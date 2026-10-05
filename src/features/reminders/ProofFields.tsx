import { OPERATORS, isOneOf, type Operator } from '../../domain/types';
import { fr } from '../../i18n/fr';

/** String-valued form state for the proof fields; empty string = not provided (`null`). */
export interface ProofFormState {
  operator: Operator;
  amount: string;
  currency: string;
  date: string;
  transactionReference: string;
  payerName: string;
}

interface ProofFieldsProps {
  value: ProofFormState;
  onChange: (next: ProofFormState) => void;
  amountInvalid: boolean;
}

export function ProofFields({ value, onChange, amountInvalid }: ProofFieldsProps) {
  const t = fr.journal.form;

  return (
    <fieldset className="wide proof-fields">
      <legend>{t.proofTitle}</legend>

      <label className="field">
        <span>{t.proofOperator}</span>
        <select
          value={value.operator}
          onChange={(event) =>
            isOneOf(OPERATORS, event.target.value) &&
            onChange({ ...value, operator: event.target.value })
          }
        >
          {OPERATORS.map((operator) => (
            <option key={operator} value={operator}>
              {operator}
            </option>
          ))}
        </select>
      </label>

      <label className="field">
        <span>{t.proofAmount}</span>
        <input
          type="text"
          inputMode="numeric"
          value={value.amount}
          aria-invalid={amountInvalid}
          aria-describedby={amountInvalid ? 'proof-amount-error' : undefined}
          onChange={(event) => onChange({ ...value, amount: event.target.value })}
        />
        {amountInvalid && (
          <span id="proof-amount-error" className="error" role="alert">
            {t.proofAmountInvalid}
          </span>
        )}
      </label>

      <label className="field">
        <span>{t.proofCurrency}</span>
        <input
          type="text"
          value={value.currency}
          onChange={(event) => onChange({ ...value, currency: event.target.value })}
        />
      </label>

      <label className="field">
        <span>{t.proofDate}</span>
        <input
          type="date"
          value={value.date}
          onChange={(event) => onChange({ ...value, date: event.target.value })}
        />
      </label>

      <label className="field">
        <span>{t.proofReference}</span>
        <input
          type="text"
          value={value.transactionReference}
          onChange={(event) =>
            onChange({ ...value, transactionReference: event.target.value })
          }
        />
      </label>

      <label className="field">
        <span>{t.proofPayer}</span>
        <input
          type="text"
          value={value.payerName}
          onChange={(event) => onChange({ ...value, payerName: event.target.value })}
        />
      </label>
    </fieldset>
  );
}
