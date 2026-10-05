import {
  CANAUX,
  OPERATORS,
  RELANCE_STEP_IDS,
  STATUTS,
  TONS,
  isOneOf,
  type Canal,
  type Operator,
  type RelanceStepId,
  type Statut,
  type Ton,
} from './types';

/** Suggestion returned by the `analyzeSituation` function, narrowed to domain types. */
export interface SituationSuggestion {
  suggestedStatus: Statut;
  suggestedChannel: Canal;
  timing: RelanceStepId;
  tone: Ton;
  draftMessage: string;
  reasoning: string;
  /** 0–1. */
  confidence: number;
}

/** Fields read by the `readPaymentProof` function; `null` = not visible. */
export interface ProofReading {
  operator: Operator;
  amount: number | null;
  currency: string | null;
  /** ISO 8601 date or datetime as returned by the model. */
  date: string | null;
  transactionReference: string | null;
  payerName: string | null;
  confidence: number;
  warning: string | null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isConfidence(value: unknown): value is number {
  return typeof value === 'number' && value >= 0 && value <= 1;
}

function nullableString(value: unknown): string | null | undefined {
  if (value === null) return null;
  return typeof value === 'string' ? value : undefined;
}

/** Validates an untrusted function result; returns `null` if it is malformed. */
export function parseSituationSuggestion(value: unknown): SituationSuggestion | null {
  if (!isRecord(value)) return null;
  const { suggestedStatus, suggestedChannel, timing, tone } = value;
  const { draftMessage, reasoning, confidence } = value;
  if (
    !isOneOf(STATUTS, suggestedStatus) ||
    !isOneOf(CANAUX, suggestedChannel) ||
    !isOneOf(RELANCE_STEP_IDS, timing) ||
    !isOneOf(TONS, tone) ||
    typeof draftMessage !== 'string' ||
    typeof reasoning !== 'string' ||
    !isConfidence(confidence)
  ) {
    return null;
  }
  return {
    suggestedStatus,
    suggestedChannel,
    timing,
    tone,
    draftMessage,
    reasoning,
    confidence,
  };
}

/** Validates an untrusted function result; returns `null` if it is malformed. */
export function parseProofReading(value: unknown): ProofReading | null {
  if (!isRecord(value)) return null;
  const { operator, amount, confidence } = value;
  const currency = nullableString(value.currency);
  const date = nullableString(value.date);
  const transactionReference = nullableString(value.transactionReference);
  const payerName = nullableString(value.payerName);
  const warning = nullableString(value.warning);
  if (
    !isOneOf(OPERATORS, operator) ||
    !(amount === null || (typeof amount === 'number' && Number.isInteger(amount))) ||
    currency === undefined ||
    date === undefined ||
    transactionReference === undefined ||
    payerName === undefined ||
    warning === undefined ||
    !isConfidence(confidence)
  ) {
    return null;
  }
  return {
    operator,
    amount,
    currency,
    date,
    transactionReference,
    payerName,
    confidence,
    warning,
  };
}
