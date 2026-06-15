"use client";

import { useEffect, useState } from "react";
import { teamCar } from "@/lib/season";

// A real F1 car image that streaks across at lights-out.
const LAUNCH_CAR = teamCar("ferrari") ?? "";

// F1-opening-style splash. Real start-light sequence (5 lights illuminate one
// per second, then all go out together 2.5s later → "lights out"); at lights-out
// a car shoots diagonally across the screen, like a race launch. Loops.
// The whole screen is clickable to skip to team selection.
export default function Intro({
  season,
  onStart,
}: {
  season: string;
  onStart: () => void;
}) {
  const { lit, launchKey } = useStartLights();

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

      {/* car launch — fires diagonally across the screen at lights-out */}
      {launchKey > 0 && LAUNCH_CAR ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={launchKey}
          src={LAUNCH_CAR}
          alt=""
          aria-hidden
          className="intro-launch pointer-events-none absolute left-0 top-[55%] z-20 h-16 w-auto drop-shadow-[0_10px_30px_rgba(0,0,0,0.7)] sm:h-24"
        />
      ) : null}

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

      {/* finish-line strip */}
      <div className="checkered intro-lights pointer-events-none absolute inset-x-0 bottom-0 h-4 opacity-80" />
    </button>
  );
}

// Drives the 5-light sequence. Lights illuminate one per second (1→5), hold,
// then all go out together 2.5s later; `launchKey` increments at that lights-out
// moment so the car animation can re-fire each cycle. The cycle repeats.
function useStartLights() {
  const [lit, setLit] = useState(0);
  const [launchKey, setLaunchKey] = useState(0);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    const at = (ms: number, fn: () => void) => timers.push(setTimeout(fn, ms));

    const run = () => {
      [1, 2, 3, 4, 5].forEach((n) => at((n - 1) * 1000, () => setLit(n)));
      at(4000 + 2500, () => {
        setLit(0); // 2.5s after the 5th light → lights out
        setLaunchKey((k) => k + 1); // fire the car launch
      });
      at(4000 + 2500 + 1500, run); // brief pause, then repeat
    };
    run();

    return () => timers.forEach(clearTimeout);
  }, []);

  return { lit, launchKey };
}
