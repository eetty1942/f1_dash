import type { CSSProperties } from "react";

// Season-wide round progress bar with an F1 car marker at the leading edge.
// Season progress is the same for every team/driver, so this lives on the
// (common) team-selection page rather than per-driver detail.
export default function SeasonProgress({
  completed,
  total,
  accent,
}: {
  completed: number;
  total: number;
  accent: string;
}) {
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  // Keep the car fully visible inside the track at both extremes.
  const carLeft = `calc(${Math.min(Math.max(pct, 0), 100)}% - 14px)`;

  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between text-xs">
        <span className="font-semibold uppercase tracking-wide text-muted">
          시즌 진행률
        </span>
        <span className="tabular-nums text-zinc-300">
          {completed} / {total} 라운드 · {pct}%
        </span>
      </div>
      <div className="relative h-2.5 rounded-full bg-black/40">
        <div
          className="h-2.5 rounded-full transition-[width] duration-500"
          style={{ width: `${pct}%`, backgroundColor: accent }}
        />
        <RaceCar
          className="absolute top-1/2 h-6 w-6 -translate-y-1/2 drop-shadow"
          style={{ left: carLeft, color: accent }}
        />
      </div>
    </div>
  );
}

// Minimalist top-down F1 car silhouette (front wing, cockpit, rear wing, wheels).
function RaceCar({
  className,
  style,
}: {
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <svg
      viewBox="0 0 64 32"
      fill="currentColor"
      className={className}
      style={style}
      aria-hidden
    >
      {/* body */}
      <path d="M6 16c0-2 2-3 5-3h10l6-4h6l2 4h12c4 0 7 1 9 3 -2 2-5 3-9 3H35l-2 4h-6l-6-4H11c-3 0-5-1-5-3z" />
      {/* front wing */}
      <rect x="2" y="11" width="4" height="10" rx="1" />
      {/* rear wing */}
      <rect x="58" y="9" width="4" height="14" rx="1" />
      {/* wheels */}
      <rect x="16" y="4" width="9" height="5" rx="2" fill="#18181b" />
      <rect x="16" y="23" width="9" height="5" rx="2" fill="#18181b" />
      <rect x="42" y="3" width="10" height="6" rx="2" fill="#18181b" />
      <rect x="42" y="23" width="10" height="6" rx="2" fill="#18181b" />
    </svg>
  );
}
