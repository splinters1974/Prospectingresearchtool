export type SectorCategory = 'ic' | 'public' | 'education' | 'defence' | 'other';
export type PersonCategory = 'board' | 'senior_leadership' | 'energy_sustainability';
export type DataConfidence = 'high' | 'medium' | 'low';

export interface EnergyProject {
  title: string;
  description: string;
  year?: string;
}

export interface NewsItem {
  headline: string;
  summary: string;
  date?: string;
  url?: string;
}

export interface ContactDetails {
  email?: string;
  phone?: string;
  linkedin?: string;
}

export interface Person {
  name: string;
  jobTitle: string;
  category: PersonCategory;
  isUKBased?: boolean;
  location?: string;
  bio: string;
  relevanceToEnergy: string;
  contactDetails: ContactDetails;
}

export interface ResearchReport {
  company: {
    name: string;
    companiesHouseNumber?: string;
    registeredAddress?: string;
    sector: string;
    sectorCategory: SectorCategory;
    description: string;
    employeeCount?: string;
    annualTurnover?: string;
    locations: string[];
    website: string;
    isInternational?: boolean;
  };
  energyBackground: {
    summary: string;
    netZeroTarget?: string;
    energyProjects: EnergyProject[];
    regulatoryObligations: string[];
    certifications: string[];
    keyFacts: string[];
    annualReportInsights?: string;
    dataConfidence: DataConfidence;
  };
  keyPeople: Person[];
  recentNews?: NewsItem[];
  researchNotes?: string;
  generatedAt: string;
}

export interface ResearchRequest {
  companyName: string;
  websiteUrl: string;
  mode: 'quick' | 'full';
}

export interface ResearchProgress {
  step: string;
  status: 'pending' | 'in_progress' | 'done' | 'error';
}
