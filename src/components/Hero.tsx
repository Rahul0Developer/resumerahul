import { useEffect, useMemo, useRef, useState } from "react";
import { PIPELINE, sparkRow, MARGIN_SNIPPETS } from "../lib/ascii";
import { useStore } from "../lib/store";
import { Magnetic, Reveal, StatusDot, usePrefersReducedMotion } from "./ui";

function SystemCard() {
  const reduced = usePrefersReducedMotion();
  const [tick, setTick] = useState(0);
  const [hover, setHover] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reduced) return;
    const id = window.setInterval(() => setTick((t) => t + 1), hover ? 70 : 150);
    return () => window.clearInterval(id);
  }, [reduced, hover]);

  /* gentle parallax following the cursor */
  useEffect(() => {
    if (reduced) return;
    const wrap = wrapRef.current;
    const card = cardRef.current;
    if (!wrap || !card) return;
    const onMove = (e: MouseEvent) => {
      const r = wrap.getBoundingClientRect();
      const px = (e.clientX - r.left) / Math.max(1, r.width) - 0.5;
      const py = (e.clientY - r.top) / Math.max(1, r.height) - 0.5;
      card.style.transform = `rotateX(${(-py * 3).toFixed(2)}deg) rotateY(${(px * 3.5).toFixed(2)}deg)`;
    };
    const onLeave = () => {
      card.style.transform = "rotateX(0deg) rotateY(0deg)";
    };
    wrap.addEventListener("mousemove", onMove);
    wrap.addEventListener("mouseleave", onLeave);
    return () => {
      wrap.removeEventListener("mousemove", onMove);
      wrap.removeEventListener("mouseleave", onLeave);
    };
  }, [reduced]);

  return (
    <div ref={wrapRef} className="relative [perspective:1000px]">
      {/* offset shadow frame */}
      <div className="absolute inset-0 translate-x-3 translate-y-3 border border-iris/30 bg-iris/[0.05] pointer-events-none" aria-hidden />
      <div
        ref={cardRef}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        className="relative bg-card border border-ink/15 shadow-[0_24px_60px_-30px_rgba(25,23,34,0.35)] transition-transform duration-200 will-change-transform"
        style={{ transformStyle: "preserve-3d" }}
      >
        <div className="scanline" aria-hidden />
        {/* title bar */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-ink/10 bg-paper2/60">
          <div className="flex items-center gap-1.5" aria-hidden>
            <span className="w-2.5 h-2.5 rounded-full bg-coral/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-moss/80" />
          </div>
          <span className="font-mono text-[10.5px] text-ink2 tracking-wide">rahul@ai-lab: ~/intelligent-systems</span>
          <span className="font-mono text-[10px] text-mut">zsh</span>
        </div>

        <div className="px-4 sm:px-6 py-5">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-iris">$ pipeline --inspect</span>
            <span className="font-mono text-[10px] text-mut">{hover ? "<hover: interactive>" : "<idle>"}</span>
          </div>

          <pre className="ascii text-[11px] sm:text-[12.5px] text-ink mt-3 overflow-x-auto" aria-label="ASCII diagram of an ML pipeline">
            {PIPELINE}
          </pre>

          {/* animated loss sparkline */}
          <div className="mt-4 border-t border-dashed border-ink/15 pt-3">
            <div className="flex items-center gap-3">
              <span className="font-mono text-[10.5px] text-mut shrink-0">loss</span>
              <span className="ascii text-[13px] text-cobalt tracking-tight" aria-hidden>
                {reduced ? sparkRow(4) : sparkRow(tick)}
              </span>
              <span className="font-mono text-[10.5px] text-moss ml-auto">▼ converging</span>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-3 font-mono text-[10px]">
              <div className="border border-ink/10 px-2 py-1.5 bg-paper">
                <div className="text-mut">latency p50</div>
                <div className="text-ink text-[12px]">1.21s</div>
              </div>
              <div className="border border-ink/10 px-2 py-1.5 bg-paper">
                <div className="text-mut">faithfulness</div>
                <div className="text-ink text-[12px]">0.89</div>
              </div>
              <div className="border border-ink/10 px-2 py-1.5 bg-paper">
                <div className="text-mut">gpu mem</div>
                <div className="text-ink text-[12px]">6.2GB</div>
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between font-mono text-[10.5px]">
            <span className="flex items-center gap-2 text-moss">
              <StatusDot color="moss" /> status: SERVING
            </span>
            <span className="text-mut">uptime 99.2% · v0.4.1</span>
          </div>
        </div>
      </div>

      {/* floating annotation tags */}
      <div className="absolute -left-3 sm:-left-8 top-16 hidden md:block floaty" style={{ animationDelay: "0.6s" }} aria-hidden>
        <span className="font-mono text-[10px] bg-ink text-paper px-2 py-1">retrieval: faiss-ivf</span>
      </div>
      <div className="absolute -right-2 sm:-right-6 bottom-24 hidden md:block floaty" aria-hidden>
        <span className="font-mono text-[10px] border border-coral/50 text-coral bg-card px-2 py-1">eval: ragas ✓</span>
      </div>
    </div>
  );
}

export default function Hero() {
  const { content } = useStore();
  const [on, setOn] = useState(false);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const t = window.setTimeout(() => setOn(true), reduced ? 0 : 120);
    return () => window.clearTimeout(t);
  }, [reduced]);

  const p = content.profile;
  const gh = p.githubUsername ? `https://github.com/${p.githubUsername}` : "https://github.com";
  const li = content.socials.find((s) => s.platform.toLowerCase().includes("linkedin"))?.url || "https://www.linkedin.com";

  const stats = useMemo(
    () => [
      { n: String(content.projects.filter((x) => !x.hidden).length).padStart(2, "0"), l: "projects built" },
      { n: String(content.certificates.length).padStart(2, "0"), l: "certifications" },
      { n: String(content.experience.length).padStart(2, "0"), l: "experience stints" },
    ],
    [content]
  );

  const goId = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <section id="home" className={`relative pt-[104px] sm:pt-[120px] pb-0 overflow-hidden ${on ? "masks-on" : ""}`}>
      {/* margin snippets */}
      <div className="hidden xl:block absolute left-6 top-40 font-mono text-[10px] text-mut/80 space-y-10 select-none" aria-hidden>
        {MARGIN_SNIPPETS.slice(0, 4).map((s, i) => (
          <div key={s} className="floaty" style={{ animationDelay: `${i * 0.9}s` }}>
            {s}
          </div>
        ))}
      </div>
      <div className="hidden xl:block absolute right-6 top-64 font-mono text-[10px] text-mut/80 space-y-12 select-none" aria-hidden>
        {MARGIN_SNIPPETS.slice(4).map((s, i) => (
          <div key={s} className="floaty" style={{ animationDelay: `${i * 1.2}s` }}>
            {s}
          </div>
        ))}
      </div>

      <div className="max-w-6xl mx-auto px-5 sm:px-8 grid lg:grid-cols-[1.12fr_0.88fr] gap-14 lg:gap-10 items-start">
        {/* left — editorial intro */}
        <div>
          <div className="mask-line">
            <span>
              <span className="inline-flex items-center gap-2.5 font-mono text-[10.5px] sm:text-[11px] tracking-[0.2em] text-moss border border-moss/35 bg-moss/[0.07] px-3 py-1.5">
                <StatusDot color="moss" /> {p.statusLine}
              </span>
            </span>
          </div>

          <h1 className="font-display font-semibold tracking-[-0.015em] text-[clamp(2.5rem,6.2vw,4.3rem)] leading-[1.04] mt-7">
            <span className="mask-line" style={{ ["--rv-delay" as string]: "90ms" }}>
              <span>Hey, I&rsquo;m Rahul&thinsp;—</span>
            </span>
            <span className="mask-line" style={{ ["--rv-delay" as string]: "190ms" }}>
              <span>
                I build <em className="text-coral font-display italic">intelligent</em>
              </span>
            </span>
            <span className="mask-line" style={{ ["--rv-delay" as string]: "290ms" }}>
              <span>systems that solve</span>
            </span>
            <span className="mask-line" style={{ ["--rv-delay" as string]: "390ms" }}>
              <span>
                real problems<span className="text-coral">.</span>
              </span>
            </span>
          </h1>

          <div className="mask-line mt-6" style={{ ["--rv-delay" as string]: "500ms" }}>
            <span className="font-mono text-[11.5px] sm:text-xs tracking-[0.14em] text-ink2 uppercase">{p.tagline}</span>
          </div>

          <div className="mask-line mt-5" style={{ ["--rv-delay" as string]: "580ms" }}>
            <span className="block">
              <p className="text-ink2 max-w-lg leading-relaxed">{p.intro}</p>
            </span>
          </div>

          <div className="mask-line mt-8" style={{ ["--rv-delay" as string]: "660ms" }}>
            <span className="flex flex-wrap items-center gap-3">
              <Magnetic>
                <a
                  href={gh}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 bg-ink text-paper font-mono text-[11px] tracking-[0.14em] px-5 py-3 hover:bg-coral transition-colors duration-300"
                >
                  GITHUB
                  <svg viewBox="0 0 24 24" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M7 17 17 7M9 7h8v8" /></svg>
                </a>
              </Magnetic>
              <Magnetic>
                <a
                  href={li}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 border border-ink/25 font-mono text-[11px] tracking-[0.14em] px-5 py-3 hover:bg-ink hover:text-paper transition-colors duration-300"
                >
                  LINKEDIN
                </a>
              </Magnetic>
              <Magnetic>
                <button
                  onClick={() => goId("resume")}
                  className="inline-flex items-center gap-2 border border-coral/50 text-coral font-mono text-[11px] tracking-[0.14em] px-5 py-3 hover:bg-coral hover:text-paper transition-colors duration-300"
                >
                  RESUME
                </button>
              </Magnetic>
              <Magnetic>
                <button
                  onClick={() => goId("contact")}
                  className="font-mono text-[11px] tracking-[0.14em] text-ink2 px-2 py-3 link-underline hover:text-ink"
                >
                  CONTACT ↓
                </button>
              </Magnetic>
            </span>
          </div>

          {/* stats strip */}
          <div className="mask-line mt-12" style={{ ["--rv-delay" as string]: "760ms" }}>
            <span className="block">
              <div className="grid grid-cols-3 max-w-md border-t border-ink/15">
                {stats.map((s, i) => (
                  <div key={s.l} className={`pt-4 pr-4 ${i > 0 ? "border-l border-ink/15 pl-4" : ""}`}>
                    <div className="font-display text-3xl font-semibold text-ink">
                      {s.n}
                      <span className="text-coral">+</span>
                    </div>
                    <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-mut mt-1">{s.l}</div>
                  </div>
                ))}
              </div>
            </span>
          </div>
        </div>

        {/* right — interactive ascii system card */}
        <Reveal variant="right" delay={200} className="lg:pt-4">
          <SystemCard />
        </Reveal>
      </div>

      {/* marquee */}
      <div className="marquee mt-16 sm:mt-20 border-y border-ink/12 bg-card/60 overflow-hidden select-none" aria-hidden>
        <div className="marquee-track flex whitespace-nowrap w-max">
          {[0, 1].map((k) => (
            <div key={k} className="flex items-center">
              {["LANGCHAIN", "FAISS", "PYTORCH", "LLAMA 3", "RAG PIPELINES", "FASTAPI", "OPENCV", "MEDIAPIPE", "HUGGING FACE", "DOCKER", "POSTGRESQL", "EMBEDDINGS", "YOLO", "EVALS"].map(
                (t) => (
                  <span key={t + k} className="flex items-center font-mono text-[11px] tracking-[0.22em] text-ink2 py-3">
                    <span className="px-6">{t}</span>
                    <span className="text-coral">✳</span>
                  </span>
                )
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
