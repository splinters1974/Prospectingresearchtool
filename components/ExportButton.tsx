'use client';

import { useState } from 'react';
import { Download, Printer } from 'lucide-react';
import type { ResearchReport } from '@/types/research';

interface Props {
  report: ResearchReport;
}

export default function ExportButton({ report }: Props) {
  const [generating, setGenerating] = useState(false);

  async function handleDownload() {
    setGenerating(true);
    try {
      const { generatePDF } = await import('@/lib/generate-pdf');
      generatePDF(report);
    } finally {
      setGenerating(false);
    }
  }

  function handlePrint() {
    window.print();
  }

  return (
    <div className="no-print flex items-center gap-2">
      <button
        onClick={handleDownload}
        disabled={generating}
        className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors"
      >
        <Download className="w-4 h-4" />
        {generating ? 'Generating…' : 'Download PDF'}
      </button>
      <button
        onClick={handlePrint}
        className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 hover:border-slate-400 text-slate-700 rounded-lg text-sm font-medium transition-colors"
      >
        <Printer className="w-4 h-4" />
        Print
      </button>
    </div>
  );
}
