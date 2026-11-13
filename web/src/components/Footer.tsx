import { useLanguage } from "../i18n/useLanguage";

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <span>{t.footerDataset}</span>
        <span>{t.footerNote}</span>
      </div>
    </footer>
  );
}
