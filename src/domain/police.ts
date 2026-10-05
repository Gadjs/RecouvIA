import type { RelanceEntry } from './types';

const POLICE_PATTERN = /^[A-Z0-9][A-Z0-9-]{3,19}$/;

export function normalizePolice(raw: string): string {
  return raw.trim().toUpperCase();
}

export function isValidPolice(raw: string): boolean {
  return POLICE_PATTERN.test(normalizePolice(raw));
}

/** Number of logged relances per police number. */
export function countByPolice(entries: readonly RelanceEntry[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const entry of entries) {
    counts.set(entry.police, (counts.get(entry.police) ?? 0) + 1);
  }
  return counts;
}
