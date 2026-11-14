import { Link } from "react-router-dom";
import { muscleGroupOf } from "../api/types";
import type { Exercise } from "../api/types";
import { pick, useLanguage } from "../i18n/useLanguage";

export function ExerciseCard({ exercise }: { exercise: Exercise }) {
  const { language, t } = useLanguage();
  const name = pick(language, exercise.nameCs, exercise.nameEn);
  const photo = exercise.images[exercise.coverIndex ?? 0];

  return (
    <li>
      <Link className="card" to={`/exercise/${exercise.id}`}>
        <div className="card__media">
          {photo ? <img className="card__img" src={photo} alt="" loading="lazy" /> : null}
          <span className="card__badge badge">{t.muscle[muscleGroupOf(exercise.primaryMuscle)]}</span>
        </div>
        <div className="card__body">
          <h3 className="card__title">{name}</h3>
          <div className="card__tags">
            <span className="tag">{t.equipment[exercise.equipment]}</span>
            <span className="tag">{t.level[exercise.level]}</span>
          </div>
        </div>
      </Link>
    </li>
  );
}
