"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";
import type { ScheduleResponse, ScheduleRound } from "@/lib/types";

const STATUS_LABEL: Record<ScheduleRound["status"], string> = {
  past: "종료",
  next: "다음 경기",
  upcoming: "예정",
};

// Shape of public/dotmap/world-dots.json (see scripts/gen-dotmap.mjs).
interface DotData {
  step: number;
  latMin: number;
  latMax: number;
  cols: number;
  rows: number;
  points: [number, number][];
}

const STATUS_COLOR: Record<ScheduleRound["status"], string> = {
  past: "#22c55e", // completed rounds → green
  next: "#e10600", // overridden by the team accent below
  upcoming: "#71717a",
};

// Dotted world map (self-generated, CC0 geometry) with one marker per round.
// Markers are projected with the SAME equirectangular mapping as the dot grid
// so they sit on the landmasses.
export default function DotMap({
  season,
  rounds: roundsProp,
  accent = "#e10600",
  selectedRound = null,
  detailPopover = false,
  onSelect,
  onClear,
}: {
  season?: string;
  // Provide rounds to share a single fetch with a parent; else DotMap fetches.
  rounds?: ScheduleRound[];
  accent?: string;
  selectedRound?: number | null;
  // When true, the selected round shows a small info card anchored on its pin.
  detailPopover?: boolean;
  onSelect?: (round: ScheduleRound) => void;
  onClear?: () => void;
}) {
  const [dots, setDots] = useState<DotData | null>(null);
  const [sched, setSched] = useState<ScheduleResponse | null>(null);

  useEffect(() => {
    fetch("/dotmap/world-dots.json")
      .then((r) => r.json())
      .then(setDots)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (roundsProp || !season) return;
    let active = true;
    setSched(null);
    fetch(`/api/schedule?season=${season}`)
      .then((r) => r.json())
      .then((d: ScheduleResponse) => active && setSched(d))
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [season, roundsProp]);

  const rounds = roundsProp ?? sched?.rounds ?? [];

  if (!dots) {
    return (
      <div className="aspect-[200/79] w-full animate-pulse rounded-xl bg-surface" />
    );
  }

  const W = dots.cols;
  const H = dots.rows;
  // lon/lat → grid units (matches the dot generator's projection).
  const px = (lon: number) => (lon + 180) / dots.step;
  const py = (lat: number) => (dots.latMax - lat) / dots.step;

  // Round whose info card is anchored on the map (if any).
  const sel =
    detailPopover && selectedRound != null
      ? rounds.find((r) => r.round === selectedRound) ?? null
      : null;
  const selX = sel ? (px(sel.long) / W) * 100 : 0;
  const selY = sel ? (py(sel.lat) / H) * 100 : 0;
  const below = selY < 24; // flip card below the pin when near the top edge

  return (
    <div className="relative rounded-xl border border-line bg-[#0b0b0e] p-2">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="시즌 일정 지도">
        {/* base landmass dots */}
        <g fill="#3f3f46" opacity="0.5">
          {dots.points.map(([c, r], i) => (
            <circle key={i} cx={c + 0.5} cy={r + 0.5} r={0.34} />
          ))}
        </g>

        {/* round markers */}
        {rounds.map((rd) => {
          const x = px(rd.long);
          const y = py(rd.lat);
          const color = rd.status === "next" ? accent : STATUS_COLOR[rd.status];
          const isSel = selectedRound === rd.round;
          return (
            <g
              key={rd.round}
              transform={`translate(${x} ${y})`}
              onClick={() => onSelect?.(rd)}
              className={onSelect ? "cursor-pointer" : undefined}
            >
              <title>{`R${rd.round} ${rd.raceName} · ${rd.locality}, ${rd.country}`}</title>
              {/* enlarged transparent tap target */}
              {onSelect && <circle r={2.8} fill="transparent" />}
              {rd.status === "next" && (
                <circle r={2.4} fill={color} opacity={0.9} className="animate-ping" />
              )}
              {isSel && (
                <circle r={2.6} fill="none" stroke={color} strokeWidth={0.5} />
              )}
              <circle
                r={isSel ? 1.5 : 1.1}
                fill={color}
                stroke="#0b0b0e"
                strokeWidth={0.35}
              />
            </g>
          );
        })}
      </svg>

      {sel && (
        <div
          className="absolute z-10 w-44 rounded-lg border border-line bg-surface p-2.5 shadow-xl"
          style={{
            left: `${selX}%`,
            top: `${selY}%`,
            transform: below
              ? "translate(-50%, 14px)"
              : "translate(-50%, calc(-100% - 14px))",
          }}
        >
          <button
            onClick={onClear}
            aria-label="닫기"
            className="absolute right-1 top-1 rounded p-0.5 text-muted transition hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
          </button>
          <p
            className="text-[10px] font-semibold uppercase tracking-wide"
            style={{ color: sel.status === "next" ? accent : "#a1a1aa" }}
          >
            R{sel.round} · {STATUS_LABEL[sel.status]}
          </p>
          <p className="mt-0.5 pr-3 text-sm font-bold leading-tight">{sel.raceName}</p>
          <p className="mt-0.5 text-[11px] text-muted">
            {sel.locality}, {sel.country}
          </p>
          <p className="text-[11px] text-muted">{formatDate(sel.date)}</p>
        </div>
      )}
    </div>
  );
}

function formatDate(date: string): string {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString("ko-KR", {
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}
