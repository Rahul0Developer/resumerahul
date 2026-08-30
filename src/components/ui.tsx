import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { AnimatePresence, motion } from "framer-motion";

/* ------------------------------------------------------------------ */
/* Hooks                                                               */
/* ------------------------------------------------------------------ */

export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const fn = () => setReduced(mq.matches);
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, []);
  return reduced;
}

export function useInView<T extends HTMLElement>(threshold = 0.15, once = true) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setInView(true);
            if (once) io.unobserve(e.target);
          } else if (!once) {
            setInView(false);
          }
        });
      },
      { threshold, rootMargin: "0px 0px -8% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold, once]);
  return { ref, inView };
}

/* ------------------------------------------------------------------ */
/* Reveal                                                              */
/* ------------------------------------------------------------------ */

export function Reveal({
  children,
  className = "",
  delay = 0,
  variant = "up",
  style,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  variant?: "up" | "left" | "right" | "scale";
  style?: CSSProperties;
}) {
  const { ref, inView } = useInView<HTMLDivElement>();
  const v = variant === "left" ? "rv-left" : variant === "right" ? "rv-right" : variant === "scale" ? "rv-scale" : "";
  return (
    <div
      ref={ref}
      className={`rv ${v} ${inView ? "rv-on" : ""} ${className}`}
      style={{ ...style, ["--rv-delay" as string]: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Scramble-decode text                                                */
/* ------------------------------------------------------------------ */

const SCRAMBLE_CHARS = "!<>-_\\/[]{}=+*^?#$%&";

export function Scramble({ text, className = "", speed = 26 }: { text: string; className?: string; speed?: number }) {
  const reduced = usePrefersReducedMotion();
  const { ref, inView } = useInView<HTMLSpanElement>(0.4);
  const [out, setOut] = useState(reduced ? text : "");
  useEffect(() => {
    if (!inView) return;
    if (reduced) {
      setOut(text);
      return;
    }
    let frame = 0;
    const total = text.length * 3 + 6;
    const id = window.setInterval(() => {
      frame++;
      const settled = Math.floor((frame / total) * text.length * 1.4);
      let s = "";
      for (let i = 0; i < text.length; i++) {
        if (i < settled) s += text[i];
        else if (text[i] === " ") s += " ";
        else s += SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
      }
      setOut(s);
      if (settled >= text.length) {
        setOut(text);
        window.clearInterval(id);
      }
    }, speed);
    return () => window.clearInterval(id);
  }, [inView, text, reduced, speed]);
  return (
    <span ref={ref} className={className} aria-label={text}>
      {out || "\u00A0"}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Section header                                                      */
/* ------------------------------------------------------------------ */

export function SectionHead({
  num,
  label,
  title,
  sub,
  align = "left",
}: {
  num: string;
  label: string;
  title: ReactNode;
  sub?: string;
  align?: "left" | "center";
}) {
  return (
    <div className={align === "center" ? "text-center" : ""}>
      <Reveal>
        <div className={`flex items-center gap-4 ${align === "center" ? "justify-center" : ""}`}>
          <span className="font-mono text-[11px] tracking-[0.22em] text-coral">{num}</span>
          <span className="font-mono text-[11px] tracking-[0.22em] text-ink2 uppercase">
            <Scramble text={label} />
          </span>
          <span className="rule-tick text-line flex-1 max-w-[140px]" aria-hidden />
        </div>
      </Reveal>
      <Reveal delay={90}>
        <h2 className="font-display font-semibold text-[clamp(1.9rem,4.5vw,3.1rem)] leading-[1.08] mt-4 tracking-[-0.01em]">
          {title}
        </h2>
      </Reveal>
      {sub && (
        <Reveal delay={160}>
          <p className={`mt-4 text-ink2 max-w-xl ${align === "center" ? "mx-auto" : ""}`}>{sub}</p>
        </Reveal>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Magnetic + Tilt                                                     */
/* ------------------------------------------------------------------ */

export function Magnetic({ children, strength = 0.35, className = "" }: { children: ReactNode; strength?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  return (
    <div
      ref={ref}
      className={`inline-block ${className}`}
      onMouseMove={(e) => {
        if (reduced || !ref.current) return;
        const r = ref.current.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        ref.current.style.transform = `translate(${dx * strength * 0.2}px, ${dy * strength * 0.2}px)`;
      }}
      onMouseLeave={() => {
        if (ref.current) ref.current.style.transform = "translate(0,0)";
      }}
      style={{ transition: "transform 0.25s cubic-bezier(0.16,1,0.3,1)" }}
    >
      {children}
    </div>
  );
}

export function Tilt({ children, className = "", max = 5 }: { children: ReactNode; className?: string; max?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  return (
    <div
      ref={ref}
      className={className}
      style={{ transformStyle: "preserve-3d", transition: "transform 0.3s cubic-bezier(0.16,1,0.3,1)" }}
      onMouseMove={(e) => {
        if (reduced || !ref.current) return;
        const r = ref.current.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        ref.current.style.transform = `perspective(900px) rotateX(${(-py * max).toFixed(2)}deg) rotateY(${(px * max).toFixed(2)}deg) translateY(-3px)`;
      }}
      onMouseLeave={() => {
        if (ref.current) ref.current.style.transform = "perspective(900px) rotateX(0deg) rotateY(0deg)";
      }}
    >
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Modal                                                               */
/* ------------------------------------------------------------------ */

export function Modal({
  open,
  onClose,
  children,
  wide = false,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[90] flex items-center justify-center p-4 sm:p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
        >
          <div className="absolute inset-0 bg-ink/45" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, y: 26, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.98 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className={`relative w-full ${wide ? "max-w-4xl" : "max-w-xl"} max-h-[88vh] overflow-y-auto bg-card border border-ink/15 shadow-[0_30px_80px_-30px_rgba(25,23,34,0.5)]`}
            role="dialog"
            aria-modal="true"
          >
            <button
              onClick={onClose}
              aria-label="Close dialog"
              className="absolute right-3 top-3 z-10 w-8 h-8 grid place-items-center border border-ink/15 bg-paper font-mono text-xs hover:bg-ink hover:text-paper transition-colors"
            >
              ✕
            </button>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ------------------------------------------------------------------ */
/* Small bits                                                          */
/* ------------------------------------------------------------------ */

export function Chip({ children, tone = "ink" }: { children: ReactNode; tone?: "ink" | "coral" | "moss" | "cobalt" | "iris" | "amber" }) {
  const tones: Record<string, string> = {
    ink: "border-ink/20 text-ink2",
    coral: "border-coral/40 text-coral",
    moss: "border-moss/40 text-moss",
    cobalt: "border-cobalt/40 text-cobalt",
    iris: "border-iris/40 text-iris",
    amber: "border-amber/40 text-amber",
  };
  return (
    <span className={`inline-block font-mono text-[10.5px] uppercase tracking-[0.08em] border px-2 py-[3px] bg-card ${tones[tone]}`}>
      {children}
    </span>
  );
}

export function StatusDot({ color = "moss", pulse = true }: { color?: "moss" | "coral" | "cobalt" | "iris" | "amber"; pulse?: boolean }) {
  const map: Record<string, string> = {
    moss: "bg-moss",
    coral: "bg-coral",
    cobalt: "bg-cobalt",
    iris: "bg-iris",
    amber: "bg-amber",
  };
  return <span className={`inline-block w-2 h-2 rounded-full ${map[color]} ${pulse ? (color === "coral" ? "pulse-dot-coral" : "pulse-dot") : ""}`} aria-hidden />;
}

/* ------------------------------------------------------------------ */
/* Cursor + scroll progress                                            */
/* ------------------------------------------------------------------ */

export function Cursor() {
  const reduced = usePrefersReducedMotion();
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (reduced) return;
    const fine = window.matchMedia("(pointer: fine)").matches;
    if (!fine) return;
    setEnabled(true);
    document.body.classList.add("has-cursor");
    let x = window.innerWidth / 2, y = window.innerHeight / 2, rx = x, ry = y;
    let raf = 0;
    const move = (e: MouseEvent) => {
      x = e.clientX;
      y = e.clientY;
      if (dotRef.current) dotRef.current.style.transform = `translate(${x - 3}px, ${y - 3}px)`;
      const t = e.target as HTMLElement;
      const link = t.closest("a, button, [data-cursor]");
      ringRef.current?.classList.toggle("is-link", !!link);
    };
    const loop = () => {
      rx += (x - rx) * 0.16;
      ry += (y - ry) * 0.16;
      if (ringRef.current) {
        const s = ringRef.current.classList.contains("is-link") ? 26 : 17;
        ringRef.current.style.transform = `translate(${rx - s}px, ${ry - s}px)`;
      }
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener("mousemove", move);
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener("mousemove", move);
      cancelAnimationFrame(raf);
      document.body.classList.remove("has-cursor");
    };
  }, [reduced]);

  if (!enabled) return null;
  return (
    <>
      <div ref={dotRef} className="cursor-dot" aria-hidden />
      <div ref={ringRef} className="cursor-ring" aria-hidden />
    </>
  );
}

export function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const p = h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight);
      if (ref.current) ref.current.style.transform = `scaleX(${p})`;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return <div ref={ref} className="fixed top-0 left-0 right-0 h-[2.5px] bg-coral z-[80] origin-left scale-x-0" aria-hidden />;
}

/* ------------------------------------------------------------------ */
/* Hand-drawn icon set (custom inline SVG)                             */
/* ------------------------------------------------------------------ */

type IconProps = { className?: string };
const S = { fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

export const IcArrow = ({ className = "w-3.5 h-3.5" }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} {...S}><path d="M4 12h15M13 6l6 6-6 6" /></svg>
);
export const IcExternal = ({ className = "w-3.5 h-3.5" }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} {...S}><path d="M7 17 17 7M9 7h8v8" /></svg>
);
export const IcDownload = ({ className = "w-3.5 h-3.5" }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} {...S}><path d="M12 4v11m0 0 4.5-4.5M12 15l-4.5-4.5M4 20h16" /></svg>
);
export const IcPlay = ({ className = "w-3.5 h-3.5" }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} {...S}><path d="M8 5.5v13l11-6.5z" /></svg>
);
export const IcMail = ({ className = "w-3.5 h-3.5" }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} {...S}><rect x="3.5" y="5.5" width="17" height="13" rx="1.5" /><path d="m4.5 7 7.5 6 7.5-6" /></svg>
);
export const IcLock = ({ className = "w-3.5 h-3.5" }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} {...S}><rect x="5.5" y="10.5" width="13" height="9" rx="1.5" /><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" /></svg>
);
export const IcEye = ({ className = "w-3.5 h-3.5" }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} {...S}><path d="M3 12s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6Z" /><circle cx="12" cy="12" r="2.6" /></svg>
);
export const IcTrash = ({ className = "w-3.5 h-3.5" }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} {...S}><path d="M5 7h14M10 7V5h4v2m-7.5 0 .8 12h9.4l.8-12M10 11v5m4-5v5" /></svg>
);
export const IcEdit = ({ className = "w-3.5 h-3.5" }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} {...S}><path d="m5 19 .8-3.2L16.6 5a1.8 1.8 0 0 1 2.5 2.5L8.2 18.2 5 19Z" /></svg>
);
export const IcPlus = ({ className = "w-3.5 h-3.5" }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} {...S}><path d="M12 5v14M5 12h14" /></svg>
);
export const IcStar = ({ className = "w-3.5 h-3.5" }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} {...S}><path d="m12 4 2.4 5 5.6.7-4.1 3.9 1 5.5-4.9-2.7-4.9 2.7 1-5.5L4 9.7 9.6 9Z" /></svg>
);
export const IcFork = ({ className = "w-3.5 h-3.5" }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} {...S}><circle cx="7" cy="6" r="2.2" /><circle cx="17" cy="6" r="2.2" /><circle cx="12" cy="18" r="2.2" /><path d="M7 8.2v1.3a3 3 0 0 0 3 3h4a3 3 0 0 0 3-3V8.2M12 12.5v3.3" /></svg>
);
export const IcPin = ({ className = "w-3.5 h-3.5" }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} {...S}><path d="M12 21s-6.5-5.4-6.5-10.3A6.5 6.5 0 0 1 12 4a6.5 6.5 0 0 1 6.5 6.7C18.5 15.6 12 21 12 21Z" /><circle cx="12" cy="10.6" r="2.2" /></svg>
);
export const IcDoc = ({ className = "w-3.5 h-3.5" }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} {...S}><path d="M7 3.5h7l4 4V20.5H7Z" /><path d="M14 3.5v4h4M9.5 12h5m-5 3.5h5" /></svg>
);
export const IcUp = ({ className = "w-3.5 h-3.5" }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} {...S}><path d="M12 19V5m0 0-5.5 5.5M12 5l5.5 5.5" /></svg>
);
export const IcShield = ({ className = "w-3.5 h-3.5" }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} {...S}><path d="M12 3.5 5 6v6c0 4.6 3 7.4 7 8.5 4-1.1 7-3.9 7-8.5V6Z" /><path d="m9 11.5 2.2 2.2L15.5 9.5" /></svg>
);

/* Platform glyphs — stylised, drawn for this site */
export function PlatformGlyph({ platform, className = "w-4 h-4" }: { platform: string; className?: string }) {
  const p = platform.toLowerCase();
  let inner: ReactNode;
  if (p.includes("github")) inner = <><circle cx="7" cy="6.5" r="2" /><circle cx="17" cy="6.5" r="2" /><circle cx="12" cy="17.5" r="2" /><path d="M7 8.5v1a3.5 3.5 0 0 0 3.5 3.5h3A3.5 3.5 0 0 0 17 9.5v-1M12 13v2.4" /></>;
  else if (p.includes("linkedin")) inner = <><rect x="4" y="4" width="16" height="16" rx="2" /><path d="M8 11v5.5M8 7.8v.4M12 16.5v-3.2a2.2 2.2 0 0 1 4.4 0v3.2" /></>;
  else if (p.includes("kaggle")) inner = <><path d="M7 4.5v15M7 12l7-7.5M8.5 13.5 16 19.5" /></>;
  else if (p.includes("hugging")) inner = <><circle cx="12" cy="12" r="8" /><path d="M8.5 10.5v.4m7-.4v.4M8.5 14.5c1 1.3 2.3 2 3.5 2s2.5-.7 3.5-2" /></>;
  else if (p.includes("leetcode")) inner = <><path d="M14.5 4.5 8 11a2.4 2.4 0 0 0 0 3.4l6 6" /><path d="M12 8.5 16.5 4M12 16.5l4.5 4.5" /></>;
  else if (p.includes("codeforces")) inner = <><path d="M6 19v-6M12 19V7M18 19v-9" strokeWidth={2.6} /></>;
  else if (p.includes("hackerrank")) inner = <><path d="M12 3.5 19 7.5v8l-7 4-7-4v-8Z" /><path d="M9.5 9v6m5-6v6M9.5 12h5" /></>;
  else if (p.includes("codechef")) inner = <><path d="M8 13a4.5 4.5 0 1 1 8 0v2.5H8Z" /><path d="M8 18.5h8" /></>;
  else if (p.includes("x ") || p === "x" || p.includes("twitter")) inner = <><path d="m5 5 14 14M19 5 5 19" strokeWidth={2.2} /></>;
  else if (p.includes("youtube")) inner = <><rect x="3.5" y="6" width="17" height="12" rx="3" /><path d="m10.5 9.5 4.5 2.5-4.5 2.5Z" /></>;
  else if (p.includes("mail")) inner = <><rect x="3.5" y="5.5" width="17" height="13" rx="1.5" /><path d="m4.5 7 7.5 6 7.5-6" /></>;
  else if (p.includes("instagram")) inner = <><rect x="4.5" y="4.5" width="15" height="15" rx="4" /><circle cx="12" cy="12" r="3.4" /><circle cx="16.6" cy="7.4" r="0.6" fill="currentColor" /></>;
  else if (p.includes("scholar")) inner = <><path d="M12 4 3 9l9 5 7-3.9V15" /><path d="M6.5 11.5V16c0 1.4 2.5 2.8 5.5 2.8s5.5-1.4 5.5-2.8v-4.5" /></>;
  else if (p.includes("stackoverflow")) inner = <><path d="M7 14v6h10v-6M9.5 17.5h5M9.7 13.6l4.8 1M10.6 9.7l4.4 2.2M12.6 6l3.6 3.4" /></>;
  else inner = <><path d="M10 14a4 4 0 0 0 6 .4l2.5-2.5a4 4 0 0 0-5.7-5.7l-1.2 1.2" /><path d="M14 10a4 4 0 0 0-6-.4l-2.5 2.5a4 4 0 0 0 5.7 5.7l1.2-1.2" /></>;
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {inner}
    </svg>
  );
}
