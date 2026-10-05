export const STATUTS = [
  'À jour',
  'Échéance proche',
  'En retard',
  'Promesse de paiement',
  'Escalade conseiller',
] as const;
export type Statut = (typeof STATUTS)[number];

export const CANAUX = ['SMS', 'appel', 'WhatsApp', 'conseiller'] as const;
export type Canal = (typeof CANAUX)[number];

export const TONS = ['Courtois', 'Neutre', 'Ferme', 'Formel'] as const;
export type Ton = (typeof TONS)[number];

/** A relance step, positioned relative to the échéance (J = due date). */
export const RELANCE_STEP_IDS = [
  'J-3',
  'J-1',
  'J0',
  'J+1',
  'J+3',
  'J+7',
  'J+10',
  'J+15',
  'J+21',
  'J+30',
] as const;
export type RelanceStepId = (typeof RELANCE_STEP_IDS)[number];

export function isOneOf<T extends string>(
  values: readonly T[],
  candidate: unknown,
): candidate is T {
  return (
    typeof candidate === 'string' && (values as readonly string[]).includes(candidate)
  );
}

/** A logged reminder (ISO 8601 dates). */
export interface RelanceEntry {
  id: string;
  /** Fictional policy number, normalised to upper case. */
  police: string;
  step: RelanceStepId;
  canal: Canal;
  statut: Statut;
  /** Date the reminder was sent, `YYYY-MM-DD`. */
  sentOn: string;
  note: string;
  /** Library template this entry came from, if any. */
  templateId: string | null;
  /** Creation timestamp, ISO 8601. */
  createdAt: string;
}

export type NewRelanceEntry = Omit<RelanceEntry, 'id' | 'createdAt'>;
