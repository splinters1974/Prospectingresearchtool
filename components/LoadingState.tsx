'use client';

import { CheckCircle, Circle, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

const STEPS = [
  'Checking Companies House register…',
  'Scanning company website…',
  'Searching for energy projects & net zero targets…',
  'Identifying key people & contacts…',
  'Generating intelligence report…',
];

export default function LoadingState() {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const intervals = STEPS.map((_, i) =>
      setTimeout(() => setCurrentStep(i), i * 4000)
    );
    return () => intervals.forEach(clearTimeout);
  }, []);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-8 max-w-md mx-auto">
      <div className="flex items-center justify-center mb-6">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
      </div>
      <h3 className="text-slate-900 font-semibold text-center mb-6">
        Researching company…
      </h3>
      <ol className="space-y-3">
        {STEPS.map((step, i) => {
          const isDone = i < currentStep;
          const isActive = i === currentStep;
          return (
            <li key={i} className="flex items-start gap-3">
              {isDone ? (
                <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" />
              ) : isActive ? (
                <Loader2 className="w-5 h-5 text-emerald-600 animate-spin mt-0.5 shrink-0" />
              ) : (
                <Circle className="w-5 h-5 text-slate-300 mt-0.5 shrink-0" />
              )}
              <span
                className={`text-sm ${
                  isDone
                    ? 'text-slate-400 line-through'
                    : isActive
                    ? 'text-slate-900 font-medium'
                    : 'text-slate-400'
                }`}
              >
                {step}
              </span>
            </li>
          );
        })}
      </ol>
      <p className="text-xs text-slate-400 text-center mt-6">
        This takes around 30–60 seconds
      </p>
    </div>
  );
}
