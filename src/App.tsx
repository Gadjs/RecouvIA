import { useMemo, useRef, useState } from 'react';
import { Journal } from './features/reminders/Journal';
import { TemplateLibrary } from './features/templates/TemplateLibrary';
import type { ReminderTemplate } from './features/templates/templates-data';
import { fr } from './i18n/fr';
import type { AiService } from './lib/ai-service';
import { createFirebaseAiService } from './lib/firebase-ai-service';
import { formatLongDate } from './lib/dates';
import { createLocalStorageRelanceRepository } from './lib/local-storage-relance-repository';

interface AppProps {
  /** Override the AI backend (tests); defaults to the Firebase callable functions. */
  ai?: AiService;
}

export function App({ ai }: AppProps) {
  // Swap this one line for a database-backed implementation of RelanceRepository.
  const repository = useMemo(() => createLocalStorageRelanceRepository(), []);
  const aiService = useMemo(() => ai ?? createFirebaseAiService(), [ai]);
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
        <div className="app-header-inner">
          <div>
            <h1>{fr.app.title}</h1>
            <p>{fr.app.subtitle}</p>
          </div>
          <p className="app-date">{fr.app.today(formatLongDate(new Date()))}</p>
        </div>
        <p className="app-notice">{fr.app.demoNotice}</p>
      </header>
      <main>
        <div ref={journalRef}>
          <Journal repository={repository} ai={aiService} selection={selection} />
        </div>
        <TemplateLibrary onUse={handleUse} />
      </main>
    </>
  );
}
