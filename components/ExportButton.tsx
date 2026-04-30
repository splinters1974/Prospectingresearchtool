'use client';

import { Download } from 'lucide-react';

interface Props {
  companyName: string;
}

export default function ExportButton({ companyName }: Props) {
  async function handleExport() {
    const { default: jsPDF } = await import('jspdf');
    const { default: html2canvas } = await import('html2canvas');

    const element = document.getElementById('report-content');
    if (!element) return;

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#f8fafc',
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    const pageHeight = pdf.internal.pageSize.getHeight();

    let yOffset = 0;
    while (yOffset < pdfHeight) {
      if (yOffset > 0) pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, -yOffset, pdfWidth, pdfHeight);
      yOffset += pageHeight;
    }

    const filename = `${companyName.toLowerCase().replace(/\s+/g, '-')}-energy-briefing.pdf`;
    pdf.save(filename);
  }

  return (
    <button
      onClick={handleExport}
      className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 hover:border-emerald-500 hover:text-emerald-600 text-slate-700 rounded-lg text-sm font-medium transition-colors"
    >
      <Download className="w-4 h-4" />
      Export PDF
    </button>
  );
}
