const BASE = 'https://api.company-information.service.gov.uk';

function authHeader() {
  const key = process.env.COMPANIES_HOUSE_API_KEY ?? '';
  return {
    Authorization: `Basic ${Buffer.from(`${key}:`).toString('base64')}`,
  };
}

export interface CHCompany {
  company_number: string;
  title: string;
  company_type?: string;
  company_status?: string;
  date_of_creation?: string;
  registered_office_address?: {
    address_line_1?: string;
    address_line_2?: string;
    locality?: string;
    postal_code?: string;
    country?: string;
  };
  sic_codes?: string[];
}

export interface CHOfficer {
  name: string;
  officer_role: string;
  appointed_on?: string;
  resigned_on?: string;
  occupation?: string;
}

export async function searchCompany(name: string): Promise<CHCompany | null> {
  try {
    const res = await fetch(
      `${BASE}/search/companies?q=${encodeURIComponent(name)}&items_per_page=5`,
      { headers: authHeader() }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const items: CHCompany[] = data.items ?? [];
    return items[0] ?? null;
  } catch {
    return null;
  }
}

export async function getOfficers(companyNumber: string): Promise<CHOfficer[]> {
  try {
    const res = await fetch(
      `${BASE}/company/${companyNumber}/officers?items_per_page=50`,
      { headers: authHeader() }
    );
    if (!res.ok) return [];
    const data = await res.json();
    const items: CHOfficer[] = data.items ?? [];
    return items.filter((o) => !o.resigned_on);
  } catch {
    return [];
  }
}

export function formatAddress(address?: CHCompany['registered_office_address']): string {
  if (!address) return '';
  return [
    address.address_line_1,
    address.address_line_2,
    address.locality,
    address.postal_code,
    address.country,
  ]
    .filter(Boolean)
    .join(', ');
}
