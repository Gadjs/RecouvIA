import type { NewRelanceEntry, RelanceEntry } from '../domain/types';

/**
 * Storage contract for the relance log. Async on purpose: the localStorage
 * implementation can be swapped for a remote database without touching callers.
 */
export interface RelanceRepository {
  list(): Promise<RelanceEntry[]>;
  add(entry: NewRelanceEntry): Promise<RelanceEntry>;
  duplicate(id: string): Promise<RelanceEntry | null>;
  remove(id: string): Promise<void>;
}
