import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { ArtBlock } from "../../components/ArtBlock";
import { Icon } from "../../components/Icon";
import { useLanguage } from "../../i18n/useLanguage";
import { useApp } from "../../state/useApp";
import { fetchExercise } from "../../api/library";
import { fetchStats } from "../../api/workout";
import type { Exercise, ExerciseStats } from "../../api/types";
import { muscleGroupOf } from "../../api/types";
import { fmt } from "../../lib/format";
import {
  LEVEL_LABEL,
  MUSCLE_LABEL,
  equipmentLabel,
  pairText,
} from "../../lib/labels";

export function ExerciseDetailPage() {
  const { lang, tx } = useLanguage();
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { catalogue, library, savedIds, toggleSaved, addExercise, today, demoState } = useApp();
  const exerciseId = Number(id);
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [stats, setStats] = useState<ExerciseStats | null>(null);
  const [phase, setPhase] = useState<"loading" | "ready" | "error">("loading");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const from = (location.state as { from?: string } | null)?.from;

  useEffect(() => {
    let cancelled = false;
    setPhase("loading");
    setExercise(null);
    setStats(null);
    void Promise.all([fetchExercise(exerciseId), fetchStats(exerciseId).catch(() => null)]).then(
      ([row, rowStats]) => {
        if (!cancelled) {
          setExercise(row);
          setStats(rowStats);
          setPhase("ready");
        }
      },
      (reason: unknown) => {
        if (!cancelled) {
          setError(reason instanceof Error ? reason.message : tx("Cvik se nenačetl", "The movement did not load"));
          setPhase("error");
        }
      },
    );
    return () => {
      cancelled = true;
    };
  }, [exerciseId, tx]);

  const index = catalogue.findIndex((row) => row.id === exerciseId);
  const previous = index > 0 ? catalogue[index - 1] : catalogue[catalogue.length - 1];
  const next = index >= 0 ? catalogue[(index + 1) % catalogue.length] : undefined;

  const similar = useMemo(() => {
    if (!exercise) {
      return [];
    }
    const group = muscleGroupOf(exercise.primaryMuscle);
    return library
      .filter((row) => row.id !== exercise.id && muscleGroupOf(row.primaryMuscle) === group)
      .sort((left, right) => {
        const leftSame = left.primaryMuscle === exercise.primaryMuscle ? 0 : 1;
        const rightSame = right.primaryMuscle === exercise.primaryMuscle ? 0 : 1;
        if (leftSame !== rightSame) {
          return leftSame - rightSame;
        }
        return (lang === "cs" ? left.nameCs : left.nameEn).localeCompare(
          lang === "cs" ? right.nameCs : right.nameEn,
          lang === "cs" ? "cs" : "en",
        );
      });
  }, [exercise, lang, library]);

  const backLabel =
    from === "dnes"
      ? tx("Zpět na Dnes", "Back to Today")
      : from === "trenink"
        ? tx("Zpět na trénink", "Back to the session")
        : tx("Knihovna", "Library");
  const backTo = from === "dnes" ? "/" : from === "trenink" ? "/tracker" : "/library";
  const saved = savedIds.has(exerciseId);
  const inSession = today?.exercises.some((item) => item.exerciseId === exerciseId) ?? false;

  if (phase === "loading" || demoState === "loading") {
    return (
      <div className="page">
        <div className="detail">
          <div className="detail__stage">
            <div className="skeleton">
              <div className="skeleton__media sk" style={{ aspectRatio: "16 / 11" }} />
            </div>
          </div>
          <div className="detail__intro">
            <div className="sk sk--title" />
            <div className="sk sk--line" />
            <div className="sk sk--line" style={{ marginTop: "var(--space-3)" }} />
          </div>
        </div>
      </div>
    );
  }

  if (phase === "error" || demoState === "error" || !exercise) {
    return (
      <div className="page">
        <Link className="back-link" to={backTo}>
          <Icon name="i-arrow" className="ico ico--sm" style={{ transform: "rotate(180deg)" }} />
          {backLabel}
        </Link>
        <div className="stateview stateview--error">
          <span className="stateview__icon">
            <Icon name="i-info" />
          </span>
          <p className="stateview__title">{tx("Cvik se nenačetl", "The movement did not load")}</p>
          <p className="stateview__text">
            {error || tx("Tento cvik neexistuje, nebo se ho nepodařilo načíst.", "This movement does not exist, or it could not load.")}
          </p>
          <div className="stateview__actions">
            <Link className="btn" to="/library">
              {tx("Zpět do knihovny", "Back to the library")}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const name = lang === "cs" ? exercise.nameCs : exercise.nameEn;
  const other = lang === "cs" ? exercise.nameEn : exercise.nameCs;
  const steps = lang === "cs" ? exercise.instructionsCs : exercise.instructionsEn;
  const cues = lang === "cs" ? exercise.cuesCs : exercise.cuesEn;
  const muscleName = pairText(MUSCLE_LABEL[exercise.primaryMuscle], lang);
  const equipmentName = equipmentLabel(exercise.equipment, lang);

  return (
    <div className="page">
      <Link className="back-link" to={backTo}>
        <Icon name="i-arrow" className="ico ico--sm" style={{ transform: "rotate(180deg)" }} />
        {backLabel}
      </Link>

      <div className="detail">
        <div className="detail__stage">
          <div className="stage">
            <ArtBlock images={exercise.images} alt={name} variant="stage" />
            <span className="stage__caption">
              {tx("Dráha pohybu", "Movement path")} · {equipmentName}
            </span>
            <div className="stage__nav">
              <button
                className="iconbtn"
                type="button"
                aria-label={tx("Předchozí", "Previous")}
                disabled={!previous}
                onClick={() => previous && navigate(`/exercise/${previous.id}`, { state: location.state })}
              >
                <Icon name="i-arrow" className="ico ico--sm" style={{ transform: "rotate(180deg)" }} />
              </button>
              <span className="stage__pos">
                {index >= 0 ? String(index + 1).padStart(2, "0") : "—"} / {catalogue.length || "—"}
              </span>
              <button
                className="iconbtn"
                type="button"
                aria-label={tx("Další", "Next")}
                disabled={!next}
                onClick={() => next && navigate(`/exercise/${next.id}`, { state: location.state })}
              >
                <Icon name="i-arrow" className="ico ico--sm" />
              </button>
            </div>
          </div>
        </div>

        <div className="detail__intro">
          <div className="detail__badges">
            <span className="tag tag--accent">{muscleName}</span>
            <span className="tag">{equipmentName}</span>
            <span className={`tag ${LEVEL_LABEL[exercise.level].cls}`}>
              {pairText(LEVEL_LABEL[exercise.level], lang)}
            </span>
          </div>
          <h1 className="display display--md">{name}</h1>
          {other && other !== name ? <p className="detail__en">{other}</p> : null}

          <dl className="meta">
            <div>
              <dt>{tx("Primární sval", "Primary muscle")}</dt>
              <dd>{muscleName}</dd>
            </div>
            <div>
              <dt>{tx("Nářadí", "Equipment")}</dt>
              <dd>{equipmentName}</dd>
            </div>
            <div>
              <dt>{tx("Náročnost", "Level")}</dt>
              <dd>{pairText(LEVEL_LABEL[exercise.level], lang)}</dd>
            </div>
            <div>
              <dt>{tx("Osobní rekord", "Personal best")}</dt>
              <dd className="num">
                {stats?.bestWeightKg ? `${fmt(stats.bestWeightKg, lang)} kg` : tx("zatím žádný", "none yet")}
              </dd>
            </div>
          </dl>

          <div className="detail__actions">
            <button
              className="btn btn--primary"
              type="button"
              disabled={inSession}
              onClick={() => void addExercise(exercise.id)}
            >
              <Icon name={inSession ? "i-check" : "i-plus"} className="ico ico--sm" />
              {inSession ? tx("V tréninku", "In the session") : tx("Přidat do tréninku", "Add to session")}
            </button>
            <button
              className="btn btn--quiet"
              type="button"
              aria-pressed={saved}
              disabled={saving}
              onClick={() => {
                setSaving(true);
                void toggleSaved(exercise.id).finally(() => setSaving(false));
              }}
            >
              <Icon name={saved ? "i-check" : "i-plus"} className="ico ico--sm" />
              {saved ? tx("V knihovně", "In the library") : tx("Uložit do knihovny", "Save to the library")}
            </button>
          </div>
        </div>
      </div>

      <div className="detail__cols" style={{ marginTop: "var(--space-7)" }}>
        <section className="content-section">
          <h2 className="content-section__title">{tx("Provedení", "How to do it")}</h2>
          {steps.length ? (
            <ol className="steps">
              {steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          ) : (
            <p className="ex__empty">
              {tx(
                "U tohoto cviku zatím nemáme popis provedení. Zapiš si ho do tréninku vlastními slovy.",
                "We have no step-by-step for this movement yet. Write your own in the session notes.",
              )}
            </p>
          )}
        </section>
        <section className="content-section">
          <h2 className="content-section__title">{tx("Na co si dát pozor", "What to watch for")}</h2>
          {cues.length ? (
            <ul className="cues">
              {cues.map((cue) => (
                <li key={cue}>{cue}</li>
              ))}
            </ul>
          ) : (
            <p className="ex__empty">{tx("Tipy k tomuto cviku zatím nemáme.", "No cues for this movement yet.")}</p>
          )}
        </section>
      </div>

      {similar.length ? <SimilarRow rows={similar} lang={lang} tx={tx} /> : null}
    </div>
  );
}

function SimilarRow({
  rows,
  lang,
  tx,
}: {
  rows: Exercise[];
  lang: "cs" | "en";
  tx: (cs: string, en: string) => string;
}) {
  const trackRef = useRef<HTMLUListElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) {
      return;
    }
    const sync = () => {
      setCanPrev(track.scrollLeft > 4);
      setCanNext(track.scrollLeft + track.clientWidth < track.scrollWidth - 4);
    };
    sync();
    track.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    return () => {
      track.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
    };
  }, [rows.length]);

  const scroll = (direction: number) => {
    const track = trackRef.current;
    if (!track) {
      return;
    }
    track.scrollBy({
      left: direction * Math.max(240, Math.round(track.clientWidth * 0.8)),
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
    });
  };

  return (
    <section className="similar" aria-labelledby="similarTitle">
      <div className="similar__head">
        <h2 className="content-section__title" id="similarTitle">
          {tx("Podobné cviky", "Similar movements")}
        </h2>
        <div className="similar__tools">
          <button
            className="iconbtn"
            type="button"
            aria-label={tx("Předchozí podobné cviky", "Previous similar movements")}
            disabled={!canPrev}
            onClick={() => scroll(-1)}
          >
            <Icon name="i-arrow" className="ico ico--sm" style={{ transform: "rotate(180deg)" }} />
          </button>
          <button
            className="iconbtn"
            type="button"
            aria-label={tx("Další podobné cviky", "More similar movements")}
            disabled={!canNext}
            onClick={() => scroll(1)}
          >
            <Icon name="i-arrow" className="ico ico--sm" />
          </button>
        </div>
      </div>
      <ul className="similar__track" ref={trackRef}>
        {rows.map((row, position) => {
          const name = lang === "cs" ? row.nameCs : row.nameEn;
          return (
            <li className="mcard" key={row.id} style={{ "--i": position } as CSSProperties}>
              <div className="mcard__link">
                <Link
                  className="mcard__cover"
                  to={`/exercise/${row.id}`}
                  state={{ from: "knihovna" }}
                  aria-label={name}
                />
                <span className="mcard__body">
                  <span className="mcard__head">
                    <span className="mcard__title">{name}</span>
                  </span>
                  <span className="mcard__meta">
                    <span className="tag">{pairText(MUSCLE_LABEL[row.primaryMuscle], lang)}</span>
                    <span className="tag">{equipmentLabel(row.equipment, lang)}</span>
                  </span>
                </span>
                <ArtBlock
                  images={row.images}
                  alt={name}
                  index={position + 1}
                  tag={pairText(MUSCLE_LABEL[row.primaryMuscle], lang)}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

