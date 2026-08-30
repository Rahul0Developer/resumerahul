import { useStore } from "../lib/store";
import { Chip, Reveal, SectionHead, useInView } from "./ui";

function TimelineItem({
  item,
  isLast,
}: {
  item: { role: string; company: string; location: string; start: string; end: string; summary: string; bullets: string[]; tech: string[] };
  isLast: boolean;
}) {
  const { ref, inView } = useInView<HTMLDivElement>(0.25);
  return (
    <div ref={ref} className="relative grid md:grid-cols-[170px_1fr] gap-4 md:gap-8 pb-12 last:pb-0">
      {/* rail */}
      <div className="absolute left-[190px] top-2 bottom-0 w-px bg-ink/12 hidden md:block" aria-hidden />
      {!isLast && <div className="absolute left-[7px] md:left-[186.5px] top-3 bottom-0 w-px bg-ink/12 md:hidden" aria-hidden />}

      <div className="flex md:flex-col items-baseline md:items-start gap-3 md:gap-2 pl-7 md:pl-0">
        <span
          className={`absolute left-0 md:left-[183px] top-1.5 w-[15px] h-[15px] rounded-full border-2 border-coral bg-paper transition-transform duration-500 ${
            inView ? "scale-100" : "scale-0"
          }`}
          aria-hidden
        >
          <span className={`absolute inset-[3px] rounded-full bg-coral ${inView ? "pulse-dot-coral" : ""}`} />
        </span>
        <div className="font-mono text-[11px] text-ink2 whitespace-nowrap">
          {item.start} — {item.end}
        </div>
        <div className="font-mono text-[10px] text-mut uppercase tracking-[0.14em]">{item.location}</div>
      </div>

      <Reveal delay={80} className="min-w-0">
        <article className="group border border-ink/15 bg-card p-5 sm:p-6 card-lift relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-coral via-iris to-cobalt scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500" aria-hidden />
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="font-display text-xl sm:text-2xl font-semibold">
              {item.role} <span className="text-coral">@</span> {item.company}
            </h3>
          </div>
          <p className="text-ink2 mt-2 text-[15px] leading-relaxed">{item.summary}</p>
          <ul className="mt-4 space-y-2">
            {item.bullets.map((b) => (
              <li key={b} className="flex gap-3 text-[14px] text-ink2 leading-relaxed">
                <span className="text-coral font-mono mt-0.5 shrink-0">▸</span>
                {b}
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-1.5 mt-4">
            {item.tech.map((t) => (
              <Chip key={t}>{t}</Chip>
            ))}
          </div>
        </article>
      </Reveal>
    </div>
  );
}

export function Experience() {
  const { content } = useStore();
  return (
    <section id="experience" className="relative py-20 sm:py-28 bg-paper2/50 border-y border-ink/10">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        <SectionHead
          num="02"
          label="EXPERIENCE LOG"
          title={
            <>
              Where I&rsquo;ve <em className="italic text-coral font-display">shipped</em>.
            </>
          }
          sub="Internships, research and freelance work — with the receipts."
        />
        <div className="mt-14">
          {content.experience.map((e, i) => (
            <TimelineItem key={e.id} item={e} isLast={i === content.experience.length - 1} />
          ))}
        </div>
      </div>
    </section>
  );
}

export function Education() {
  const { content } = useStore();
  return (
    <section id="education" className="relative py-20 sm:py-28">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        <SectionHead
          num="09"
          label="EDUCATION"
          title={
            <>
              The <em className="italic text-coral font-display">groundwork</em>.
            </>
          }
        />
        <div className="grid md:grid-cols-2 gap-5 mt-12">
          {content.education.map((e, i) => (
            <Reveal key={e.id} delay={i * 90}>
              <article className="border border-ink/15 bg-card h-full p-6 card-lift relative">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="font-mono text-[10px] tracking-[0.18em] text-mut uppercase">
                      {e.start} — {e.end}
                    </div>
                    <h3 className="font-display text-xl font-semibold mt-2 leading-snug">{e.degree}</h3>
                    <div className="text-ink2 mt-1 text-[14.5px]">
                      {e.school} · {e.branch}
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="font-display text-2xl font-semibold text-coral whitespace-nowrap">{e.score}</div>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="font-mono text-[10px] tracking-[0.18em] text-mut uppercase mb-2">Relevant coursework</div>
                  <div className="flex flex-wrap gap-1.5">
                    {e.coursework.map((c) => (
                      <Chip key={c}>{c}</Chip>
                    ))}
                  </div>
                </div>
                {e.note && <p className="mt-4 text-[13.5px] text-mut border-t border-dashed border-ink/15 pt-3">↳ {e.note}</p>}
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
