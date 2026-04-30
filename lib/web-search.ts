const TAVILY_ENDPOINT = 'https://api.tavily.com/search';

interface TavilyResult {
  title: string;
  url: string;
  content: string;
}

async function tavilySearch(query: string): Promise<string> {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) return '';
  try {
    const res = await fetch(TAVILY_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: apiKey,
        query,
        search_depth: 'basic',
        max_results: 5,
      }),
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return '';
    const data = await res.json();
    const results: TavilyResult[] = data.results ?? [];
    return results
      .map((r) => `${r.title}\n${r.url}\n${r.content}`)
      .join('\n\n');
  } catch {
    return '';
  }
}

async function batchSearch(queries: string[]): Promise<string> {
  const results: string[] = [];
  for (const q of queries) {
    const r = await tavilySearch(q);
    if (r) results.push(r);
  }
  return results.join('\n\n---\n\n');
}

export async function searchCompanyEnergy(
  companyName: string,
  mode: 'quick' | 'full' = 'full'
): Promise<string> {
  const queries =
    mode === 'quick'
      ? [
          `"${companyName}" net zero carbon energy sustainability`,
          `"${companyName}" ESOS SECR annual report energy`,
        ]
      : [
          `"${companyName}" net zero carbon target sustainability UK`,
          `"${companyName}" ESOS SECR energy carbon annual report`,
          `"${companyName}" energy projects renewable decarbonisation`,
        ];
  return batchSearch(queries);
}

export async function searchCompanyPeople(
  companyName: string,
  mode: 'quick' | 'full' = 'full'
): Promise<string> {
  const queries =
    mode === 'quick'
      ? [
          `"${companyName}" UK managing director CEO sustainability director`,
          `"${companyName}" energy manager procurement director leadership`,
        ]
      : [
          `"${companyName}" UK managing director CEO CFO operations finance director`,
          `"${companyName}" sustainability director energy manager ESG procurement`,
          `"${companyName}" UK leadership team engineering director country manager`,
          `"${companyName}" global chief sustainability officer group energy director`,
        ];
  return batchSearch(queries);
}

export async function searchCompanyNews(
  companyName: string,
  mode: 'quick' | 'full' = 'full'
): Promise<string> {
  const queries =
    mode === 'quick'
      ? [`"${companyName}" energy sustainability news`]
      : [
          `"${companyName}" energy sustainability news 2024 2025`,
          `"${companyName}" carbon net zero achievement press release announcement`,
        ];
  return batchSearch(queries);
}
