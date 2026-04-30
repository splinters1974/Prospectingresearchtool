import { Users } from 'lucide-react';
import PersonCard from '@/components/PersonCard';
import type { Person } from '@/types/research';

interface Props {
  people: Person[];
}

export default function KeyPeople({ people }: Props) {
  if (people.length === 0) return null;

  const board = people.filter((p) => p.category === 'board');
  const leadership = people.filter((p) => p.category === 'senior_leadership');
  const energy = people.filter((p) => p.category === 'energy_sustainability');

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6">
      <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
        <Users className="w-5 h-5 text-emerald-600" />
        Key People
      </h3>

      {board.length > 0 && (
        <Section title="Board / Directors" people={board} />
      )}
      {leadership.length > 0 && (
        <Section title="Senior Leadership" people={leadership} />
      )}
      {energy.length > 0 && (
        <Section title="Energy & Sustainability" people={energy} />
      )}
    </div>
  );
}

function Section({ title, people }: { title: string; people: Person[] }) {
  return (
    <div>
      <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">{title}</h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {people.map((person, i) => (
          <PersonCard key={i} person={person} />
        ))}
      </div>
    </div>
  );
}
