import { Leaf, Target, Zap, Award, AlertCircle, CheckCircle } from 'lucide-react';
import type { ResearchReport } from '@/types/research';

const CONFIDENCE_CONFIG = {
  high: { label: 'High confidence', colour: 'text-emerald-600 bg-emerald-50', icon: CheckCircle },
  medium: { label: 'Medium confidence', colour: 'text-amber-600 bg-amber-50', icon: AlertCircle },
  low: { label: 'Low confidence — limited public data', colour: 'text-red-600 bg-red-50', icon: AlertCircle },
};

interface Props {
  energyBackground: ResearchReport['energyBackground'];
}

export default function EnergyBackground({ energyBackground }: Props) {
  const {
    summary,
    netZeroTarget,
    energyProjects,
    regulatoryObligations,
    certifications,
    keyFacts,
    dataConfidence,
  } = energyBackground;

  const conf = CONFIDENCE_CONFIG[dataConfidence];
  const ConfIcon = conf.icon;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
          <Leaf className="w-5 h-5 text-emerald-600" />
          Energy &amp; Carbon Background
        </h3>
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1 ${conf.colour}`}>
          <ConfIcon className="w-3.5 h-3.5" />
          {conf.label}
        </span>
      </div>

      <p className="text-slate-700 text-sm leading-relaxed">{summary}</p>

      {netZeroTarget && (
        <div className="flex items-start gap-3 bg-emerald-50 rounded-lg p-4">
          <Target className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-emerald-900">Net Zero Target</p>
            <p className="text-sm text-emerald-800 mt-0.5">{netZeroTarget}</p>
          </div>
        </div>
      )}

      {keyFacts.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-amber-500" />
            Key Energy Facts
          </h4>
          <ul className="space-y-1.5">
            {keyFacts.map((fact, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                {fact}
              </li>
            ))}
          </ul>
        </div>
      )}

      {energyProjects.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-slate-700 mb-3">Energy Projects</h4>
          <div className="space-y-3">
            {energyProjects.map((project, i) => (
              <div key={i} className="border border-slate-100 rounded-lg p-4">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <p className="text-sm font-medium text-slate-900">{project.title}</p>
                  {project.year && (
                    <span className="text-xs text-slate-400 shrink-0">{project.year}</span>
                  )}
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{project.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {regulatoryObligations.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Regulatory Obligations
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {regulatoryObligations.map((r, i) => (
                <span
                  key={i}
                  className="text-xs px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full font-medium"
                >
                  {r}
                </span>
              ))}
            </div>
          </div>
        )}
        {certifications.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
              <Award className="w-3.5 h-3.5" />
              Certifications
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {certifications.map((c, i) => (
                <span
                  key={i}
                  className="text-xs px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full font-medium"
                >
                  {c}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
