"use client";

import { useEffect, useState } from "react";

// F1-opening-style splash. Real start-light sequence (5 lights illuminate one
// per second, then all go out together 2.5s later → "lights out"), looping.
// A simple car silhouette glides across the title line, vanishing over the text.
// The whole screen is clickable to skip to team selection.
export default function Intro({
  season,
  onStart,
}: {
  season: string;
  onStart: () => void;
}) {
  const lit = useStartLights();

  return (
    <button
      onClick={onStart}
      aria-label="대시보드 시작"
      className="group relative flex w-full flex-1 cursor-pointer items-center justify-center overflow-hidden bg-black text-white"
    >
      {/* background video (drop a licensed clip at public/intro.mp4 / .webm) */}
      <video
        className="pointer-events-none absolute inset-0 h-full w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
      >
        <source src="/intro.mp4" type="video/mp4" />
        <source src="/intro.webm" type="video/webm" />
      </video>

      {/* readability overlay above the video, below the content */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/60 via-black/45 to-black/70" />

      {/* foreground content — fills the whole button so the bottom-anchored CTA
          sits at the true bottom (not overlapping the centered title) */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center">
      {/* speed streaks */}
      <div className="pointer-events-none absolute inset-0 opacity-40">
        {[0, 1, 2, 3, 4].map((i) => (
          <span
            key={i}
            className="intro-streak absolute h-px w-1/2 bg-gradient-to-r from-transparent via-red-600 to-transparent"
            style={{
              top: `${15 + i * 18}%`,
              animationDuration: `${2.2 + i * 0.5}s`,
              animationDelay: `${i * 0.3}s`,
            }}
          />
        ))}
      </div>

      {/* car silhouette — glides across the title line, hidden over the text */}
      <div className="intro-car pointer-events-none absolute left-0 top-1/2 z-0">
        <svg viewBox="0 0 64 32" className="h-10 w-20 text-red-600" fill="currentColor">
          <path d="M6 16c0-2 2-3 5-3h10l6-4h6l2 4h12c4 0 7 1 9 3 -2 2-5 3-9 3H35l-2 4h-6l-6-4H11c-3 0-5-1-5-3z" />
          <rect x="2" y="11" width="4" height="10" rx="1" />
          <rect x="58" y="9" width="4" height="14" rx="1" />
          <rect x="16" y="4" width="9" height="5" rx="2" fill="#0a0a0a" />
          <rect x="16" y="23" width="9" height="5" rx="2" fill="#0a0a0a" />
          <rect x="42" y="3" width="10" height="6" rx="2" fill="#0a0a0a" />
          <rect x="42" y="23" width="10" height="6" rx="2" fill="#0a0a0a" />
        </svg>
      </div>

      {/* start lights */}
      <div className="intro-lights mb-8 flex gap-3">
        {[0, 1, 2, 3, 4].map((i) => {
          const on = i < lit;
          return (
            <span
              key={i}
              className="h-6 w-6 rounded-full transition-all duration-150 sm:h-7 sm:w-7"
              style={{
                backgroundColor: on ? "#e10600" : "#241012",
                boxShadow: on ? "0 0 18px 3px rgba(225,6,0,0.85)" : "none",
              }}
            />
          );
        })}
      </div>

      <div className="relative z-10 px-6 text-center">
        <p className="intro-sub mb-2 text-sm font-medium tracking-[0.3em] text-red-600">
          FORMULA 1 · {season}
        </p>
        <h1 className="intro-title font-display text-4xl font-extrabold tracking-tight sm:text-6xl">
          SEASON DASHBOARD
        </h1>
        <p className="intro-sub mt-4 text-zinc-400">
          내가 응원하는 팀과 드라이버의 시즌을 한눈에
        </p>
      </div>

      <p className="intro-cta absolute bottom-16 text-sm uppercase tracking-[0.25em] text-zinc-300">
        클릭하여 시작 ▸
      </p>
      </div>
    </button>
  );
}

// Returns how many of the 5 lights are currently on. Lights illuminate one per
// second (1→5), hold, then all go out together 2.5s later; the cycle repeats.
function useStartLights() {
  const [lit, setLit] = useState(0);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    const at = (ms: number, fn: () => void) => timers.push(setTimeout(fn, ms));

    const run = () => {
      [1, 2, 3, 4, 5].forEach((n) => at((n - 1) * 1000, () => setLit(n)));
      at(4000 + 2500, () => setLit(0)); // 2.5s after the 5th light → lights out
      at(4000 + 2500 + 1500, run); // brief pause, then repeat
    };
    run();

    return () => timers.forEach(clearTimeout);
  }, []);

  return lit;
}
