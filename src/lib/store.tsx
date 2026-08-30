import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { DEFAULT_CONTENT, uid, type SiteContent } from "./data";

const CONTENT_KEY = "rahul_ai_content_v2";
const CRED_KEY = "rahul_ai_admin_v2";
const SESSION_KEY = "rahul_ai_session_v2";
const SESSION_HOURS = 12;

/* ------------------------------------------------------------------ */
/* Content store                                                       */
/* ------------------------------------------------------------------ */

export type CollKey =
  | "experience"
  | "education"
  | "projects"
  | "certificates"
  | "skills"
  | "lab"
  | "achievements"
  | "socials";

export type ItemOf<K extends CollKey> = SiteContent[K][number];

interface StoreApi {
  content: SiteContent;
  updateProfile: (patch: Partial<SiteContent["profile"]>) => void;
  upsertItem: <K extends CollKey>(key: K, item: ItemOf<K>) => void;
  removeItem: (key: CollKey, id: string) => void;
  moveItem: (key: CollKey, id: string, dir: -1 | 1) => void;
  resetAll: () => void;
  newId: () => string;
  storageKb: number;
}

function loadContent(): SiteContent {
  try {
    const raw = localStorage.getItem(CONTENT_KEY);
    if (!raw) return DEFAULT_CONTENT;
    const parsed = JSON.parse(raw) as Partial<SiteContent>;
    return { ...DEFAULT_CONTENT, ...parsed, profile: { ...DEFAULT_CONTENT.profile, ...(parsed.profile ?? {}) } };
  } catch {
    return DEFAULT_CONTENT;
  }
}

const StoreCtx = createContext<StoreApi | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<SiteContent>(loadContent);
  const [storageKb, setStorageKb] = useState(0);

  useEffect(() => {
    try {
      const raw = JSON.stringify(content);
      localStorage.setItem(CONTENT_KEY, raw);
      setStorageKb(Math.round(raw.length / 1024));
    } catch {
      /* quota exceeded — keep working in memory */
    }
  }, [content]);

  const updateProfile = useCallback((patch: Partial<SiteContent["profile"]>) => {
    setContent((c) => ({ ...c, profile: { ...c.profile, ...patch } }));
  }, []);

  const upsertItem = useCallback(<K extends CollKey>(key: K, item: ItemOf<K>) => {
    setContent((c) => {
      const list = c[key] as Array<{ id: string }>;
      const idx = list.findIndex((x) => x.id === (item as { id: string }).id);
      const next = idx >= 0 ? list.map((x) => (x.id === (item as { id: string }).id ? (item as unknown as typeof x) : x)) : [...list, item as unknown as (typeof list)[number]];
      return { ...c, [key]: next };
    });
  }, []);

  const removeItem = useCallback((key: CollKey, id: string) => {
    setContent((c) => ({ ...c, [key]: (c[key] as Array<{ id: string }>).filter((x) => x.id !== id) }));
  }, []);

  const moveItem = useCallback((key: CollKey, id: string, dir: -1 | 1) => {
    setContent((c) => {
      const list = [...(c[key] as Array<{ id: string }>)] as Array<{ id: string }>;
      const i = list.findIndex((x) => x.id === id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= list.length) return c;
      const [it] = list.splice(i, 1);
      list.splice(j, 0, it);
      return { ...c, [key]: list };
    });
  }, []);

  const resetAll = useCallback(() => {
    localStorage.removeItem(CONTENT_KEY);
    setContent(DEFAULT_CONTENT);
  }, []);

  const api = useMemo<StoreApi>(
    () => ({ content, updateProfile, upsertItem, removeItem, moveItem, resetAll, newId: uid, storageKb }),
    [content, updateProfile, upsertItem, removeItem, moveItem, resetAll, storageKb]
  );

  return <StoreCtx.Provider value={api}>{children}</StoreCtx.Provider>;
}

export function useStore(): StoreApi {
  const ctx = useContext(StoreCtx);
  if (!ctx) throw new Error("useStore outside provider");
  return ctx;
}

/* ------------------------------------------------------------------ */
/* Admin auth — PBKDF2-hashed credential, never stored in plain text.  */
/* ------------------------------------------------------------------ */

interface AdminCred {
  salt: string;
  hash: string;
  iter: number;
}

function toHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function derive(password: string, salt: Uint8Array, iter: number): Promise<string> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: salt as BufferSource, iterations: iter, hash: "SHA-256" },
    keyMaterial,
    256
  );
  return toHex(bits);
}

function readCred(): AdminCred | null {
  try {
    const raw = localStorage.getItem(CRED_KEY);
    return raw ? (JSON.parse(raw) as AdminCred) : null;
  } catch {
    return null;
  }
}

export function useAdminAuth() {
  const [needsSetup, setNeedsSetup] = useState<boolean>(() => readCred() === null);
  const [authed, setAuthed] = useState<boolean>(() => {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY) || localStorage.getItem(SESSION_KEY);
      if (!raw) return false;
      const s = JSON.parse(raw) as { exp: number };
      return s.exp > Date.now();
    } catch {
      return false;
    }
  });

  const startSession = useCallback(() => {
    const payload = JSON.stringify({ exp: Date.now() + SESSION_HOURS * 3600 * 1000 });
    try {
      sessionStorage.setItem(SESSION_KEY, payload);
    } catch {
      localStorage.setItem(SESSION_KEY, payload);
    }
    setAuthed(true);
  }, []);

  const setup = useCallback(
    async (password: string) => {
      const salt = crypto.getRandomValues(new Uint8Array(16));
      const iter = 120000;
      const hash = await derive(password, salt, iter);
      const cred: AdminCred = { salt: toHex(salt.buffer as ArrayBuffer), hash, iter };
      localStorage.setItem(CRED_KEY, JSON.stringify(cred));
      setNeedsSetup(false);
      startSession();
    },
    [startSession]
  );

  const login = useCallback(async (password: string): Promise<boolean> => {
    const cred = readCred();
    if (!cred) return false;
    const saltBytes = new Uint8Array(cred.salt.match(/.{2}/g)?.map((h) => parseInt(h, 16)) ?? []);
    const hash = await derive(password, saltBytes, cred.iter);
    const ok = hash === cred.hash;
    if (ok) startSession();
    return ok;
  }, [startSession]);

  const logout = useCallback(() => {
    sessionStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(SESSION_KEY);
    setAuthed(false);
  }, []);

  return { needsSetup, authed, setup, login, logout };
}

/* ------------------------------------------------------------------ */
/* Upload helpers — type + size validated before reading as data URL.  */
/* ------------------------------------------------------------------ */

export function readFileAsDataUrl(file: File, opts: { kind: "image" | "pdf"; maxMb: number }): Promise<string> {
  return new Promise((resolve, reject) => {
    const okType =
      opts.kind === "image"
        ? ["image/png", "image/jpeg", "image/webp", "image/gif", "image/svg+xml"].includes(file.type)
        : file.type === "application/pdf";
    if (!okType) {
      reject(new Error(opts.kind === "image" ? "Only PNG / JPG / WEBP / GIF / SVG images are allowed." : "Only PDF files are allowed."));
      return;
    }
    if (file.size > opts.maxMb * 1024 * 1024) {
      reject(new Error(`File too large — max ${opts.maxMb} MB.`));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Could not read the file."));
    reader.readAsDataURL(file);
  });
}
