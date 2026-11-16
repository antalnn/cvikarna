import type { CSSProperties, ReactNode } from "react";

const PATHS: Record<string, string> = {
  "i-pulse": "M3 12h4l2.5-7 4 14 2.5-7h5",
  "i-book": "M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15.5H6.5A2.5 2.5 0 0 0 4 21V5.5ZM4 18.5A2.5 2.5 0 0 1 6.5 16H20",
  "i-bar": "M3 9v6M6 7v10M18 7v10M21 9v6M6 12h12",
  "i-cal": "M3.5 5h17v15.5h-17zM3.5 10h17M8 3v4M16 3v4",
  "i-compass": "M12 3.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 0 0 0-17ZM14.8 9.2l-1.6 4-4 1.6 1.6-4 4-1.6Z",
  "i-search": "M11 4.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13ZM16 16l4 4",
  "i-plus": "M12 5v14M5 12h14",
  "i-pencil": "M4 20h4l10-10a2.8 2.8 0 0 0-4-4L4 16v4ZM14.5 6.5l3 3",
  "i-chevron": "m6 9 6 6 6-6",
  "i-arrow": "M5 12h14M13 6l6 6-6 6",
  "i-check": "m5 12.5 4.5 4.5L19 7",
  "i-x": "m6 6 12 12M18 6 6 18",
  "i-clock": "M12 3.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 0 0 0-17ZM12 7.5V12l3 2",
  "i-play": "M8 5.5v13l10-6.5-10-6.5Z",
  "i-pause": "M9 5v14M15 5v14",
  "i-reset": "M4 12a8 8 0 1 0 2.6-5.9M4 4v5h5",
  "i-flame": "M12 3c3.5 4 5.5 6.4 5.5 9.5A5.5 5.5 0 0 1 12 18a5.5 5.5 0 0 1-5.5-5.5C6.5 9.4 8.5 7 12 3ZM12 18c0 1.2-.6 2.2-1.6 2.8",
  "i-trend": "M4 16.5 9 11l3.5 3.5L20 7M15 7h5v5",
  "i-copy": "M9 9h11v11H9zM15 9V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h3",
  "i-info": "M12 3.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 0 0 0-17ZM12 11v5.5M12 8h.01",
  "i-globe": "M12 3.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 0 0 0-17ZM3.5 12h17M12 3.5c2.4 2.6 3.5 5.4 3.5 8.5S14.4 18.4 12 20.5c-2.4-2.1-3.5-5.4-3.5-8.5S9.6 6.1 12 3.5Z",
  "i-grid": "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z",
  "i-trash": "M4 7h16M9.5 7V4.8h5V7M6.4 7l.9 12.2h9.4L17.6 7M10 10.5v5.5M14 10.5v5.5",
};

const DOTS: Record<string, Array<[number, number]>> = {
  "i-grip": [
    [9, 6],
    [15, 6],
    [9, 12],
    [15, 12],
    [9, 18],
    [15, 18],
  ],
  "i-more": [
    [12, 5.5],
    [12, 12],
    [12, 18.5],
  ],
};

function symbolChildren(id: string): ReactNode {
  const dots = DOTS[id];
  if (dots) {
    return dots.map(([cx, cy]) => <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={1.6} fill="currentColor" stroke="none" />);
  }
  const path = PATHS[id];
  return path ? <path d={path} /> : null;
}

const ALL = [...Object.keys(PATHS), ...Object.keys(DOTS)];

export function Sprite() {
  return (
    <svg className="sprite" aria-hidden="true" focusable="false">
      <defs>
        {ALL.map((id) => (
          <symbol key={id} id={id} viewBox="0 0 24 24">
            {symbolChildren(id)}
          </symbol>
        ))}
      </defs>
    </svg>
  );
}

export function Icon({
  name,
  className = "ico",
  style,
}: {
  name: string;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <svg className={className} aria-hidden="true" style={style}>
      <use href={`#${name}`} />
    </svg>
  );
}

export function BrandMark({ className = "mark" }: { className?: string }) {
  return (
    <span className={className} aria-hidden="true">
      <svg viewBox="0 0 32 32">
        <path d="M7 10v12M25 10v12M16 5v22M2 16h28" />
      </svg>
    </span>
  );
}
