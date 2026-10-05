import { countByPolice } from '../../domain/police';
import type { RelanceEntry } from '../../domain/types';
import { fr } from '../../i18n/fr';

interface PoliceCountersProps {
  entries: readonly RelanceEntry[];
}

export function PoliceCounters({ entries }: PoliceCountersProps) {
  const t = fr.journal.counters;
  const counts = [...countByPolice(entries)].sort(([a], [b]) => a.localeCompare(b));

  return (
    <section aria-labelledby="counters-title">
      <h3 id="counters-title">{t.title}</h3>
      {counts.length === 0 ? (
        <p className="muted">{t.empty}</p>
      ) : (
        <ul className="counters">
          {counts.map(([police, count]) => (
            <li key={police}>
              <strong>{police}</strong> <span className="badge">{t.count(count)}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
