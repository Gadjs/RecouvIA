import type { ReactNode } from 'react';
import { fr } from '../../i18n/fr';

interface AiReviewProps {
  /** Short facts about the suggestion (status, channel, …), already formatted. */
  facts: readonly { label: string; value: string }[];
  confidence: number;
  reasoning?: string;
  warning?: string | null;
  children: ReactNode;
}

/** Card shown after an AI call: summary of what was suggested, then the editable form. */
export function AiReview({
  facts,
  confidence,
  reasoning,
  warning,
  children,
}: AiReviewProps) {
  const t = fr.journal.review;

  return (
    <section className="review" aria-labelledby="review-title">
      <h3 id="review-title">{t.title}</h3>
      <dl className="facts">
        {facts.map((fact) => (
          <div key={fact.label}>
            <dt>{fact.label}</dt>
            <dd>{fact.value}</dd>
          </div>
        ))}
        <div>
          <dd>{t.confidence(confidence)}</dd>
        </div>
      </dl>
      {reasoning && (
        <p>
          <strong>{t.reasoning} :</strong> {reasoning}
        </p>
      )}
      {warning && (
        <p className="notice" role="note">
          <strong>{t.warning} :</strong> {warning}
        </p>
      )}
      <p className="muted">{t.editHint}</p>
      {children}
    </section>
  );
}
