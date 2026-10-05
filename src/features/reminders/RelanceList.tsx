import { useState } from 'react';
import { normalizePolice } from '../../domain/police';
import type { RelanceEntry } from '../../domain/types';
import { formatDate } from '../../lib/dates';
import { formatAmount } from '../../lib/format';
import { fr } from '../../i18n/fr';

interface RelanceListProps {
  entries: readonly RelanceEntry[];
  onDuplicate: (id: string) => Promise<void>;
  onRemove: (id: string) => Promise<void>;
}

export function RelanceList({ entries, onDuplicate, onRemove }: RelanceListProps) {
  const [filter, setFilter] = useState('');
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const t = fr.journal.list;

  const normalizedFilter = normalizePolice(filter);
  const visible = normalizedFilter
    ? entries.filter((e) => e.police.includes(normalizedFilter))
    : entries;

  return (
    <section aria-labelledby="list-title">
      <h3 id="list-title">{t.title}</h3>
      <label className="field">
        <span>{t.filterLabel}</span>
        <input
          type="search"
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
        />
      </label>

      {visible.length === 0 ? (
        <p className="muted">{t.empty}</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th scope="col">{t.columns.sentOn}</th>
                <th scope="col">{t.columns.police}</th>
                <th scope="col">{t.columns.step}</th>
                <th scope="col">{t.columns.canal}</th>
                <th scope="col">{t.columns.statut}</th>
                <th scope="col">{t.columns.source}</th>
                <th scope="col">{t.columns.note}</th>
                <th scope="col">{t.columns.actions}</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((entry) => (
                <tr key={entry.id}>
                  <td>{formatDate(entry.sentOn)}</td>
                  <td>{entry.police}</td>
                  <td>{entry.step}</td>
                  <td>{entry.canal}</td>
                  <td>{entry.statut}</td>
                  <td>{t.sources[entry.source]}</td>
                  <td>
                    {entry.note}
                    {entry.proof && (
                      <p className="muted">
                        {t.proofSummary(
                          entry.proof.operator,
                          entry.proof.amount === null
                            ? ''
                            : formatAmount(entry.proof.amount, entry.proof.currency),
                          entry.proof.transactionReference ?? '',
                        )}
                      </p>
                    )}
                    {entry.message && (
                      <details>
                        <summary>{t.showMessage}</summary>
                        {entry.message}
                      </details>
                    )}
                  </td>
                  <td className="actions">
                    <button
                      type="button"
                      className="secondary"
                      aria-label={t.duplicateAria(entry.police, entry.step)}
                      onClick={() => void onDuplicate(entry.id)}
                    >
                      {t.duplicate}
                    </button>
                    {pendingDeleteId === entry.id ? (
                      <>
                        <button
                          type="button"
                          className="danger"
                          onClick={() => {
                            setPendingDeleteId(null);
                            void onRemove(entry.id);
                          }}
                        >
                          {t.confirm}
                        </button>
                        <button
                          type="button"
                          className="secondary"
                          onClick={() => setPendingDeleteId(null)}
                        >
                          {t.cancel}
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        className="secondary"
                        aria-label={t.removeAria(entry.police, entry.step)}
                        onClick={() => setPendingDeleteId(entry.id)}
                      >
                        {t.remove}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
