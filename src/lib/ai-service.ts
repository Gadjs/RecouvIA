import type { ProofReading, SituationSuggestion } from '../domain/ai-results';

export type AiErrorKind =
  | 'unavailable' // function unreachable (emulator stopped, offline) or AI model overloaded
  | 'timeout'
  | 'not-configured' // server has no Gemini key
  | 'invalid-input'
  | 'invalid-response'
  | 'unknown';

export class AiServiceError extends Error {
  constructor(readonly kind: AiErrorKind) {
    super(kind);
    this.name = 'AiServiceError';
  }
}

/**
 * Client-side contract for the AI backend. The implementation talks to the
 * callable Cloud Functions; no API key ever exists in the browser.
 */
export interface AiService {
  analyzeSituation(text: string): Promise<SituationSuggestion>;
  readPaymentProof(image: {
    base64: string;
    mimeType: 'image/jpeg';
  }): Promise<ProofReading>;
}
