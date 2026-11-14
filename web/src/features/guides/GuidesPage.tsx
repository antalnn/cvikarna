import { useEffect } from "react";
import { useLanguage } from "../../i18n/useLanguage";
import { guideContent } from "./guideContent";
import { ProteinDiagram, RepsDiagram, SleepDiagram } from "./GuideDiagrams";

const diagrams = {
  reps: RepsDiagram,
  protein: ProteinDiagram,
  sleep: SleepDiagram,
};

/** Renders **bold** spans inside guide copy without pulling in a markdown parser. */
function emphasize(text: string) {
  return text.split("**").map((part, index) =>
    index % 2 === 1 ? <strong key={index}>{part}</strong> : part,
  );
}

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

      <div className="guide-sections">
        {page.sections.map((section, index) => {
          const Diagram = section.diagram ? diagrams[section.diagram] : null;

          return (
            <details className="guide-section" key={section.id} open={index === 0}>
              <summary className="guide-section__summary">
                <span className="guide-section__index" aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h2 className="guide-section__title">{section.title}</h2>
                <span className="guide-section__lede">{section.lede}</span>
                <svg
                  className="guide-section__chevron"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </summary>

              <div className="guide-section__body">
                <div className="guide-takeaways">
                  <p className="guide-takeaways__label">{page.takeawaysLabel}</p>
                  <ul>
                    {section.takeaways.map((takeaway) => (
                      <li key={takeaway}>{takeaway}</li>
                    ))}
                  </ul>
                </div>

                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{emphasize(paragraph)}</p>
                ))}

                {section.bullets ? (
                  <ul className="guide-list">
                    {section.bullets.map((bullet) => (
                      <li key={bullet}>{emphasize(bullet)}</li>
                    ))}
                  </ul>
                ) : null}

                {Diagram ? (
                  <figure className="guide-figure">
                    <Diagram language={language} />
                    {section.diagramCaption ? (
                      <figcaption>{section.diagramCaption}</figcaption>
                    ) : null}
                  </figure>
                ) : null}

                <div className="guide-section__sources">
                  <h3>{page.sourcesLabel}</h3>
                  <ul>
                    {section.sources.map((source) => (
                      <li key={source.url}>
                        <a href={source.url} target="_blank" rel="noreferrer">
                          {source.label}
                        </a>
                        <span>{source.supports}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </details>
          );
        })}
      </div>

      <p className="guide__note">{page.disclaimer}</p>
    </article>
  );
}
