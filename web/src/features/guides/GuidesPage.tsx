import { useEffect } from "react";
import { useLanguage } from "../../i18n/useLanguage";
import { guideContent } from "./guideContent";

export function GuidesPage() {
  const { language, t } = useLanguage();
  const page = guideContent[language];

  useEffect(() => {
    document.title = `${page.title} · ${t.brandName}`;
  }, [page.title, t.brandName]);

  return (
    <article className="guide">
      <p className="eyebrow">{page.eyebrow}</p>
      <h1 className="guide__title">{page.title}</h1>
      <p className="guide__lede">{page.lede}</p>

      {page.sections.map((section) => (
        <section className="guide-section" key={section.title}>
          <h2 className="guide-section__title">{section.title}</h2>
          {section.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
          {section.bullets ? (
            <ul className="guide-list">
              {section.bullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
          ) : null}
        </section>
      ))}

      <section className="guide-section guide-sources">
        <h2 className="guide-section__title">{page.sourcesTitle}</h2>
        <p>{page.sourcesNote}</p>
        <ol className="guide-sources__list">
          {page.sources.map((source) => (
            <li key={source.url}>
              <a href={source.url} target="_blank" rel="noreferrer">
                {source.label}
              </a>
              <span>{source.note}</span>
            </li>
          ))}
        </ol>
      </section>

      <p className="guide__note">{page.disclaimer}</p>
    </article>
  );
}
