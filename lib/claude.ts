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

Sector characteristics:
- I&C (Industrial & Commercial): high energy intensity, ESOS/SECR likely applies, energy a major cost
- Public Sector: PPN 06/21 obligations, social value, Salix Finance funding available
- Education: universities have net zero strategies; schools less so; Salix loans available
- Defence: MOD Net Zero targets, complex procurement rules
- Healthcare: NHS net zero 2040 target (Scope 1&2), 2045 (Scope 3)

When data is limited, make reasonable inferences based on sector and company size, but clearly flag what is inferred vs. explicitly stated.

IMPORTANT: Return ONLY valid JSON matching the schema provided. No markdown, no explanation, just the JSON object.`;

function buildUserPrompt(
  companyName: string,
  websiteUrl: string,
  companiesHouseData: string,
  websiteContent: string,
  energySearchResults: string,
  peopleSearchResults: string
): string {
  return `Research the following company and return a structured JSON report.

COMPANY NAME: ${companyName}
WEBSITE: ${websiteUrl}

=== COMPANIES HOUSE DATA ===
${companiesHouseData || 'No data retrieved'}

=== COMPANY WEBSITE CONTENT ===
${websiteContent || 'No content retrieved'}

=== ENERGY & SUSTAINABILITY SEARCH RESULTS ===
${energySearchResults || 'No results'}

=== PEOPLE & LEADERSHIP SEARCH RESULTS ===
${peopleSearchResults || 'No results'}

Return a JSON object matching this exact TypeScript interface:

{
  company: {
    name: string,
    companiesHouseNumber?: string,
    registeredAddress?: string,
    sector: string,                    // human-readable sector description
    sectorCategory: "ic" | "public" | "education" | "defence" | "other",
    description: string,               // 2-3 sentence overview of what they do
    employeeCount?: string,
    annualTurnover?: string,
    locations: string[],               // UK locations they operate from
    website: string
  },
  energyBackground: {
    summary: string,                   // 2-3 sentence energy/carbon summary
    netZeroTarget?: string,            // e.g. "Net zero by 2040"
    energyProjects: [{ title: string, description: string, year?: string }],
    regulatoryObligations: string[],   // e.g. ["ESOS", "SECR"]
    certifications: string[],          // e.g. ["ISO 50001", "BREEAM Excellent"]
    keyFacts: string[],                // 3-5 notable energy/carbon facts
    dataConfidence: "high" | "medium" | "low"
  },
  keyPeople: [
    {
      name: string,
      jobTitle: string,
      category: "board" | "senior_leadership" | "energy_sustainability",
      bio: string,                     // 1-2 sentences about the person
      relevanceToEnergy: string,       // why they matter for an energy sale
      contactDetails: {
        email?: string,
        phone?: string,
        linkedin?: string
      }
    }
  ],
  researchNotes?: string,              // gaps, caveats, or important context
  generatedAt: string                  // ISO 8601 timestamp
}

Rules:
- Include ALL directors found in Companies House data
- Add any energy/sustainability/facilities roles found in search results
- Senior leadership = C-suite, MD, directors not on Companies House list
- Set generatedAt to "${new Date().toISOString()}"
- If a field is unknown, omit it (don't set to null or "Unknown")
- keyFacts should include whether ESOS/SECR likely applies based on company size
- Be specific about energy projects — avoid generic statements`;
}

export async function synthesiseReport(params: {
  companyName: string;
  websiteUrl: string;
  companiesHouseData: string;
  websiteContent: string;
  energySearchResults: string;
  peopleSearchResults: string;
}): Promise<ResearchReport> {
  const userPrompt = buildUserPrompt(
    params.companyName,
    params.websiteUrl,
    params.companiesHouseData,
    params.websiteContent,
    params.energySearchResults,
    params.peopleSearchResults
  );

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userPrompt }],
  });

  const text = message.content
    .filter((b) => b.type === 'text')
    .map((b) => (b as { type: 'text'; text: string }).text)
    .join('');

  // Extract JSON from response (strip any accidental markdown fences)
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Claude did not return valid JSON');

  return JSON.parse(jsonMatch[0]) as ResearchReport;
}
