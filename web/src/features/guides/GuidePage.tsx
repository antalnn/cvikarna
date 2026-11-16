import { useState, type ReactNode } from "react";
import { Icon } from "../../components/Icon";
import { useLanguage } from "../../i18n/useLanguage";
import { guideContent } from "./guideContent";
import { GuideFigure } from "./GuideFigures";

const HINTS: Record<string, { cs: string; en: string }> = {
  training: { cs: "6–12 opakování", en: "6–12 reps" },
  protein: { cs: "1,6–2,2 g/kg", en: "1.6–2.2 g/kg" },
  calories: { cs: "přebytek 200–300 kcal", en: "200–300 kcal surplus" },
  sleep: { cs: "7–9 hodin", en: "7–9 hours" },
  recovery: { cs: "48 h na skupinu", en: "48 h per muscle" },
};

/** Inline **bold** inside the guide copy, without injecting HTML. */
function inline(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    return <span key={index}>{part}</span>;
  });
}

export function GuidePage() {
  const { lang, tx, pick } = useLanguage();
  const content = guideContent[lang];
  const [openId, setOpenId] = useState<string | null>("training");

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <p className="eyebrow">{tx("Věda, ne mýty", "Evidence, not myths")}</p>
          <h1 className="display display--md">{content.title}</h1>
          <p className="lede">{content.lede}</p>
        </div>
      </header>

      <div className="guide">
        {content.sections.map((section, index) => {
          const open = openId === section.id;
          const hint = HINTS[section.id];
          return (
            <article className="acc" key={section.id}>
              <h2>
                <button
                  className="acc__head"
                  type="button"
                  aria-expanded={open}
                  aria-controls={`acc-${section.id}`}
                  onClick={() => setOpenId(open ? null : section.id)}
                >
                  <span className="acc__num">{String(index + 1).padStart(2, "0")}</span>
                  <span className="acc__title">{section.title}</span>
                  <span className="acc__hint">{hint ? pick(hint) : ""}</span>
                  <Icon name="i-chevron" />
                </button>
              </h2>
              <div className="acc__panel" id={`acc-${section.id}`} hidden={!open}>
                <p className="acc__lede">{section.lede}</p>
                <div className="acc__points">
                  <p className="micro acc__label">{content.takeawaysLabel}</p>
                  <ul className="keypoints">
                    {section.takeaways.map((point) => (
                      <li key={point}>
                        <Icon name="i-check" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="acc__grid">
                  <div className="acc__main">
                    <div className="acc__copy">
                      {section.paragraphs.map((paragraph) => (
                        <p key={paragraph}>{inline(paragraph)}</p>
                      ))}
                    </div>
                    {section.bullets ? (
                      <ul className="acc__bullets">
                        {section.bullets.map((bullet) => (
                          <li key={bullet}>{inline(bullet)}</li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                  <div className="acc__aside">
                    {section.diagram ? (
                      <>
                        <GuideFigure kind={section.diagram} />
                        {section.diagramCaption ? (
                          <p className="figure__caption">{section.diagramCaption}</p>
                        ) : null}
                      </>
                    ) : null}
                    <div className="acc__sources">
                      <p className="micro acc__label">{content.sourcesLabel}</p>
                      <ul className="sources">
                        {section.sources.map((source) => (
                          <li key={source.url}>
                            <a href={source.url} target="_blank" rel="noopener noreferrer">
                              {source.label}
                            </a>
                            <span className="sources__claim">{source.supports}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <p className="guide__disclaimer">{content.disclaimer}</p>
    </div>
  );
}
