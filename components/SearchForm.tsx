'use client';

import { useState } from 'react';
import { Search, Globe, Building2, Zap, FileSearch } from 'lucide-react';

interface Props {
  onSubmit: (companyName: string, websiteUrl: string, mode: 'quick' | 'full') => void;
  isLoading: boolean;
}

function normaliseUrl(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return trimmed;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export default function SearchForm({ onSubmit, isLoading }: Props) {
  const [companyName, setCompanyName] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [mode, setMode] = useState<'quick' | 'full'>('full');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (companyName.trim() && websiteUrl.trim()) {
      onSubmit(companyName.trim(), normaliseUrl(websiteUrl), mode);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Company name"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            required
            className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
          />
        </div>
        <div className="relative">
          <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="company-website.co.uk"
            value={websiteUrl}
            onChange={(e) => setWebsiteUrl(e.target.value)}
            required
            className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
          />
        </div>
      </div>

      {/* Mode selector */}
      <div className="flex items-center gap-3">
        <span className="text-xs text-slate-500 font-medium">Research depth:</span>
        <div className="flex rounded-lg border border-slate-200 overflow-hidden text-sm">
          <button
            type="button"
            onClick={() => setMode('quick')}
            className={`flex items-center gap-1.5 px-4 py-2 font-medium transition-colors ${
              mode === 'quick'
                ? 'bg-emerald-600 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            Quick
            <span className={`text-xs ${mode === 'quick' ? 'text-emerald-200' : 'text-slate-400'}`}>
              ~$0.01
            </span>
          </button>
          <button
            type="button"
            onClick={() => setMode('full')}
            className={`flex items-center gap-1.5 px-4 py-2 font-medium transition-colors border-l border-slate-200 ${
              mode === 'full'
                ? 'bg-emerald-600 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            <FileSearch className="w-3.5 h-3.5" />
            Full
            <span className={`text-xs ${mode === 'full' ? 'text-emerald-200' : 'text-slate-400'}`}>
              ~$0.08
            </span>
          </button>
        </div>
        <span className="text-xs text-slate-400">
          {mode === 'quick'
            ? 'Haiku model · 5 searches · fast'
            : 'Sonnet model · 11 searches · thorough'}
        </span>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isLoading || !companyName.trim() || !websiteUrl.trim()}
          className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors text-sm"
        >
          <Search className="w-4 h-4" />
          {isLoading ? 'Researching…' : 'Research Company'}
        </button>
      </div>
    </form>
  );
}
