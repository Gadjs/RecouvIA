import type { Canal, RelanceStepId, Ton } from './types';

export interface RelanceStep {
  id: RelanceStepId;
  /** Offset in days from the échéance (negative = before). */
  offsetDays: number;
  canal: Canal;
  ton: Ton;
}

/**
 * Single source of truth for the step → canal/tone mapping.
 * Mirrored in docs/decisions.md; do not duplicate elsewhere.
 */
export const RELANCE_STEPS: readonly RelanceStep[] = [
  { id: 'J-3', offsetDays: -3, canal: 'SMS', ton: 'Courtois' },
  { id: 'J-1', offsetDays: -1, canal: 'WhatsApp', ton: 'Courtois' },
  { id: 'J0', offsetDays: 0, canal: 'SMS', ton: 'Neutre' },
  { id: 'J+1', offsetDays: 1, canal: 'SMS', ton: 'Neutre' },
  { id: 'J+3', offsetDays: 3, canal: 'appel', ton: 'Neutre' },
  { id: 'J+7', offsetDays: 7, canal: 'WhatsApp', ton: 'Ferme' },
  { id: 'J+10', offsetDays: 10, canal: 'appel', ton: 'Ferme' },
  { id: 'J+15', offsetDays: 15, canal: 'SMS', ton: 'Formel' },
  { id: 'J+21', offsetDays: 21, canal: 'appel', ton: 'Formel' },
  { id: 'J+30', offsetDays: 30, canal: 'conseiller', ton: 'Formel' },
];

export function getRelanceStep(id: RelanceStepId): RelanceStep {
  const step = RELANCE_STEPS.find((s) => s.id === id);
  if (!step) throw new Error(`Unknown relance step: ${id}`);
  return step;
}
