import { NextRequest, NextResponse } from 'next/server';
import { searchCompany, getOfficers, getFilingHistory, formatAddress, formatFilings } from '@/lib/companies-house';
import { searchCompanyEnergy, searchCompanyPeople, searchCompanyNews } from '@/lib/web-search';
import { scrapeCompanyWebsite } from '@/lib/scraper';
import { synthesiseReport } from '@/lib/claude';
import type { ResearchRequest } from '@/types/research';

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  let body: ResearchRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { companyName, websiteUrl } = body;
  if (!companyName?.trim() || !websiteUrl?.trim()) {
    return NextResponse.json({ error: 'companyName and websiteUrl are required' }, { status: 400 });
  }

  // Gather all data sources in parallel
  const [chCompany, websiteContent, energyResults, peopleResults, newsResults] = await Promise.all([
    searchCompany(companyName),
    scrapeCompanyWebsite(websiteUrl),
    searchCompanyEnergy(companyName),
    searchCompanyPeople(companyName),
    searchCompanyNews(companyName),
  ]);

  let chText = '';
  let filingHistory = '';

  if (chCompany) {
    const [officers, filings] = await Promise.all([
      getOfficers(chCompany.company_number),
      getFilingHistory(chCompany.company_number),
    ]);

    chText = [
      `Company: ${chCompany.title}`,
      `Number: ${chCompany.company_number}`,
      `Type: ${chCompany.company_type ?? 'N/A'}`,
      `Status: ${chCompany.company_status ?? 'N/A'}`,
      `Incorporated: ${chCompany.date_of_creation ?? 'N/A'}`,
      `Registered address: ${formatAddress(chCompany.registered_office_address)}`,
      `SIC codes: ${(chCompany.sic_codes ?? []).join(', ')}`,
    ].join('\n');

    const officersText = officers
      .map((o) => `- ${o.name} (${o.officer_role}${o.occupation ? `, ${o.occupation}` : ''})`)
      .join('\n');

    if (officersText) chText += `\n\nCurrent Officers:\n${officersText}`;

    filingHistory = formatFilings(filings);
  }

  try {
    const report = await synthesiseReport({
      companyName,
      websiteUrl,
      companiesHouseData: chText,
      websiteContent,
      energySearchResults: energyResults,
      peopleSearchResults: peopleResults,
      newsResults,
      filingHistory,
    });

    return NextResponse.json(report);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('Synthesis error:', message);
    return NextResponse.json(
      { error: `Failed to generate report: ${message}` },
      { status: 500 }
    );
  }
}
