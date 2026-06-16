"use client";

import { TriangleAlert } from "lucide-react";
import { useEffect, useState } from "react";
import DotMap from "@/components/DotMap";
import type { ScheduleResponse, ScheduleRound } from "@/lib/types";

const STATUS_DOT: Record<ScheduleRound["status"], string> = {
  past: "#22c55e",
  next: "#e10600",
  upcoming: "#71717a",
};

// In-page schedule view: a large dotted world map (tap a pin for a small info
// card anchored on the map) with the round list below.
export default function ScheduleView({
  season,
  accent = "#e10600",
}: {
  season: string;
  accent?: string;
}) {
  const [data, setData] = useState<ScheduleResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    setData(null);
    setError(null);
    fetch(`/api/schedule?season=${season}`)
      .then((r) => {
        if (!r.ok) throw new Error("일정을 불러오지 못했습니다.");
        return r.json();
      })
      .then((d: ScheduleResponse) => {
        if (!active) return;
        setData(d);
        const next = d.rounds.find((r) => r.status === "next");
        setSelected((next ?? d.rounds[0])?.round ?? null);
      })
      .catch((e: Error) => active && setError(e.message));
    return () => {
      active = false;
    };
  }, [season]);

  if (error) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl border border-line bg-surface px-6 py-12 text-center">
        <TriangleAlert className="h-6 w-6 text-red-400" />
        <p className="text-sm text-red-400">{error}</p>
      </div>
    );
  }

  const rounds = data?.rounds ?? [];

  return (
    <div className="space-y-4">
      <DotMap
        rounds={rounds}
        accent={accent}
        selectedRound={selected}
        detailPopover
        onSelect={(r) => setSelected(r.round)}
        onClear={() => setSelected(null)}
      />

      {/* Legend */}
      <div className="flex flex-wrap gap-4 px-1 text-xs text-muted">
        {(
          [
            ["past", "종료"],
            ["next", "다음 경기"],
            ["upcoming", "예정"],
          ] as const
        ).map(([k, label]) => (
          <span key={k} className="flex items-center gap-1.5">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: STATUS_DOT[k] }}
            />
            {label}
          </span>
        ))}
      </div>

      {/* Round list below the map */}
      <ul className="grid gap-1.5 sm:grid-cols-2">
        {!data
          ? Array.from({ length: 8 }).map((_, i) => (
              <li key={i} className="h-12 animate-pulse rounded-lg bg-elevated" />
            ))
          : rounds.map((r) => {
              const isSel = r.round === selected;
              return (
                <li key={r.round}>
                  <button
                    onClick={() => setSelected(r.round)}
                    className={`flex w-full items-center gap-3 rounded-lg border px-3 py-2 text-left transition ${
                      isSel
                        ? "border-transparent bg-white/5"
                        : "border-line hover:border-zinc-600"
                    }`}
                    style={isSel ? { boxShadow: `inset 0 0 0 1px ${accent}` } : undefined}
                  >
                    <span
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{ backgroundColor: STATUS_DOT[r.status] }}
                    />
                    <span className="w-6 shrink-0 font-mono text-xs text-muted">
                      R{r.round}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold">
                        {r.raceName}
                      </span>
                      <span className="block truncate text-[11px] text-muted">
                        {r.locality}, {r.country} · {formatDate(r.date)}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
      </ul>
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
