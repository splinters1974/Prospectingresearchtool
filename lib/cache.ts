import type { ResearchReport } from '@/types/research';

const CACHE_KEY = 'energy-prospecting-cache';
const MAX_ENTRIES = 50;

export interface CacheEntry {
  companyName: string;
  websiteUrl: string;
  report: ResearchReport;
  savedAt: string;
}

function readCache(): CacheEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? (JSON.parse(raw) as CacheEntry[]) : [];
  } catch {
    return [];
  }
}

function writeCache(entries: CacheEntry[]): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(entries));
  } catch {
    // Storage full — remove oldest entry and retry
    const trimmed = entries.slice(1);
    localStorage.setItem(CACHE_KEY, JSON.stringify(trimmed));
  }
}

export function saveToCache(companyName: string, websiteUrl: string, report: ResearchReport): void {
  const entries = readCache();
  const key = companyName.toLowerCase().trim();

  // Remove existing entry for this company if present
  const filtered = entries.filter((e) => e.companyName.toLowerCase().trim() !== key);

  const newEntry: CacheEntry = {
    companyName,
    websiteUrl,
    report,
    savedAt: new Date().toISOString(),
  };

  // Add to front, cap at MAX_ENTRIES
  writeCache([newEntry, ...filtered].slice(0, MAX_ENTRIES));
}

export function loadFromCache(companyName: string): CacheEntry | null {
  const entries = readCache();
  const key = companyName.toLowerCase().trim();
  return entries.find((e) => e.companyName.toLowerCase().trim() === key) ?? null;
}

export function getAllCacheEntries(): CacheEntry[] {
  return readCache();
}

export function deleteFromCache(companyName: string): void {
  const entries = readCache();
  const key = companyName.toLowerCase().trim();
  writeCache(entries.filter((e) => e.companyName.toLowerCase().trim() !== key));
}
