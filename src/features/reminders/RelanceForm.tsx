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
  type PaymentProof,
  type RelanceStepId,
  type Statut,
} from '../../domain/types';
import { todayIso } from '../../lib/dates';
import { fr } from '../../i18n/fr';
import type { ReminderTemplate } from '../templates/templates-data';
import type { EntryDraft } from './entry-draft';
import { ProofFields, type ProofFormState } from './ProofFields';

interface RelanceFormProps {
  /** Template used to pre-fill the form. Remount the form (via `key`) to apply a new one. */
  template: ReminderTemplate | null;
  /** AI-generated values to pre-fill (takes precedence over `template`). */
  draft?: EntryDraft | null;
  onSubmit: (entry: NewRelanceEntry) => Promise<void>;
}

const DEFAULT_STEP: RelanceStepId = 'J-3';
const AMOUNT_PATTERN = /^\d+$/;

function toProofFormState(proof: PaymentProof): ProofFormState {
  return {
    operator: proof.operator,
    amount: proof.amount === null ? '' : String(proof.amount),
    currency: proof.currency ?? '',
    date: proof.date ?? '',
    transactionReference: proof.transactionReference ?? '',
    payerName: proof.payerName ?? '',
  };
}

function emptyToNull(value: string): string | null {
  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
}

/** Spaces are tolerated as thousands separators ("25 000"). */
function normalizeAmount(raw: string): string {
  return raw.replace(/\s/g, '');
}

export function RelanceForm({ template, draft = null, onSubmit }: RelanceFormProps) {
  const initialStep = draft?.step ?? template?.step ?? DEFAULT_STEP;
  const [police, setPolice] = useState('');
  const [step, setStep] = useState<RelanceStepId>(initialStep);
  const [canal, setCanal] = useState<Canal>(
    draft?.canal ?? getRelanceStep(initialStep).canal,
  );
  const [statut, setStatut] = useState<Statut>(
    draft?.statut ?? template?.statut ?? 'Échéance proche',
  );
  const [sentOn, setSentOn] = useState(todayIso());
  const [note, setNote] = useState('');
  const [message, setMessage] = useState(draft?.message ?? template?.message ?? '');
  const [proof, setProof] = useState<ProofFormState | null>(
    draft?.proof ? toProofFormState(draft.proof) : null,
  );
  const [showErrors, setShowErrors] = useState(false);
  const t = fr.journal.form;

  const policeInvalid = !isValidPolice(police);
  const amountInvalid =
    proof !== null &&
    normalizeAmount(proof.amount) !== '' &&
    !AMOUNT_PATTERN.test(normalizeAmount(proof.amount));

  function handleStepChange(value: string) {
    const next = RELANCE_STEPS.find((s) => s.id === value);
    if (!next) return;
    setStep(next.id);
    setCanal(next.canal);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (policeInvalid || !sentOn || amountInvalid) {
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
      source: draft?.source ?? 'modele',
      message: message.trim(),
      proof: proof && {
        operator: proof.operator,
        amount:
          emptyToNull(proof.amount) === null
            ? null
            : Number(normalizeAmount(proof.amount)),
        currency: emptyToNull(proof.currency),
        date: emptyToNull(proof.date),
        transactionReference: emptyToNull(proof.transactionReference),
        payerName: emptyToNull(proof.payerName),
      },
      templateId: draft ? null : (template?.id ?? null),
    });
    setNote('');
    setShowErrors(false);
  }

  return (
    <form className="form" onSubmit={handleSubmit} noValidate>
      {template && !draft && <p className="notice">{t.fromTemplate(template.title)}</p>}

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
        <span>{t.message}</span>
        <textarea
          rows={4}
          value={message}
          aria-describedby="message-hint"
          onChange={(event) => setMessage(event.target.value)}
        />
      </label>
      <small id="message-hint" className="muted wide">
        {t.messageHint}
      </small>

      {proof && (
        <ProofFields
          value={proof}
          onChange={setProof}
          amountInvalid={showErrors && amountInvalid}
        />
      )}

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
