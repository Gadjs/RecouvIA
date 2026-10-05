import { useState } from 'react';
import type { AiService } from '../../lib/ai-service';
import type { RelanceRepository } from '../../lib/relance-repository';
import { fr } from '../../i18n/fr';
import { ProofUploadPanel } from '../proof-upload/ProofUploadPanel';
import { SituationPanel } from '../situation/SituationPanel';
import type { ReminderTemplate } from '../templates/templates-data';
import { EntryTabs, type EntryTab } from './EntryTabs';
import { PoliceCounters } from './PoliceCounters';
import { RelanceForm } from './RelanceForm';
import { RelanceList } from './RelanceList';
import { useRelances } from './use-relances';

interface JournalProps {
  repository: RelanceRepository;
  ai: AiService;
  /** Template chosen in the library; `nonce` changes on every pick so the form re-applies it. */
  selection: { template: ReminderTemplate; nonce: number } | null;
}

export function Journal({ repository, ai, selection }: JournalProps) {
  const { entries, loaded, add, duplicate, remove } = useRelances(repository);
  const [tab, setTab] = useState<EntryTab>('modele');
  const [seenNonce, setSeenNonce] = useState(selection?.nonce);

  // Picking a template in the library jumps back to the "Modèles" tab.
  if (selection?.nonce !== seenNonce) {
    setSeenNonce(selection?.nonce);
    setTab('modele');
  }

  return (
    <section aria-labelledby="journal-title">
      <h2 id="journal-title">{fr.journal.title}</h2>
      <EntryTabs
        active={tab}
        onChange={setTab}
        panels={{
          modele: (
            <RelanceForm
              key={selection?.nonce ?? 'none'}
              template={selection?.template ?? null}
              onSubmit={add}
            />
          ),
          description: <SituationPanel ai={ai} onSubmit={add} />,
          preuve: <ProofUploadPanel ai={ai} onSubmit={add} />,
        }}
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
