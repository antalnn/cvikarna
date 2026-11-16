import { useEffect, useState } from "react";
import { useLanguage } from "../i18n/useLanguage";

const FILL_MS = 1300;
const HOLD_MS = 340;

/**
 * The boot sequence: about 1.9s, a 1.3s fill, a short hold, then the wipe. It
 * plays on every load, honours reduced motion, `?boot=0` disables it, a key
 * press skips it, and it carries no visible control.
 */
export function Boot() {
  const { tx } = useLanguage();
  const [progress, setProgress] = useState(0);
  const [finished, setFinished] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const skipped = new URLSearchParams(location.search).get("boot") === "0";

    if (reduced || skipped) {
      setGone(true);
      return;
    }

    const start = performance.now();
    let frameId = 0;
    let closeTimer = 0;
    let done = false;

    const finish = () => {
      if (done) {
        return;
      }
      done = true;
      setProgress(100);
      setFinished(true);
      closeTimer = window.setTimeout(() => setGone(true), 480);
    };

    const frame = (now: number) => {
      if (done) {
        return;
      }
      const ratio = Math.min(1, (now - start) / FILL_MS);
      setProgress(Math.round(ratio * 100));
      if (ratio < 1) {
        frameId = requestAnimationFrame(frame);
      }
    };

    frameId = requestAnimationFrame(frame);
    const holdTimer = window.setTimeout(finish, FILL_MS + HOLD_MS);
    window.addEventListener("keydown", finish, { once: true });

    return () => {
      cancelAnimationFrame(frameId);
      window.clearTimeout(holdTimer);
      window.clearTimeout(closeTimer);
      window.removeEventListener("keydown", finish);
    };
  }, []);

  if (gone) {
    return null;
  }

  return (
    <div className={`boot${finished ? " is-done" : ""}`} id="boot">
      <div className="boot__inner">
        <div className="boot__brand">
          <span className="boot__mark" aria-hidden="true">
            <svg viewBox="0 0 32 32">
              <path className="boot__plate boot__plate--l" d="M6 10v12" />
              <path className="boot__plate boot__plate--r" d="M26 10v12" />
              <path className="boot__plate boot__plate--m" d="M16 6v20" />
              <path className="boot__bar" d="M2 16h28" />
            </svg>
          </span>
          <span className="boot__word" aria-label="Cvikárna">
            {"CVIKÁRNA".split("").map((letter, index) => (
              <span key={`${letter}-${index}`} style={{ "--i": index } as React.CSSProperties}>
                {letter}
              </span>
            ))}
          </span>
        </div>
        <div className="boot__bar-track">
          <span className="boot__fill" style={{ width: `${progress}%` }} />
        </div>
        <div className="boot__meta">
          <span>{finished ? tx("Připraveno", "Ready") : tx("Načítám trénink", "Loading the session")}</span>
          <span className="boot__count">{String(progress).padStart(2, "0")}</span>
        </div>
      </div>
    </div>
  );
}

