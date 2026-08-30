import type { SiteContent } from "./data";

/* Builds a small, valid single/multi-page-ish resume PDF entirely client-side.
   Used as the fallback document until the admin uploads their own PDF. */

interface PdfLine {
  text: string;
  bold?: boolean;
  size?: number;
  gap?: number;
  color?: [number, number, number];
}

function esc(s: string): string {
  return s
    .replace(/[^\x20-\x7E]/g, (ch) => (ch === "—" ? "-" : ch === "·" ? "-" : ch === "→" ? "->" : ""))
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

export function makeResumeBlob(content: SiteContent): Blob {
  const { profile, experience, education, projects, skills, certificates } = content;
  const lines: PdfLine[] = [];

  lines.push({ text: profile.name.toUpperCase(), bold: true, size: 22 });
  lines.push({ text: profile.role + "  |  " + profile.location, size: 10, color: [0.28, 0.26, 0.36], gap: 14 });
  lines.push({ text: profile.email + "   github.com/" + (profile.githubUsername || "your-handle"), size: 9, color: [0.45, 0.43, 0.53], gap: 12 });
  lines.push({ text: "SUMMARY", bold: true, size: 11, gap: 22 });
  wrap(profile.intro, 95).forEach((t) => lines.push({ text: t, size: 9.5, gap: 12 }));

  lines.push({ text: "EXPERIENCE", bold: true, size: 11, gap: 22 });
  experience.slice(0, 3).forEach((e) => {
    lines.push({ text: `${e.role} - ${e.company}`, bold: true, size: 10, gap: 15 });
    lines.push({ text: `${e.start} - ${e.end}  |  ${e.location}`, size: 8.5, color: [0.45, 0.43, 0.53], gap: 11 });
    e.bullets.slice(0, 3).forEach((b) =>
      wrap("•  " + b, 92).forEach((t) => lines.push({ text: t, size: 9, gap: 11 }))
    );
  });

  lines.push({ text: "SELECTED PROJECTS", bold: true, size: 11, gap: 22 });
  projects
    .filter((p) => !p.hidden)
    .slice(0, 4)
    .forEach((p) => {
      lines.push({ text: `${p.name}  (${p.category})`, bold: true, size: 10, gap: 15 });
      wrap(p.tagline + "  " + (p.metrics[0] ?? ""), 92).forEach((t) => lines.push({ text: t, size: 9, gap: 11 }));
    });

  lines.push({ text: "EDUCATION", bold: true, size: 11, gap: 22 });
  education.slice(0, 2).forEach((e) => {
    lines.push({ text: `${e.degree} - ${e.school}`, bold: true, size: 10, gap: 15 });
    lines.push({ text: `${e.start} - ${e.end}  |  ${e.score}`, size: 9, color: [0.45, 0.43, 0.53], gap: 11 });
  });

  lines.push({ text: "SKILLS", bold: true, size: 11, gap: 22 });
  skills.slice(0, 5).forEach((g) =>
    wrap(`${g.group}:  ${g.items.join(", ")}`, 95).forEach((t) => lines.push({ text: t, size: 9, gap: 11 }))
  );

  lines.push({ text: "CERTIFICATIONS", bold: true, size: 11, gap: 22 });
  certificates.slice(0, 4).forEach((c) =>
    lines.push({ text: `•  ${c.title} - ${c.issuer} (${c.date})`, size: 9, gap: 11 })
  );

  /* ---- paginate into pages of maxLines ---- */
  const pages: PdfLine[][] = [];
  let cur: PdfLine[] = [];
  let y = 780;
  for (const l of lines) {
    const h = (l.gap ?? 12) + 6;
    if (y - h < 50) {
      pages.push(cur);
      cur = [];
      y = 780;
    }
    cur.push(l);
    y -= h;
  }
  if (cur.length) pages.push(cur);

  /* ---- build pdf objects ---- */
  const objs: string[] = [];
  const pageObjIds: number[] = [];
  const fontObjId = 3;
  const boldFontObjId = 4;

  objs[1] = "<< /Type /Catalog /Pages 2 0 R >>";
  const kids = pages.map((_, i) => `${5 + i * 2} 0 R`).join(" ");
  pageObjIds.push(...pages.map((_, i) => 5 + i * 2));
  objs[2] = `<< /Type /Pages /Kids [${kids}] /Count ${pages.length} >>`;
  objs[fontObjId] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>";
  objs[boldFontObjId] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>";

  pages.forEach((pageLines, i) => {
    const pageId = 5 + i * 2;
    const streamId = pageId + 1;
    let y2 = 780;
    const ops: string[] = [];
    for (const l of pageLines) {
      y2 -= l.gap ?? 12;
      const [r, g, b] = l.color ?? [0.1, 0.09, 0.13];
      ops.push(
        `BT /F${l.bold ? 2 : 1} ${(l.size ?? 10).toFixed(1)} Tf ${r.toFixed(2)} ${g.toFixed(2)} ${b.toFixed(2)} rg 56 ${y2.toFixed(1)} Td (${esc(l.text)}) Tj ET`
      );
    }
    const stream = ops.join("\n");
    objs[pageId] = `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 842] /Resources << /Font << /F1 ${fontObjId} 0 R /F2 ${boldFontObjId} 0 R >> >> /Contents ${streamId} 0 R >>`;
    objs[streamId] = `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`;
  });

  let body = "%PDF-1.4\n";
  const offsets: number[] = [0];
  const total = Math.max(...objs.map((_, i) => i)) + 1;
  for (let i = 1; i < total; i++) {
    offsets[i] = body.length;
    body += `${i} 0 obj\n${objs[i]}\nendobj\n`;
  }
  const xrefPos = body.length;
  body += `xref\n0 ${total}\n0000000000 65535 f \n`;
  for (let i = 1; i < total; i++) {
    body += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  }
  body += `trailer\n<< /Size ${total} /Root 1 0 R >>\nstartxref\n${xrefPos}\n%%EOF`;
  return new Blob([body], { type: "application/pdf" });
}

function wrap(text: string, max: number): string[] {
  const words = text.split(/\s+/);
  const out: string[] = [];
  let line = "";
  for (const w of words) {
    if ((line + " " + w).trim().length > max) {
      if (line) out.push(line.trim());
      line = w;
    } else {
      line = (line + " " + w).trim();
    }
  }
  if (line) out.push(line.trim());
  return out;
}
