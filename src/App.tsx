import { useMemo, useRef, useState } from 'react';
import { Journal } from './features/reminders/Journal';
import { TemplateLibrary } from './features/templates/TemplateLibrary';
import type { ReminderTemplate } from './features/templates/templates-data';
import { fr } from './i18n/fr';
import { createLocalStorageRelanceRepository } from './lib/local-storage-relance-repository';

export function App() {
  // Swap this one line for a database-backed implementation of RelanceRepository.
  const repository = useMemo(() => createLocalStorageRelanceRepository(), []);
  const [selection, setSelection] = useState<{
    template: ReminderTemplate;
    nonce: number;
  } | null>(null);
  const nonce = useRef(0);
  const journalRef = useRef<HTMLDivElement>(null);

  function handleUse(template: ReminderTemplate) {
    nonce.current += 1;
    setSelection({ template, nonce: nonce.current });
    journalRef.current?.scrollIntoView?.({ behavior: 'smooth' });
  }

  return (
    <>
      <header className="app-header">
        <h1>{fr.app.title}</h1>
        <p>{fr.app.subtitle}</p>
        <p className="muted">{fr.app.demoNotice}</p>
      </header>
      <main>
        <div ref={journalRef}>
          <Journal repository={repository} selection={selection} />
        </div>
        <TemplateLibrary onUse={handleUse} />
      </main>
    </>
  );
}
