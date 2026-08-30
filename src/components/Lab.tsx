import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CHIP } from "../lib/ascii";
import type { LabItem, LabStatus } from "../lib/data";
import { useStore } from "../lib/store";
import { Reveal, Scramble, StatusDot, usePrefersReducedMotion } from "./ui";

const STATUS_COLOR: Record<LabStatus, "coral" | "moss" | "cobalt"> = {
  EXPERIMENTAL: "coral",
  STABLE: "moss",
  ARCHIVED: "cobalt",
};

function LabCard({ item, delay }: { item: LabItem; delay: number }) {
  const [open, setOpen] = useState(false);
  const reduced = usePrefersReducedMotion();
  return (
    <Reveal delay={delay}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full text-left group border border-paper/15 bg-paper/[0.04] hover:bg-paper/[0.07] hover:border-paper/30 transition-all duration-300 relative overflow-hidden"
        aria-expanded={open}
      >
        <div className="px-5 py-4 border-b border-paper/10 flex items-center justify-between">
          <span className="font-mono text-[10px] tracking-[0.18em] text-iris">AI_LAB / {item.code}</span>
          <span className="font-mono text-[10px] text-paper/40">{open ? "[-]" : "[+]"}</span>
        </div>
        <div className="px-5 py-4">
          <h3 className="font-mono text-[13.5px] font-bold tracking-wide text-paper group-hover:text-coral transition-colors">
            {item.title}
          </h3>
          <div className="mt-3 space-y-1.5 font-mono text-[11px]">
            <div><span className="text-paper/40">Model      :</span> <span className="text-paper/85">{item.model}</span></div>
            <div><span className="text-paper/40">Stack      :</span> <span className="text-paper/85">{item.stack.join(" · ")}</span></div>
            <div className="flex items-center gap-2">
              <span className="text-paper/40">Status     :</span>
              <StatusDot color={STATUS_COLOR[item.status]} pulse={item.status === "EXPERIMENTAL"} />
              <span className={item.status === "EXPERIMENTAL" ? "text-coral" : item.status === "STABLE" ? "text-moss" : "text-cobalt"}>{item.status}</span>
            </div>
          </div>
          <div className="mt-3 font-mono text-[10.5px] text-coral/90">» {item.metric}</div>
          <AnimatePresence initial={false}>
            {open && (
              <motion.div
                initial={reduced ? false : { height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="overflow-hidden"
              >
                <div className="mt-3 pt-3 border-t border-dashed border-paper/15 font-mono text-[10.5px] leading-relaxed">
                  <div className="text-paper/50">$ ./run.sh --exp {item.code.toLowerCase()}</div>
                  <div className="text-paper/75 mt-1">{item.note}</div>
                  <div className="text-moss mt-1">✓ log appended to lab/{item.code.toLowerCase()}.md</div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </button>
    </Reveal>
  );
}

export default function Lab() {
  const { content } = useStore();
  return (
    <section id="lab" className="relative py-20 sm:py-28 bg-ink text-paper overflow-hidden">
      <div className="absolute inset-0 opacity-[0.05] dot-grid" style={{ backgroundImage: "radial-gradient(rgba(242,240,246,0.9) 1px, transparent 1.2px)" }} aria-hidden />
      <div className="relative max-w-6xl mx-auto px-5 sm:px-8">
        <div className="grid lg:grid-cols-[1fr_auto] gap-10 items-start">
          <div>
            <Reveal>
              <div className="flex items-center gap-4">
                <span className="font-mono text-[11px] tracking-[0.22em] text-coral">05</span>
                <span className="font-mono text-[11px] tracking-[0.22em] text-paper/70 uppercase">
                  <Scramble text="RESEARCH BENCH / AI_LAB" />
                </span>
                <span className="rule-tick text-paper/25 flex-1 max-w-[140px]" aria-hidden />
              </div>
            </Reveal>
            <Reveal delay={90}>
              <h2 className="font-display font-semibold text-[clamp(1.9rem,4.5vw,3.1rem)] leading-[1.08] mt-4">
                The <em className="italic text-coral font-display">messy shelf</em> behind the showcase.
              </h2>
            </Reveal>
            <Reveal delay={160}>
              <p className="mt-4 text-paper/65 max-w-xl leading-relaxed">
                Experiments, benchmarks and half-formed ideas. Some become projects, most become lessons — all of them
                are logged. Click a card for its run note.
              </p>
            </Reveal>
            <Reveal delay={220}>
              <div className="mt-8 flex flex-wrap gap-5 font-mono text-[10.5px] text-paper/50">
                <span className="flex items-center gap-2"><StatusDot color="coral" /> experimental: {content.lab.filter((l) => l.status === "EXPERIMENTAL").length}</span>
                <span className="flex items-center gap-2"><StatusDot color="moss" pulse={false} /> stable: {content.lab.filter((l) => l.status === "STABLE").length}</span>
                <span className="flex items-center gap-2"><StatusDot color="cobalt" pulse={false} /> archived: {content.lab.filter((l) => l.status === "ARCHIVED").length}</span>
              </div>
            </Reveal>
          </div>
          <Reveal variant="right" delay={200} className="hidden lg:block">
            <pre className="ascii text-[11px] text-paper/35 leading-snug" aria-hidden>{CHIP}</pre>
          </Reveal>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-12">
          {content.lab.map((l, i) => (
            <LabCard key={l.id} item={l} delay={(i % 3) * 80} />
          ))}
          <Reveal delay={160}>
            <a
              href="#/admin"
              className="h-full min-h-[160px] grid place-items-center border border-dashed border-paper/25 text-paper/50 hover:text-coral hover:border-coral/60 transition-all duration-300 group"
            >
              <div className="text-center font-mono">
                <div className="text-2xl group-hover:rotate-90 transition-transform duration-300">+</div>
                <div className="text-[10.5px] tracking-[0.16em] mt-1">LOG NEW EXPERIMENT</div>
                <div className="text-[9.5px] text-paper/35 mt-1">via /admin → AI Lab</div>
              </div>
            </a>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
