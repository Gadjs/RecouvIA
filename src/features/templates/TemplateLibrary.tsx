import { useMemo, useState } from 'react';
import { fr } from '../../i18n/fr';
import { TemplateCard } from './TemplateCard';
import { searchTemplates } from './template-search';
import { TEMPLATES, type ReminderTemplate } from './templates-data';

interface TemplateLibraryProps {
  onUse: (template: ReminderTemplate) => void;
}

export function TemplateLibrary({ onUse }: TemplateLibraryProps) {
  const [query, setQuery] = useState('');
  const results = useMemo(() => searchTemplates(TEMPLATES, query), [query]);
  const t = fr.library;

  return (
    <section aria-labelledby="library-title">
      <h2 id="library-title">{t.title}</h2>
      <label className="field">
        <span>{t.searchLabel}</span>
        <input
          type="search"
          value={query}
          placeholder={t.searchPlaceholder}
          onChange={(event) => setQuery(event.target.value)}
        />
      </label>
      <p className="muted" role="status">
        {t.count(results.length, TEMPLATES.length)}
      </p>
      {results.length === 0 ? (
        <p>{t.empty}</p>
      ) : (
        <div className="grid">
          {results.map((template) => (
            <TemplateCard key={template.id} template={template} onUse={onUse} />
          ))}
        </div>
      )}
    </section>
  );
}
