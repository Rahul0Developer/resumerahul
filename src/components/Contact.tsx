import { useState, type FormEvent } from "react";
import { useStore } from "../lib/store";
import { IcMail, PlatformGlyph, Reveal, Scramble, SectionHead } from "./ui";

/* ---------------- Socials ---------------- */

export function Socials() {
  const { content } = useStore();
  const active = content.socials.filter((s) => s.enabled);
  return (
    <section id="socials" className="relative py-20 sm:py-28">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        <SectionHead
          num="11"
          label="ELSEWHERE ON THE NET"
          title={
            <>
              Find me around <em className="italic text-coral font-display">the internet</em>.
            </>
          }
          sub="One handle, many terminals. Platforms are managed dynamically from /admin → Social Links."
        />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mt-12">
          {active.map((s, i) => (
            <Reveal key={s.id} delay={(i % 4) * 60}>
              <a
                href={s.url}
                target={s.url.startsWith("mailto:") ? undefined : "_blank"}
                rel="noreferrer"
                className="group flex items-start gap-3 border border-ink/15 bg-card p-4 h-full card-lift"
              >
                <span className="w-9 h-9 shrink-0 grid place-items-center border border-ink/15 text-ink2 group-hover:text-coral group-hover:border-coral/50 transition-colors">
                  <PlatformGlyph platform={s.platform} />
                </span>
                <span className="min-w-0">
                  <span className="block font-mono text-[11.5px] font-semibold text-ink group-hover:text-coral transition-colors">
                    {s.platform}
                  </span>
                  <span className="block font-mono text-[10px] text-mut truncate mt-0.5">
                    {s.username || s.url.replace("https://", "").replace("mailto:", "")}
                  </span>
                  <span className="hidden sm:block text-[11px] text-ink2 mt-1 leading-snug">{s.note}</span>
                </span>
                <span className="ml-auto font-mono text-mut group-hover:text-coral group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" aria-hidden>
                  ↗
                </span>
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- Contact + Footer ---------------- */

export function Contact() {
  const { content } = useStore();
  const p = content.profile;
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [sent, setSent] = useState(false);
  const [copied, setCopied] = useState(false);

  const gh = p.githubUsername ? `https://github.com/${p.githubUsername}` : "https://github.com";
  const li = content.socials.find((s) => s.platform.toLowerCase().includes("linkedin"))?.url || "https://www.linkedin.com";

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !msg.trim()) {
      setErr("All three fields are required.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErr("That email doesn't look valid.");
      return;
    }
    setErr("");
    const subject = encodeURIComponent(`Portfolio contact from ${name}`);
    const body = encodeURIComponent(`${msg}\n\n— ${name} (${email})`);
    window.location.href = `mailto:${p.email}?subject=${subject}&body=${body}`;
    setSent(true);
  };

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(p.email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section id="contact" className="relative py-20 sm:py-28 bg-ink text-paper overflow-hidden">
      <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: "radial-gradient(rgba(242,240,246,0.9) 1px, transparent 1.2px)", backgroundSize: "24px 24px" }} aria-hidden />
      <div className="absolute -right-10 top-10 hidden lg:block font-mono text-[11px] text-paper/20 select-none" aria-hidden>
        <pre className="ascii">{`$ ./reach_out.sh
> channel: open
> latency: < 24h`}</pre>
      </div>
      <div className="relative max-w-6xl mx-auto px-5 sm:px-8 grid lg:grid-cols-[1.05fr_0.95fr] gap-14">
        <div>
          <Reveal>
            <div className="flex items-center gap-4">
              <span className="font-mono text-[11px] tracking-[0.22em] text-coral">12</span>
              <span className="font-mono text-[11px] tracking-[0.22em] text-paper/70 uppercase">
                <Scramble text="TRANSMISSION / CONTACT" />
              </span>
              <span className="rule-tick text-paper/25 flex-1 max-w-[140px]" aria-hidden />
            </div>
          </Reveal>
          <Reveal delay={90}>
            <h2 className="font-display font-semibold text-[clamp(2rem,4.8vw,3.4rem)] leading-[1.06] mt-5">
              Let&rsquo;s build something <em className="italic text-coral font-display">useful</em>.
            </h2>
          </Reveal>
          <Reveal delay={160}>
            <p className="mt-5 text-paper/65 max-w-md leading-relaxed">
              Open to AI/ML engineering roles, internships-turned-full-time, and honest conversations about shipping
              models to production.
            </p>
          </Reveal>
          <Reveal delay={220}>
            <div className="mt-9 space-y-3">
              <button onClick={copyEmail} className="group w-full sm:w-auto flex items-center justify-between gap-6 border border-paper/20 px-5 py-3.5 hover:border-coral hover:bg-paper/[0.04] transition-all">
                <span className="flex items-center gap-3">
                  <IcMail className="w-4 h-4 text-coral" />
                  <span className="font-mono text-[13px]">{p.email}</span>
                </span>
                <span className="font-mono text-[10px] tracking-[0.16em] text-paper/50 group-hover:text-coral transition-colors">
                  {copied ? "COPIED ✓" : "CLICK TO COPY"}
                </span>
              </button>
              <div className="flex flex-wrap gap-3">
                <a href={li} target="_blank" rel="noreferrer" className="font-mono text-[10.5px] tracking-[0.14em] border border-paper/20 px-4 py-2.5 hover:bg-paper hover:text-ink transition-colors">
                  LINKEDIN ↗
                </a>
                <a href={gh} target="_blank" rel="noreferrer" className="font-mono text-[10.5px] tracking-[0.14em] border border-paper/20 px-4 py-2.5 hover:bg-paper hover:text-ink transition-colors">
                  GITHUB ↗
                </a>
              </div>
            </div>
          </Reveal>
        </div>

        <Reveal variant="right" delay={150}>
          <form onSubmit={submit} className="border border-paper/15 bg-paper/[0.04] p-6 sm:p-7 relative">
            <div className="absolute inset-0 translate-x-2 translate-y-2 border border-coral/30 -z-10" aria-hidden />
            <div className="font-mono text-[10.5px] text-paper/50 mb-5">$ new message --to rahul</div>
            <div className="space-y-4">
              <div>
                <label htmlFor="cf-name" className="font-mono text-[10px] tracking-[0.18em] text-paper/60 uppercase">Name</label>
                <input
                  id="cf-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1.5 w-full bg-transparent border border-paper/25 px-3.5 py-2.5 text-paper placeholder:text-paper/30 focus:border-coral transition-colors"
                  placeholder="Ada Lovelace"
                />
              </div>
              <div>
                <label htmlFor="cf-email" className="font-mono text-[10px] tracking-[0.18em] text-paper/60 uppercase">Email</label>
                <input
                  id="cf-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1.5 w-full bg-transparent border border-paper/25 px-3.5 py-2.5 text-paper placeholder:text-paper/30 focus:border-coral transition-colors"
                  placeholder="ada@analytical.engine"
                />
              </div>
              <div>
                <label htmlFor="cf-msg" className="font-mono text-[10px] tracking-[0.18em] text-paper/60 uppercase">Message</label>
                <textarea
                  id="cf-msg"
                  rows={5}
                  value={msg}
                  onChange={(e) => setMsg(e.target.value)}
                  className="mt-1.5 w-full bg-transparent border border-paper/25 px-3.5 py-2.5 text-paper placeholder:text-paper/30 focus:border-coral transition-colors resize-none"
                  placeholder="We have 4M support tickets and a dream…"
                />
              </div>
            </div>
            {err && <div className="mt-3 font-mono text-[11px] text-coral">⚠ {err}</div>}
            {sent && !err && (
              <div className="mt-3 font-mono text-[11px] text-moss">✓ your mail app should be opening — or just write to {p.email}</div>
            )}
            <button
              type="submit"
              className="mt-5 w-full bg-coral text-paper font-mono text-[11.5px] tracking-[0.18em] py-3.5 hover:bg-paper hover:text-ink transition-colors duration-300"
            >
              SEND MESSAGE →
            </button>
          </form>
        </Reveal>
      </div>

      <footer className="relative max-w-6xl mx-auto px-5 sm:px-8 mt-20 pt-8 border-t border-paper/15">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div>
            <div className="font-mono text-sm font-semibold">
              rahul<span className="text-coral">.</span>ai
            </div>
            <div className="font-mono text-[10.5px] text-paper/45 mt-1.5">Built with Python, AI, curiosity & caffeine.</div>
          </div>
          <div className="flex items-center gap-5 font-mono text-[10.5px] tracking-[0.14em]">
            <a href={gh} target="_blank" rel="noreferrer" className="text-paper/60 hover:text-coral transition-colors">GITHUB</a>
            <a href={li} target="_blank" rel="noreferrer" className="text-paper/60 hover:text-coral transition-colors">LINKEDIN</a>
            <a href={`mailto:${p.email}`} className="text-paper/60 hover:text-coral transition-colors">EMAIL</a>
            <a href="#/admin" className="text-paper/35 hover:text-coral transition-colors">/ADMIN</a>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mt-6 pb-2 font-mono text-[10px] text-paper/35">
          <span>© 2026 Rahul — designed & engineered by hand.</span>
          <span>
            v2.4.0 · <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="hover:text-coral transition-colors">back to top ↑</button>
          </span>
        </div>
      </footer>
    </section>
  );
}
