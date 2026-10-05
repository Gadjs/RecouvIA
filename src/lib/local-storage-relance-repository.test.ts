import type { NewRelanceEntry } from '../domain/types';
import {
  STORAGE_KEY,
  createLocalStorageRelanceRepository,
} from './local-storage-relance-repository';

const NEW_ENTRY: NewRelanceEntry = {
  police: 'DEMO-0001',
  step: 'J+7',
  canal: 'WhatsApp',
  statut: 'En retard',
  sentOn: '2026-01-10',
  note: 'Test',
  templateId: 'tpl-11',
};

describe('localStorage relance repository', () => {
  it('persists entries across repository instances (simulated refresh)', async () => {
    await createLocalStorageRelanceRepository().add(NEW_ENTRY);
    const reloaded = await createLocalStorageRelanceRepository().list();
    expect(reloaded).toHaveLength(1);
    expect(reloaded[0]).toMatchObject(NEW_ENTRY);
  });

  it('puts the newest entry first', async () => {
    const repo = createLocalStorageRelanceRepository();
    const first = await repo.add(NEW_ENTRY);
    const second = await repo.add({ ...NEW_ENTRY, police: 'DEMO-0002' });
    expect((await repo.list()).map((e) => e.id)).toEqual([second.id, first.id]);
  });

  it('duplicates with a new id and removes by id', async () => {
    const repo = createLocalStorageRelanceRepository();
    const original = await repo.add(NEW_ENTRY);
    const copy = await repo.duplicate(original.id);
    expect(copy).not.toBeNull();
    expect(copy?.id).not.toBe(original.id);
    expect(copy).toMatchObject(NEW_ENTRY);
    expect(await repo.list()).toHaveLength(2);

    await repo.remove(original.id);
    expect((await repo.list()).map((e) => e.id)).toEqual([copy?.id]);
    expect(await repo.duplicate('missing')).toBeNull();
  });

  it('ignores corrupted storage and invalid items', async () => {
    localStorage.setItem(STORAGE_KEY, '{not json');
    expect(await createLocalStorageRelanceRepository().list()).toEqual([]);

    localStorage.setItem(STORAGE_KEY, JSON.stringify([{ id: 1 }, null, 'x']));
    expect(await createLocalStorageRelanceRepository().list()).toEqual([]);
  });
});
