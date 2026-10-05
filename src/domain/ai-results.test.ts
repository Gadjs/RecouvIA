import { parseProofReading, parseSituationSuggestion } from './ai-results';

const SITUATION = {
  suggestedStatus: 'Promesse de paiement',
  suggestedChannel: 'SMS',
  timing: 'J+30',
  tone: 'Courtois',
  draftMessage: 'Bonjour {nom}',
  reasoning: 'Parce que.',
  confidence: 0.9,
};

const PROOF = {
  operator: 'Wave',
  amount: 25000,
  currency: 'F CFA',
  date: '2026-09-28T14:32',
  transactionReference: 'TEST-1',
  payerName: null,
  confidence: 1,
  warning: null,
};

describe('parseSituationSuggestion', () => {
  it('accepts a valid result', () => {
    expect(parseSituationSuggestion(SITUATION)).toEqual(SITUATION);
  });

  it.each([
    ['unknown status', { ...SITUATION, suggestedStatus: 'Payé' }],
    ['unknown channel', { ...SITUATION, suggestedChannel: 'email' }],
    ['unknown timing', { ...SITUATION, timing: 'J+2' }],
    ['confidence out of range', { ...SITUATION, confidence: 3 }],
    ['missing message', { ...SITUATION, draftMessage: undefined }],
    ['not an object', 'oops'],
  ])('rejects %s', (_label, value) => {
    expect(parseSituationSuggestion(value)).toBeNull();
  });
});

describe('parseProofReading', () => {
  it('accepts a valid result, nulls included', () => {
    expect(parseProofReading(PROOF)).toEqual(PROOF);
  });

  it.each([
    ['decimal amount', { ...PROOF, amount: 10.5 }],
    ['unknown operator', { ...PROOF, operator: 'MTN' }],
    ['undefined field instead of null', { ...PROOF, payerName: undefined }],
    ['null', null],
  ])('rejects %s', (_label, value) => {
    expect(parseProofReading(value)).toBeNull();
  });
});
