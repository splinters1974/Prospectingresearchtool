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
        include_domains: [],
        exclude_domains: [],
      }),
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

export async function searchCompanyEnergy(companyName: string): Promise<string> {
  const queries = [
    `"${companyName}" net zero carbon target UK`,
    `"${companyName}" energy projects renewable sustainability`,
    `"${companyName}" ESOS SECR carbon reporting`,
    `"${companyName}" sustainability report annual`,
  ];

  const results = await Promise.all(queries.map(tavilySearch));
  return results.filter(Boolean).join('\n\n---\n\n');
}

export async function searchCompanyPeople(companyName: string): Promise<string> {
  const queries = [
    `"${companyName}" CEO CFO board directors LinkedIn`,
    `"${companyName}" energy manager sustainability director facilities`,
    `"${companyName}" leadership team executive`,
  ];

  const results = await Promise.all(queries.map(tavilySearch));
  return results.filter(Boolean).join('\n\n---\n\n');
}
