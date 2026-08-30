import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { PROJECT_CATEGORIES, type ProjectItem } from "../lib/data";
import { useStore } from "../lib/store";
import { Chip, Modal, Reveal, SectionHead, Tilt, usePrefersReducedMotion } from "./ui";

/* ---- tiny inline architecture diagrams (no stock images) ---- */
function ArchDiagram({ kind }: { kind: ProjectItem["architecture"] }) {
  const box = "fill-none stroke-current";
  const common = { strokeWidth: 1.1, className: box } as const;
  const txt = "font-mono text-[7.5px] fill-current";
  if (kind === "rag")
    return (
      <svg viewBox="0 0 220 64" className="w-full h-16 text-ink2" aria-hidden>
        <rect x="4" y="22" width="38" height="20" {...common} />
        <text x="23" y="34" textAnchor="middle" className={txt}>docs</text>
        <rect x="58" y="22" width="38" height="20" {...common} />
        <text x="77" y="34" textAnchor="middle" className={txt}>embed</text>
        <rect x="112" y="22" width="38" height="20" {...common} />
        <text x="131" y="34" textAnchor="middle" className={txt}>faiss</text>
        <rect x="166" y="22" width="44" height="20" {...common} />
        <text x="188" y="34" textAnchor="middle" className={txt}>llm</text>
        <path d="M42 32h16M96 32h16M150 32h16" stroke="currentColor" strokeWidth="1.1" markerEnd="url(#arr)" />
        <text x="23" y="56" textAnchor="middle" className={txt}>40k</text>
        <text x="77" y="12" textAnchor="middle" className={txt}>bge-s</text>
        <text x="131" y="56" textAnchor="middle" className={txt}>k=5</text>
        <text x="188" y="12" textAnchor="middle" className={txt}>cite</text>
        <defs>
          <marker id="arr" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto">
            <path d="M0 0 8 4 0 8Z" fill="currentColor" />
          </marker>
        </defs>
      </svg>
    );
  if (kind === "cv")
    return (
      <svg viewBox="0 0 220 64" className="w-full h-16 text-ink2" aria-hidden>
        <rect x="4" y="18" width="28" height="28" strokeWidth="1.1" className="fill-none stroke-current" />
        <rect x="10" y="24" width="16" height="16" strokeWidth="0.9" className="fill-none stroke-current opacity-60" />
        <path d="M36 32h14" stroke="currentColor" strokeWidth="1.1" />
        <rect x="52" y="14" width="12" height="36" strokeWidth="1.1" className="fill-none stroke-current" />
        <path d="M66 32h14" stroke="currentColor" strokeWidth="1.1" />
        <rect x="82" y="20" width="12" height="24" strokeWidth="1.1" className="fill-none stroke-current" />
        <path d="M96 32h14" stroke="currentColor" strokeWidth="1.1" />
        <rect x="112" y="24" width="12" height="16" strokeWidth="1.1" className="fill-none stroke-current" />
        <path d="M126 32h14" stroke="currentColor" strokeWidth="1.1" />
        <text x="156" y="28" className={txt}>class</text>
        <text x="156" y="40" className={txt}>bbox</text>
        <path d="M150 25h-2m2 12h-2" stroke="currentColor" strokeWidth="1.1" />
        <text x="18" y="58" textAnchor="middle" className={txt}>frame</text>
        <text x="58" y="58" textAnchor="middle" className={txt}>conv</text>
        <text x="88" y="58" textAnchor="middle" className={txt}>pool</text>
        <text x="118" y="58" textAnchor="middle" className={txt}>fc</text>
      </svg>
    );
  if (kind === "nlp")
    return (
      <svg viewBox="0 0 220 64" className="w-full h-16 text-ink2" aria-hidden>
        <text x="8" y="20" className={txt}>token →</text>
        {[0, 1, 2, 3, 4].map((i) => (
          <rect key={i} x={56 + i * 18} y={12} width="12" height="12" strokeWidth="1.1" className="fill-none stroke-current" />
        ))}
        <path d="M62 28v10m18-10v10m18-10v10m18-10v10m18-10v10" stroke="currentColor" strokeWidth="1.1" />
        <rect x="50" y="40" width="104" height="14" strokeWidth="1.1" className="fill-none stroke-current" />
        <text x="102" y="50" textAnchor="middle" className={txt}>attention</text>
        <path d="M158 47h24" stroke="currentColor" strokeWidth="1.1" />
        <text x="186" y="44" className={txt}>intent</text>
        <text x="186" y="55" className={txt}>reply</text>
      </svg>
    );
  if (kind === "data")
    return (
      <svg viewBox="0 0 220 64" className="w-full h-16 text-ink2" aria-hidden>
        <path d="M10 52h200" stroke="currentColor" strokeWidth="1" />
        <path d="M10 52V10" stroke="currentColor" strokeWidth="1" />
        <path d="M18 44 44 40 70 42 96 30 122 33 148 22 174 25 200 14" fill="none" stroke="currentColor" strokeWidth="1.3" />
        <path d="M148 22 174 25 200 14" fill="none" stroke="currentColor" strokeWidth="1.3" strokeDasharray="3 3" opacity="0.55" />
        {[18, 44, 70, 96, 122].map((x, i) => (
          <circle key={x} cx={x} cy={[44, 40, 42, 30, 33][i]} r="1.8" fill="currentColor" />
        ))}
        <text x="170" y="36" className={txt}>forecast</text>
      </svg>
    );
  return null;
}

function ytId(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{6,})/);
  return m ? m[1] : null;
}

function ProjectCard({ p, i }: { p: ProjectItem; i: number }) {
  const [videoOpen, setVideoOpen] = useState(false);
  const reduced = usePrefersReducedMotion();
  const viewUrl = p.demo || p.github;
  const yid = p.video ? ytId(p.video) : null;

  const inner = (
    <article
      className={`group relative h-full border bg-card p-5 sm:p-6 flex flex-col card-lift ${
        p.featured ? "border-ink/25" : "border-ink/15"
      }`}
    >
      {p.featured && (
        <span className="absolute -top-[11px] right-4 font-mono text-[9.5px] tracking-[0.16em] bg-coral text-paper px-2 py-[3px]">
          ★ FEATURED
        </span>
      )}
      <div className="flex items-center justify-between gap-3">
        <span className="font-mono text-[10px] text-mut">
          {String(i + 1).padStart(2, "0")} / {p.date}
        </span>
        <Chip tone={p.category === "GENAI" ? "iris" : p.category === "COMPUTER VISION" ? "cobalt" : p.category === "NLP" ? "moss" : p.category === "DATA SCIENCE" ? "amber" : "ink"}>
          {p.category}
        </Chip>
      </div>

      <h3 className="font-display text-2xl font-semibold mt-3 group-hover:text-coral transition-colors duration-300">
        {p.name}
      </h3>
      <p className="text-ink2 text-[14.5px] mt-1.5 leading-relaxed">{p.tagline}</p>

      <div className="mt-4">
        <div className="font-mono text-[9.5px] tracking-[0.18em] text-coral uppercase">Problem</div>
        <p className="text-[13.5px] text-ink2 mt-1 leading-relaxed">{p.problem}</p>
      </div>

      {(p.featured || p.architecture !== "none") && p.architecture !== "none" && (
        <div className="mt-4 border border-dashed border-ink/20 bg-paper px-3 py-2 opacity-80 group-hover:opacity-100 transition-opacity">
          <ArchDiagram kind={p.architecture} />
        </div>
      )}

      {p.metrics.length > 0 && (
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2">
          {p.metrics.slice(0, 3).map((m) => (
            <div key={m} className="border border-ink/10 bg-paper px-2.5 py-2 font-mono text-[10px] text-ink2 leading-snug">
              {m}
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-1.5 mt-4">
        {p.tech.slice(0, 6).map((t) => (
          <Chip key={t}>{t}</Chip>
        ))}
      </div>

      <div className="mt-auto pt-5 flex flex-wrap items-center gap-4 font-mono text-[10.5px] tracking-[0.12em]">
        {viewUrl && (
          <a href={viewUrl} target="_blank" rel="noreferrer" className="link-underline text-ink font-semibold">
            VIEW PROJECT →
          </a>
        )}
        {p.github && (
          <a href={p.github} target="_blank" rel="noreferrer" className="link-underline text-ink2">
            GITHUB →
          </a>
        )}
        {(yid || p.video) && (
          <button
            onClick={() => setVideoOpen(true)}
            className="inline-flex items-center gap-1.5 text-coral link-underline"
          >
            <svg viewBox="0 0 24 24" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M8 5.5v13l11-6.5z" /></svg>
            DEMO VIDEO
          </button>
        )}
      </div>

      <Modal open={videoOpen} onClose={() => setVideoOpen(false)} wide>
        <div className="p-5 sm:p-6">
          <div className="font-mono text-[10.5px] tracking-[0.18em] text-mut uppercase mb-1">demo reel</div>
          <h3 className="font-display text-2xl font-semibold">{p.name}</h3>
          <div className="mt-4 aspect-video border border-ink/15 bg-ink">
            {yid ? (
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${yid}`}
                title={`${p.name} demo video`}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="w-full h-full grid place-items-center font-mono text-paper/60 text-xs">
                video URL is not a YouTube/Vimeo embed — set one in /admin
              </div>
            )}
          </div>
          {p.model && <p className="mt-4 font-mono text-[11px] text-mut">model: {p.model}</p>}
        </div>
      </Modal>
    </article>
  );

  return reduced ? inner : <Tilt max={3.5}>{inner}</Tilt>;
}

export default function Projects() {
  const { content } = useStore();
  const [cat, setCat] = useState<string>("ALL");
  const visible = useMemo(() => content.projects.filter((p) => !p.hidden), [content.projects]);
  const filtered = useMemo(() => {
    const list = cat === "ALL" ? visible : visible.filter((p) => p.category === cat);
    return [...list].sort((a, b) => Number(b.featured) - Number(a.featured));
  }, [visible, cat]);

  const counts = useMemo(() => {
    const m = new Map<string, number>();
    PROJECT_CATEGORIES.forEach((c) => m.set(c, c === "ALL" ? visible.length : visible.filter((p) => p.category === c).length));
    return m;
  }, [visible]);

  return (
    <section id="projects" className="relative py-20 sm:py-28">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHead
            num="03"
            label="SELECTED WORK"
            title={
              <>
                The <em className="italic text-coral font-display">Showcase</em>.
              </>
            }
            sub="Systems I designed, trained and shipped — each with the problem, the stack and the measured result."
          />
          <Reveal delay={150} className="font-mono text-[10.5px] text-mut pb-2">
            {filtered.length} / {visible.length} shown · sorted by featured
          </Reveal>
        </div>

        <Reveal delay={100}>
          <div className="mt-10 flex flex-wrap gap-2">
            {PROJECT_CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={`font-mono text-[10.5px] tracking-[0.12em] px-3.5 py-2 border transition-all duration-300 ${
                  cat === c
                    ? "bg-ink text-paper border-ink translate-y-[-1px]"
                    : "border-ink/20 text-ink2 hover:border-ink hover:-translate-y-[1px]"
                }`}
                aria-pressed={cat === c}
              >
                {c} <span className={cat === c ? "text-coral" : "text-mut"}>{counts.get(c) ?? 0}</span>
              </button>
            ))}
          </div>
        </Reveal>

        <motion.div layout className="grid sm:grid-cols-2 gap-5 mt-10">
          <AnimatePresence mode="popLayout">
            {filtered.map((p, i) => (
              <motion.div
                layout
                key={p.id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className={p.featured ? "sm:col-span-2" : ""}
              >
                <div className={p.featured ? "grid md:grid-cols-2 gap-0 [&>*>article]:h-full" : "h-full"}>
                  <ProjectCard p={p} i={i} />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {filtered.length === 0 && (
          <div className="border border-dashed border-ink/25 bg-card px-6 py-14 text-center mt-10">
            <div className="font-mono text-xs text-mut">$ ls projects/{cat.toLowerCase().replace(/\s+/g, "-")}/</div>
            <div className="font-display text-2xl font-semibold mt-3">Nothing here yet — add one from /admin.</div>
          </div>
        )}
      </div>
    </section>
  );
}
