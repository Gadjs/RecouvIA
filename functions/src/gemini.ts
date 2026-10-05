import { GoogleGenAI, type Part } from '@google/genai';
import { HttpsError } from 'firebase-functions/v2/https';
import { logger } from 'firebase-functions/v2';
import { defineSecret } from 'firebase-functions/params';
import { z } from 'zod';

/** Emulator: read from functions/.secret.local. Never read from client code. */
export const GEMINI_API_KEY = defineSecret('GEMINI_API_KEY');

/** Current Flash model, then a fallback used on the retry (newest models can return 503 under load). */
export const GEMINI_MODELS = ['gemini-3.8-flash', 'gemini-3.5-flash'] as const;

interface GenerateJsonOptions<T extends z.ZodType> {
  systemInstruction: string;
  parts: Part[];
  schema: T;
  temperature: number;
}

/**
 * Calls Gemini in JSON mode and validates the answer with zod.
 * Retries once, on the fallback model, if the call fails or the output is invalid.
 */
export async function generateJson<T extends z.ZodType>({
  systemInstruction,
  parts,
  schema,
  temperature,
}: GenerateJsonOptions<T>): Promise<z.infer<T>> {
  const apiKey = GEMINI_API_KEY.value();
  if (!apiKey) {
    logger.error('GEMINI_API_KEY is empty');
    throw new HttpsError('failed-precondition', 'AI service is not configured.');
  }
  const ai = new GoogleGenAI({ apiKey });
  const responseJsonSchema: Record<string, unknown> = z.toJSONSchema(schema);
  delete responseJsonSchema.$schema; // not accepted by the Gemini API

  for (let attempt = 1; attempt <= 2; attempt++) {
    let text: string | undefined;
    try {
      const response = await ai.models.generateContent({
        model: GEMINI_MODELS[attempt - 1] ?? GEMINI_MODELS[0],
        contents: [{ role: 'user', parts }],
        config: {
          systemInstruction,
          temperature,
          responseMimeType: 'application/json',
          responseJsonSchema,
        },
      });
      text = response.text;
    } catch (error) {
      // Log the error only: never the prompt or image (personal data).
      logger.error('Gemini call failed', { attempt, error: errorMessage(error) });
      if (attempt === 2) throw new HttpsError('unavailable', 'AI service unavailable.');
      continue;
    }

    try {
      return schema.parse(JSON.parse(text ?? ''));
    } catch (error) {
      logger.warn('Gemini output rejected', { attempt, error: errorMessage(error) });
    }
  }
  throw new HttpsError('internal', 'The AI response could not be validated.');
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
