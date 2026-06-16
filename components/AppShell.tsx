"use client";

import type { CSSProperties, ReactNode } from "react";
import { SEASON } from "@/lib/season";

// App-like shell: sticky branded top bar + centered content column. The current
// team accent is exposed as the CSS variable `--team` for descendants.
export default function AppShell({
  accent,
  right,
  onHome,
  season,
  seasons,
  onSeasonChange,
  children,
}: {
  accent?: string;
  right?: ReactNode;
  onHome?: () => void;
  // When provided, the season badge becomes a selectable dropdown.
  season?: string;
  seasons?: string[];
  onSeasonChange?: (season: string) => void;
  children: ReactNode;
}) {
  const style = accent
    ? ({ "--team": accent } as CSSProperties)
    : undefined;

  const seasonControl =
    season && seasons && onSeasonChange ? (
      <select
        value={season}
        onChange={(e) => onSeasonChange(e.target.value)}
        aria-label="시즌 선택"
        className="ml-1 cursor-pointer rounded-full border border-line bg-surface px-2 py-0.5 text-[11px] font-medium text-muted transition hover:border-zinc-600 hover:text-zinc-200 focus:outline-none"
      >
        {seasons.map((s) => (
          <option key={s} value={s} className="bg-surface text-foreground">
            {s}
          </option>
        ))}
      </select>
    ) : (
      <span className="ml-1 rounded-full border border-line px-2 py-0.5 text-[11px] font-medium text-muted">
        {season ?? SEASON}
      </span>
    );

  const brand = (
    <>
      <span
        className="flex h-7 w-7 items-center justify-center rounded-md text-sm"
        style={{ backgroundColor: accent ?? "var(--team)" }}
      >
        🏁
      </span>
      <span className="font-display text-sm font-extrabold uppercase tracking-[0.18em]">
        F1 Dash
      </span>
    </>
  );

  return (
    <div className="flex flex-1 flex-col" style={style}>
      <header className="sticky top-0 z-30 border-b border-line/70 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2.5">
            {onHome ? (
              <button
                onClick={onHome}
                aria-label="대시보드 메인으로"
                className="flex items-center gap-2.5 rounded-lg transition hover:opacity-80"
              >
                {brand}
              </button>
            ) : (
              <div className="flex items-center gap-2.5">{brand}</div>
            )}
            {seasonControl}
          </div>
          {right}
        </div>
      </header>

      <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:py-8">
        {children}
      </div>
    </div>
  );
}
