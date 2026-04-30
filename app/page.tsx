'use client';

import { useState, useEffect } from 'react';
import SearchForm from '@/components/SearchForm';
import LoadingState from '@/components/LoadingState';
import ResearchReport from '@/components/ResearchReport';
import RecentSearches from '@/components/RecentSearches';
import type { ResearchReport as ReportType } from '@/types/research';
import { saveToCache, getAllCacheEntries, type CacheEntry } from '@/lib/cache';
import { Zap } from 'lucide-react';

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [report, setReport] = useState<ReportType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cacheEntries, setCacheEntries] = useState<CacheEntry[]>([]);

  useEffect(() => {
    setCacheEntries(getAllCacheEntries());
  }, []);

  async function handleSearch(companyName: string, websiteUrl: string) {
    setIsLoading(true);
    setReport(null);
    setError(null);

    try {
      const res = await fetch('/api/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyName, websiteUrl }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? 'Something went wrong. Please try again.');
        return;
      }

      const result = data as ReportType;
      saveToCache(companyName, websiteUrl, result);
      setCacheEntries(getAllCacheEntries());
      setReport(result);
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  }

  function handleSelectCached(entry: CacheEntry) {
    setReport(entry.report);
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleDeleteCached(companyName: string) {
    setCacheEntries(getAllCacheEntries());
    // Clear report if it's the one being deleted
    if (report?.company.name.toLowerCase().trim() === companyName.toLowerCase().trim()) {
      setReport(null);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="no-print bg-slate-900 border-b border-slate-800">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-white font-bold text-lg leading-none">Energy Prospecting</h1>
            <p className="text-slate-400 text-xs mt-0.5">UK Energy &amp; Carbon Intelligence</p>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <div className="no-print bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-slate-900 font-semibold mb-1">Research a prospect</h2>
          <p className="text-slate-500 text-sm mb-5">
            Enter a company name and website to generate an energy &amp; carbon intelligence briefing.
          </p>
          <SearchForm onSubmit={handleSearch} isLoading={isLoading} />
        </div>

        {isLoading && <div className="no-print"><LoadingState /></div>}

        {error && !isLoading && (
          <div className="no-print bg-red-50 border border-red-200 rounded-xl p-5 text-red-700 text-sm">
            {error}
          </div>
        )}

        {report && !isLoading && <ResearchReport report={report} />}

        {!isLoading && !report && !error && cacheEntries.length === 0 && (
          <div className="no-print text-center py-16 text-slate-400">
            <Zap className="w-10 h-10 mx-auto mb-3 text-slate-300" />
            <p className="text-sm">Your energy intelligence briefing will appear here</p>
          </div>
        )}

        <RecentSearches
          entries={cacheEntries}
          onSelect={handleSelectCached}
          onDelete={handleDeleteCached}
        />
      </main>
    </div>
  );
}
