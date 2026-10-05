import { z } from 'zod';

export const STATUTS = [
  'À jour',
  'Échéance proche',
  'En retard',
  'Promesse de paiement',
  'Escalade conseiller',
] as const;

export const CANAUX = ['SMS', 'appel', 'WhatsApp', 'conseiller'] as const;

/** Relance steps, from J-3 (before échéance) to J+30 (after). */
export const TIMINGS = [
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

export const TONS = ['Courtois', 'Neutre', 'Ferme', 'Formel'] as const;

export const OPERATORS = ['Wave', 'Orange Money', 'inconnu'] as const;

export const MAX_SITUATION_CHARS = 2000;
export const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
/** Base64 inflates by 4/3; reject oversized strings before decoding them. */
const MAX_IMAGE_BASE64_CHARS = Math.ceil((MAX_IMAGE_BYTES * 4) / 3) + 4;

export const IMAGE_MIME_TYPES = ['image/png', 'image/jpeg', 'image/webp'] as const;

// ---------- analyzeSituation ----------

export const AnalyzeSituationInputSchema = z.object({
  text: z.string().trim().min(1).max(MAX_SITUATION_CHARS),
});

export const AnalyzeSituationOutputSchema = z.object({
  suggestedStatus: z.enum(STATUTS),
  suggestedChannel: z.enum(CANAUX),
  timing: z.enum(TIMINGS),
  tone: z.enum(TONS),
  draftMessage: z.string().trim().min(1).max(1000),
  reasoning: z.string().trim().min(1).max(600),
  confidence: z.number().min(0).max(1),
});
export type AnalyzeSituationOutput = z.infer<typeof AnalyzeSituationOutputSchema>;

// ---------- readPaymentProof ----------

export const ReadPaymentProofInputSchema = z.object({
  imageBase64: z
    .string()
    .min(1)
    .max(MAX_IMAGE_BASE64_CHARS)
    .regex(/^[A-Za-z0-9+/]+={0,2}$/, 'imageBase64 must be raw base64 (no data: prefix)')
    .refine((b64) => decodedSize(b64) <= MAX_IMAGE_BYTES, 'Image exceeds 4 MB'),
  mimeType: z.enum(IMAGE_MIME_TYPES),
});

export const ReadPaymentProofOutputSchema = z.object({
  operator: z.enum(OPERATORS),
  /** Integer XOF amount, null when not visible. */
  amount: z.number().int().nonnegative().nullable(),
  currency: z.string().trim().min(1).nullable(),
  /** ISO 8601 (YYYY-MM-DD or full datetime), null when not visible. */
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}([T ]\d{2}:\d{2}(:\d{2})?)?$/)
    .nullable(),
  transactionReference: z.string().trim().min(1).nullable(),
  payerName: z.string().trim().min(1).nullable(),
  confidence: z.number().min(0).max(1),
  /** French message when something is unreadable or doubtful, otherwise null. */
  warning: z.string().trim().min(1).nullable(),
});
export type ReadPaymentProofOutput = z.infer<typeof ReadPaymentProofOutputSchema>;

function decodedSize(b64: string): number {
  const padding = b64.endsWith('==') ? 2 : b64.endsWith('=') ? 1 : 0;
  return Math.floor((b64.length * 3) / 4) - padding;
}
