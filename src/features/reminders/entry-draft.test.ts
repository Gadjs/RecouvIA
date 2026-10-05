import { draftFromProof, draftFromSuggestion } from './entry-draft';

describe('entry drafts', () => {
  it('maps a situation suggestion to form values', () => {
    const draft = draftFromSuggestion({
      suggestedStatus: 'Promesse de paiement',
      suggestedChannel: 'SMS',
      timing: 'J+30',
      tone: 'Courtois',
      draftMessage: 'Bonjour {nom}',
      reasoning: '…',
      confidence: 0.9,
    });
    expect(draft).toMatchObject({
      source: 'description',
      step: 'J+30',
      canal: 'SMS',
      statut: 'Promesse de paiement',
      message: 'Bonjour {nom}',
      proof: null,
    });
  });

  it('maps a proof reading, keeping nulls and dropping the time of day', () => {
    const draft = draftFromProof({
      operator: 'Wave',
      amount: 25000,
      currency: null,
      date: '2026-09-28T14:32',
      transactionReference: 'TEST-1',
      payerName: null,
      confidence: 1,
      warning: null,
    });
    expect(draft.source).toBe('preuve');
    expect(draft.proof).toEqual({
      operator: 'Wave',
      amount: 25000,
      currency: null,
      date: '2026-09-28',
      transactionReference: 'TEST-1',
      payerName: null,
    });
  });
});
