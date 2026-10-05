import { useState } from 'react';
import { normalizePolice } from '../../domain/police';
import { STATUTS, type RelanceEntry, type Statut } from '../../domain/types';
import { formatDate } from '../../lib/dates';
import { formatAmount } from '../../lib/format';
import { fr } from '../../i18n/fr';

const STATUT_CLASS: Record<Statut, string> = {
  'À jour': 'statut-ok',
  'Échéance proche': 'statut-soon',
  'En retard': 'statut-late',
  'Promesse de paiement': 'statut-promise',
  'Escalade conseiller': 'statut-escalade',
};

interface RelanceListProps {
  entries: readonly RelanceEntry[];
  onDuplicate: (id: string) => Promise<void>;
  onRemove: (id: string) => Promise<void>;
}

export function RelanceList({ entries, onDuplicate, onRemove }: RelanceListProps) {
  const [filter, setFilter] = useState('');
  const [statutFilter, setStatutFilter] = useState<Statut | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const t = fr.journal.list;

  const normalizedFilter = normalizePolice(filter);
  const visible = entries.filter(
    (e) =>
      (!normalizedFilter || e.police.includes(normalizedFilter)) &&
      (statutFilter === null || e.statut === statutFilter),
  );

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

      <div className="chips" role="group" aria-label={t.statusFilterLabel}>
        <button
          type="button"
          className="chip"
          aria-pressed={statutFilter === null}
          onClick={() => setStatutFilter(null)}
        >
          {t.allStatuts} <span className="chip-count">{entries.length}</span>
        </button>
        {STATUTS.map((statut) => (
          <button
            key={statut}
            type="button"
            className={`chip ${STATUT_CLASS[statut]}`}
            aria-pressed={statutFilter === statut}
            onClick={() => setStatutFilter(statutFilter === statut ? null : statut)}
          >
            {statut}{' '}
            <span className="chip-count">
              {entries.filter((e) => e.statut === statut).length}
            </span>
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="empty-state">{entries.length === 0 ? t.empty : t.emptyFiltered}</p>
      ) : (
        <ul className="entries" aria-label={t.title}>
          {visible.map((entry) => (
            <li key={entry.id} className={`entry ${STATUT_CLASS[entry.statut]}`}>
              <div className="entry-head">
                <strong className="entry-police">{entry.police}</strong>
                <span className={`badge ${STATUT_CLASS[entry.statut]}`}>
                  {entry.statut}
                </span>
              </div>
              <dl className="meta">
                <div>
                  <dt>{t.columns.sentOn}</dt>
                  <dd>{formatDate(entry.sentOn)}</dd>
                </div>
                <div>
                  <dt>{t.columns.step}</dt>
                  <dd>{entry.step}</dd>
                </div>
                <div>
                  <dt>{t.columns.canal}</dt>
                  <dd>{entry.canal}</dd>
                </div>
                <div>
                  <dt>{t.columns.source}</dt>
                  <dd>{t.sources[entry.source]}</dd>
                </div>
              </dl>
              {entry.note && <p className="entry-note">{entry.note}</p>}
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
              <div className="actions">
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
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
