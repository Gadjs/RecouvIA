import { useCallback, useEffect, useState } from 'react';
import type { NewRelanceEntry, RelanceEntry } from '../../domain/types';
import type { RelanceRepository } from '../../lib/relance-repository';

export interface UseRelances {
  entries: RelanceEntry[];
  loaded: boolean;
  add: (entry: NewRelanceEntry) => Promise<void>;
  duplicate: (id: string) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

/** Keeps the in-memory list in sync with the repository after each mutation. */
export function useRelances(repository: RelanceRepository): UseRelances {
  const [entries, setEntries] = useState<RelanceEntry[]>([]);
  const [loaded, setLoaded] = useState(false);

  const refresh = useCallback(async () => {
    setEntries(await repository.list());
    setLoaded(true);
  }, [repository]);

  useEffect(() => {
    let cancelled = false;
    void repository.list().then((initial) => {
      if (cancelled) return;
      setEntries(initial);
      setLoaded(true);
    });
    return () => {
      cancelled = true;
    };
  }, [repository]);

  const add = useCallback(
    async (entry: NewRelanceEntry) => {
      await repository.add(entry);
      await refresh();
    },
    [repository, refresh],
  );

  const duplicate = useCallback(
    async (id: string) => {
      await repository.duplicate(id);
      await refresh();
    },
    [repository, refresh],
  );

  const remove = useCallback(
    async (id: string) => {
      await repository.remove(id);
      await refresh();
    },
    [repository, refresh],
  );

  return { entries, loaded, add, duplicate, remove };
}
