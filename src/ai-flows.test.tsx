import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from './App';
import { AiServiceError, type AiService } from './lib/ai-service';

vi.mock('./lib/resize-image', async (importOriginal) => ({
  ...(await importOriginal<typeof import('./lib/resize-image')>()),
  prepareImage: vi.fn(async () => ({
    base64: 'AAAA',
    mimeType: 'image/jpeg' as const,
    previewUrl: 'data:image/jpeg;base64,AAAA',
  })),
}));

function fakeAi(overrides: Partial<AiService> = {}): AiService {
  return {
    analyzeSituation: vi.fn(async () => ({
      suggestedStatus: 'Promesse de paiement' as const,
      suggestedChannel: 'SMS' as const,
      timing: 'J+30' as const,
      tone: 'Courtois' as const,
      draftMessage: 'Bonjour {nom}, merci pour votre promesse.',
      reasoning: 'Promesse de paiement fin de mois.',
      confidence: 0.9,
    })),
    readPaymentProof: vi.fn(async () => ({
      operator: 'Wave' as const,
      amount: 25000,
      currency: 'F CFA',
      date: '2026-09-28T14:32',
      transactionReference: 'TEST-WAVE-1',
      payerName: null,
      confidence: 0.95,
      warning: 'Document fictif.',
    })),
    ...overrides,
  };
}

describe('"Décrire" flow', () => {
  it('shows the suggestion, lets the officer edit it, then saves it', async () => {
    const user = userEvent.setup();
    const ai = fakeAi();
    render(<App ai={ai} />);

    await user.click(screen.getByRole('tab', { name: 'Décrire' }));
    const panel = screen.getByRole('tabpanel', { name: 'Décrire' });
    await user.type(
      within(panel).getByLabelText(/situation de l’assuré/i),
      'Deux échéances de retard, paiera fin du mois',
    );
    await user.click(within(panel).getByRole('button', { name: /analyser/i }));

    expect(ai.analyzeSituation).toHaveBeenCalledWith(
      'Deux échéances de retard, paiera fin du mois',
    );
    expect(await within(panel).findByLabelText(/^statut$/i)).toHaveValue(
      'Promesse de paiement',
    );
    expect(within(panel).getByLabelText(/^canal$/i)).toHaveValue('SMS');
    expect(within(panel).getByLabelText(/étape de relance/i)).toHaveValue('J+30');

    const message = within(panel).getByLabelText(/^message$/i);
    expect(message).toHaveValue('Bonjour {nom}, merci pour votre promesse.');
    await user.clear(message);
    await user.type(message, 'Message corrigé');
    await user.type(within(panel).getByLabelText(/numéro de police/i), 'DEMO-0003');
    await user.click(
      within(panel).getByRole('button', { name: /enregistrer la relance/i }),
    );

    const table = await screen.findByRole('table');
    expect(table).toHaveTextContent('DEMO-0003');
    expect(table).toHaveTextContent('Description (IA)');
    expect(table).toHaveTextContent('Message corrigé');
  });

  it('shows a friendly French error when the service is down', async () => {
    const user = userEvent.setup();
    const ai = fakeAi({
      analyzeSituation: vi.fn(async () => {
        throw new AiServiceError('unavailable');
      }),
    });
    render(<App ai={ai} />);

    await user.click(screen.getByRole('tab', { name: 'Décrire' }));
    const panel = screen.getByRole('tabpanel', { name: 'Décrire' });
    await user.type(within(panel).getByLabelText(/situation de l’assuré/i), 'Texte');
    await user.click(within(panel).getByRole('button', { name: /analyser/i }));

    expect(await within(panel).findByRole('alert')).toHaveTextContent(
      /momentanément indisponible/i,
    );
    expect(within(panel).queryByLabelText(/numéro de police/i)).not.toBeInTheDocument();
  });

  it('refuses an empty description without calling the service', async () => {
    const user = userEvent.setup();
    const ai = fakeAi();
    render(<App ai={ai} />);

    await user.click(screen.getByRole('tab', { name: 'Décrire' }));
    const panel = screen.getByRole('tabpanel', { name: 'Décrire' });
    await user.click(within(panel).getByRole('button', { name: /analyser/i }));

    expect(await within(panel).findByRole('alert')).toHaveTextContent(
      /décrivez d’abord/i,
    );
    expect(ai.analyzeSituation).not.toHaveBeenCalled();
  });
});

describe('"Preuve de paiement" flow', () => {
  it('previews the image, shows the extracted fields and saves the proof', async () => {
    const user = userEvent.setup();
    const ai = fakeAi();
    render(<App ai={ai} />);

    await user.click(screen.getByRole('tab', { name: 'Preuve de paiement' }));
    const panel = screen.getByRole('tabpanel', { name: 'Preuve de paiement' });
    const file = new File(['x'], 'recu.png', { type: 'image/png' });
    await user.upload(within(panel).getByLabelText(/capture du reçu/i), file);

    expect(await within(panel).findByAltText(/aperçu du reçu/i)).toBeInTheDocument();
    await user.click(within(panel).getByRole('button', { name: /lire le reçu/i }));

    expect(ai.readPaymentProof).toHaveBeenCalledWith(
      expect.objectContaining({ base64: 'AAAA', mimeType: 'image/jpeg' }),
    );
    expect(await within(panel).findByLabelText(/^opérateur$/i)).toHaveValue('Wave');
    expect(within(panel).getByLabelText(/montant/i)).toHaveValue('25000');
    expect(within(panel).getByLabelText(/référence de transaction/i)).toHaveValue(
      'TEST-WAVE-1',
    );
    expect(within(panel).getByLabelText(/nom de l’expéditeur/i)).toHaveValue('');
    expect(within(panel).getByRole('note')).toHaveTextContent('Document fictif.');

    await user.type(within(panel).getByLabelText(/numéro de police/i), 'DEMO-0004');
    await user.click(
      within(panel).getByRole('button', { name: /enregistrer la relance/i }),
    );

    const table = await screen.findByRole('table');
    expect(table).toHaveTextContent('Preuve de paiement');
    expect(table).toHaveTextContent('Preuve Wave');
    expect(table).toHaveTextContent('TEST-WAVE-1');
    // Entries persist: the screenshot is not part of what is stored.
    expect(localStorage.getItem('recouvia.relances.v1')).not.toContain('AAAA');
  });

  it('rejects a non-numeric amount when saving', async () => {
    const user = userEvent.setup();
    render(<App ai={fakeAi()} />);

    await user.click(screen.getByRole('tab', { name: 'Preuve de paiement' }));
    const panel = screen.getByRole('tabpanel', { name: 'Preuve de paiement' });
    await user.upload(
      within(panel).getByLabelText(/capture du reçu/i),
      new File(['x'], 'recu.png', { type: 'image/png' }),
    );
    await user.click(await within(panel).findByRole('button', { name: /lire le reçu/i }));

    const amount = await within(panel).findByLabelText(/montant/i);
    await user.clear(amount);
    await user.type(amount, '12,5');
    await user.type(within(panel).getByLabelText(/numéro de police/i), 'DEMO-0005');
    await user.click(
      within(panel).getByRole('button', { name: /enregistrer la relance/i }),
    );

    expect(await within(panel).findByRole('alert')).toHaveTextContent(
      /montant invalide/i,
    );
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });
});
