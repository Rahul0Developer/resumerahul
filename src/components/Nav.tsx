import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const LINKS = [
  { id: "experience", label: "EXPERIENCE" },
  { id: "projects", label: "PROJECTS" },
  { id: "github", label: "GITHUB" },
  { id: "skills", label: "SKILLS" },
  { id: "certificates", label: "CERTIFICATES" },
  { id: "achievements", label: "ACHIEVEMENTS" },
  { id: "contact", label: "CONTACT" },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const ids = [...LINKS.map((l) => l.id), "resume"];
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: "-38% 0px -55% 0px" }
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const go = (id: string) => {
    setOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-[60] transition-all duration-300 border-b ${
          scrolled ? "bg-paper/85 backdrop-blur-md border-ink/10 shadow-[0_10px_30px_-20px_rgba(25,23,34,0.25)]" : "bg-transparent border-transparent"
        }`}
      >
        <div className="max-w-6xl mx-auto px-5 sm:px-8 h-[64px] flex items-center justify-between gap-4">
          <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="flex items-center gap-2 group" aria-label="Back to top">
            <span className="w-7 h-7 grid place-items-center bg-ink text-paper font-mono text-[11px] font-bold group-hover:bg-coral transition-colors duration-300">
              r.
            </span>
            <span className="font-mono text-sm font-semibold tracking-tight">
              rahul<span className="text-coral">.</span>ai
            </span>
          </button>

          <nav className="hidden lg:flex items-center gap-6" aria-label="Primary">
            {LINKS.map((l) => (
              <button
                key={l.id}
                onClick={() => go(l.id)}
                className={`font-mono text-[10.5px] tracking-[0.18em] transition-colors relative pb-1 ${
                  active === l.id ? "text-coral" : "text-ink2 hover:text-ink"
                }`}
              >
                {l.label}
                <span
                  className={`absolute left-0 -bottom-0.5 h-[2px] bg-coral transition-all duration-300 ${active === l.id ? "w-full" : "w-0"}`}
                  aria-hidden
                />
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={() => go("resume")}
              className={`hidden sm:block font-mono text-[10.5px] tracking-[0.18em] border px-3.5 py-2 transition-all duration-300 ${
                active === "resume"
                  ? "bg-coral border-coral text-paper"
                  : "border-ink/25 hover:bg-ink hover:text-paper hover:border-ink"
              }`}
            >
              [ RESUME ]
            </button>
            <button
              onClick={() => setOpen(true)}
              className="lg:hidden w-10 h-10 grid place-items-center border border-ink/20 bg-card"
              aria-label="Open menu"
              aria-expanded={open}
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <path d="M4 7.5h16M4 12h10M4 16.5h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[75] bg-paper dot-grid-faint lg:hidden overflow-y-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="px-6 h-[64px] flex items-center justify-between">
              <span className="font-mono text-sm font-semibold">
                rahul<span className="text-coral">.</span>ai
              </span>
              <button
                onClick={() => setOpen(false)}
                className="w-10 h-10 grid place-items-center border border-ink/20 bg-card"
                aria-label="Close menu"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <path d="m6 6 12 12M18 6 6 18" />
                </svg>
              </button>
            </div>
            <nav className="px-6 pt-8 pb-16 flex flex-col gap-1" aria-label="Mobile">
              {[...LINKS, { id: "resume", label: "RESUME" }].map((l, i) => (
                <motion.button
                  key={l.id}
                  onClick={() => go(l.id)}
                  initial={{ opacity: 0, x: -18 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 + i * 0.045, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  className="text-left flex items-baseline gap-4 py-3 border-b border-ink/10 group"
                >
                  <span className="font-mono text-[10px] text-coral">0{i + 1}</span>
                  <span className="font-display text-3xl font-semibold group-hover:text-coral group-hover:translate-x-1.5 transition-all duration-300">
                    {l.label.charAt(0) + l.label.slice(1).toLowerCase()}
                  </span>
                </motion.button>
              ))}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.55 }}
                className="mt-10 font-mono text-[11px] text-mut leading-relaxed"
              >
                <pre className="ascii text-[10px] text-ink2">{"$ status\n> open to AI/ML roles\n$ location\n> Bengaluru, IN"}</pre>
                <a href="#/admin" className="inline-block mt-4 link-underline text-ink2">
                  admin access →
                </a>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
