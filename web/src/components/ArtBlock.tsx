import { useEffect, useState } from "react";
import { useLanguage } from "../i18n/useLanguage";

interface ArtBlockProps {
  images: string[];
  alt: string;
  variant?: "card" | "stage" | "row";
  index?: number;
  tag?: string;
}

/**
 * The free-exercise-db pair inside the design's framed art block. The block
 * cross-fades the start and end frames on its own, looping, to suggest the
 * motion. The two in-frame controls pick one frame and hold it; pressing the
 * held frame again returns the block to its loop. Movement switching is never
 * here: the detail page keeps that on the arrows beside the art.
 */
export function ArtBlock({ images, alt, variant = "card", index, tag }: ArtBlockProps) {
  const { tx } = useLanguage();
  const pair = images.filter(Boolean).slice(0, 2);
  const [frame, setFrame] = useState(0);
  const [auto, setAuto] = useState(true);
  const [failed, setFailed] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (variant === "row" || !auto || pair.length < 2) {
      return;
    }
    const timer = window.setInterval(() => setFrame((current) => (current === 0 ? 1 : 0)), 2200);
    return () => window.clearInterval(timer);
  }, [auto, pair.length, variant]);

  const frameButtons = (
    <div className={variant === "stage" ? "stage__frames" : "bp__frames"} role="group" aria-label={tx("Snímek pohybu", "Movement frame")}>
      {[0, 1].map((value) => (
        <button
          key={value}
          className="bp__frame-btn"
          type="button"
          aria-pressed={!auto && frame === value}
          aria-label={
            value === 0
              ? tx("Výchozí snímek", "Start frame")
              : tx("Koncový snímek", "End frame")
          }
          onClick={() => {
            if (!auto && frame === value) {
              setAuto(true);
              return;
            }
            setAuto(false);
            setFrame(value);
          }}
        >
          {value + 1}
        </button>
      ))}
    </div>
  );

  const layers = (
    <span aria-hidden="true">
      {(pair.length ? pair : [""]).map((src, layer) => (
        <img
          key={`${src}-${layer}`}
          className={
            variant === "stage"
              ? `stage__frame${frame === layer ? " is-on" : ""}`
              : variant === "row"
                ? `stage__frame${layer === 0 ? " is-on" : ""}`
                : `bp__frame${frame === layer ? " is-on" : ""}`
          }
          src={src}
          alt=""
          loading={variant === "stage" ? "eager" : "lazy"}
          decoding="async"
          onError={() => setFailed((current) => ({ ...current, [layer]: true }))}
          style={failed[layer] ? { opacity: 0 } : undefined}
        />
      ))}
    </span>
  );

  if (variant === "row") {
    return (
      <span className="catalogue-row__art">
        <img
          className="is-on"
          src={pair[0] ?? ""}
          alt=""
          loading="lazy"
          decoding="async"
          onError={() => setFailed((current) => ({ ...current, 0: true }))}
        />
      </span>
    );
  }

  if (variant === "stage") {
    return (
      <div className="stage__art" role="img" aria-label={alt}>
        {layers}
        <span className="stage__scrim" aria-hidden="true" />
        {frameButtons}
      </div>
    );
  }

  return (
    <span className="bp" role="img" aria-label={alt}>
      {layers}
      <span className="bp__scrim" aria-hidden="true" />
      {typeof index === "number" ? (
        <span className="bp__idx">{String(index).padStart(2, "0")}</span>
      ) : null}
      {tag ? <span className="bp__tag">{tag}</span> : null}
      <span className="bp__corner bp__corner--tl" aria-hidden="true" />
      <span className="bp__corner bp__corner--br" aria-hidden="true" />
      {frameButtons}
    </span>
  );
}

export function ExerciseThumb({ images, alt }: { images: string[]; alt: string }) {
  return <ArtBlock images={images} alt={alt} variant="row" />;
}
