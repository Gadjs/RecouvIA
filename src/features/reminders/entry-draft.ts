import type { ProofReading, SituationSuggestion } from '../../domain/ai-results';
import { getRelanceStep } from '../../domain/relance-steps';
import type {
  Canal,
  EntrySource,
  PaymentProof,
  RelanceStepId,
  Statut,
} from '../../domain/types';

/** Pre-filled values for the entry form; every field stays editable before saving. */
export interface EntryDraft {
  source: EntrySource;
  step: RelanceStepId;
  canal: Canal;
  statut: Statut;
  message: string;
  proof: PaymentProof | null;
}

/** Neutral starting point for a proof: the officer chooses the step, canal and statut. */
const PROOF_DEFAULT_STEP: RelanceStepId = 'J0';
const PROOF_DEFAULT_STATUT: Statut = 'À jour';

export function draftFromSuggestion(suggestion: SituationSuggestion): EntryDraft {
  return {
    source: 'description',
    step: suggestion.timing,
    // Keep the model's channel rather than the step's default one: it is the suggestion.
    canal: suggestion.suggestedChannel,
    statut: suggestion.suggestedStatus,
    message: suggestion.draftMessage,
    proof: null,
  };
}

export function draftFromProof(reading: ProofReading): EntryDraft {
  return {
    source: 'preuve',
    step: PROOF_DEFAULT_STEP,
    canal: getRelanceStep(PROOF_DEFAULT_STEP).canal,
    statut: PROOF_DEFAULT_STATUT,
    message: '',
    proof: {
      operator: reading.operator,
      amount: reading.amount,
      currency: reading.currency,
      // The form edits a calendar date; the time of day is dropped.
      date: reading.date ? reading.date.slice(0, 10) : null,
      transactionReference: reading.transactionReference,
      payerName: reading.payerName,
    },
  };
}
