import { Mail, Phone, ExternalLink, User, Globe } from 'lucide-react';

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}
import type { Person, BuyerType } from '@/types/research';

const CATEGORY_LABELS: Record<Person['category'], string> = {
  board: 'Board',
  senior_leadership: 'Senior Leadership',
  energy_sustainability: 'Energy & Sustainability',
  procurement: 'Procurement',
};

const CATEGORY_COLOURS: Record<Person['category'], string> = {
  board: 'bg-slate-100 text-slate-700',
  senior_leadership: 'bg-blue-50 text-blue-700',
  energy_sustainability: 'bg-emerald-50 text-emerald-700',
  procurement: 'bg-orange-50 text-orange-700',
};

const BUYER_TYPE_LABELS: Record<BuyerType, string> = {
  supply: 'Supply buyer',
  solutions: 'Solutions buyer',
  both: 'Supply & solutions',
};

const BUYER_TYPE_COLOURS: Record<BuyerType, string> = {
  supply: 'bg-sky-50 text-sky-700',
  solutions: 'bg-teal-50 text-teal-700',
  both: 'bg-violet-50 text-violet-700',
};

function linkedInSearchUrl(name: string, companyName: string): string {
  const q = encodeURIComponent(`${name} ${companyName}`);
  return `https://www.linkedin.com/search/results/people/?keywords=${q}`;
}

interface Props {
  person: Person;
  companyName: string;
}

export default function PersonCard({ person, companyName }: Props) {
  const { name, jobTitle, category, buyerType, bio, relevanceToEnergy, contactDetails = {}, isUKBased, location } = person;
  const isOverseas = isUKBased === false;

  return (
    <div className="print-card bg-white rounded-xl border border-slate-200 p-5 flex flex-col gap-3 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isOverseas ? 'bg-amber-50' : 'bg-slate-100'}`}>
          {isOverseas
            ? <Globe className="w-5 h-5 text-amber-500" />
            : <User className="w-5 h-5 text-slate-400" />
          }
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-slate-900 text-sm leading-tight">{name}</p>
          <p className="text-slate-500 text-xs mt-0.5 leading-tight">{jobTitle}</p>
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CATEGORY_COLOURS[category]}`}>
              {CATEGORY_LABELS[category]}
            </span>
            {buyerType && (
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${BUYER_TYPE_COLOURS[buyerType]}`}>
                {BUYER_TYPE_LABELS[buyerType]}
              </span>
            )}
            {location && (
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${isOverseas ? 'bg-amber-50 text-amber-700' : 'bg-slate-50 text-slate-600'}`}>
                {location}
              </span>
            )}
          </div>
        </div>
      </div>

      {bio && <p className="text-slate-600 text-xs leading-relaxed">{bio}</p>}

      {relevanceToEnergy && (
        <div className="bg-emerald-50 rounded-lg p-3">
          <p className="text-xs text-emerald-800 font-medium mb-0.5">Energy relevance</p>
          <p className="text-xs text-emerald-700 leading-relaxed">{relevanceToEnergy}</p>
        </div>
      )}

      <div className="border-t border-slate-100 pt-3 flex flex-col gap-1.5">
        {contactDetails.email && (
          <a
            href={`mailto:${contactDetails.email}`}
            className="flex items-center gap-2 text-xs text-slate-600 hover:text-emerald-600 transition-colors"
          >
            <Mail className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{contactDetails.email}</span>
          </a>
        )}
        {contactDetails.phone && (
          <a
            href={`tel:${contactDetails.phone}`}
            className="flex items-center gap-2 text-xs text-slate-600 hover:text-emerald-600 transition-colors"
          >
            <Phone className="w-3.5 h-3.5 shrink-0" />
            <span>{contactDetails.phone}</span>
          </a>
        )}
        {contactDetails.linkedin ? (
          <a
            href={contactDetails.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-xs text-slate-600 hover:text-blue-600 transition-colors"
          >
            <LinkedInIcon className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">LinkedIn profile</span>
          </a>
        ) : (
          <a
            href={linkedInSearchUrl(name, companyName)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-xs text-slate-400 hover:text-blue-600 transition-colors"
          >
            <LinkedInIcon className="w-3.5 h-3.5 shrink-0" />
            <span>Find on LinkedIn</span>
            <ExternalLink className="w-3 h-3 shrink-0 ml-auto" />
          </a>
        )}
      </div>
    </div>
  );
}
