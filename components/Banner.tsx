"use client";

import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

export interface BannerItem {
  id: string;
  title: string;
  subtitle?: string;
}

// Promo banner shown below the team grid. When more than one item exists it
// auto-advances left→right every 2.5s and exposes prev/next arrows + dots.
// Tapping the active slide bubbles up via `onItemClick` (the parent shows a
// "coming soon" modal for now).
export default function Banner({
  items,
  onItemClick,
}: {
  items: BannerItem[];
  onItemClick: (item: BannerItem) => void;
}) {
  const [index, setIndex] = useState(0);
  const count = items.length;

  // Auto-advance every 2.5s; only meaningful with multiple slides.
  useEffect(() => {
    if (count <= 1) return;
    const id = setInterval(
      () => setIndex((i) => (i + 1) % count),
      2500,
    );
    return () => clearInterval(id);
  }, [count]);

  if (count === 0) return null;

  const active = items[index];
  const go = (next: number) => setIndex(((next % count) + count) % count);

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-line">
      <button
        onClick={() => onItemClick(active)}
        className="team-glow group flex w-full items-center justify-between gap-4 px-5 py-5 text-left transition sm:px-6"
      >
        <div className="flex items-center gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-elevated text-team">
            <Sparkles className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <p className="font-display text-base font-bold leading-tight sm:text-lg">
              {active.title}
            </p>
            {active.subtitle ? (
              <p className="mt-0.5 truncate text-sm text-muted">
                {active.subtitle}
              </p>
            ) : null}
          </div>
        </div>
        <span className="hidden shrink-0 items-center gap-1 text-xs font-semibold text-muted transition group-hover:text-foreground sm:flex">
          자세히 보기
          <ChevronRight className="h-4 w-4" />
        </span>
      </button>

      {count > 1 && (
        <>
          <button
            onClick={() => go(index - 1)}
            aria-label="이전 배너"
            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-1 text-zinc-300 backdrop-blur transition hover:bg-black/60 hover:text-foreground"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => go(index + 1)}
            aria-label="다음 배너"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-1 text-zinc-300 backdrop-blur transition hover:bg-black/60 hover:text-foreground"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5">
            {items.map((it, i) => (
              <button
                key={it.id}
                onClick={() => go(i)}
                aria-label={`배너 ${i + 1}`}
                className={`h-1.5 rounded-full transition-all ${
                  i === index ? "w-4 bg-team" : "w-1.5 bg-zinc-600"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
