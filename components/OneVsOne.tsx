"use client";

import { ChevronLeft, TriangleAlert, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { teamColor } from "@/lib/season";
import type { CompareDriver, CompareResponse } from "@/lib/types";

// 1:1 driver comparison layer opened from a driver's detail page. Pick a second
// driver, then see head-to-head season stats and overlaid cumulative points.
export default function OneVsOne({
  season,
  currentId,
  onClose,
}: {
  season: string;
  currentId: string;
  onClose: () => void;
}) {
  const [data, setData] = useState<CompareResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [bId, setBId] = useState<string | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    let on = true;
    fetch(`/api/compare?season=${season}`)
      .then((r) => {
        if (!r.ok) throw new Error("비교 데이터를 불러오지 못했습니다.");
        return r.json();
      })
      .then((d: CompareResponse) => on && setData(d))
      .catch((e: Error) => on && setError(e.message));
    return () => {
      on = false;
    };
  }, [season]);

  const a = data?.drivers.find((d) => d.driverId === currentId) ?? null;
  const b = data?.drivers.find((d) => d.driverId === bId) ?? null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="rise-in flex max-h-[88vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between border-b border-line px-5 py-4">
          <div className="flex items-center gap-2">
            {b && (
              <button
                onClick={() => setBId(null)}
                aria-label="다른 선수 선택"
                className="rounded-lg p-1.5 text-muted transition hover:bg-white/10 hover:text-foreground"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            )}
            <div>
              <p className="text-[11px] uppercase tracking-wide text-muted">
                {season} · 1:1 비교
              </p>
              <p className="font-display text-lg font-bold leading-tight">
                {b ? "헤드 투 헤드" : "비교할 선수 선택"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="닫기"
            className="rounded-lg p-1.5 text-muted transition hover:bg-white/10 hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          {error && (
            <div className="flex flex-col items-center gap-2 py-12 text-center">
              <TriangleAlert className="h-6 w-6 text-red-400" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {!error && !data && (
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-10 animate-pulse rounded-lg bg-elevated" />
              ))}
            </div>
          )}

          {data && !a && !error && (
            <p className="py-12 text-center text-sm text-muted">
              이 선수는 {season} 시즌 기록이 없어 비교할 수 없습니다.
            </p>
          )}

          {/* Step 1: pick the opponent */}
          {data && a && !b && (
            <ul className="space-y-1.5">
              {data.drivers
                .filter((d) => d.driverId !== currentId)
                .map((d) => (
                  <li key={d.driverId}>
                    <button
                      onClick={() => setBId(d.driverId)}
                      className="flex w-full items-center gap-3 rounded-lg border border-line px-3 py-2 text-left transition hover:border-zinc-600"
                    >
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: teamColor(d.constructorId) }}
                      />
                      <span className="min-w-0 flex-1 truncate text-sm font-semibold">
                        {d.name}
                      </span>
                      <span className="shrink-0 font-mono text-xs text-muted">
                        P{d.position} · {d.points}pt
                      </span>
                    </button>
                  </li>
                ))}
            </ul>
          )}

          {/* Step 2: head-to-head */}
          {data && a && b && <HeadToHead data={data} a={a} b={b} />}
        </div>
      </div>
    </div>
  );
}

function HeadToHead({
  data,
  a,
  b,
}: {
  data: CompareResponse;
  a: CompareDriver;
  b: CompareDriver;
}) {
  const colorA = teamColor(a.constructorId);
  const colorB = teamColor(b.constructorId);
  const sameTeam = a.constructorId === b.constructorId;

  const sa = useMemo(() => derive(data, a.driverId), [data, a.driverId]);
  const sb = useMemo(() => derive(data, b.driverId), [data, b.driverId]);

  const cumData = useMemo(() => {
    const last: Record<string, number> = {};
    return Array.from({ length: data.rounds }, (_, i) => {
      const round = i + 1;
      for (const id of [a.driverId, b.driverId]) {
        for (const p of data.series[id] ?? []) {
          if (p.round === round) last[id] = p.cumulative;
        }
      }
      return {
        label: `R${round}`,
        [a.driverId]: last[a.driverId] ?? null,
        [b.driverId]: last[b.driverId] ?? null,
      };
    });
  }, [data, a.driverId, b.driverId]);

  return (
    <div className="space-y-4">
      {/* names */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { d: a, c: colorA },
          { d: b, c: colorB },
        ].map(({ d, c }) => (
          <div
            key={d.driverId}
            className="rounded-xl border border-line bg-elevated p-3"
            style={{ boxShadow: `inset 3px 0 0 ${c}` }}
          >
            <p className="truncate font-display text-base font-bold">{d.name}</p>
            <p className="truncate text-xs text-muted">{d.constructorName}</p>
          </div>
        ))}
      </div>

      {/* stat rows */}
      <div className="overflow-hidden rounded-xl border border-line">
        <StatRow label="순위" a={`P${a.position}`} b={`P${b.position}`} aWins={a.position < b.position} bWins={b.position < a.position} />
        <StatRow label="포인트" a={a.points} b={b.points} aWins={a.points > b.points} bWins={b.points > a.points} />
        <StatRow label="우승" a={a.wins} b={b.wins} aWins={a.wins > b.wins} bWins={b.wins > a.wins} />
        <StatRow label="포디움" a={sa.podiums} b={sb.podiums} aWins={sa.podiums > sb.podiums} bWins={sb.podiums > sa.podiums} />
        <StatRow
          label="베스트 피니시"
          a={sa.best != null ? `P${sa.best}` : "—"}
          b={sb.best != null ? `P${sb.best}` : "—"}
          aWins={sa.best != null && (sb.best == null || sa.best < sb.best)}
          bWins={sb.best != null && (sa.best == null || sb.best < sa.best)}
        />
      </div>

      {/* overlaid cumulative points */}
      <div className="rounded-xl border border-line bg-surface p-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">
          누적 포인트
        </p>
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={cumData} margin={{ top: 4, right: 10, bottom: 0, left: -18 }}>
              <CartesianGrid stroke="#27272a" vertical={false} />
              <XAxis dataKey="label" {...AX} />
              <YAxis {...AX} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  background: "#09090b",
                  border: "1px solid #3f3f46",
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Line
                type="monotone"
                dataKey={a.driverId}
                name={a.code ?? a.name}
                stroke={colorA}
                strokeWidth={2}
                dot={false}
                connectNulls
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey={b.driverId}
                name={b.code ?? b.name}
                stroke={colorB}
                strokeWidth={2}
                strokeDasharray={sameTeam ? "5 3" : undefined}
                dot={false}
                connectNulls
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function StatRow({
  label,
  a,
  b,
  aWins,
  bWins,
}: {
  label: string;
  a: string | number;
  b: string | number;
  aWins?: boolean;
  bWins?: boolean;
}) {
  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 border-b border-line px-3 py-2 text-sm last:border-b-0">
      <span
        className={`text-right font-display font-bold tabular-nums ${aWins ? "text-foreground" : "text-muted"}`}
      >
        {a}
      </span>
      <span className="px-2 text-center text-[11px] uppercase tracking-wide text-zinc-600">
        {label}
      </span>
      <span
        className={`font-display font-bold tabular-nums ${bWins ? "text-foreground" : "text-muted"}`}
      >
        {b}
      </span>
    </div>
  );
}

function derive(data: CompareResponse, id: string): { best: number | null; podiums: number } {
  let best: number | null = null;
  let podiums = 0;
  for (const p of data.series[id] ?? []) {
    if (p.finishPos != null) {
      if (best == null || p.finishPos < best) best = p.finishPos;
      if (p.finishPos <= 3) podiums++;
    }
  }
  return { best, podiums };
}

const AX = {
  stroke: "#52525b",
  tick: { fill: "#a1a1aa", fontSize: 11 },
  tickLine: false,
  axisLine: false,
} as const;
