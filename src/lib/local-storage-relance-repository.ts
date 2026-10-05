import {
  CANAUX,
  ENTRY_SOURCES,
  OPERATORS,
  RELANCE_STEP_IDS,
  STATUTS,
  isOneOf,
  type NewRelanceEntry,
  type PaymentProof,
  type RelanceEntry,
} from '../domain/types';
import type { RelanceRepository } from './relance-repository';

export const STORAGE_KEY = 'recouvia.relances.v1';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function nullableString(value: unknown): string | null | undefined {
  if (value === null) return null;
  return typeof value === 'string' ? value : undefined;
}

function parseProof(value: unknown): PaymentProof | null {
  if (!isRecord(value)) return null;
  const { operator, amount, currency, date, transactionReference, payerName } = value;
  const parsed = {
    currency: nullableString(currency),
    date: nullableString(date),
    transactionReference: nullableString(transactionReference),
    payerName: nullableString(payerName),
  };
  if (
    !isOneOf(OPERATORS, operator) ||
    !(amount === null || (typeof amount === 'number' && Number.isInteger(amount))) ||
    parsed.currency === undefined ||
    parsed.date === undefined ||
    parsed.transactionReference === undefined ||
    parsed.payerName === undefined
  ) {
    return null;
  }
  return {
    operator,
    amount,
    currency: parsed.currency,
    date: parsed.date,
    transactionReference: parsed.transactionReference,
    payerName: parsed.payerName,
  };
}

function parseEntry(value: unknown): RelanceEntry | null {
  if (!isRecord(value)) return null;
  const { id, police, step, canal, statut, sentOn, note, templateId, createdAt } = value;
  // `source`, `message` and `proof` were added after the first release: default them.
  const source = value.source ?? 'modele';
  const message = value.message ?? '';
  if (
    typeof id !== 'string' ||
    typeof police !== 'string' ||
    !isOneOf(RELANCE_STEP_IDS, step) ||
    !isOneOf(CANAUX, canal) ||
    !isOneOf(STATUTS, statut) ||
    typeof sentOn !== 'string' ||
    typeof note !== 'string' ||
    (templateId !== null && typeof templateId !== 'string') ||
    typeof createdAt !== 'string' ||
    !isOneOf(ENTRY_SOURCES, source) ||
    typeof message !== 'string'
  ) {
    return null;
  }
  return {
    id,
    police,
    step,
    canal,
    statut,
    sentOn,
    note,
    source,
    message,
    proof: parseProof(value.proof),
    templateId,
    createdAt,
  };
}

function readAll(storage: Storage): RelanceEntry[] {
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.flatMap((item) => parseEntry(item) ?? []);
  } catch {
    // Corrupted or unavailable storage: start from an empty log.
    return [];
  }
}

function writeAll(storage: Storage, entries: readonly RelanceEntry[]): void {
  storage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function createLocalStorageRelanceRepository(
  storage: Storage = window.localStorage,
): RelanceRepository {
  return {
    async list() {
      return readAll(storage);
    },

    async add(entry: NewRelanceEntry) {
      const created: RelanceEntry = {
        ...entry,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
      };
      writeAll(storage, [created, ...readAll(storage)]);
      return created;
    },

    async duplicate(id: string) {
      const entries = readAll(storage);
      const source = entries.find((e) => e.id === id);
      if (!source) return null;
      const copy: RelanceEntry = {
        ...source,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
      };
      writeAll(storage, [copy, ...entries]);
      return copy;
    },

    async remove(id: string) {
      writeAll(
        storage,
        readAll(storage).filter((e) => e.id !== id),
      );
    },
  };
}
