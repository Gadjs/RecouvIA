interface SpinnerProps {
  label: string;
}

export function Spinner({ label }: SpinnerProps) {
  return (
    <p className="spinner-row" role="status">
      <span className="spinner" aria-hidden="true" />
      {label}
    </p>
  );
}
