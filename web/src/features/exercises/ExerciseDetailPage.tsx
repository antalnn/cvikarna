import { useCallback, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchExercise, fetchExercises, NotFoundError } from "../../api/library";
import { muscleGroupOf } from "../../api/types";
import type { Exercise } from "../../api/types";
import { ExerciseCard } from "../../components/ExerciseCard";
import { PhotoStage } from "../../components/PhotoStage";
import { Section } from "../../components/Section";
import { ErrorState, NotFoundState } from "../../components/StateViews";
import { pick, useLanguage } from "../../i18n/useLanguage";
import { useAsync } from "../../lib/useAsync";

export function ExerciseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const exerciseId = Number(id);
  const load = useCallback(() => fetchExercise(exerciseId), [exerciseId]);
  const state = useAsync(load);
  const { language, t } = useLanguage();

  const loaded = state.status === "success" ? state.data : null;

  const similarLoad = useCallback(() => {
    if (!loaded) {
      return Promise.resolve<Exercise[]>([]);
    }

    return fetchExercises({
      muscle: muscleGroupOf(loaded.primaryMuscle),
      equipment: "all",
      level: "all",
      q: "",
    });
  }, [loaded]);
  const similarState = useAsync(similarLoad);

  const loadedName = loaded
    ? pick(language, loaded.nameCs, loaded.nameEn)
    : undefined;

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
  const instructions = pick(language, exercise.instructionsCs, exercise.instructionsEn);
  const cues = pick(language, exercise.cuesCs, exercise.cuesEn);
  const aliases = pick(language, exercise.aliasesCs, exercise.aliasesEn);
  const secondary = exercise.secondaryMuscles.map((muscle) => t.muscleFine[muscle]);
  const similarItems =
    similarState.status === "success"
      ? similarState.data.filter((item) => item.id !== exercise.id).slice(0, 4)
      : [];

  return (
    <>
      <Link className="back-link" to="/">
        <span aria-hidden="true">←</span> {t.backToLibrary}
      </Link>

      <article className="detail">
        <div className="detail-hero">
          <div className="detail__media">
            <PhotoStage images={exercise.images} name={name} />
          </div>

          <div className="detail__intro">
            <div className="detail__badges">
              <span className="badge badge--accent">
                {t.muscle[muscleGroupOf(exercise.primaryMuscle)]}
              </span>
              <span className="badge badge--muted">{t.equipment[exercise.equipment]}</span>
              <span className={`level-tag level-tag--${exercise.level}`}>{t.level[exercise.level]}</span>
            </div>

            <h1 className="detail__title">{name}</h1>

            <div className="detail__meta">
              <div className="detail__meta-row">
                <span className="detail__meta-label">{t.muscleFilterLabel}</span>
                <span className="detail__meta-value">{t.muscleFine[exercise.primaryMuscle]}</span>
              </div>
              <div className="detail__meta-row">
                <span className="detail__meta-label">{t.secondaryLabel}</span>
                <span className="detail__meta-value">
                  {secondary.length > 0 ? secondary.join(", ") : "—"}
                </span>
              </div>
              <div className="detail__meta-row">
                <span className="detail__meta-label">{t.aliasesLabel}</span>
                <span className="detail__meta-value">
                  {aliases.length > 0 ? aliases.join(", ") : "—"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="detail-sections">
          <Section title={t.sectionInstructions}>
            <ol className="steps">
              {instructions.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </Section>

          <Section title={t.sectionCues}>
            <ul className="cues">
              {cues.map((cue) => (
                <li key={cue}>{cue}</li>
              ))}
            </ul>
          </Section>
        </div>

        {similarItems.length > 0 ? (
          <Section title={t.sectionSimilar} className="detail-similar">
            <ul className="grid">
              {similarItems.map((item) => (
                <ExerciseCard key={item.id} exercise={item} />
              ))}
            </ul>
          </Section>
        ) : null}
      </article>
    </>
  );
}
