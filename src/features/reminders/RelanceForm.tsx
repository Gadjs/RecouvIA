import { useState, type FormEvent } from 'react';
import { SAMPLE_POLICES } from '../../data/sample-polices';
import { isValidPolice, normalizePolice } from '../../domain/police';
import { RELANCE_STEPS, getRelanceStep } from '../../domain/relance-steps';
import {
  CANAUX,
  STATUTS,
  isOneOf,
  type Canal,
  type NewRelanceEntry,
  type RelanceStepId,
  type Statut,
} from '../../domain/types';
import { todayIso } from '../../lib/dates';
import { fr } from '../../i18n/fr';
import type { ReminderTemplate } from '../templates/templates-data';

interface RelanceFormProps {
  /** Template used to pre-fill the form. Remount the form (via `key`) to apply a new one. */
  template: ReminderTemplate | null;
  onSubmit: (entry: NewRelanceEntry) => Promise<void>;
}

const DEFAULT_STEP: RelanceStepId = 'J-3';

export function RelanceForm({ template, onSubmit }: RelanceFormProps) {
  const initialStep = template?.step ?? DEFAULT_STEP;
  const [police, setPolice] = useState('');
  const [step, setStep] = useState<RelanceStepId>(initialStep);
  const [canal, setCanal] = useState<Canal>(getRelanceStep(initialStep).canal);
  const [statut, setStatut] = useState<Statut>(template?.statut ?? 'Échéance proche');
  const [sentOn, setSentOn] = useState(todayIso());
  const [note, setNote] = useState('');
  const [showErrors, setShowErrors] = useState(false);
  const t = fr.journal.form;

  const policeInvalid = !isValidPolice(police);

  function handleStepChange(value: string) {
    const next = RELANCE_STEPS.find((s) => s.id === value);
    if (!next) return;
    setStep(next.id);
    setCanal(next.canal);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (policeInvalid || !sentOn) {
      setShowErrors(true);
      return;
    }
    await onSubmit({
      police: normalizePolice(police),
      step,
      canal,
      statut,
      sentOn,
      note: note.trim(),
      templateId: template?.id ?? null,
    });
    setNote('');
    setShowErrors(false);
  }

  return (
    <form className="form" onSubmit={handleSubmit} noValidate>
      {template && <p className="notice">{t.fromTemplate(template.title)}</p>}

      <label className="field">
        <span>{t.police}</span>
        <input
          type="text"
          list="sample-polices"
          value={police}
          placeholder={t.policeHint}
          aria-invalid={showErrors && policeInvalid}
          aria-describedby={showErrors && policeInvalid ? 'police-error' : undefined}
          onChange={(event) => setPolice(event.target.value)}
        />
        <datalist id="sample-polices">
          {SAMPLE_POLICES.map((p) => (
            <option key={p} value={p} />
          ))}
        </datalist>
        {showErrors && policeInvalid && (
          <span id="police-error" className="error" role="alert">
            {t.policeInvalid}
          </span>
        )}
      </label>

      <label className="field">
        <span>{t.step}</span>
        <select value={step} onChange={(event) => handleStepChange(event.target.value)}>
          {RELANCE_STEPS.map((s) => (
            <option key={s.id} value={s.id}>
              {s.id}
            </option>
          ))}
        </select>
      </label>

      <label className="field">
        <span>{t.canal}</span>
        <select
          value={canal}
          onChange={(event) =>
            isOneOf(CANAUX, event.target.value) && setCanal(event.target.value)
          }
        >
          {CANAUX.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </label>

      <label className="field">
        <span>{t.statut}</span>
        <select
          value={statut}
          onChange={(event) =>
            isOneOf(STATUTS, event.target.value) && setStatut(event.target.value)
          }
        >
          {STATUTS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </label>

      <label className="field">
        <span>{t.sentOn}</span>
        <input
          type="date"
          value={sentOn}
          required
          onChange={(event) => setSentOn(event.target.value)}
        />
      </label>

      <label className="field wide">
        <span>{t.note}</span>
        <textarea
          rows={2}
          value={note}
          onChange={(event) => setNote(event.target.value)}
        />
      </label>

      <button type="submit">{t.submit}</button>
    </form>
  );
}
