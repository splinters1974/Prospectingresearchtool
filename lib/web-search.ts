const BRAVE_ENDPOINT = 'https://api.search.brave.com/res/v1/web/search';

interface BraveResult {
  title: string;
  url: string;
  description: string;
}

async function braveSearch(query: string): Promise<string> {
  const apiKey = process.env.BRAVE_SEARCH_API_KEY;
  if (!apiKey) return '';
  try {
    const res = await fetch(
      `${BRAVE_ENDPOINT}?q=${encodeURIComponent(query)}&count=5&country=GB`,
      {
        headers: {
          Accept: 'application/json',
          'Accept-Encoding': 'gzip',
          'X-Subscription-Token': apiKey,
        },
      }
    );
    if (!res.ok) return '';
    const data = await res.json();
    const results: BraveResult[] = data.web?.results ?? [];
    return results
      .map((r) => `${r.title}\n${r.url}\n${r.description}`)
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

  const results = await Promise.all(queries.map(braveSearch));
  return results.filter(Boolean).join('\n\n---\n\n');
}

export async function searchCompanyPeople(companyName: string): Promise<string> {
  const queries = [
    `"${companyName}" CEO CFO board directors LinkedIn`,
    `"${companyName}" energy manager sustainability director facilities`,
    `"${companyName}" leadership team executive`,
  ];

  const results = await Promise.all(queries.map(braveSearch));
  return results.filter(Boolean).join('\n\n---\n\n');
}
