import { Link } from "react-router-dom";
import { useLanguage } from "../i18n/useLanguage";

export function SkeletonGrid({ count = 8 }: { count?: number }) {
  const { t } = useLanguage();

  return (
    <>
      <p className="visually-hidden" role="status">
        {t.loading}
      </p>
      <ul className="grid" aria-hidden="true">
        {Array.from({ length: count }, (_, index) => (
          <li key={index} className="skeleton-card">
            <div className="skeleton skeleton-card__media" />
            <div className="skeleton-card__body">
              <div className="skeleton skeleton--title" />
              <div className="skeleton skeleton--line" />
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}

export function EmptyState({ onClear }: { onClear: () => void }) {
  const { t } = useLanguage();

  return (
    <div className="state">
      <p className="state__title">{t.emptyTitle}</p>
      <p className="state__text">{t.emptyText}</p>
      <button className="button" type="button" onClick={onClear}>
        {t.clearFilters}
      </button>
    </div>
  );
}

export function ErrorState({ onRetry }: { onRetry: () => void }) {
  const { t } = useLanguage();

  return (
    <div className="state state--error" role="alert">
      <p className="state__title">{t.errorTitle}</p>
      <p className="state__text">{t.errorText}</p>
      <button className="button button--accent" type="button" onClick={onRetry}>
        {t.retry}
      </button>
    </div>
  );
}

export function NotFoundState() {
  const { t } = useLanguage();

  return (
    <div className="state">
      <p className="state__title">{t.notFoundTitle}</p>
      <p className="state__text">{t.notFoundText}</p>
      <Link className="button" to="/">
        {t.backToLibrary}
      </Link>
    </div>
  );
}
