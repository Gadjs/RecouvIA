import { getRelanceStep } from '../../domain/relance-steps';
import { fr } from '../../i18n/fr';
import type { ReminderTemplate } from './templates-data';

interface TemplateCardProps {
  template: ReminderTemplate;
  onUse: (template: ReminderTemplate) => void;
}

export function TemplateCard({ template, onUse }: TemplateCardProps) {
  const { canal, ton } = getRelanceStep(template.step);
  const t = fr.library;

  return (
    <article className="card">
      <header className="card-header">
        <h3>{template.title}</h3>
        <span className="badge">{template.step}</span>
      </header>
      <dl className="meta">
        <div>
          <dt>{t.fields.statut}</dt>
          <dd>{template.statut}</dd>
        </div>
        <div>
          <dt>{t.fields.canal}</dt>
          <dd>{canal}</dd>
        </div>
        <div>
          <dt>{t.fields.ton}</dt>
          <dd>{ton}</dd>
        </div>
      </dl>
      <p className="message-label">{t.fields.message}</p>
      <p className="message">{template.message}</p>
      <p className="message-label">{t.fields.wolof}</p>
      <p className="message muted">{template.wolof}</p>
      <button
        type="button"
        onClick={() => onUse(template)}
        aria-label={t.useAria(template.title)}
      >
        {t.use}
      </button>
    </article>
  );
}
