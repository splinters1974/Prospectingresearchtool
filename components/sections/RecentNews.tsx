import { Newspaper, ExternalLink } from 'lucide-react';
import type { NewsItem } from '@/types/research';

interface Props {
  news: NewsItem[];
}

export default function RecentNews({ news }: Props) {
  if (!news || news.length === 0) return null;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 print-section">
      <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2 mb-4">
        <Newspaper className="w-5 h-5 text-emerald-600" />
        Recent News &amp; Press
      </h3>
      <div className="space-y-3">
        {news.map((item, i) => (
          <div key={i} className="border border-slate-100 rounded-lg p-4">
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-medium text-slate-900 leading-snug">{item.headline}</p>
              <div className="flex items-center gap-2 shrink-0">
                {item.date && (
                  <span className="text-xs text-slate-400">{item.date}</span>
                )}
                {item.url && (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-400 hover:text-emerald-600 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
            {item.summary && (
              <p className="text-xs text-slate-600 leading-relaxed mt-1.5">{item.summary}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
