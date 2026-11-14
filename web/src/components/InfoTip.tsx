import { useId } from "react";

interface InfoTipProps {
  /** Accessible name for the trigger, e.g. "What is RPE?". */
  label: string;
  children: string;
}

/** A small question mark that explains a term on hover or keyboard focus. */
export function InfoTip({ label, children }: InfoTipProps) {
  const id = useId();

  return (
    <span className="info-tip">
      <button
        className="info-tip__button"
        type="button"
        aria-label={label}
        aria-describedby={id}
      >
        ?
      </button>
      <span className="info-tip__bubble" id={id} role="tooltip">
        {children}
      </span>
    </span>
  );
}
