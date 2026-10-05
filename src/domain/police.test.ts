import { countByPolice, isValidPolice, normalizePolice } from './police';
import type { RelanceEntry } from './types';

function entry(police: string, id: string): RelanceEntry {
  return {
    id,
    police,
    step: 'J+1',
    canal: 'SMS',
    statut: 'En retard',
    sentOn: '2026-01-01',
    note: '',
    templateId: null,
    createdAt: '2026-01-01T00:00:00.000Z',
  };
}

describe('police', () => {
  it('normalises to trimmed upper case', () => {
    expect(normalizePolice('  demo-0001 ')).toBe('DEMO-0001');
  });

  it('validates the format', () => {
    expect(isValidPolice('demo-0001')).toBe(true);
    expect(isValidPolice('ab')).toBe(false);
    expect(isValidPolice('DEMO 0001')).toBe(false);
    expect(isValidPolice('')).toBe(false);
  });

  it('counts entries per police', () => {
    const counts = countByPolice([
      entry('A-001', '1'),
      entry('A-001', '2'),
      entry('B-002', '3'),
    ]);
    expect(counts.get('A-001')).toBe(2);
    expect(counts.get('B-002')).toBe(1);
    expect(counts.get('C-003')).toBeUndefined();
  });
});
