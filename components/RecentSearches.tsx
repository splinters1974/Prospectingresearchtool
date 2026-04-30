'use client';

import { Clock, Trash2, ChevronRight } from 'lucide-react';
import { deleteFromCache, type CacheEntry } from '@/lib/cache';

interface Props {
  entries: CacheEntry[];
  onSelect: (entry: CacheEntry) => void;
  onDelete: (companyName: string) => void;
}

export default function RecentSearches({ entries, onSelect, onDelete }: Props) {
  if (entries.length === 0) return null;

  function handleDelete(e: React.MouseEvent, companyName: string) {
    e.stopPropagation();
    deleteFromCache(companyName);
    onDelete(companyName);
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }

  return (
    <div className="no-print bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-center gap-2 mb-3">
        <Clock className="w-4 h-4 text-slate-400" />
        <h3 className="text-sm font-semibold text-slate-700">Recent Searches</h3>
        <span className="text-xs text-slate-400 ml-auto">{entries.length} saved</span>
      </div>
      <ul className="divide-y divide-slate-100">
        {entries.map((entry) => (
          <li key={entry.companyName}>
            <button
              onClick={() => onSelect(entry)}
              className="w-full flex items-center gap-3 py-2.5 text-left hover:bg-slate-50 rounded-lg px-2 -mx-2 transition-colors group"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">{entry.companyName}</p>
                <p className="text-xs text-slate-400 truncate">{entry.websiteUrl}</p>
              </div>
              <span className="text-xs text-slate-400 shrink-0">{formatDate(entry.savedAt)}</span>
              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-500 transition-colors shrink-0" />
              <button
                onClick={(e) => handleDelete(e, entry.companyName)}
                className="p-1 rounded hover:bg-red-50 hover:text-red-500 text-slate-300 transition-colors shrink-0"
                title="Delete"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
