import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from './App';

async function logRelance(user: ReturnType<typeof userEvent.setup>, police: string) {
  await user.type(screen.getByLabelText(/numéro de police/i), police);
  await user.click(screen.getByRole('button', { name: /enregistrer la relance/i }));
}

describe('App', () => {
  it('filters the template library by search', async () => {
    const user = userEvent.setup();
    render(<App />);
    expect(screen.getByText('20 modèle(s) sur 20')).toBeInTheDocument();

    await user.type(screen.getByLabelText(/rechercher un modèle/i), 'escalade');
    expect(screen.queryByText('20 modèle(s) sur 20')).not.toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent(/sur 20/);

    await user.clear(screen.getByLabelText(/rechercher un modèle/i));
    await user.type(screen.getByLabelText(/rechercher un modèle/i), 'zzzz');
    expect(screen.getByText(/aucun modèle ne correspond/i)).toBeInTheDocument();
  });

  it('rejects an invalid police number', async () => {
    const user = userEvent.setup();
    render(<App />);
    await logRelance(user, 'x');
    expect(await screen.findByRole('alert')).toHaveTextContent(/numéro invalide/i);
    expect(screen.getByText(/aucune relance enregistrée/i)).toBeInTheDocument();
  });

  it('logs, counts per police, duplicates and deletes entries', async () => {
    const user = userEvent.setup();
    render(<App />);

    await logRelance(user, 'demo-0001');
    const table = await screen.findByRole('table');
    expect(within(table).getAllByRole('row')).toHaveLength(2); // header + 1
    expect(screen.getByText('1 relance')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /dupliquer la relance/i }));
    expect(await screen.findByText('2 relances')).toBeInTheDocument();

    await user.click(
      screen.getAllByRole('button', { name: /supprimer la relance/i })[0]!,
    );
    await user.click(screen.getByRole('button', { name: /confirmer la suppression/i }));
    expect(await screen.findByText('1 relance')).toBeInTheDocument();
  });

  it('keeps entries after a "refresh" (remount)', async () => {
    const user = userEvent.setup();
    const { unmount } = render(<App />);
    await logRelance(user, 'DEMO-0002');
    await screen.findByRole('table');
    unmount();

    render(<App />);
    expect(await screen.findByRole('table')).toHaveTextContent('DEMO-0002');
  });

  it('pre-fills the journal form from a template', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(
      screen.getByRole('button', { name: /utiliser le modèle « appel formel/i }),
    );
    expect(screen.getByLabelText(/étape de relance/i)).toHaveValue('J+21');
    expect(screen.getByLabelText(/^canal$/i)).toHaveValue('appel');
    expect(screen.getByLabelText(/^statut$/i)).toHaveValue('En retard');
  });
});
