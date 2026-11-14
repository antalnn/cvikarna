import { useEffect, useRef, useState } from "react";
import { ApiError } from "../api/client";
import type { Workout } from "../api/types";
import { useLanguage } from "../i18n/useLanguage";

interface WorkoutNameEditorProps {
  /** The stored name. Null or blank means the fallback title is shown. */
  name: string | null;
  /** The title to show when the workout has no name. */
  fallback: string;
  /** Heading level, so the tracker and the history keep one h1 and one h2. */
  level: 1 | 2;
  /** Heading class, so each page keeps its own type scale. */
  titleClassName: string;
  /** Sends the new name. Null clears it. Resolves with the updated workout. */
  onSave: (name: string | null) => Promise<Workout>;
  onSaved: (workout: Workout) => void;
}

/**
 * A heading that turns into an inline input behind a pencil button.
 * Enter or blur saves, Escape cancels, and the server error appears under the
 * input while the old name is restored.
 */
export function WorkoutNameEditor({
  name,
  fallback,
  level,
  titleClassName,
  onSave,
  onSaved,
}: WorkoutNameEditorProps) {
  const { t } = useLanguage();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const Heading = level === 1 ? "h1" : "h2";

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  const start = () => {
    setDraft(name ?? "");
    setError(null);
    setEditing(true);
  };

  const cancel = () => {
    setEditing(false);
    setError(null);
    setDraft(name ?? "");
  };

  const commit = async () => {
    if (!editing || saving) {
      return;
    }

    const trimmed = draft.trim();
    const stored = name?.trim() ?? "";

    if (trimmed === stored) {
      setEditing(false);
      setError(null);
      return;
    }

    if (trimmed.length > 80) {
      setError(t.nameError);
      return;
    }

    setSaving(true);

    try {
      const updated = await onSave(trimmed === "" ? null : trimmed);
      onSaved(updated);
      setEditing(false);
      setError(null);
    } catch (failure) {
      setError(failure instanceof ApiError && failure.errors.name ? t.nameError : t.saveError);
      setDraft(name ?? "");
    } finally {
      setSaving(false);
    }
  };

  if (editing) {
    return (
      <div className="name-edit">
        <div className="name-edit__form">
          <input
            ref={inputRef}
            className="name-edit__input"
            type="text"
            value={draft}
            maxLength={80}
            placeholder={t.workoutNamePlaceholder}
            aria-label={t.workoutNamePlaceholder}
            aria-invalid={error ? true : undefined}
            disabled={saving}
            onChange={(event) => setDraft(event.target.value)}
            onBlur={() => void commit()}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                void commit();
              }
              if (event.key === "Escape") {
                event.preventDefault();
                cancel();
              }
            }}
          />
          <button
            className="name-edit__action name-edit__action--save"
            type="button"
            aria-label={t.saveName}
            title={t.saveName}
            disabled={saving}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => void commit()}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
              <path d="m5 13 4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            className="name-edit__action"
            type="button"
            aria-label={t.cancelEdit}
            title={t.cancelEdit}
            disabled={saving}
            onMouseDown={(event) => event.preventDefault()}
            onClick={cancel}
          >
            ×
          </button>
        </div>
        {error ? (
          <p className="field-error name-edit__error" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="name-edit">
      <div className="name-edit__row">
        <Heading className={titleClassName}>{name?.trim() ? name : fallback}</Heading>
        <button
          className="name-edit__pencil"
          type="button"
          aria-label={t.renameWorkout}
          title={t.renameWorkout}
          onClick={start}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M4 20h4l10-10-4-4L4 16v4Z" strokeLinecap="round" strokeLinejoin="round" />
            <path d="m14 6 4 4" strokeLinecap="round" />
          </svg>
        </button>
      </div>
      {error ? (
        <p className="field-error name-edit__error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
