import { useCallback, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchExercise, NotFoundError } from "../../api/library";
import { muscleGroupOf } from "../../api/types";
import { PhotoStage } from "../../components/PhotoStage";
import { ErrorState, NotFoundState } from "../../components/StateViews";
import { ExerciseHistory } from "./ExerciseHistory";
import { pick, useLanguage } from "../../i18n/useLanguage";
import { useAsync } from "../../lib/useAsync";

export function ExerciseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const exerciseId = Number(id);
  const load = useCallback(() => fetchExercise(exerciseId), [exerciseId]);
  const state = useAsync(load);
  const { language, t } = useLanguage();

  const loadedName =
    state.status === "success" ? pick(language, state.data.nameCs, state.data.nameEn) : undefined;

  useEffect(() => {
    if (loadedName) {
      document.title = `${loadedName} · ${t.brandName}`;
    }
  }, [loadedName, t.brandName]);

  if (state.status === "loading") {
    return (
      <div className="state">
        <p className="state__text" role="status">
          {t.loading}
        </p>
      </div>
    );
  }

  if (state.status === "error") {
    if (state.error instanceof NotFoundError) {
      return (
        <div className="state">
          <NotFoundState />
        </div>
      );
    }

    return <ErrorState onRetry={state.retry} />;
  }

  const exercise = state.data;
  const name = pick(language, exercise.nameCs, exercise.nameEn);
  const alt = pick(language, exercise.nameEn, exercise.nameCs);
  const instructions = pick(language, exercise.instructionsCs, exercise.instructionsEn);
  const cues = pick(language, exercise.cuesCs, exercise.cuesEn);
  const aliases = pick(language, exercise.aliasesCs, exercise.aliasesEn);
  const secondary = exercise.secondaryMuscles.map((muscle) => t.muscleFine[muscle]);

  return (
    <>
      <Link className="back-link" to="/">
        <span aria-hidden="true">←</span> {t.backToLibrary}
      </Link>

      <article className="detail">
        <div className="detail__media">
          <PhotoStage images={exercise.images} name={name} />

          <div className="facts">
            <div className="facts__cell">
              <span className="facts__label">{t.muscleFilterLabel}</span>
              <span className="facts__value">{t.muscleFine[exercise.primaryMuscle]}</span>
            </div>
            <div className="facts__cell">
              <span className="facts__label">{t.secondaryLabel}</span>
              <span className="facts__value">{secondary.length > 0 ? secondary.join(", ") : "—"}</span>
            </div>
            <div className="facts__cell">
              <span className="facts__label">{t.aliasesLabel}</span>
              <span className="facts__value">{aliases.length > 0 ? aliases.join(", ") : "—"}</span>
            </div>
          </div>
        </div>

        <div className="detail__body">
          <div className="detail__badges">
            <span className="badge badge--accent">{t.muscle[muscleGroupOf(exercise.primaryMuscle)]}</span>
            <span className="badge badge--muted">{t.equipment[exercise.equipment]}</span>
            <span className="badge badge--muted">{t.level[exercise.level]}</span>
          </div>

          <h1 className="detail__title">{name}</h1>
          <p className="detail__alt" lang={pick(language, "en", "cs")}>
            {alt}
          </p>

          <section className="section">
            <h2 className="section__title">{t.sectionInstructions}</h2>
            <ol className="steps">
              {instructions.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </section>

          <section className="section">
            <h2 className="section__title">{t.sectionCues}</h2>
            <ul className="cues">
              {cues.map((cue) => (
                <li key={cue}>{cue}</li>
              ))}
            </ul>
          </section>
        </div>
      </article>

      <ExerciseHistory exerciseId={exercise.id} primaryMuscle={exercise.primaryMuscle} />
    </>
  );
}
