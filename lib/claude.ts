import Anthropic from '@anthropic-ai/sdk';
import type { ResearchReport } from '@/types/research';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are a senior UK energy consultant preparing a prospecting briefing for a B2B energy broker or consultant. Your role is to analyse all available information about a company and produce a structured intelligence report that helps the sales team prepare for a meeting.

UK energy context you understand deeply:
- ESOS (Energy Savings Opportunity Scheme): mandatory for large UK organisations every 4 years
- SECR (Streamlined Energy & Carbon Reporting): mandatory annual reporting for large companies
- CRC Energy Efficiency Scheme (now closed but historically relevant)
- Net Zero 2050: UK government target; many sectors have their own earlier targets
- SBTi (Science Based Targets initiative): corporate net zero commitments
- PPN 06/21: UK public sector net zero procurement requirements
- BREEAM, ISO 50001, PAS 2060: energy and carbon certifications
- PPAs (Power Purchase Agreements), demand response, onsite generation (solar, CHP)
- Heat decarbonisation: heat pumps replacing gas boilers
- EV fleet electrification
- Scope 1, 2, 3 emissions terminology
- TCFD (Task Force on Climate-related Financial Disclosures): mandatory for large UK companies
- Carbon Border Adjustment Mechanism (CBAM): relevant for industrial importers/exporters

Sector characteristics:
- I&C (Industrial & Commercial): high energy intensity, ESOS/SECR likely applies, energy a major cost
- Public Sector: PPN 06/21 obligations, social value, Salix Finance funding available
- Education: universities have net zero strategies; schools less so; Salix loans available
- Defence: MOD Net Zero targets, complex procurement rules
- Healthcare: NHS net zero 2040 target (Scope 1&2), 2045 (Scope 3)

INTERNATIONAL BUSINESSES:
- If a company is a multinational or overseas-headquartered business, identify BOTH:
  1. UK-specific contacts: UK MD/CEO, UK Operations Director, UK Finance Director, UK Engineering Director, UK energy/sustainability/procurement leads
  2. Global/overseas stakeholders: Group CSO, Global Head of Energy, Group Sustainability Director — note their location and global remit
- For UK operations of international companies, ESOS/SECR still applies to UK entities above thresholds
- Note where decisions may be made centrally vs locally (e.g. energy procurement centralised at HQ)

KEY PEOPLE TO IDENTIFY:
Prioritise finding ALL of the following roles where they exist:
1. Board/Directors: CEO, MD, CFO, Chairman (from Companies House + search)
2. Senior UK Leadership: UK Managing Director, UK Operations Director, UK Finance Director, UK Engineering/Technical Director
3. Energy & Sustainability: Head of Sustainability, Sustainability Director, Energy Manager, Carbon Manager, ESG Director, Environment Manager, Head of Net Zero, Facilities Director (if energy responsible)
4. Procurement / Energy Buying: Category Manager (Energy or Utilities), Energy Buyer, Group Energy Manager, Head of Procurement (if energy in remit), Supply Chain Director, Head of Estates, Utilities Manager, Head of Facilities
5. Global stakeholders (for international cos): Chief Sustainability Officer (Group), Group Energy Director, VP Sustainability, European Energy Manager

BUYER TYPE — for each person, set buyerType:
- "supply": their role involves procuring energy commodity (gas/power contracts, TPI/broker relationships, half-hourly metering, supplier selection, contract renewals). Typical roles: Energy Buyer, Category Manager Energy/Utilities, Group Energy Manager, Procurement Director
- "solutions": their role involves approving energy projects, efficiency measures, renewables, EV fleet, ESOS/SECR compliance, decarbonisation capex. Typical roles: Sustainability Director, Energy Manager, Head of Net Zero, Engineering Director, Capital Projects Manager
- "both": their role spans both (e.g. Head of Facilities who manages both contracts and projects, CFO who approves all energy spend)
- Omit buyerType for board/general leadership with no direct energy remit

ENERGY DECISION STRUCTURE:
For ALL companies (especially multi-site or international), write a 2-3 sentence energyDecisionStructure field that explains:
- Who makes the day-to-day energy supply decisions (contract renewals, supplier selection) — is it UK-led or centralised at group/regional HQ?
- Who approves energy projects and capital spend (net zero initiatives, efficiency projects, onsite generation)?
- For international companies: where are major decisions made (e.g. European HQ in Germany, US parent)?
- What the likely approval threshold is for multi-year deals or significant energy contracts
Example: "Energy supply contracts for UK sites are managed locally by the UK Facilities Director, with procurement sign-off required above £100k. Major capital projects and net zero strategy are set at Group level by the Global Head of Sustainability in Amsterdam. Multi-year PPAs would require Group CFO approval."

ANNUAL REPORTS & ACCOUNTS:
- Companies House filing history shows when accounts were filed and the period covered
- Use this data to understand the company's reporting cadence and financial period
- Cross-reference with sustainability/energy search results to find energy & carbon data from those annual reports
- Look for: total energy consumption (kWh/MWh), carbon emissions (tCO2e), energy spend, year-on-year trends, stated energy reduction targets

When data is limited, make reasonable inferences based on sector and company size, but clearly flag what is inferred vs. explicitly stated.

IMPORTANT: Return ONLY valid JSON matching the schema provided. No markdown, no explanation, just the JSON object.`;

function buildUserPrompt(
  companyName: string,
  websiteUrl: string,
  companiesHouseData: string,
  websiteContent: string,
  energySearchResults: string,
  peopleSearchResults: string,
  newsResults: string,
  filingHistory: string
): string {
  return `Research the following company and return a structured JSON report.

COMPANY NAME: ${companyName}
WEBSITE: ${websiteUrl}

=== COMPANIES HOUSE DATA ===
${companiesHouseData || 'No data retrieved'}

=== COMPANIES HOUSE FILING HISTORY (Annual Accounts) ===
${filingHistory || 'No filing history retrieved'}

=== COMPANY WEBSITE CONTENT ===
${websiteContent || 'No content retrieved'}

=== ENERGY & SUSTAINABILITY SEARCH RESULTS ===
${energySearchResults || 'No results'}

=== PEOPLE & LEADERSHIP SEARCH RESULTS ===
${peopleSearchResults || 'No results'}

=== NEWS & PRESS RELEASES ===
${newsResults || 'No results'}

Return a JSON object matching this exact TypeScript interface:

{
  company: {
    name: string,
    companiesHouseNumber?: string,
    registeredAddress?: string,
    sector: string,
    sectorCategory: "ic" | "public" | "education" | "defence" | "other",
    description: string,               // 2-3 sentences covering what they do and whether UK-only or international
    employeeCount?: string,
    annualTurnover?: string,
    locations: string[],               // UK locations they operate from
    website: string,
    isInternational?: boolean          // true if HQ is outside UK or multinational
  },
  energyBackground: {
    summary: string,                   // 2-3 sentence energy/carbon summary including any annual report data
    netZeroTarget?: string,
    energyProjects: [{ title: string, description: string, year?: string }],
    regulatoryObligations: string[],   // ESOS, SECR, TCFD, etc.
    certifications: string[],
    keyFacts: string[],                // 4-6 facts including any annual report energy/carbon figures
    annualReportInsights?: string,     // key energy/carbon findings from annual accounts if available
    dataConfidence: "high" | "medium" | "low"
  },
  keyPeople: [
    {
      name: string,
      jobTitle: string,
      category: "board" | "senior_leadership" | "energy_sustainability" | "procurement",
      buyerType?: "supply" | "solutions" | "both",  // see instructions above
      isUKBased?: boolean,             // false for overseas stakeholders at international companies
      location?: string,               // e.g. "UK", "USA (Global HQ)", "Germany"
      bio: string,
      relevanceToEnergy: string,
      contactDetails: {
        email?: string,
        phone?: string,
        linkedin?: string
      }
    }
  ],
  energyDecisionStructure?: string,    // 2-3 sentences on how energy decisions are made and where
  recentNews: [                        // up to 5 notable recent news items
    {
      headline: string,
      summary: string,
      date?: string,
      url?: string
    }
  ],
  researchNotes?: string,
  generatedAt: string
}

Rules:
- Include ALL directors found in Companies House data
- Actively look for MD, Ops Director, Finance Director, Engineering Director, procurement leads and energy/sustainability roles from search results
- ALWAYS look for energy buyers and procurement roles: Category Manager Energy/Utilities, Energy Buyer, Group Energy Manager, Head of Estates, Utilities Manager, Facilities Director — these go in category "procurement"
- For international companies: include both UK contacts AND relevant overseas stakeholders, flagging each with isUKBased and location
- Set buyerType for anyone in procurement, energy_sustainability, or senior_leadership with energy remit; omit for pure board/governance roles
- energyDecisionStructure: write this for every company — at minimum note whether energy decisions are UK-led or group-led, and who the key approver is for contracts vs projects
- annualReportInsights: extract any energy consumption figures, carbon data, or energy strategy commitments found in annual report search results
- recentNews: include genuine news items only — energy projects, sustainability achievements, awards, investments
- Set generatedAt to "${new Date().toISOString()}"
- If a field is unknown, omit it
- keyFacts should include whether ESOS/SECR/TCFD likely applies and any figures from annual reports`;
}

export async function synthesiseReport(params: {
  companyName: string;
  websiteUrl: string;
  companiesHouseData: string;
  websiteContent: string;
  energySearchResults: string;
  peopleSearchResults: string;
  newsResults: string;
  filingHistory: string;
  mode: 'quick' | 'full';
}): Promise<ResearchReport> {
  const userPrompt = buildUserPrompt(
    params.companyName,
    params.websiteUrl,
    params.companiesHouseData,
    params.websiteContent,
    params.energySearchResults,
    params.peopleSearchResults,
    params.newsResults,
    params.filingHistory
  );

  const model =
    params.mode === 'quick' ? 'claude-haiku-4-5-20251001' : 'claude-sonnet-4-6';
  const maxTokens = params.mode === 'quick' ? 5000 : 8000;

  const quickNote =
    params.mode === 'quick'
      ? '\n\nQUICK MODE: Be concise. Limit keyPeople to 6 max. Keep bios to 1 sentence. Keep keyFacts to 4 items. Keep energyProjects to 3 max. Keep recentNews to 3 max.'
      : '';

  const message = await client.messages.create({
    model,
    max_tokens: maxTokens,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userPrompt + quickNote }],
  });

  const text = message.content
    .filter((b) => b.type === 'text')
    .map((b) => (b as { type: 'text'; text: string }).text)
    .join('');

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Claude did not return valid JSON');

  return JSON.parse(jsonMatch[0]) as ResearchReport;
}
