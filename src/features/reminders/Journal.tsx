import type { RelanceRepository } from '../../lib/relance-repository';
import { fr } from '../../i18n/fr';
import type { ReminderTemplate } from '../templates/templates-data';
import { PoliceCounters } from './PoliceCounters';
import { RelanceForm } from './RelanceForm';
import { RelanceList } from './RelanceList';
import { useRelances } from './use-relances';

interface JournalProps {
  repository: RelanceRepository;
  /** Template chosen in the library; `nonce` changes on every pick so the form re-applies it. */
  selection: { template: ReminderTemplate; nonce: number } | null;
}

export function Journal({ repository, selection }: JournalProps) {
  const { entries, loaded, add, duplicate, remove } = useRelances(repository);

  return (
    <section aria-labelledby="journal-title">
      <h2 id="journal-title">{fr.journal.title}</h2>
      <RelanceForm
        key={selection?.nonce ?? 'none'}
        template={selection?.template ?? null}
        onSubmit={add}
      />
      {loaded && (
        <>
          <PoliceCounters entries={entries} />
          <RelanceList entries={entries} onDuplicate={duplicate} onRemove={remove} />
        </>
      )}
    </section>
  );
}
