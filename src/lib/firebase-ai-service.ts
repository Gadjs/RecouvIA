import { httpsCallable } from 'firebase/functions';
import { parseProofReading, parseSituationSuggestion } from '../domain/ai-results';
import { AiServiceError, type AiErrorKind, type AiService } from './ai-service';
import { getAppFunctions } from './firebase';

/** Slightly above the 60 s server timeout so the server error wins. */
const CALL_TIMEOUT_MS = 70_000;

function errorKind(error: unknown): AiErrorKind {
  const code =
    typeof error === 'object' && error !== null && 'code' in error
      ? String((error as { code: unknown }).code)
      : '';
  switch (code) {
    case 'functions/invalid-argument':
      return 'invalid-input';
    case 'functions/deadline-exceeded':
      return 'timeout';
    case 'functions/failed-precondition':
      return 'not-configured';
    case 'functions/internal':
      // Also what the SDK reports when the endpoint answers with a non-JSON body.
      return 'invalid-response';
    case 'functions/unavailable':
    case 'functions/not-found':
      // The server sends `unavailable` when Gemini is overloaded; the SDK uses
      // it too when the function cannot be reached at all.
      return 'unavailable';
    default:
      return 'unknown';
  }
}

async function call(name: string, data: unknown): Promise<unknown> {
  try {
    const callable = httpsCallable(getAppFunctions(), name, { timeout: CALL_TIMEOUT_MS });
    return (await callable(data)).data;
  } catch (error) {
    throw new AiServiceError(errorKind(error));
  }
}

export function createFirebaseAiService(): AiService {
  return {
    async analyzeSituation(text) {
      const result = parseSituationSuggestion(await call('analyzeSituation', { text }));
      if (!result) throw new AiServiceError('invalid-response');
      return result;
    },

    async readPaymentProof(image) {
      const result = parseProofReading(
        await call('readPaymentProof', {
          imageBase64: image.base64,
          mimeType: image.mimeType,
        }),
      );
      if (!result) throw new AiServiceError('invalid-response');
      return result;
    },
  };
}
