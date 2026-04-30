import { NextRequest, NextResponse } from 'next/server';
import { searchCompany, getOfficers, formatAddress } from '@/lib/companies-house';
import { searchCompanyEnergy, searchCompanyPeople } from '@/lib/web-search';
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
  const [chCompany, websiteContent, energyResults, peopleResults] = await Promise.all([
    searchCompany(companyName),
    scrapeCompanyWebsite(websiteUrl),
    searchCompanyEnergy(companyName),
    searchCompanyPeople(companyName),
  ]);

  let officersText = '';
  let chText = '';

  if (chCompany) {
    const officers = await getOfficers(chCompany.company_number);
    chText = [
      `Company: ${chCompany.title}`,
      `Number: ${chCompany.company_number}`,
      `Type: ${chCompany.company_type ?? 'N/A'}`,
      `Status: ${chCompany.company_status ?? 'N/A'}`,
      `Incorporated: ${chCompany.date_of_creation ?? 'N/A'}`,
      `Registered address: ${formatAddress(chCompany.registered_office_address)}`,
      `SIC codes: ${(chCompany.sic_codes ?? []).join(', ')}`,
    ].join('\n');

    officersText = officers
      .map((o) => `- ${o.name} (${o.officer_role}${o.occupation ? `, ${o.occupation}` : ''})`)
      .join('\n');

    if (officersText) chText += `\n\nCurrent Officers:\n${officersText}`;
  }

  try {
    const report = await synthesiseReport({
      companyName,
      websiteUrl,
      companiesHouseData: chText,
      websiteContent,
      energySearchResults: energyResults,
      peopleSearchResults: peopleResults,
    });

    return NextResponse.json(report);
  } catch (err) {
    console.error('Synthesis error:', err);
    return NextResponse.json(
      { error: 'Failed to generate report. Please try again.' },
      { status: 500 }
    );
  }
}
