import { useStore } from "../lib/store";
import { Chip, Reveal, SectionHead } from "./ui";

const GROUP_TONES = [
  { chip: "cobalt", text: "text-cobalt" },
  { chip: "iris", text: "text-iris" },
  { chip: "moss", text: "text-moss" },
  { chip: "amber", text: "text-amber" },
  { chip: "coral", text: "text-coral" },
  { chip: "cobalt", text: "text-cobalt" },
  { chip: "ink", text: "text-ink2" },
] as const;

export default function Skills() {
  const { content } = useStore();
  const total = content.skills.reduce((a, g) => a + g.items.length, 0);
  return (
    <section id="skills" className="relative py-20 sm:py-28">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHead
            num="06"
            label="TOOLBOX"
            title={
              <>
                Tools I actually <em className="italic text-coral font-display">use</em>.
              </>
            }
            sub="Not a keyword dump for ATS bots — the stack I reach for when something has to ship."
          />
          <Reveal delay={150} className="pb-2 text-right">
            <div className="font-display text-3xl font-semibold">
              {total}<span className="text-coral">+</span>
            </div>
            <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-mut">tools in rotation</div>
          </Reveal>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-12">
          {content.skills.map((g, gi) => (
            <Reveal key={g.id} delay={(gi % 3) * 80}>
              <div className="group border border-ink/15 bg-card p-5 h-full card-lift relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] tracking-[0.2em] text-mut">G.{String(gi + 1).padStart(2, "0")}</span>
                  <span className={`font-mono text-[10px] ${GROUP_TONES[gi % GROUP_TONES.length].text}`}>
                    {g.items.length} tools
                  </span>
                </div>
                <h3 className="font-display text-xl font-semibold mt-2 group-hover:text-coral transition-colors duration-300">{g.group}</h3>
                <div className="flex flex-wrap gap-1.5 mt-4">
                  {g.items.map((s, si) => (
                    <span key={s} className="floaty" style={{ animationDelay: `${(si % 5) * 0.7 + gi * 0.3}s` }}>
                      <Chip tone={GROUP_TONES[gi % GROUP_TONES.length].chip}>{s}</Chip>
                    </span>
                  ))}
                </div>
                <div className="absolute bottom-0 left-0 h-[2.5px] w-full bg-current scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500 text-coral" aria-hidden />
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Achievements() {
  const { content } = useStore();
  const kindTone: Record<string, "coral" | "cobalt" | "iris" | "moss" | "amber" | "ink"> = {
    HACKATHON: "coral",
    COMPETITION: "cobalt",
    KAGGLE: "amber",
    "OPEN SOURCE": "moss",
    SPEAKING: "iris",
    MILESTONE: "ink",
    AWARD: "coral",
    RESEARCH: "iris",
  };
  return (
    <section id="achievements" className="relative py-20 sm:py-28 bg-paper2/50 border-y border-ink/10">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        <SectionHead
          num="08"
          label="ACHIEVEMENTS"
          title={
            <>
              Receipts & <em className="italic text-coral font-display">milestones</em>.
            </>
          }
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-12">
          {content.achievements.map((a, i) => (
            <Reveal key={a.id} delay={(i % 3) * 80}>
              <article className="border border-ink/15 bg-card p-5 h-full card-lift flex flex-col">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] text-mut">{a.year}</span>
                  <Chip tone={kindTone[a.kind] ?? "ink"}>{a.kind}</Chip>
                </div>
                <h3 className="font-display text-lg font-semibold mt-3 leading-snug">{a.title}</h3>
                <p className="text-[13.5px] text-ink2 mt-2 leading-relaxed flex-1">{a.detail}</p>
                <div className="mt-4 font-mono text-[10px] text-coral">● logged</div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
