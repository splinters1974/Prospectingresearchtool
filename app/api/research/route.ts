import { NextRequest, NextResponse } from 'next/server';
import { searchCompany, getOfficers, getFilingHistory, getCompanyProfile, getCharges, formatAddress, formatFilings } from '@/lib/companies-house';
import { searchCompanyEnergy, searchCompanyPeople, searchCompanyNews } from '@/lib/web-search';
import { scrapeCompanyWebsite } from '@/lib/scraper';
import { synthesiseReport } from '@/lib/claude';
import { computeFinancialHealth } from '@/lib/financial-health';
import type { ResearchRequest, FinancialHealthCheck } from '@/types/research';

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  let body: ResearchRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { companyName, websiteUrl, mode = 'full' } = body;
  if (!companyName?.trim() || !websiteUrl?.trim()) {
    return NextResponse.json({ error: 'companyName and websiteUrl are required' }, { status: 400 });
  }

  const [chCompany, websiteContent, energyResults, peopleResults, newsResults] = await Promise.all([
    searchCompany(companyName),
    scrapeCompanyWebsite(websiteUrl, mode),
    searchCompanyEnergy(companyName, mode),
    searchCompanyPeople(companyName, mode),
    searchCompanyNews(companyName, mode),
  ]);

  let chText = '';
  let filingHistory = '';
  let financialHealth: FinancialHealthCheck | undefined;

  if (chCompany) {
    const [officers, filings, profile, charges] = await Promise.all([
      getOfficers(chCompany.company_number),
      getFilingHistory(chCompany.company_number),
      getCompanyProfile(chCompany.company_number),
      getCharges(chCompany.company_number),
    ]);

    financialHealth = computeFinancialHealth(
      chCompany.company_status,
      chCompany.date_of_creation,
      profile,
      charges
    );

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
      mode,
    });

    if (financialHealth) report.financialHealth = financialHealth;
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
