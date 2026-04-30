import { Users, GitBranch } from 'lucide-react';
import PersonCard from '@/components/PersonCard';
import type { Person } from '@/types/research';

interface Props {
  people: Person[];
  companyName: string;
  decisionStructure?: string;
}

export default function KeyPeople({ people, companyName, decisionStructure }: Props) {
  if (people.length === 0) return null;

  const board = people.filter((p) => p.category === 'board');
  const leadership = people.filter((p) => p.category === 'senior_leadership');
  const energy = people.filter((p) => p.category === 'energy_sustainability');
  const procurement = people.filter((p) => p.category === 'procurement');

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6">
      <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
        <Users className="w-5 h-5 text-emerald-600" />
        Key People
      </h3>

      {decisionStructure && (
        <div className="bg-sky-50 border border-sky-200 rounded-lg p-4 flex gap-3">
          <GitBranch className="w-4 h-4 text-sky-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-semibold text-sky-800 mb-1">Energy Decision Structure</p>
            <p className="text-xs text-sky-700 leading-relaxed">{decisionStructure}</p>
          </div>
        </div>
      )}

      {procurement.length > 0 && (
        <Section title="Procurement & Energy Buying" people={procurement} companyName={companyName} />
      )}
      {energy.length > 0 && (
        <Section title="Energy & Sustainability" people={energy} companyName={companyName} />
      )}
      {leadership.length > 0 && (
        <Section title="Senior Leadership" people={leadership} companyName={companyName} />
      )}
      {board.length > 0 && (
        <Section title="Board / Directors" people={board} companyName={companyName} />
      )}
    </div>
  );
}

function Section({ title, people, companyName }: { title: string; people: Person[]; companyName: string }) {
  return (
    <div>
      <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">{title}</h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {people.map((person, i) => (
          <PersonCard key={i} person={person} companyName={companyName} />
        ))}
      </div>
    </div>
  );
}
