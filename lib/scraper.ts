const PAGES_QUICK = ['', '/about', '/about-us', '/sustainability', '/leadership', '/team'];

const PAGES_FULL = [
  '',
  '/about',
  '/about-us',
  '/sustainability',
  '/environment',
  '/net-zero',
  '/carbon',
  '/energy',
  '/leadership',
  '/board',
  '/team',
  '/people',
  '/who-we-are',
  '/our-team',
  '/corporate-responsibility',
];

function normaliseUrl(url: string): string {
  if (!url.startsWith('http')) url = `https://${url}`;
  return url.replace(/\/$/, '');
}

function htmlToText(html: string): string {
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
    .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '')
    .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

async function fetchPage(url: string, maxChars: number): Promise<string> {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (compatible; EnergyProspectBot/1.0; +https://github.com/splinters1974/prospectingresearchtool)',
        Accept: 'text/html,application/xhtml+xml',
      },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return '';
    const html = await res.text();
    return htmlToText(html).slice(0, maxChars);
  } catch {
    return '';
  }
}

export async function scrapeCompanyWebsite(
  websiteUrl: string,
  mode: 'quick' | 'full' = 'full'
): Promise<string> {
  const base = normaliseUrl(websiteUrl);
  const pages = mode === 'quick' ? PAGES_QUICK : PAGES_FULL;
  const maxChars = mode === 'quick' ? 1500 : 3000;

  const results = await Promise.allSettled(
    pages.map((path) => fetchPage(`${base}${path}`, maxChars))
  );

  const fetched = results
    .map((r) => (r.status === 'fulfilled' ? r.value : ''))
    .filter(Boolean);

  const seen = new Set<string>();
  const unique: string[] = [];
  for (const page of fetched) {
    const key = page.slice(0, 200);
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(page);
    }
  }

  return unique.join('\n\n---\n\n');
}
