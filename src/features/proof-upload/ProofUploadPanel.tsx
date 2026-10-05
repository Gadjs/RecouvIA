import { useState, type ChangeEvent } from 'react';
import { Spinner } from '../../components/Spinner';
import type { ProofReading } from '../../domain/ai-results';
import type { NewRelanceEntry } from '../../domain/types';
import { fr } from '../../i18n/fr';
import { AiServiceError, type AiService } from '../../lib/ai-service';
import { ImageError, prepareImage, type PreparedImage } from '../../lib/resize-image';
import { AiReview } from '../reminders/AiReview';
import { draftFromProof } from '../reminders/entry-draft';
import { RelanceForm } from '../reminders/RelanceForm';

interface ProofUploadPanelProps {
  ai: AiService;
  onSubmit: (entry: NewRelanceEntry) => Promise<void>;
}

type Phase = 'idle' | 'preparing' | 'reading';

export function ProofUploadPanel({ ai, onSubmit }: ProofUploadPanelProps) {
  const [image, setImage] = useState<PreparedImage | null>(null);
  const [phase, setPhase] = useState<Phase>('idle');
  const [error, setError] = useState<string | null>(null);
  const [reading, setReading] = useState<ProofReading | null>(null);
  const [saved, setSaved] = useState(false);
  // Remounts the file input so the same file can be chosen again after a reset.
  const [inputKey, setInputKey] = useState(0);
  const t = fr.journal.proof;
  const review = fr.journal.review;

  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setError(null);
    setReading(null);
    setSaved(false);
    setImage(null);
    setPhase('preparing');
    try {
      setImage(await prepareImage(file));
    } catch (caught) {
      setError(
        fr.journal.errors[caught instanceof ImageError ? caught.reason : 'unreadable'],
      );
    } finally {
      setPhase('idle');
    }
  }

  async function readProof() {
    if (!image) {
      setError(fr.journal.errors.noImage);
      return;
    }
    setPhase('reading');
    setError(null);
    setSaved(false);
    try {
      setReading(await ai.readPaymentProof(image));
    } catch (caught) {
      setReading(null);
      const kind = caught instanceof AiServiceError ? caught.kind : 'unknown';
      setError(fr.journal.errors[kind]);
    } finally {
      setPhase('idle');
    }
  }

  function reset() {
    setImage(null);
    setReading(null);
    setError(null);
    setInputKey((key) => key + 1);
  }

  async function save(entry: NewRelanceEntry) {
    await onSubmit(entry);
    reset();
    setSaved(true);
  }

  const busy = phase !== 'idle';

  return (
    <div className="ai-panel">
      <p className="muted">{t.intro}</p>
      <label className="field wide">
        <span>{t.label}</span>
        <input
          key={inputKey}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          disabled={busy}
          onChange={(event) => void handleFile(event)}
        />
      </label>

      {image && (
        <img className="proof-preview" src={image.previewUrl} alt={t.previewAlt} />
      )}

      <div className="actions">
        <button type="button" disabled={busy || !image} onClick={() => void readProof()}>
          {t.read}
        </button>
        {(image || reading) && (
          <button type="button" className="secondary" disabled={busy} onClick={reset}>
            {t.restart}
          </button>
        )}
      </div>

      {phase === 'preparing' && <Spinner label={t.preparing} />}
      {phase === 'reading' && <Spinner label={t.loading} />}
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      {saved && <p role="status">{review.saved}</p>}

      {reading && (
        <AiReview facts={[]} confidence={reading.confidence} warning={reading.warning}>
          <RelanceForm template={null} draft={draftFromProof(reading)} onSubmit={save} />
        </AiReview>
      )}
    </div>
  );
}
