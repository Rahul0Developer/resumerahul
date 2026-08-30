import { useEffect, useState } from "react";
import { useStore } from "../lib/store";
import { Reveal, SectionHead, StatusDot, usePrefersReducedMotion } from "./ui";
import { NET_SMALL } from "../lib/ascii";

const TERM_LINES = [
  { t: "Role      → ", v: "AI/ML Engineer" },
  { t: "Focus     → ", v: "GenAI + ML Systems" },
  { t: "Backend   → ", v: "Python · FastAPI" },
  { t: "Research  → ", v: "LLM / CV / NLP" },
  { t: "Status    → ", v: "OPEN TO WORK" },
];

function AboutTerminal() {
  const reduced = usePrefersReducedMotion();
  const [count, setCount] = useState(reduced ? 999 : 0);

  useEffect(() => {
    if (reduced) return;
    const total = TERM_LINES.reduce((a, l) => a + l.t.length + l.v.length, 0);
    const id = window.setInterval(() => {
      setCount((c) => {
        if (c >= total) {
          window.clearInterval(id);
          return c;
        }
        return c + 1;
      });
    }, 22);
    return () => window.clearInterval(id);
  }, [reduced]);

  let remaining = count;
  const rendered = TERM_LINES.map((l) => {
    const full = l.t + l.v;
    const take = Math.max(0, Math.min(full.length, remaining));
    remaining -= full.length;
    return full.slice(0, take);
  });
  const done = count >= TERM_LINES.reduce((a, l) => a + l.t.length + l.v.length, 0);

  return (
    <div className="relative bg-ink text-paper shadow-[0_24px_60px_-30px_rgba(25,23,34,0.6)]">
      <div className="absolute inset-0 translate-x-2.5 translate-y-2.5 border border-coral/40 -z-10" aria-hidden />
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-paper/15">
        <span className="font-mono text-[10.5px] text-paper/70">user@rahul.ai: ~</span>
        <span className="font-mono text-[10px] text-paper/40">bash — 80×14</span>
      </div>
      <div className="px-4 sm:px-5 py-4 font-mono text-[12px] sm:text-[12.5px] leading-[1.9] min-h-[196px]">
        <div className="text-paper/60">
          <span className="text-moss">user@rahul.ai</span>
          <span className="text-paper/50">:~$</span> ./about
        </div>
        <div className="mt-2 text-paper/45">── profile dump ──────────────────</div>
        {rendered.map((line, i) => (
          <div key={i} className="whitespace-pre">
            <span className="text-paper/55">{line.slice(0, TERM_LINES[i].t.length)}</span>
            <span className={i === TERM_LINES.length - 1 ? "text-coral font-semibold" : "text-paper"}>
              {line.slice(TERM_LINES[i].t.length)}
            </span>
          </div>
        ))}
        <div className={`mt-2 text-moss ${done ? "" : "opacity-0"}`}>
          ✓ exit code 0<span className="caret" />
        </div>
      </div>
    </div>
  );
}

export default function About() {
  const { content } = useStore();
  const p = content.profile;
  const edu = content.education[0];

  const facts = [
    { k: "LOCATION", v: p.location, tone: "text-ink" },
    { k: "DEGREE", v: edu ? edu.degree.split(",")[0] : "B.Tech CSE", tone: "text-ink" },
    { k: "CAREER FOCUS", v: "Applied ML · LLM Systems", tone: "text-ink" },
    { k: "STATUS", v: "Final year · Open to work", tone: "text-moss" },
  ];

  return (
    <section id="about" className="relative py-20 sm:py-28">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        <SectionHead
          num="01"
          label="PROFILE / ABOUT"
          title={
            <>
              Engineer&rsquo;s notes, <em className="italic text-coral font-display">not</em> a buzzword salad.
            </>
          }
        />

        <div className="grid lg:grid-cols-[1fr_0.92fr] gap-10 lg:gap-14 mt-12 items-start">
          <div>
            <Reveal>
              <p className="text-lg sm:text-xl leading-relaxed text-ink">
                I&rsquo;m a final-year Computer Science engineer who treats machine learning as an{" "}
                <span className="bg-coral/15 px-1">engineering discipline</span> — versioned data, measured evals,
                boring-and-reliable deployments.
              </p>
            </Reveal>
            <Reveal delay={90}>
              <p className="mt-5 text-ink2 leading-relaxed">
                My interest started with a scrapped-together OCR script for my father&rsquo;s shop invoices. It became
                a habit: find a messy, real problem, wrap it in a dataset, train something honest, ship it. These days
                that loop runs on <strong className="text-ink font-semibold">LLM applications, retrieval systems and
                computer vision</strong> — with FastAPI doing the unglamorous plumbing.
              </p>
            </Reveal>
            <Reveal delay={160}>
              <p className="mt-5 text-ink2 leading-relaxed">
                Currently interning at <strong className="text-ink font-semibold">NIELIT</strong>, building RAG systems
                over large public document corpora — and looking for a team where models have to survive contact with
                production.
              </p>
            </Reveal>

            <Reveal delay={220}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-ink/12 border border-ink/12 mt-8">
                {facts.map((f) => (
                  <div key={f.k} className="bg-paper px-4 py-3.5 hover:bg-card transition-colors">
                    <div className="font-mono text-[10px] tracking-[0.18em] text-mut">{f.k}</div>
                    <div className={`font-medium text-[14.5px] mt-1 ${f.tone}`}>{f.v}</div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>

          <div className="space-y-5">
            <Reveal variant="right" delay={120}>
              <AboutTerminal />
            </Reveal>
            <Reveal variant="right" delay={220}>
              <div className="border border-ink/15 bg-card px-4 py-4 flex items-center justify-between gap-4">
                <pre className="ascii text-[11px] text-ink2 leading-snug" aria-hidden>{NET_SMALL}</pre>
                <div className="text-right font-mono text-[10px] text-mut leading-relaxed shrink-0">
                  fig. 01 —<br />
                  the whole trick,<br />
                  <span className="text-coral">minus the hype</span>
                </div>
              </div>
            </Reveal>
            <Reveal variant="right" delay={300}>
              <div className="flex items-center gap-3 font-mono text-[10.5px] text-mut">
                <StatusDot color="moss" />
                <span>
                  response time: usually &lt; 24h · preferred channel: <span className="text-ink2">email</span>
                </span>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
