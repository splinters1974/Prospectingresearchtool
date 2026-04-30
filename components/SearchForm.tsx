'use client';

import { useState } from 'react';
import { Search, Globe, Building2 } from 'lucide-react';

interface Props {
  onSubmit: (companyName: string, websiteUrl: string) => void;
  isLoading: boolean;
}

export default function SearchForm({ onSubmit, isLoading }: Props) {
  const [companyName, setCompanyName] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (companyName.trim() && websiteUrl.trim()) {
      onSubmit(companyName.trim(), websiteUrl.trim());
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
            type="url"
            placeholder="https://company-website.co.uk"
            value={websiteUrl}
            onChange={(e) => setWebsiteUrl(e.target.value)}
            required
            className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
          />
        </div>
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
