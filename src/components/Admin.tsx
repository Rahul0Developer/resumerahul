import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import {
  uid,
  type AchievementItem,
  type CertItem,
  type EducationItem,
  type ExperienceItem,
  type LabItem,
  type ProjectCategory,
  type ProjectItem,
  type SiteContent,
  type SkillGroup,
  type SocialItem,
} from "../lib/data";
import { readFileAsDataUrl, useAdminAuth, useStore, type CollKey } from "../lib/store";
import { IcDownload, IcEdit, IcLock, IcPlus, IcShield, IcTrash, IcUp } from "./ui";

/* ------------------------------------------------------------------ */
/* Auth gate                                                           */
/* ------------------------------------------------------------------ */

type AuthApi = ReturnType<typeof useAdminAuth>;

function Gate({ auth }: { auth: AuthApi }) {
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setErr("");
    if (auth.needsSetup) {
      if (pw.length < 8) return setErr("Passphrase must be at least 8 characters.");
      if (pw !== pw2) return setErr("Passphrases do not match.");
      setBusy(true);
      await auth.setup(pw);
      setBusy(false);
      return;
    }
    setBusy(true);
    const ok = await auth.login(pw);
    setBusy(false);
    if (!ok) setErr("Wrong passphrase. Access denied.");
  };

  return (
    <div className="min-h-screen bg-ink text-paper grid place-items-center px-5 relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: "radial-gradient(rgba(242,240,246,0.9) 1px, transparent 1.2px)", backgroundSize: "24px 24px" }} aria-hidden />
      <div className="absolute top-8 left-8 font-mono text-[11px] text-paper/40">
        <a href="#/" className="hover:text-coral transition-colors">← back to rahul.ai</a>
      </div>
      <div className="w-full max-w-md relative">
        <div className="absolute inset-0 translate-x-2.5 translate-y-2.5 border border-coral/40" aria-hidden />
        <form onSubmit={submit} className="relative border border-paper/20 bg-paper/[0.04] p-7 sm:p-8">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 grid place-items-center border border-coral/50 text-coral"><IcLock className="w-5 h-5" /></span>
            <div>
              <div className="font-mono text-[10px] tracking-[0.22em] text-paper/50 uppercase">restricted area</div>
              <h1 className="font-display text-2xl font-semibold">/admin</h1>
            </div>
          </div>
          <p className="font-mono text-[11px] text-paper/55 mt-5 leading-relaxed">
            {auth.needsSetup
              ? "First launch: create an admin passphrase. It is stored only as a salted PBKDF2-SHA256 hash in this browser — never in plain text."
              : "Authenticate to manage projects, certificates, resume, skills and more."}
          </p>
          <div className="mt-6 space-y-4">
            <div>
              <label htmlFor="adm-pw" className="font-mono text-[10px] tracking-[0.18em] text-paper/60 uppercase">Passphrase</label>
              <input
                id="adm-pw"
                type="password"
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                autoFocus
                className="mt-1.5 w-full bg-transparent border border-paper/25 px-3.5 py-2.5 font-mono text-sm text-paper focus:border-coral transition-colors"
                placeholder="••••••••••"
              />
            </div>
            {auth.needsSetup && (
              <div>
                <label htmlFor="adm-pw2" className="font-mono text-[10px] tracking-[0.18em] text-paper/60 uppercase">Confirm passphrase</label>
                <input
                  id="adm-pw2"
                  type="password"
                  value={pw2}
                  onChange={(e) => setPw2(e.target.value)}
                  className="mt-1.5 w-full bg-transparent border border-paper/25 px-3.5 py-2.5 font-mono text-sm text-paper focus:border-coral transition-colors"
                  placeholder="••••••••••"
                />
              </div>
            )}
          </div>
          {err && <div className="mt-4 font-mono text-[11px] text-coral">⚠ {err}</div>}
          <button type="submit" disabled={busy} className="mt-6 w-full bg-coral text-paper font-mono text-[11.5px] tracking-[0.18em] py-3 hover:bg-paper hover:text-ink transition-colors disabled:opacity-50">
            {busy ? "DERIVING KEY…" : auth.needsSetup ? "CREATE ADMIN ACCESS →" : "AUTHENTICATE →"}
          </button>
          <p className="mt-4 font-mono text-[9.5px] text-paper/35 leading-relaxed">
            120k-iteration PBKDF2 · session lasts 12h · visitors can never upload or edit without this key.
          </p>
        </form>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Generic collection editor                                           */
/* ------------------------------------------------------------------ */

type FieldType = "text" | "textarea" | "url" | "date" | "toggle" | "select" | "tags" | "lines" | "image" | "pdf";
interface FieldSpec {
  key: string;
  label: string;
  type: FieldType;
  options?: string[];
  required?: boolean;
  placeholder?: string;
  maxMb?: number;
}

function Field({
  spec,
  value,
  onChange,
  error,
}: {
  spec: FieldSpec;
  value: unknown;
  onChange: (v: unknown) => void;
  error?: string;
}) {
  const base = `field ${error ? "field-err" : ""}`;
  let control: ReactNode;
  switch (spec.type) {
    case "textarea":
      control = <textarea rows={3} className={base} value={(value as string) ?? ""} placeholder={spec.placeholder} onChange={(e) => onChange(e.target.value)} />;
      break;
    case "toggle":
      control = (
        <button
          type="button"
          onClick={() => onChange(!value)}
          className={`font-mono text-[10.5px] tracking-[0.14em] px-3 py-2 border transition-colors ${value ? "bg-moss text-paper border-moss" : "border-ink/25 text-ink2"}`}
        >
          {value ? "ON ✓" : "OFF"}
        </button>
      );
      break;
    case "select":
      control = (
        <select className={base} value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)}>
          {(spec.options ?? []).map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
      );
      break;
    case "tags":
      control = (
        <>
          <input className={base} value={Array.isArray(value) ? (value as string[]).join(", ") : ""} placeholder="comma, separated, values" onChange={(e) => onChange(e.target.value.split(",").map((s) => s.trim()).filter(Boolean))} />
        </>
      );
      break;
    case "lines":
      control = (
        <>
          <textarea rows={4} className={base} placeholder={"one item per line"} value={Array.isArray(value) ? (value as string[]).join("\n") : ""} onChange={(e) => onChange(e.target.value.split("\n").map((s) => s.trim()).filter(Boolean))} />
          <span className="font-mono text-[9.5px] text-mut">one item per line</span>
        </>
      );
      break;
    case "image":
    case "pdf":
      control = (
        <FileField kind={spec.type} maxMb={spec.maxMb ?? (spec.type === "image" ? 1.5 : 4)} value={(value as string) ?? ""} onChange={onChange} />
      );
      break;
    default:
      control = <input className={base} type={spec.type === "url" ? "url" : "text"} value={(value as string) ?? ""} placeholder={spec.placeholder} onChange={(e) => onChange(e.target.value)} />;
  }
  return (
    <div>
      <label className="font-mono text-[10px] tracking-[0.16em] text-ink2 uppercase">
        {spec.label} {spec.required && <span className="text-coral">*</span>}
      </label>
      <div className="mt-1.5">{control}</div>
      {error && <div className="font-mono text-[10px] text-coral mt-1">⚠ {error}</div>}
    </div>
  );
}

function FileField({ kind, maxMb, value, onChange }: { kind: "image" | "pdf"; maxMb: number; value: string; onChange: (v: string) => void }) {
  const [err, setErr] = useState("");
  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <label className="inline-flex items-center gap-2 font-mono text-[10.5px] tracking-[0.12em] border border-ink/25 px-3 py-2 hover:bg-ink hover:text-paper transition-colors cursor-pointer">
          <IcPlus className="w-3 h-3" /> UPLOAD {kind === "image" ? "IMAGE" : "PDF"} (≤{maxMb}MB)
          <input
            type="file"
            className="hidden"
            accept={kind === "image" ? "image/png,image/jpeg,image/webp,image/gif,image/svg+xml" : "application/pdf"}
            onChange={async (e) => {
              const f = e.target.files?.[0];
              e.target.value = "";
              if (!f) return;
              try {
                setErr("");
                onChange(await readFileAsDataUrl(f, { kind, maxMb }));
              } catch (ex) {
                setErr(ex instanceof Error ? ex.message : "Upload failed");
              }
            }}
          />
        </label>
        {value && (
          <button type="button" onClick={() => onChange("")} className="font-mono text-[10px] text-coral link-underline">
            remove file
          </button>
        )}
      </div>
      {err && <div className="font-mono text-[10px] text-coral mt-1.5">⚠ {err}</div>}
      {value && kind === "image" && <img src={value} alt="upload preview" className="mt-2 max-h-28 border border-ink/15" />}
      {value && kind === "pdf" && <div className="mt-2 font-mono text-[10px] text-moss">✓ file stored ({Math.round((value.length * 3) / 4 / 1024)} KB)</div>}
    </div>
  );
}

interface EditorConfig {
  title: string;
  coll: CollKey;
  fields: FieldSpec[];
  makeNew: () => { id: string };
  rowLabel: (item: never) => string;
  rowMeta: (item: never) => string;
  flags?: { hide?: boolean; feature?: boolean; reorder?: boolean };
  addLabel: string;
}

function ConfirmBtn({ onConfirm, label = "DEL" }: { onConfirm: () => void; label?: string }) {
  const [arm, setArm] = useState(false);
  return (
    <button
      onClick={() => (arm ? onConfirm() : setArm(true))}
      onBlur={() => setArm(false)}
      className={`inline-flex items-center gap-1 font-mono text-[10px] tracking-[0.1em] px-2 py-1.5 border transition-colors ${
        arm ? "bg-coral border-coral text-paper" : "border-ink/20 text-ink2 hover:border-coral hover:text-coral"
      }`}
    >
      <IcTrash className="w-3 h-3" /> {arm ? "SURE?" : label}
    </button>
  );
}

function CollectionEditor({ cfg }: { cfg: EditorConfig }) {
  const store = useStore();
  const items = store.content[cfg.coll] as unknown as Array<Record<string, unknown> & { id: string }>;
  const [draft, setDraft] = useState<Record<string, unknown> | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (d: Record<string, unknown>) => {
    const errs: Record<string, string> = {};
    cfg.fields.forEach((f) => {
      const v = d[f.key];
      if (f.required && (v === undefined || v === null || String(v).trim() === "")) errs[f.key] = "required";
      if (f.type === "url" && typeof v === "string" && v.trim() && !/^(https?:\/\/|mailto:)/i.test(v.trim())) errs[f.key] = "must start with http(s):// or mailto:";
    });
    return errs;
  };

  const save = () => {
    if (!draft) return;
    const errs = validate(draft);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    store.upsertItem(cfg.coll, draft as never);
    setDraft(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h2 className="font-display text-2xl font-semibold">{cfg.title}</h2>
        <button
          onClick={() => {
            setErrors({});
            setDraft(cfg.makeNew() as Record<string, unknown>);
          }}
          className="inline-flex items-center gap-2 bg-ink text-paper font-mono text-[10.5px] tracking-[0.14em] px-4 py-2.5 hover:bg-coral transition-colors"
        >
          <IcPlus className="w-3 h-3" /> {cfg.addLabel}
        </button>
      </div>

      <div className="mt-6 border border-ink/15 bg-card divide-y divide-ink/10">
        {items.length === 0 && <div className="px-5 py-10 text-center font-mono text-xs text-mut">empty — add the first entry ↑</div>}
        {items.map((item, idx) => (
          <div key={item.id} className="px-4 sm:px-5 py-3.5 flex items-center gap-3 flex-wrap hover:bg-paper transition-colors">
            <div className="min-w-0 flex-1">
              <div className="font-medium text-[14px] truncate">
                {Boolean(item.hidden) && <span className="font-mono text-[9px] text-amber border border-amber/40 px-1 py-0.5 mr-2">HIDDEN</span>}
                {Boolean(item.featured) && <span className="font-mono text-[9px] text-coral border border-coral/40 px-1 py-0.5 mr-2">★ FEATURED</span>}
                {cfg.rowLabel(item as never)}
              </div>
              <div className="font-mono text-[10.5px] text-mut truncate mt-0.5">{cfg.rowMeta(item as never)}</div>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {cfg.flags?.reorder && (
                <>
                  <button disabled={idx === 0} onClick={() => store.moveItem(cfg.coll, item.id, -1)} className="font-mono text-[10px] px-2 py-1.5 border border-ink/20 text-ink2 disabled:opacity-30 hover:border-ink" aria-label="Move up"><IcUp className="w-3 h-3" /></button>
                  <button disabled={idx === items.length - 1} onClick={() => store.moveItem(cfg.coll, item.id, 1)} className="font-mono text-[10px] px-2 py-1.5 border border-ink/20 text-ink2 disabled:opacity-30 hover:border-ink rotate-180" aria-label="Move down"><IcUp className="w-3 h-3" /></button>
                </>
              )}
              {cfg.flags?.hide && (
                <button
                  onClick={() => store.upsertItem(cfg.coll, { ...item, hidden: !item.hidden } as never)}
                  className={`font-mono text-[10px] tracking-[0.1em] px-2 py-1.5 border transition-colors ${item.hidden ? "bg-amber text-paper border-amber" : "border-ink/20 text-ink2 hover:border-amber hover:text-amber"}`}
                >
                  {item.hidden ? "UNHIDE" : "HIDE"}
                </button>
              )}
              {cfg.flags?.feature && (
                <button
                  onClick={() => store.upsertItem(cfg.coll, { ...item, featured: !item.featured } as never)}
                  className={`font-mono text-[10px] tracking-[0.1em] px-2 py-1.5 border transition-colors ${item.featured ? "bg-coral text-paper border-coral" : "border-ink/20 text-ink2 hover:border-coral hover:text-coral"}`}
                >
                  {item.featured ? "★ UNFEATURE" : "☆ FEATURE"}
                </button>
              )}
              <button
                onClick={() => {
                  setErrors({});
                  setDraft({ ...item });
                }}
                className="inline-flex items-center gap-1 font-mono text-[10px] tracking-[0.1em] px-2 py-1.5 border border-ink/20 text-ink2 hover:border-ink hover:text-ink transition-colors"
              >
                <IcEdit className="w-3 h-3" /> EDIT
              </button>
              <ConfirmBtn onConfirm={() => store.removeItem(cfg.coll, item.id)} />
            </div>
          </div>
        ))}
      </div>

      {draft && (
        <div className="fixed inset-0 z-[85] flex items-start sm:items-center justify-center p-4 overflow-y-auto">
          <div className="absolute inset-0 bg-ink/45" onClick={() => setDraft(null)} />
          <div className="relative w-full max-w-2xl bg-paper border border-ink/20 shadow-2xl my-8">
            <div className="px-5 sm:px-6 py-4 border-b border-ink/15 flex items-center justify-between">
              <h3 className="font-display text-xl font-semibold">{cfg.title} — editor</h3>
              <button onClick={() => setDraft(null)} className="w-8 h-8 grid place-items-center border border-ink/15 font-mono text-xs hover:bg-ink hover:text-paper transition-colors" aria-label="Close editor">✕</button>
            </div>
            <div className="px-5 sm:px-6 py-5 grid sm:grid-cols-2 gap-4">
              {cfg.fields.map((f) => (
                <div key={f.key} className={f.type === "textarea" || f.type === "lines" || f.type === "image" || f.type === "pdf" ? "sm:col-span-2" : ""}>
                  <Field spec={f} value={draft[f.key]} error={errors[f.key]} onChange={(v) => setDraft((d) => (d ? { ...d, [f.key]: v } : d))} />
                </div>
              ))}
            </div>
            <div className="px-5 sm:px-6 py-4 border-t border-ink/15 flex items-center justify-end gap-3">
              <button onClick={() => setDraft(null)} className="font-mono text-[10.5px] tracking-[0.12em] text-ink2 px-3 py-2 hover:text-ink">CANCEL</button>
              <button onClick={save} className="font-mono text-[10.5px] tracking-[0.14em] bg-ink text-paper px-5 py-2.5 hover:bg-coral transition-colors">
                PUBLISH →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Field configs + factories                                           */
/* ------------------------------------------------------------------ */

const CATS: ProjectCategory[] = ["AI/ML", "GENAI", "COMPUTER VISION", "NLP", "WEB APPS", "DATA SCIENCE", "OTHER"];

const CONFIGS: Record<string, EditorConfig> = {
  projects: {
    title: "Projects",
    coll: "projects",
    addLabel: "NEW PROJECT",
    flags: { hide: true, feature: true },
    makeNew: (): ProjectItem => ({
      id: uid(), name: "", tagline: "", problem: "", category: "AI/ML", tech: [], github: "", demo: "", video: "",
      dataset: "", model: "", metrics: [], features: [], date: new Date().getFullYear().toString(), featured: false, hidden: false, image: "", architecture: "none",
    }),
    rowLabel: (p) => (p as unknown as ProjectItem).name || "Untitled",
    rowMeta: (p) => {
      const x = p as unknown as ProjectItem;
      return `${x.category} · ${x.date} · ${x.tech.slice(0, 3).join(", ")}`;
    },
    fields: [
      { key: "name", label: "Project title", type: "text", required: true, placeholder: "NeuroQuery" },
      { key: "category", label: "Category", type: "select", options: CATS, required: true },
      { key: "tagline", label: "Short description", type: "text", required: true },
      { key: "problem", label: "Problem solved", type: "textarea" },
      { key: "tech", label: "Technologies", type: "tags" },
      { key: "github", label: "GitHub link", type: "url", placeholder: "https://github.com/…" },
      { key: "demo", label: "Live demo link", type: "url", placeholder: "https://…" },
      { key: "video", label: "Video URL (YouTube/Vimeo)", type: "url", placeholder: "https://youtube.com/watch?v=…" },
      { key: "dataset", label: "Dataset info", type: "text" },
      { key: "model", label: "Model info", type: "text" },
      { key: "metrics", label: "Results / metrics", type: "lines" },
      { key: "features", label: "Key features", type: "lines" },
      { key: "date", label: "Date / year", type: "text", placeholder: "2026" },
      { key: "architecture", label: "Architecture diagram", type: "select", options: ["none", "rag", "cv", "nlp", "data"] },
      { key: "featured", label: "Featured", type: "toggle" },
      { key: "hidden", label: "Hidden from site", type: "toggle" },
      { key: "image", label: "Project image (optional)", type: "image", maxMb: 1.5 },
    ],
  },
  certificates: {
    title: "Certificates",
    coll: "certificates",
    addLabel: "NEW CERTIFICATE",
    makeNew: (): CertItem => ({ id: uid(), title: "", issuer: "", date: "", credentialId: "", verifyUrl: "", image: "" }),
    rowLabel: (c) => (c as unknown as CertItem).title || "Untitled",
    rowMeta: (c) => {
      const x = c as unknown as CertItem;
      return `${x.issuer} · ${x.date} · ${x.credentialId}`;
    },
    fields: [
      { key: "title", label: "Certificate title", type: "text", required: true },
      { key: "issuer", label: "Issuing organization", type: "text", required: true },
      { key: "date", label: "Date", type: "text", placeholder: "Aug 2025" },
      { key: "credentialId", label: "Credential ID", type: "text" },
      { key: "verifyUrl", label: "Verification URL", type: "url" },
      { key: "image", label: "Certificate image / scan", type: "image", maxMb: 1.5 },
    ],
  },
  experience: {
    title: "Experience",
    coll: "experience",
    addLabel: "NEW ROLE",
    makeNew: (): ExperienceItem => ({ id: uid(), role: "", company: "", location: "", start: "", end: "", summary: "", bullets: [], tech: [] }),
    rowLabel: (e) => {
      const x = e as unknown as ExperienceItem;
      return `${x.role} @ ${x.company}`;
    },
    rowMeta: (e) => {
      const x = e as unknown as ExperienceItem;
      return `${x.start} — ${x.end} · ${x.location}`;
    },
    fields: [
      { key: "role", label: "Role", type: "text", required: true },
      { key: "company", label: "Company", type: "text", required: true },
      { key: "location", label: "Location", type: "text" },
      { key: "start", label: "Start", type: "text", placeholder: "Feb 2026" },
      { key: "end", label: "End", type: "text", placeholder: "Aug 2026" },
      { key: "summary", label: "Summary", type: "textarea" },
      { key: "bullets", label: "Achievements / bullets", type: "lines" },
      { key: "tech", label: "Technologies", type: "tags" },
    ],
  },
  education: {
    title: "Education",
    coll: "education",
    addLabel: "NEW ENTRY",
    makeNew: (): EducationItem => ({ id: uid(), degree: "", school: "", branch: "", start: "", end: "", score: "", coursework: [], note: "" }),
    rowLabel: (e) => (e as unknown as EducationItem).degree || "Untitled",
    rowMeta: (e) => {
      const x = e as unknown as EducationItem;
      return `${x.school} · ${x.start}–${x.end} · ${x.score}`;
    },
    fields: [
      { key: "degree", label: "Degree", type: "text", required: true },
      { key: "school", label: "University / school", type: "text", required: true },
      { key: "branch", label: "Branch / place", type: "text" },
      { key: "start", label: "Start", type: "text" },
      { key: "end", label: "End", type: "text" },
      { key: "score", label: "CGPA / score", type: "text" },
      { key: "coursework", label: "Relevant coursework", type: "tags" },
      { key: "note", label: "Achievements / note", type: "textarea" },
    ],
  },
  skills: {
    title: "Skills",
    coll: "skills",
    addLabel: "NEW GROUP",
    makeNew: (): SkillGroup => ({ id: uid(), group: "", items: [] }),
    rowLabel: (s) => (s as unknown as SkillGroup).group || "Untitled group",
    rowMeta: (s) => (s as unknown as SkillGroup).items.join(", "),
    fields: [
      { key: "group", label: "Group name", type: "text", required: true, placeholder: "Languages" },
      { key: "items", label: "Skills", type: "tags" },
    ],
  },
  achievements: {
    title: "Achievements",
    coll: "achievements",
    addLabel: "NEW ACHIEVEMENT",
    makeNew: (): AchievementItem => ({ id: uid(), year: new Date().getFullYear().toString(), kind: "HACKATHON", title: "", detail: "" }),
    rowLabel: (a) => (a as unknown as AchievementItem).title || "Untitled",
    rowMeta: (a) => {
      const x = a as unknown as AchievementItem;
      return `${x.kind} · ${x.year}`;
    },
    fields: [
      { key: "title", label: "Title", type: "text", required: true },
      { key: "kind", label: "Type", type: "select", options: ["HACKATHON", "COMPETITION", "KAGGLE", "OPEN SOURCE", "SPEAKING", "AWARD", "RESEARCH", "MILESTONE"] },
      { key: "year", label: "Year", type: "text" },
      { key: "detail", label: "Detail", type: "textarea" },
    ],
  },
  socials: {
    title: "Social Links",
    coll: "socials",
    addLabel: "ADD PLATFORM",
    flags: { reorder: true },
    makeNew: (): SocialItem => ({ id: uid(), platform: "", username: "", url: "", note: "", enabled: true }),
    rowLabel: (s) => {
      const x = s as unknown as SocialItem;
      return `${x.platform} — @${x.username}`;
    },
    rowMeta: (s) => {
      const x = s as unknown as SocialItem;
      return `${x.url} · ${x.enabled ? "visible" : "disabled"}`;
    },
    fields: [
      { key: "platform", label: "Platform", type: "text", required: true, placeholder: "GitHub / Dev.to / Medium…" },
      { key: "username", label: "Username", type: "text" },
      { key: "url", label: "URL", type: "url", required: true },
      { key: "note", label: "Short description", type: "text" },
      { key: "enabled", label: "Enabled on site", type: "toggle" },
    ],
  },
  lab: {
    title: "AI Lab",
    coll: "lab",
    addLabel: "LOG EXPERIMENT",
    makeNew: (): LabItem => ({ id: uid(), code: `EXPERIMENT_${String(Math.floor(Math.random() * 900) + 100)}`, title: "", model: "", stack: [], status: "EXPERIMENTAL", note: "", metric: "" }),
    rowLabel: (l) => (l as unknown as LabItem).title || "Untitled",
    rowMeta: (l) => {
      const x = l as unknown as LabItem;
      return `${x.code} · ${x.status} · ${x.model}`;
    },
    fields: [
      { key: "code", label: "Experiment code", type: "text", required: true, placeholder: "EXPERIMENT_014" },
      { key: "title", label: "Title", type: "text", required: true },
      { key: "model", label: "Model", type: "text" },
      { key: "stack", label: "Stack", type: "tags" },
      { key: "status", label: "Status", type: "select", options: ["EXPERIMENTAL", "STABLE", "ARCHIVED"] },
      { key: "metric", label: "Headline metric", type: "text" },
      { key: "note", label: "Run note", type: "textarea" },
    ],
  },
};

/* ------------------------------------------------------------------ */
/* Dashboard                                                           */
/* ------------------------------------------------------------------ */

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "projects", label: "Projects" },
  { id: "certificates", label: "Certificates" },
  { id: "resume", label: "Resume" },
  { id: "experience", label: "Experience" },
  { id: "education", label: "Education" },
  { id: "skills", label: "Skills" },
  { id: "achievements", label: "Achievements" },
  { id: "socials", label: "Social Links" },
  { id: "lab", label: "AI Lab" },
  { id: "settings", label: "Settings" },
] as const;

function Overview({ go }: { go: (t: string) => void }) {
  const { content, storageKb } = useStore();
  const cards = [
    { t: "projects", n: content.projects.length, hint: `${content.projects.filter((p) => p.featured).length} featured · ${content.projects.filter((p) => p.hidden).length} hidden` },
    { t: "certificates", n: content.certificates.length, hint: "all link to issuer verification" },
    { t: "experience", n: content.experience.length, hint: "timeline entries on the site" },
    { t: "socials", n: content.socials.filter((s) => s.enabled).length, hint: `${content.socials.length} platforms total` },
    { t: "lab", n: content.lab.length, hint: `${content.lab.filter((l) => l.status === "EXPERIMENTAL").length} running experiments` },
    { t: "achievements", n: content.achievements.length, hint: "milestones logged" },
  ];
  return (
    <div>
      <h2 className="font-display text-2xl font-semibold">Overview</h2>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mt-6">
        {cards.map((c) => (
          <button key={c.t} onClick={() => go(c.t)} className="text-left border border-ink/15 bg-card p-4 card-lift group">
            <div className="font-display text-3xl font-semibold group-hover:text-coral transition-colors">{String(c.n).padStart(2, "0")}</div>
            <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-ink2 mt-1">{c.t}</div>
            <div className="font-mono text-[9.5px] text-mut mt-1.5">{c.hint}</div>
          </button>
        ))}
      </div>
      <div className="grid sm:grid-cols-2 gap-3 mt-4">
        <div className="border border-ink/15 bg-card p-4">
          <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-mut">Resume</div>
          <div className="mt-1.5 text-[14px]">
            {content.profile.resumeDataUrl ? "uploaded PDF" : "auto-composed from content"} · updated <strong>{content.profile.resumeUpdated}</strong>
          </div>
          <button onClick={() => go("resume")} className="mt-2 font-mono text-[10.5px] text-coral link-underline">manage →</button>
        </div>
        <div className="border border-ink/15 bg-card p-4">
          <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-mut">Local storage</div>
          <div className="mt-1.5 text-[14px]">{storageKb} KB of ~5 MB used</div>
          <div className="mt-2 h-1.5 bg-ink/10"><div className="h-full bg-moss" style={{ width: `${Math.min(100, (storageKb / 5120) * 100)}%` }} /></div>
        </div>
      </div>
      <div className="mt-6 border border-dashed border-ink/25 bg-paper2/60 px-5 py-4 font-mono text-[11px] text-ink2 leading-relaxed">
        <span className="text-iris">$ tip</span> — every change publishes instantly to the live portfolio (this browser). Uploads are
        validated by type & size; visitors never see this panel without the passphrase.
      </div>
    </div>
  );
}

function ResumeTab() {
  const { content, updateProfile } = useStore();
  const [err, setErr] = useState("");
  const [date, setDate] = useState(content.profile.resumeUpdated);
  return (
    <div>
      <h2 className="font-display text-2xl font-semibold">Resume</h2>
      <div className="mt-6 grid gap-4 max-w-2xl">
        <div className="border border-ink/15 bg-card p-5">
          <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-mut">Current document</div>
          <div className="mt-2 flex items-center gap-3">
            <span className={`w-2 h-2 rounded-full ${content.profile.resumeDataUrl ? "bg-moss" : "bg-cobalt"}`} />
            <span className="text-[14px]">
              {content.profile.resumeDataUrl ? "Uploaded PDF (served to visitors)" : "Auto-composed from live content — upload to replace"}
            </span>
          </div>
          {content.profile.resumeDataUrl && (
            <a href={content.profile.resumeDataUrl} download="resume.pdf" className="mt-3 inline-flex items-center gap-2 font-mono text-[10.5px] text-ink2 link-underline">
              <IcDownload className="w-3 h-3" /> download current
            </a>
          )}
        </div>
        <div className="border border-ink/15 bg-card p-5">
          <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-mut">Upload / replace (PDF only, ≤ 4MB)</div>
          <div className="mt-3">
            <FileField
              kind="pdf"
              maxMb={4}
              value={content.profile.resumeDataUrl}
              onChange={(v) => updateProfile({ resumeDataUrl: v })}
            />
          </div>
          {err && <div className="font-mono text-[10.5px] text-coral mt-2">⚠ {err}</div>}
        </div>
        <div className="border border-ink/15 bg-card p-5">
          <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-mut">"Last updated" label shown on site</div>
          <div className="mt-2 flex gap-2">
            <input className="field" value={date} onChange={(e) => setDate(e.target.value)} placeholder="Jan 2026" />
            <button
              onClick={() => {
                if (!date.trim()) return setErr("Enter a date label first.");
                setErr("");
                updateProfile({ resumeUpdated: date.trim() });
              }}
              className="font-mono text-[10.5px] tracking-[0.12em] bg-ink text-paper px-4 hover:bg-coral transition-colors"
            >
              SAVE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingsTab() {
  const { content, updateProfile, resetAll } = useStore();
  const [form, setForm] = useState({ ...content.profile });
  const [saved, setSaved] = useState(false);
  const p = content.profile;

  const fields: Array<[keyof typeof form, string, "text" | "textarea" | "url"]> = [
    ["name", "Full name", "text"],
    ["role", "Role", "text"],
    ["tagline", "Tagline (hero mono line)", "text"],
    ["intro", "Intro paragraph", "textarea"],
    ["location", "Location", "text"],
    ["email", "Contact email", "text"],
    ["statusLine", "Hero status line", "text"],
    ["githubUsername", "GitHub username (powers GitHub section)", "text"],
    ["leetcode", "LeetCode handle", "text"],
    ["codeforces", "Codeforces handle (official API)", "text"],
    ["hackerrank", "HackerRank handle", "text"],
    ["kaggle", "Kaggle username", "text"],
    ["huggingface", "Hugging Face username", "text"],
  ];

  return (
    <div>
      <h2 className="font-display text-2xl font-semibold">Settings</h2>
      <div className="mt-6 max-w-2xl border border-ink/15 bg-card p-5 sm:p-6">
        <div className="grid sm:grid-cols-2 gap-4">
          {fields.map(([k, label, type]) => (
            <div key={k} className={type === "textarea" ? "sm:col-span-2" : ""}>
              <label className="font-mono text-[10px] tracking-[0.16em] text-ink2 uppercase">{label}</label>
              {type === "textarea" ? (
                <textarea rows={3} className="field mt-1.5" value={String(form[k] ?? "")} onChange={(e) => setForm((f) => ({ ...f, [k]: e.target.value }))} />
              ) : (
                <input className="field mt-1.5" value={String(form[k] ?? "")} onChange={(e) => setForm((f) => ({ ...f, [k]: e.target.value }))} />
              )}
            </div>
          ))}
        </div>
        <div className="mt-5 flex items-center gap-3">
          <button
            onClick={() => {
              updateProfile(form);
              setSaved(true);
              window.setTimeout(() => setSaved(false), 2000);
            }}
            className="font-mono text-[10.5px] tracking-[0.14em] bg-ink text-paper px-5 py-2.5 hover:bg-coral transition-colors"
          >
            SAVE PROFILE
          </button>
          {saved && <span className="font-mono text-[11px] text-moss">✓ published</span>}
        </div>
        <div className="font-mono text-[10px] text-mut mt-3">live values: {p.name} · {p.email}{p.githubUsername ? ` · gh:${p.githubUsername}` : ""}</div>
      </div>

      <div className="mt-6 max-w-2xl border border-coral/40 bg-coral/[0.04] p-5">
        <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-coral">Danger zone</div>
        <p className="text-[13.5px] text-ink2 mt-2">Reset all content back to the original portfolio defaults. Your passphrase is kept.</p>
        <div className="mt-3">
          <ConfirmBtn label="RESET ALL CONTENT" onConfirm={resetAll} />
        </div>
      </div>
    </div>
  );
}

function Dashboard({ auth }: { auth: AuthApi }) {
  const [tab, setTab] = useState<string>("overview");
  return (
    <div className="min-h-screen bg-paper">
      <header className="sticky top-0 z-40 bg-paper/90 backdrop-blur border-b border-ink/12">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 h-[60px] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-7 h-7 grid place-items-center bg-coral text-paper font-mono text-[11px] font-bold">A</span>
            <span className="font-mono text-sm font-semibold">rahul.ai <span className="text-mut">/ admin desk</span></span>
          </div>
          <div className="flex items-center gap-3">
            <a href="#/" className="font-mono text-[10.5px] tracking-[0.12em] text-ink2 hover:text-coral transition-colors">VIEW SITE ↗</a>
            <button onClick={auth.logout} className="font-mono text-[10.5px] tracking-[0.12em] border border-ink/20 px-3 py-1.5 hover:bg-ink hover:text-paper transition-colors">
              LOCK ⏻
            </button>
          </div>
        </div>
      </header>
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-8 grid lg:grid-cols-[200px_1fr] gap-8 items-start">
        <nav className="lg:sticky lg:top-[84px] flex lg:flex-col gap-1 overflow-x-auto pb-2 lg:pb-0" aria-label="Admin sections">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`text-left font-mono text-[11px] tracking-[0.08em] px-3.5 py-2.5 border-l-2 transition-all whitespace-nowrap ${
                tab === t.id ? "border-coral bg-card text-ink font-semibold" : "border-transparent text-ink2 hover:text-ink hover:bg-card/70"
              }`}
            >
              {t.label}
            </button>
          ))}
          <div className="hidden lg:flex items-center gap-2 mt-6 px-3.5 font-mono text-[9.5px] text-mut">
            <IcShield className="w-3.5 h-3.5 text-moss" /> PBKDF2 session active
          </div>
        </nav>
        <main className="min-w-0">
          {tab === "overview" && <Overview go={setTab} />}
          {tab === "resume" && <ResumeTab />}
          {tab === "settings" && <SettingsTab />}
          {CONFIGS[tab] && <CollectionEditor cfg={CONFIGS[tab]} />}
        </main>
      </div>
    </div>
  );
}

export default function Admin() {
  const auth = useAdminAuth();
  return auth.authed ? <Dashboard auth={auth} /> : <Gate auth={auth} />;
}
