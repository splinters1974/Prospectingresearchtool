import { Building2, MapPin, Users, PoundSterling, Hash } from 'lucide-react';
import type { ResearchReport } from '@/types/research';

const SECTOR_LABELS: Record<string, string> = {
  ic: 'Industrial & Commercial',
  public: 'Public Sector',
  education: 'Education',
  defence: 'Defence',
  other: 'Other',
};

const SECTOR_COLOURS: Record<string, string> = {
  ic: 'bg-orange-50 text-orange-700 border-orange-200',
  public: 'bg-blue-50 text-blue-700 border-blue-200',
  education: 'bg-purple-50 text-purple-700 border-purple-200',
  defence: 'bg-slate-100 text-slate-700 border-slate-200',
  other: 'bg-slate-50 text-slate-600 border-slate-200',
};

interface Props {
  company: ResearchReport['company'];
}

export default function BusinessOverview({ company }: Props) {
  const sectorColour = SECTOR_COLOURS[company.sectorCategory] ?? SECTOR_COLOURS.other;
  const sectorLabel = SECTOR_LABELS[company.sectorCategory] ?? company.sectorCategory;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">{company.name}</h2>
          <p className="text-slate-500 text-sm mt-0.5">{company.sector}</p>
        </div>
        <span
          className={`shrink-0 text-xs font-medium px-3 py-1 rounded-full border ${sectorColour}`}
        >
          {sectorLabel}
        </span>
      </div>

      <p className="text-slate-700 text-sm leading-relaxed mb-5">{company.description}</p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {company.companiesHouseNumber && (
          <Stat icon={<Hash className="w-4 h-4" />} label="CH Number" value={company.companiesHouseNumber} />
        )}
        {company.employeeCount && (
          <Stat icon={<Users className="w-4 h-4" />} label="Employees" value={company.employeeCount} />
        )}
        {company.annualTurnover && (
          <Stat icon={<PoundSterling className="w-4 h-4" />} label="Turnover" value={company.annualTurnover} />
        )}
        {company.locations.length > 0 && (
          <Stat
            icon={<MapPin className="w-4 h-4" />}
            label="Locations"
            value={company.locations.join(', ')}
          />
        )}
      </div>

      {company.registeredAddress && (
        <p className="text-xs text-slate-400 mt-4 flex items-center gap-1.5">
          <Building2 className="w-3.5 h-3.5 shrink-0" />
          Registered: {company.registeredAddress}
        </p>
      )}
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-slate-50 rounded-lg p-3">
      <div className="flex items-center gap-1.5 text-slate-400 mb-1">
        {icon}
        <span className="text-xs font-medium">{label}</span>
      </div>
      <p className="text-slate-800 text-sm font-semibold leading-tight">{value}</p>
    </div>
  );
}
