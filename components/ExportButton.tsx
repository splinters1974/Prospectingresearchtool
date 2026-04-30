'use client';

import { Printer } from 'lucide-react';

interface Props {
  companyName: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function ExportButton({ companyName }: Props) {
  function handlePrint() {
    window.print();
  }

  return (
    <button
      onClick={handlePrint}
      className="no-print inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 hover:border-emerald-500 hover:text-emerald-600 text-slate-700 rounded-lg text-sm font-medium transition-colors"
    >
      <Printer className="w-4 h-4" />
      Print / Save PDF
    </button>
  );
}
