import { RELANCE_STEP_IDS, STATUTS } from '../../domain/types';
import { searchTemplates } from './template-search';
import { TEMPLATES } from './templates-data';

describe('templates data', () => {
  it('contains exactly 20 templates with unique ids', () => {
    expect(TEMPLATES).toHaveLength(20);
    expect(new Set(TEMPLATES.map((t) => t.id)).size).toBe(20);
  });

  it('uses valid steps and statuts, and French placeholders only', () => {
    for (const t of TEMPLATES) {
      expect(RELANCE_STEP_IDS).toContain(t.step);
      expect(STATUTS).toContain(t.statut);
      expect(t.wolof).toBe('[à valider]');
      expect(t.message).toMatch(/\{(nom|police)\}/);
      expect(t.message).not.toMatch(/\d{4,}/); // no invented figures or dates
    }
  });

  it('covers every step from J-3 to J+30', () => {
    const steps = new Set(TEMPLATES.map((t) => t.step));
    for (const id of RELANCE_STEP_IDS) expect(steps).toContain(id);
  });
});

describe('searchTemplates', () => {
  it('returns everything for an empty query', () => {
    expect(searchTemplates(TEMPLATES, '  ')).toHaveLength(20);
  });

  it('ignores accents and case', () => {
    const results = searchTemplates(TEMPLATES, 'ECHEANCE proche');
    expect(results.length).toBeGreaterThan(0);
    expect(
      results.every((t) => t.statut === 'Échéance proche' || /echeance/i.test(t.message)),
    ).toBe(true);
  });

  it('matches derived channel and requires all terms', () => {
    const results = searchTemplates(TEMPLATES, 'conseiller J+30');
    expect(results.length).toBeGreaterThan(0);
    expect(results.every((t) => t.step === 'J+30')).toBe(true);
    expect(searchTemplates(TEMPLATES, 'zzzzz')).toHaveLength(0);
  });
});
