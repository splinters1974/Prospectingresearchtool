const TAVILY_ENDPOINT = 'https://api.tavily.com/search';

interface TavilyResult {
  title: string;
  url: string;
  content: string;
}

async function tavilySearch(query: string, depth: 'basic' | 'advanced' = 'basic'): Promise<string> {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) return '';
  try {
    const res = await fetch(TAVILY_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: apiKey,
        query,
        search_depth: depth,
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
    `"${companyName}" energy projects renewable sustainability UK`,
    `"${companyName}" ESOS SECR carbon reporting Scope emissions`,
    `"${companyName}" annual report energy carbon strategy`,
    `"${companyName}" sustainability report climate change energy`,
    `"${companyName}" energy efficiency decarbonisation heat pump solar PPA`,
  ];

  const results = await Promise.all(queries.map((q) => tavilySearch(q)));
  return results.filter(Boolean).join('\n\n---\n\n');
}

export async function searchCompanyPeople(companyName: string): Promise<string> {
  const queries = [
    // UK senior leadership
    `"${companyName}" UK "managing director" OR "MD" OR "chief executive" OR "CEO"`,
    `"${companyName}" UK "operations director" OR "finance director" OR "chief financial officer"`,
    `"${companyName}" UK "engineering director" OR "technical director" OR "chief technical officer"`,
    // Energy & sustainability
    `"${companyName}" "head of sustainability" OR "sustainability director" OR "energy manager" OR "carbon manager"`,
    `"${companyName}" "head of energy" OR "energy director" OR "environment manager" OR "ESG"`,
    // Procurement
    `"${companyName}" "procurement director" OR "head of procurement" OR "category manager" energy sustainability`,
    // International / overseas stakeholders
    `"${companyName}" UK "country manager" OR "UK director" OR "VP UK" OR "general manager UK"`,
    `"${companyName}" global "chief sustainability officer" OR "group energy" OR "group sustainability"`,
  ];

  const results = await Promise.all(queries.map((q) => tavilySearch(q)));
  return results.filter(Boolean).join('\n\n---\n\n');
}

export async function searchCompanyNews(companyName: string): Promise<string> {
  const queries = [
    `"${companyName}" energy news 2024 2025`,
    `"${companyName}" sustainability success renewable achievement award`,
    `"${companyName}" carbon reduction net zero announcement press release`,
    `"${companyName}" energy project case study investment`,
  ];

  const results = await Promise.all(queries.map((q) => tavilySearch(q, 'advanced')));
  return results.filter(Boolean).join('\n\n---\n\n');
}
