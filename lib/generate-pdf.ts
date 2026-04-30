import jsPDF from 'jspdf';
import type { ResearchReport, Person } from '@/types/research';

const M = 15; // margin
const PW = 210; // page width
const PH = 297; // page height
const CW = PW - M * 2; // content width
const FOOT = 12; // footer reserved height

// Colours
const C_DARK = [15, 23, 42] as const;
const C_MID = [71, 85, 105] as const;
const C_LIGHT = [148, 163, 184] as const;
const C_GREEN = [16, 185, 129] as const;
const C_GREEN_DARK = [6, 78, 59] as const;
const C_GREEN_BG = [236, 253, 245] as const;
const C_SLATE_BG = [248, 250, 252] as const;
const C_BORDER = [226, 232, 240] as const;
const C_AMBER_BG = [255, 251, 235] as const;
const C_AMBER = [120, 53, 15] as const;
const C_WHITE = [255, 255, 255] as const;
const C_NAVY = [15, 23, 42] as const;

function setColor(pdf: jsPDF, rgb: readonly [number, number, number]) {
  pdf.setTextColor(rgb[0], rgb[1], rgb[2]);
}
function setFill(pdf: jsPDF, rgb: readonly [number, number, number]) {
  pdf.setFillColor(rgb[0], rgb[1], rgb[2]);
}
function setDraw(pdf: jsPDF, rgb: readonly [number, number, number]) {
  pdf.setDrawColor(rgb[0], rgb[1], rgb[2]);
}

function wrap(pdf: jsPDF, text: string, maxW: number): string[] {
  return pdf.splitTextToSize(text, maxW);
}

function lineH(size: number) {
  return size * 0.45;
}

function checkBreak(pdf: jsPDF, y: number, needed: number): number {
  if (y + needed > PH - FOOT) {
    pdf.addPage();
    return M + 4;
  }
  return y;
}

function drawRect(
  pdf: jsPDF,
  x: number, y: number, w: number, h: number,
  fill?: readonly [number, number, number],
  stroke?: readonly [number, number, number]
) {
  if (fill) setFill(pdf, fill);
  if (stroke) setDraw(pdf, stroke);
  const style = fill && stroke ? 'FD' : fill ? 'F' : 'D';
  if (stroke) pdf.setLineWidth(0.2);
  pdf.rect(x, y, w, h, style);
}

function sectionHeader(pdf: jsPDF, title: string, icon: string, y: number): number {
  y = checkBreak(pdf, y, 14);
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  setColor(pdf, C_DARK);
  pdf.text(`${icon}  ${title}`, M, y);
  y += 2;
  setDraw(pdf, C_GREEN);
  pdf.setLineWidth(0.5);
  pdf.line(M, y, M + CW, y);
  return y + 6;
}

function badge(pdf: jsPDF, text: string, x: number, y: number, bg: readonly [number,number,number], fg: readonly [number,number,number]): number {
  pdf.setFontSize(7.5);
  pdf.setFont('helvetica', 'bold');
  const tw = pdf.getTextWidth(text);
  drawRect(pdf, x, y - 3.5, tw + 5, 5.5, bg);
  setColor(pdf, fg);
  pdf.text(text, x + 2.5, y);
  return tw + 8;
}

export function generatePDF(report: ResearchReport): void {
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  let y = 0;

  // ── HEADER BAR ──────────────────────────────────────────────────────────
  drawRect(pdf, 0, 0, PW, 22, C_NAVY);
  pdf.setFontSize(13);
  pdf.setFont('helvetica', 'bold');
  setColor(pdf, C_WHITE);
  pdf.text('⚡  Energy Prospecting', M, 10);
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  setColor(pdf, C_LIGHT);
  pdf.text('UK Energy & Carbon Intelligence Briefing', M, 17);
  y = 30;

  // ── COMPANY NAME + SECTOR BADGE ─────────────────────────────────────────
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  setColor(pdf, C_DARK);
  pdf.text(report.company.name, M, y);

  const SECTOR_LABELS: Record<string, string> = {
    ic: 'Industrial & Commercial', public: 'Public Sector',
    education: 'Education', defence: 'Defence', other: 'Other',
  };
  const sectorLabel = SECTOR_LABELS[report.company.sectorCategory] ?? report.company.sectorCategory;
  const badgeX = M + pdf.getTextWidth(report.company.name) + 4;
  badge(pdf, sectorLabel, badgeX, y, C_GREEN_BG, C_GREEN_DARK);
  y += 6;

  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  setColor(pdf, C_MID);
  pdf.text(report.company.sector, M, y);
  y += 6;

  // Description
  pdf.setFontSize(9.5);
  setColor(pdf, C_DARK);
  const descLines = wrap(pdf, report.company.description, CW);
  pdf.text(descLines, M, y);
  y += descLines.length * lineH(9.5) + 5;

  // Stats grid
  const stats: [string, string][] = [];
  if (report.company.companiesHouseNumber) stats.push(['CH Number', report.company.companiesHouseNumber]);
  if (report.company.employeeCount) stats.push(['Employees', report.company.employeeCount]);
  if (report.company.annualTurnover) stats.push(['Turnover', report.company.annualTurnover]);
  if (report.company.locations.length) stats.push(['Locations', report.company.locations.slice(0, 3).join(', ')]);

  if (stats.length > 0) {
    const cols = Math.min(stats.length, 4);
    const colW = CW / cols;
    stats.slice(0, 4).forEach(([label, value], i) => {
      const x = M + i * colW;
      drawRect(pdf, x, y, colW - 2, 13, C_SLATE_BG);
      pdf.setFontSize(7.5);
      pdf.setFont('helvetica', 'normal');
      setColor(pdf, C_LIGHT);
      pdf.text(label, x + 3, y + 5);
      pdf.setFontSize(8.5);
      pdf.setFont('helvetica', 'bold');
      setColor(pdf, C_DARK);
      const val = wrap(pdf, value, colW - 7);
      pdf.text(val[0], x + 3, y + 10.5);
    });
    y += 17;
  }

  if (report.company.registeredAddress) {
    pdf.setFontSize(7.5);
    pdf.setFont('helvetica', 'normal');
    setColor(pdf, C_LIGHT);
    pdf.text(`Registered: ${report.company.registeredAddress}`, M, y);
    y += 5;
  }

  // ── ENERGY & CARBON BACKGROUND ──────────────────────────────────────────
  y += 3;
  y = sectionHeader(pdf, 'Energy & Carbon Background', '🌿', y);

  // Net zero target callout
  if (report.energyBackground.netZeroTarget) {
    y = checkBreak(pdf, y, 14);
    drawRect(pdf, M, y, CW, 13, C_GREEN_BG);
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'bold');
    setColor(pdf, C_GREEN_DARK);
    pdf.text('Net Zero Target', M + 3, y + 5);
    pdf.setFont('helvetica', 'normal');
    setColor(pdf, C_GREEN_DARK);
    pdf.text(report.energyBackground.netZeroTarget, M + 3, y + 10);
    y += 17;
  }

  // Summary
  pdf.setFontSize(9.5);
  pdf.setFont('helvetica', 'normal');
  setColor(pdf, C_DARK);
  const sumLines = wrap(pdf, report.energyBackground.summary, CW);
  y = checkBreak(pdf, y, sumLines.length * lineH(9.5));
  pdf.text(sumLines, M, y);
  y += sumLines.length * lineH(9.5) + 5;

  // Key facts
  if (report.energyBackground.keyFacts.length > 0) {
    y = checkBreak(pdf, y, 10);
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    setColor(pdf, C_DARK);
    pdf.text('Key Energy Facts', M, y);
    y += 5;
    for (const fact of report.energyBackground.keyFacts) {
      const lines = wrap(pdf, fact, CW - 6);
      y = checkBreak(pdf, y, lines.length * lineH(8.5) + 2);
      pdf.setFontSize(8.5);
      pdf.setFont('helvetica', 'normal');
      setColor(pdf, C_MID);
      // Bullet dot
      setFill(pdf, C_GREEN);
      pdf.circle(M + 1.5, y - 1, 0.8, 'F');
      pdf.text(lines, M + 5, y);
      y += lines.length * lineH(8.5) + 2;
    }
    y += 3;
  }

  // Energy projects
  if (report.energyBackground.energyProjects.length > 0) {
    y = checkBreak(pdf, y, 12);
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    setColor(pdf, C_DARK);
    pdf.text('Energy Projects', M, y);
    y += 5;
    for (const proj of report.energyBackground.energyProjects) {
      const titleText = proj.year ? `${proj.title}  (${proj.year})` : proj.title;
      const descLines = wrap(pdf, proj.description, CW - 8);
      const boxH = 7 + descLines.length * 4 + 5;
      y = checkBreak(pdf, y, boxH);
      drawRect(pdf, M, y, CW, boxH, C_SLATE_BG, C_BORDER);
      pdf.setFontSize(8.5);
      pdf.setFont('helvetica', 'bold');
      setColor(pdf, C_DARK);
      pdf.text(titleText, M + 3, y + 5.5);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      setColor(pdf, C_MID);
      pdf.text(descLines, M + 3, y + 10);
      y += boxH + 3;
    }
    y += 2;
  }

  // Regulatory + certifications
  const hasReg = report.energyBackground.regulatoryObligations.length > 0;
  const hasCert = report.energyBackground.certifications.length > 0;
  if (hasReg || hasCert) {
    y = checkBreak(pdf, y, 12);
    const half = CW / 2 - 2;
    if (hasReg) {
      drawRect(pdf, M, y, half, 10, C_SLATE_BG);
      pdf.setFontSize(7.5);
      pdf.setFont('helvetica', 'bold');
      setColor(pdf, C_LIGHT);
      pdf.text('REGULATORY OBLIGATIONS', M + 3, y + 4);
      pdf.setFont('helvetica', 'normal');
      setColor(pdf, C_DARK);
      pdf.text(report.energyBackground.regulatoryObligations.join('   '), M + 3, y + 8.5);
    }
    if (hasCert) {
      const cx = M + half + 4;
      drawRect(pdf, cx, y, half, 10, C_GREEN_BG);
      pdf.setFontSize(7.5);
      pdf.setFont('helvetica', 'bold');
      setColor(pdf, C_GREEN_DARK);
      pdf.text('CERTIFICATIONS', cx + 3, y + 4);
      pdf.setFont('helvetica', 'normal');
      pdf.text(report.energyBackground.certifications.join('   '), cx + 3, y + 8.5);
    }
    y += 14;
  }

  // ── KEY PEOPLE ──────────────────────────────────────────────────────────
  y += 2;
  y = sectionHeader(pdf, 'Key People', '👥', y);

  const CATEGORIES: { label: string; key: Person['category'] }[] = [
    { label: 'BOARD / DIRECTORS', key: 'board' },
    { label: 'SENIOR LEADERSHIP', key: 'senior_leadership' },
    { label: 'ENERGY & SUSTAINABILITY', key: 'energy_sustainability' },
  ];

  for (const { label, key } of CATEGORIES) {
    const people = report.keyPeople.filter((p) => p.category === key);
    if (people.length === 0) continue;

    y = checkBreak(pdf, y, 10);
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'bold');
    setColor(pdf, C_LIGHT);
    pdf.text(label, M, y);
    y += 5;

    const cardW = (CW - 4) / 2;

    for (let i = 0; i < people.length; i += 2) {
      const left = people[i];
      const right = people[i + 1] ?? null;

      // Calculate card height based on content
      const cardHeight = (p: Person): number => {
        const bioL = wrap(pdf, p.bio || '', cardW - 8).length;
        const relL = wrap(pdf, p.relevanceToEnergy || '', cardW - 8).length;
        const contacts = [p.contactDetails.email, p.contactDetails.linkedin, p.contactDetails.phone].filter(Boolean).length;
        return 7 + 5 + bioL * 4 + 4 + 4 + relL * 4 + contacts * 4 + 4;
      };

      const h = Math.max(cardHeight(left), right ? cardHeight(right) : 0);
      y = checkBreak(pdf, y, h);

      const drawPersonCard = (p: Person, x: number) => {
        drawRect(pdf, x, y, cardW, h, C_SLATE_BG, C_BORDER);

        let cy = y + 5.5;
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'bold');
        setColor(pdf, C_DARK);
        pdf.text(p.name, x + 3, cy);
        cy += 4.5;

        pdf.setFontSize(7.5);
        pdf.setFont('helvetica', 'normal');
        setColor(pdf, C_MID);
        pdf.text(p.jobTitle, x + 3, cy);
        cy += 5;

        if (p.bio) {
          const lines = wrap(pdf, p.bio, cardW - 8);
          pdf.setFontSize(8);
          setColor(pdf, C_MID);
          pdf.text(lines, x + 3, cy);
          cy += lines.length * 4 + 3;
        }

        if (p.relevanceToEnergy) {
          pdf.setFontSize(7.5);
          pdf.setFont('helvetica', 'bold');
          setColor(pdf, C_GREEN_DARK);
          pdf.text('Energy relevance', x + 3, cy);
          cy += 4;
          pdf.setFont('helvetica', 'normal');
          setColor(pdf, C_GREEN_DARK);
          const relLines = wrap(pdf, p.relevanceToEnergy, cardW - 8);
          pdf.text(relLines, x + 3, cy);
          cy += relLines.length * 4 + 2;
        }

        const contacts = [
          p.contactDetails.email ? `✉  ${p.contactDetails.email}` : null,
          p.contactDetails.phone ? `☎  ${p.contactDetails.phone}` : null,
          p.contactDetails.linkedin ? `in  ${p.contactDetails.linkedin}` : null,
        ].filter(Boolean) as string[];

        if (contacts.length > 0) {
          pdf.setFontSize(7.5);
          setColor(pdf, C_GREEN);
          contacts.forEach((c) => {
            const cLines = wrap(pdf, c, cardW - 8);
            pdf.text(cLines[0], x + 3, cy);
            cy += 4;
          });
        }
      }

      drawPersonCard(left, M);
      if (right) drawPersonCard(right, M + cardW + 4);

      y += h + 4;
    }
    y += 4;
  }

  // Research notes
  if (report.researchNotes) {
    const noteLines = wrap(pdf, report.researchNotes, CW - 8);
    const boxH = noteLines.length * 4.5 + 12;
    y = checkBreak(pdf, y, boxH);
    drawRect(pdf, M, y, CW, boxH, C_AMBER_BG);
    pdf.setFontSize(8.5);
    pdf.setFont('helvetica', 'bold');
    setColor(pdf, C_AMBER);
    pdf.text('ℹ  Research Notes', M + 3, y + 6);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.text(noteLines, M + 3, y + 11);
  }

  // ── FOOTER ON EVERY PAGE ─────────────────────────────────────────────────
  const pageCount = pdf.getNumberOfPages();
  const date = new Date(report.generatedAt).toLocaleDateString('en-GB', { dateStyle: 'long' });
  for (let p = 1; p <= pageCount; p++) {
    pdf.setPage(p);
    setDraw(pdf, C_BORDER);
    pdf.setLineWidth(0.3);
    pdf.line(M, PH - 10, PW - M, PH - 10);
    pdf.setFontSize(7);
    pdf.setFont('helvetica', 'normal');
    setColor(pdf, C_LIGHT);
    pdf.text(`Energy Prospecting — Generated ${date}`, M, PH - 6);
    pdf.text(`${p} / ${pageCount}`, PW - M, PH - 6, { align: 'right' });
  }

  const filename = `${report.company.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-energy-briefing.pdf`;
  pdf.save(filename);
}
