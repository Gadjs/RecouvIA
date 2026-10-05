import { useState } from 'react';
import { Spinner } from '../../components/Spinner';
import type { SituationSuggestion } from '../../domain/ai-results';
import type { NewRelanceEntry } from '../../domain/types';
import { fr } from '../../i18n/fr';
import { AiServiceError, type AiService } from '../../lib/ai-service';
import { AiReview } from '../reminders/AiReview';
import { draftFromSuggestion } from '../reminders/entry-draft';
import { RelanceForm } from '../reminders/RelanceForm';

const MAX_CHARS = 2000;

interface SituationPanelProps {
  ai: AiService;
  onSubmit: (entry: NewRelanceEntry) => Promise<void>;
}

export function SituationPanel({ ai, onSubmit }: SituationPanelProps) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestion, setSuggestion] = useState<SituationSuggestion | null>(null);
  const [saved, setSaved] = useState(false);
  const t = fr.journal.describe;
  const review = fr.journal.review;

  async function analyze() {
    if (text.trim() === '') {
      setError(fr.journal.errors.emptyText);
      return;
    }
    setLoading(true);
    setError(null);
    setSaved(false);
    try {
      setSuggestion(await ai.analyzeSituation(text.trim()));
    } catch (caught) {
      setSuggestion(null);
      const kind = caught instanceof AiServiceError ? caught.kind : 'unknown';
      setError(fr.journal.errors[kind]);
    } finally {
      setLoading(false);
    }
  }

  async function save(entry: NewRelanceEntry) {
    await onSubmit(entry);
    setSuggestion(null);
    setText('');
    setSaved(true);
  }

  return (
    <div className="ai-panel">
      <p className="muted">{t.intro}</p>
      <label className="field wide">
        <span>{t.label}</span>
        <textarea
          rows={4}
          maxLength={MAX_CHARS}
          value={text}
          placeholder={t.placeholder}
          disabled={loading}
          onChange={(event) => setText(event.target.value)}
        />
      </label>
      <div className="actions">
        <button type="button" disabled={loading} onClick={() => void analyze()}>
          {t.analyze}
        </button>
        {suggestion && (
          <button type="button" className="secondary" onClick={() => setSuggestion(null)}>
            {t.restart}
          </button>
        )}
      </div>

      {loading && <Spinner label={t.loading} />}
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      {saved && <p role="status">{review.saved}</p>}

      {suggestion && (
        <AiReview
          facts={[
            { label: review.status, value: suggestion.suggestedStatus },
            { label: review.channel, value: suggestion.suggestedChannel },
            { label: review.timing, value: suggestion.timing },
            { label: review.tone, value: suggestion.tone },
          ]}
          confidence={suggestion.confidence}
          reasoning={suggestion.reasoning}
        >
          <RelanceForm
            template={null}
            draft={draftFromSuggestion(suggestion)}
            onSubmit={save}
          />
        </AiReview>
      )}
    </div>
  );
}
