import { useEffect, useMemo, useState } from "react";
import type { CertItem } from "../lib/data";
import { makeResumeBlob } from "../lib/pdf";
import { useStore } from "../lib/store";
import { IcDownload, IcExternal, IcEye, Modal, Reveal, SectionHead } from "./ui";

/* ---------------- Certificates ---------------- */

function CertPreview({ cert }: { cert: CertItem }) {
  return (
    <div className="p-6 sm:p-8">
      <div className="border-2 border-ink p-1.5">
        <div className="border border-ink/40 px-5 py-8 sm:px-8 text-center relative overflow-hidden">
          <div className="absolute inset-0 dot-grid-faint opacity-60" aria-hidden />
          <div className="relative">
            {cert.image ? (
              <img src={cert.image} alt={cert.title} className="max-h-[46vh] mx-auto border border-ink/15" />
            ) : (
              <>
                <div className="font-mono text-[10px] tracking-[0.3em] text-mut uppercase">Certificate of Completion</div>
                <div className="mx-auto w-16 rule-tick text-coral mt-4" aria-hidden />
                <h3 className="font-display text-2xl sm:text-3xl font-semibold mt-5 leading-tight">{cert.title}</h3>
                <p className="font-mono text-[11px] text-ink2 mt-3 tracking-[0.12em] uppercase">{cert.issuer}</p>
                <div className="flex items-center justify-center gap-8 mt-8 font-mono text-[10.5px] text-mut">
                  <div>
                    <div className="text-ink text-[12px]">{cert.date}</div>
                    <div className="mt-1 tracking-[0.2em]">DATE</div>
                  </div>
                  <div className="w-px h-8 bg-ink/20" aria-hidden />
                  <div>
                    <div className="text-ink text-[12px]">{cert.credentialId}</div>
                    <div className="mt-1 tracking-[0.2em]">CREDENTIAL ID</div>
                  </div>
                </div>
                <div className="mt-8 inline-grid place-items-center w-16 h-16 rounded-full border-2 border-coral text-coral" aria-hidden>
                  <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 3.5 14 8l4.8.5-3.6 3.2 1 4.7L12 14l-4.2 2.4 1-4.7L5.2 8.5 10 8Z" />
                  </svg>
                </div>
                <p className="font-mono text-[9.5px] text-mut mt-4">rendered preview — verify via issuer below</p>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="mt-5 flex flex-wrap gap-3">
        <a
          href={cert.verifyUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 bg-ink text-paper font-mono text-[11px] tracking-[0.14em] px-4 py-2.5 hover:bg-coral transition-colors"
        >
          VERIFY WITH ISSUER <IcExternal className="w-3 h-3" />
        </a>
        <span className="font-mono text-[10.5px] text-mut self-center">ID: {cert.credentialId}</span>
      </div>
    </div>
  );
}

export function Certificates() {
  const { content } = useStore();
  const [sel, setSel] = useState<CertItem | null>(null);
  return (
    <section id="certificates" className="relative py-20 sm:py-28">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        <SectionHead
          num="07"
          label="CREDENTIALS"
          title={
            <>
              Certificates, <em className="italic text-coral font-display">verified</em>.
            </>
          }
          sub="Every credential links out to its issuer. Preview in-app, verify at the source."
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-12">
          {content.certificates.map((c, i) => (
            <Reveal key={c.id} delay={(i % 3) * 80}>
              <article className="group border border-ink/15 bg-card p-5 h-full flex flex-col card-lift relative overflow-hidden">
                <div className="absolute top-0 right-0 w-10 h-10" aria-hidden>
                  <div className="absolute -top-5 -right-5 w-10 h-10 rotate-45 bg-iris/15 group-hover:bg-iris/30 transition-colors" />
                </div>
                <div className="font-mono text-[10px] tracking-[0.18em] text-mut">{c.date}</div>
                <h3 className="font-display text-lg font-semibold mt-2 leading-snug pr-4">{c.title}</h3>
                <div className="text-[13px] text-ink2 mt-1">{c.issuer}</div>
                <div className="font-mono text-[10px] text-mut mt-3">ID · {c.credentialId}</div>
                <div className="mt-auto pt-5 flex items-center gap-4 font-mono text-[10.5px] tracking-[0.12em]">
                  <button onClick={() => setSel(c)} className="inline-flex items-center gap-1.5 text-ink font-semibold link-underline">
                    <IcEye className="w-3.5 h-3.5" /> VIEW
                  </button>
                  <a href={c.verifyUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-ink2 link-underline">
                    <IcExternal className="w-3 h-3" /> VERIFY
                  </a>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
      <Modal open={!!sel} onClose={() => setSel(null)}>
        {sel && <CertPreview cert={sel} />}
      </Modal>
    </section>
  );
}

/* ---------------- Resume ---------------- */

export function Resume() {
  const { content } = useStore();
  const [viewerOpen, setViewerOpen] = useState(false);

  const generated = useMemo(() => makeResumeBlob(content), [content]);
  const [genUrl, setGenUrl] = useState("");
  useEffect(() => {
    const url = URL.createObjectURL(generated);
    setGenUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [generated]);

  const pdfUrl = content.profile.resumeDataUrl || genUrl;
  const isUpload = !!content.profile.resumeDataUrl;

  return (
    <section id="resume" className="relative py-20 sm:py-28 bg-paper2/50 border-y border-ink/10 overflow-hidden">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 grid lg:grid-cols-[1fr_0.95fr] gap-12 items-center">
        <div>
          <SectionHead
            num="10"
            label="THE DOCUMENT"
            title={
              <>
                Want the <em className="italic text-coral font-display">full story</em>?
              </>
            }
            sub="One page of signal: experience, projects, skills and credentials — kept current from the admin desk, no code deploys needed."
          />
          <Reveal delay={180}>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button
                onClick={() => setViewerOpen(true)}
                className="inline-flex items-center gap-2 bg-ink text-paper font-mono text-[11px] tracking-[0.14em] px-5 py-3 hover:bg-coral transition-colors"
              >
                <IcEye className="w-3.5 h-3.5" /> VIEW RESUME
              </button>
              <a
                href={pdfUrl}
                download="Rahul_Verma_AI_ML_Resume.pdf"
                className="inline-flex items-center gap-2 border border-ink/25 font-mono text-[11px] tracking-[0.14em] px-5 py-3 hover:bg-ink hover:text-paper transition-colors"
              >
                <IcDownload className="w-3.5 h-3.5" /> DOWNLOAD PDF
              </a>
            </div>
          </Reveal>
          <Reveal delay={250}>
            <div className="mt-6 font-mono text-[10.5px] text-mut space-y-1.5">
              <div>
                last updated: <span className="text-ink2">{content.profile.resumeUpdated}</span>
              </div>
              <div>
                source: {isUpload ? <span className="text-moss">uploaded PDF (admin)</span> : <span className="text-cobalt">auto-composed from live content</span>}
              </div>
              <div className="text-mut/80">↳ admins can replace the PDF in /admin → Resume</div>
            </div>
          </Reveal>
        </div>

        {/* inline document preview */}
        <Reveal variant="right" delay={150}>
          <button
            onClick={() => setViewerOpen(true)}
            className="group relative w-full text-left border border-ink/20 bg-card shadow-[0_28px_60px_-32px_rgba(25,23,34,0.45)] hover:-translate-y-1.5 hover:rotate-[0.4deg] transition-transform duration-400"
            aria-label="Open resume viewer"
          >
            <div className="absolute -left-2 top-6 bottom-6 w-2 bg-coral" aria-hidden />
            <div className="p-4">
              <div className="flex items-center justify-between font-mono text-[9.5px] text-mut border-b border-dashed border-ink/15 pb-2 mb-3">
                <span>resume.pdf — {isUpload ? "uploaded" : "generated"}</span>
                <span className="group-hover:text-coral transition-colors">open ↗</span>
              </div>
              {pdfUrl ? (
                <iframe src={pdfUrl} title="Resume preview" className="w-full h-[380px] pointer-events-none bg-white" loading="lazy" />
              ) : (
                <div className="h-[380px] grid place-items-center font-mono text-xs text-mut">preparing document…</div>
              )}
            </div>
          </button>
        </Reveal>
      </div>

      <Modal open={viewerOpen} onClose={() => setViewerOpen(false)} wide>
        <div className="p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <div className="font-mono text-[10px] tracking-[0.18em] text-mut uppercase">resume viewer</div>
              <h3 className="font-display text-2xl font-semibold">Rahul Verma — AI/ML Engineer</h3>
            </div>
            <a href={pdfUrl} download="Rahul_Verma_AI_ML_Resume.pdf" className="inline-flex items-center gap-2 border border-ink/25 font-mono text-[10.5px] tracking-[0.12em] px-3.5 py-2 hover:bg-ink hover:text-paper transition-colors">
              <IcDownload className="w-3 h-3" /> PDF
            </a>
          </div>
          {pdfUrl ? (
            <iframe src={pdfUrl} title="Resume" className="w-full h-[70vh] border border-ink/15 bg-white" />
          ) : (
            <div className="h-[50vh] grid place-items-center font-mono text-xs text-mut">preparing document…</div>
          )}
        </div>
      </Modal>
    </section>
  );
}
