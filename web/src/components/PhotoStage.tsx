import { useEffect, useState } from "react";
import { useLanguage } from "../i18n/useLanguage";

interface PhotoStageProps {
  images: string[];
  name: string;
}

const FRAME_MS = 1800;

/** Autoplay is motion, so it waits for permission from the visitor's system settings. */
function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Two stacked photos with an opacity crossfade and the controls on the image
 * itself: arrows on the edges for stepping, one round button for play and
 * pause. The arrows stay out of the way until the pointer or keyboard focus
 * reaches the frame, and reduced motion starts paused.
 */
export function PhotoStage({ images, name }: PhotoStageProps) {
  const { t } = useLanguage();
  const [frame, setFrame] = useState(0);
  const [playing, setPlaying] = useState(() => images.length > 1 && !prefersReducedMotion());

  useEffect(() => {
    if (!playing || images.length < 2) {
      return;
    }

    const timer = window.setInterval(() => {
      setFrame((current) => (current + 1) % images.length);
    }, FRAME_MS);

    return () => window.clearInterval(timer);
  }, [playing, images.length]);

  if (images.length === 0) {
    return null;
  }

  const captions = [t.photoStart, t.photoEnd];
  const canStep = images.length > 1;

  const step = (delta: number) => {
    setPlaying(false);
    setFrame((current) => (current + delta + images.length) % images.length);
  };

  return (
    <div className="stage">
      <div className="stage__frame">
        {images.map((src, index) => (
          <img
            key={src}
            className={`stage__img${index === frame ? " is-visible" : ""}`}
            src={src}
            alt={`${name}, ${captions[index] ?? captions[0]}`}
          />
        ))}

        {canStep ? (
          <>
            <button
              className="stage__arrow stage__arrow--prev"
              type="button"
              aria-label={t.prevPhoto}
              onClick={() => step(-1)}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="m15 5-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              className="stage__arrow stage__arrow--next"
              type="button"
              aria-label={t.nextPhoto}
              onClick={() => step(1)}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="m9 5 7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </>
        ) : null}

        <span className="stage__caption">{captions[frame] ?? captions[0]}</span>

        <button
          className="stage__play"
          type="button"
          aria-pressed={playing}
          aria-label={playing ? t.pause : t.play}
          title={playing ? t.pause : t.play}
          disabled={!canStep}
          onClick={() => setPlaying((value) => !value)}
        >
          {playing ? (
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <rect x="6" y="5" width="4" height="14" rx="1" />
              <rect x="14" y="5" width="4" height="14" rx="1" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M8 5.5v13l11-6.5z" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
