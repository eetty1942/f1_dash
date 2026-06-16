"use client";

import { useState } from "react";
import { driverHeadshots } from "@/lib/season";

// Official F1 driver headshot with a graceful initials fallback. Tries each
// season-appropriate portrait URL in turn (modern cutout → legacy portrait),
// landing on team-coloured initials only if every image fails. The `season`
// selects that year's asset (a driver's team/photo changes season to season).
export default function DriverHeadshot({
  constructorId,
  name,
  accent,
  season,
  className = "",
}: {
  constructorId: string | undefined;
  name: string;
  accent: string;
  season?: string;
  className?: string;
}) {
  const candidates = driverHeadshots(constructorId, name, season);
  const key = candidates.join("|");
  // Advance through candidates on error. Reset to the first candidate whenever
  // the candidate set changes (season/team/name) — derived, no effect needed.
  const [state, setState] = useState({ key, idx: 0 });
  const idx = state.key === key ? state.idx : 0;
  const src = candidates[idx];

  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={name}
        loading="lazy"
        onError={() => setState({ key, idx: idx + 1 })}
        className={`object-cover object-top ${className}`}
      />
    );
  }

  return (
    <div
      className={`flex items-center justify-center font-display text-sm font-extrabold text-black ${className}`}
      style={{ backgroundColor: accent }}
    >
      {initials(name)}
    </div>
  );
}

function initials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "—";
  const first = words[0][0] ?? "";
  const last = words.length > 1 ? (words[words.length - 1][0] ?? "") : "";
  return (first + last).toUpperCase();
}
