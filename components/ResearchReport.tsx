import BusinessOverview from '@/components/sections/BusinessOverview';
import EnergyBackground from '@/components/sections/EnergyBackground';
import KeyPeople from '@/components/sections/KeyPeople';
import ExportButton from '@/components/ExportButton';
import type { ResearchReport as ReportType } from '@/types/research';
import { Info } from 'lucide-react';

interface Props {
  report: ReportType;
}

export default function ResearchReport({ report }: Props) {
  const formatted = new Date(report.generatedAt).toLocaleString('en-GB', {
    dateStyle: 'long',
    timeStyle: 'short',
  });

  return (
    <div>
      {/* Print-only header */}
      <div className="hidden print:block mb-6">
        <p className="text-xs text-slate-400">UK Energy &amp; Carbon Intelligence Briefing &mdash; Generated {formatted}</p>
      </div>

      <div className="no-print flex items-center justify-between mb-4">
        <p className="text-xs text-slate-400">Generated {formatted}</p>
        <ExportButton report={report} />
      </div>

      <div id="report-content" className="space-y-5 bg-slate-50 p-4 rounded-xl">
        <BusinessOverview company={report.company} />
        <EnergyBackground energyBackground={report.energyBackground} />
        <KeyPeople people={report.keyPeople} />

        {report.researchNotes && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
            <Info className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-amber-800 mb-1">Research Notes</p>
              <p className="text-sm text-amber-700">{report.researchNotes}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
