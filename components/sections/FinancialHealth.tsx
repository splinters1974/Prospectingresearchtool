import { ShieldCheck, ShieldAlert, ShieldX, Info } from 'lucide-react';
import type { FinancialHealthCheck, FinancialHealthItem, HealthFlag } from '@/types/research';

const FLAG_BORDER: Record<HealthFlag, string> = {
  green:   'border-l-emerald-500',
  amber:   'border-l-amber-500',
  red:     'border-l-red-500',
  neutral: 'border-l-slate-300',
};

const FLAG_DOT: Record<HealthFlag, string> = {
  green:   'bg-emerald-500',
  amber:   'bg-amber-500',
  red:     'bg-red-500',
  neutral: 'bg-slate-300',
};

const FLAG_VALUE: Record<HealthFlag, string> = {
  green:   'text-emerald-700',
  amber:   'text-amber-700',
  red:     'text-red-700',
  neutral: 'text-slate-700',
};

const OVERALL_STYLE = {
  green: {
    wrapper: 'bg-emerald-50 border border-emerald-200',
    icon: <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />,
    text: 'text-emerald-800',
  },
  amber: {
    wrapper: 'bg-amber-50 border border-amber-200',
    icon: <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />,
    text: 'text-amber-800',
  },
  red: {
    wrapper: 'bg-red-50 border border-red-200',
    icon: <ShieldX className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />,
    text: 'text-red-800',
  },
};

function FactItem({ item }: { item: FinancialHealthItem }) {
  return (
    <div className={`border-l-2 ${FLAG_BORDER[item.flag]} pl-3 py-0.5`}>
      <div className="flex items-center gap-1.5 mb-0.5">
        <span className={`w-2 h-2 rounded-full shrink-0 ${FLAG_DOT[item.flag]}`} />
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{item.label}</span>
      </div>
      <p className={`text-sm font-semibold ${FLAG_VALUE[item.flag]}`}>{item.value}</p>
      <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{item.detail}</p>
    </div>
  );
}

interface Props {
  check: FinancialHealthCheck;
}

export default function FinancialHealth({ check }: Props) {
  const style = OVERALL_STYLE[check.overallFlag];

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
      <div className="flex items-start justify-between gap-4">
        <h3 className="text-lg font-semibold text-slate-900">Financial Health Check</h3>
        <span className="text-xs text-slate-400 shrink-0 mt-1">Companies House data</span>
      </div>

      {/* Overall status banner */}
      <div className={`rounded-lg p-4 flex items-start gap-3 ${style.wrapper}`}>
        {style.icon}
        <p className={`text-sm font-semibold ${style.text}`}>{check.headline}</p>
      </div>

      {/* Individual fact items */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
        {check.items.map((item, i) => (
          <FactItem key={i} item={item} />
        ))}
      </div>

      {/* Disclaimer */}
      <div className="flex items-start gap-2 pt-2 border-t border-slate-100">
        <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
        <p className="text-xs text-slate-400 leading-relaxed">{check.disclaimer}</p>
      </div>
    </div>
  );
}
