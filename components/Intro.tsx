"use client";

// F1-opening-style splash. Cascading start lights, a streaking car, and a title
// reveal, then "click to start" advances to team selection. The whole screen is
// clickable so users can skip the animation.
export default function Intro({
  season,
  onStart,
}: {
  season: string;
  onStart: () => void;
}) {
  return (
    <button
      onClick={onStart}
      aria-label="대시보드 시작"
      className="group relative flex flex-1 w-full cursor-pointer flex-col items-center justify-center overflow-hidden bg-black text-white"
    >
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

      {/* streaking car silhouette */}
      <div className="intro-car pointer-events-none absolute top-1/2 left-0 -translate-y-1/2">
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
        {[0, 1, 2, 3, 4].map((i) => (
          <span
            key={i}
            className="start-light h-6 w-6 rounded-full sm:h-7 sm:w-7"
            style={{ animationDelay: `${i * 0.22}s` }}
          />
        ))}
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

      {/* finish-line strip */}
      <div className="checkered intro-lights pointer-events-none absolute inset-x-0 bottom-0 h-4 opacity-80" />
    </button>
  );
}
