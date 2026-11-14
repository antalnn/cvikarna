import type { ReactNode } from "react";

interface SectionProps {
  title: string;
  children: ReactNode;
  className?: string;
}

/** One titled block of page content. New detail sections reuse this shell. */
export function Section({ title, children, className }: SectionProps) {
  return (
    <section className={["content-section", className].filter(Boolean).join(" ")}>
      <h2 className="content-section__title">{title}</h2>
      {children}
    </section>
  );
}
