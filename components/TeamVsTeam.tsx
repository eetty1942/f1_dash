"use client";

import { X } from "lucide-react";
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
import type { CompareRoundPoint, CompareTeam } from "@/lib/types";

// Team-vs-team head-to-head layer. Reuses already-loaded comparison data (no
// fetch): pick two teams via dropdowns, then see a multi-metric comparison, a
// round-by-round points record, and overlaid cumulative-points lines.
export default function TeamVsTeam({
  teams,
  series,
  rounds,
  onClose,
}: {
  teams: CompareTeam[];
  series: Record<string, CompareRoundPoint[]>;
  rounds: number;
  onClose: () => void;
}) {
  const [aId, setAId] = useState(teams[0]?.constructorId ?? "");
  const [bId, setBId] = useState(teams[1]?.constructorId ?? "");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const a = teams.find((t) => t.constructorId === aId) ?? null;
  const b = teams.find((t) => t.constructorId === bId) ?? null;
  const colorA = a ? teamColor(a.constructorId) : "#888";
  const colorB = b ? teamColor(b.constructorId) : "#888";

  // Round-by-round points record + overlaid cumulative data.
  const { aw, bw, cumData } = useMemo(() => {
    const at = (id: string, r: number) =>
      series[id]?.find((p) => p.round === r) ?? null;
    let aWins = 0;
    let bWins = 0;
    const cum: { label: string; a: number | null; b: number | null }[] = [];
    let lastA: number | null = null;
    let lastB: number | null = null;
    for (let r = 1; r <= rounds; r++) {
      const pa = a ? at(a.constructorId, r) : null;
      const pb = b ? at(b.constructorId, r) : null;
      const ap = pa?.points ?? 0;
      const bp = pb?.points ?? 0;
      if (ap > bp) aWins++;
      else if (bp > ap) bWins++;
      if (pa) lastA = pa.cumulative;
      if (pb) lastB = pb.cumulative;
      cum.push({ label: `R${r}`, a: lastA, b: lastB });
    }
    return { aw: aWins, bw: bWins, cumData: cum };
  }, [a, b, series, rounds]);

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
          <div>
            <p className="text-[11px] uppercase tracking-wide text-muted">1:1 팀 비교</p>
            <p className="font-display text-lg font-bold leading-tight">컨스트럭터 head-to-head</p>
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
          {/* team pickers */}
          <div className="grid grid-cols-2 gap-3">
            <TeamSelect value={aId} onChange={setAId} options={teams} exclude={bId} color={colorA} />
            <TeamSelect value={bId} onChange={setBId} options={teams} exclude={aId} color={colorB} />
          </div>

          {a && b && (
            <div className="mt-4 space-y-4">
              {/* round record */}
              <div className="rounded-xl border border-line bg-elevated p-3 text-center">
                <p className="text-[11px] uppercase tracking-wide text-muted">라운드 우열 (포인트 기준)</p>
                <p className="mt-1 font-display text-lg font-bold tabular-nums">
                  <span style={{ color: colorA }}>{aw}</span>
                  <span className="px-2 text-muted">:</span>
                  <span style={{ color: colorB }}>{bw}</span>
                </p>
              </div>

              {/* stat rows */}
              <div className="overflow-hidden rounded-xl border border-line">
                <StatRow label="순위" a={`P${a.position}`} b={`P${b.position}`} aw={a.position < b.position} bw={b.position < a.position} />
                <StatRow label="포인트" a={a.points} b={b.points} aw={a.points > b.points} bw={b.points > a.points} />
                <StatRow label="우승" a={a.wins} b={b.wins} aw={a.wins > b.wins} bw={b.wins > a.wins} />
                <StatRow label="포디움" a={a.podiums} b={b.podiums} aw={a.podiums > b.podiums} bw={b.podiums > a.podiums} />
                <StatRow label="패스티스트랩" a={a.fastestLaps} b={b.fastestLaps} aw={a.fastestLaps > b.fastestLaps} bw={b.fastestLaps > a.fastestLaps} />
                <StatRow label="1-2 피니시" a={a.oneTwos} b={b.oneTwos} aw={a.oneTwos > b.oneTwos} bw={b.oneTwos > a.oneTwos} />
                <StatRow label="DNF" a={a.dnfs} b={b.dnfs} aw={a.dnfs < b.dnfs} bw={b.dnfs < a.dnfs} />
                <StatRow
                  label="베스트 피니시"
                  a={a.bestFinish != null ? `P${a.bestFinish}` : "—"}
                  b={b.bestFinish != null ? `P${b.bestFinish}` : "—"}
                  aw={a.bestFinish != null && (b.bestFinish == null || a.bestFinish < b.bestFinish)}
                  bw={b.bestFinish != null && (a.bestFinish == null || b.bestFinish < a.bestFinish)}
                />
              </div>

              {/* overlaid cumulative */}
              <div className="rounded-xl border border-line bg-surface p-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">누적 포인트</p>
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
                      <Line type="monotone" dataKey="a" name={a.name} stroke={colorA} strokeWidth={2} dot={false} connectNulls isAnimationActive={false} />
                      <Line type="monotone" dataKey="b" name={b.name} stroke={colorB} strokeWidth={2} dot={false} connectNulls isAnimationActive={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TeamSelect({
  value,
  onChange,
  options,
  exclude,
  color,
}: {
  value: string;
  onChange: (v: string) => void;
  options: CompareTeam[];
  exclude: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-line bg-elevated px-2.5 py-2" style={{ boxShadow: `inset 3px 0 0 ${color}` }}>
      <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: color }} />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full cursor-pointer bg-transparent text-sm font-semibold focus:outline-none"
      >
        {options.map((t) => (
          <option
            key={t.constructorId}
            value={t.constructorId}
            disabled={t.constructorId === exclude}
            className="bg-surface text-foreground"
          >
            {t.name}
          </option>
        ))}
      </select>
    </div>
  );
}

function StatRow({
  label,
  a,
  b,
  aw,
  bw,
}: {
  label: string;
  a: string | number;
  b: string | number;
  aw?: boolean;
  bw?: boolean;
}) {
  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 border-b border-line px-3 py-2 text-sm last:border-b-0">
      <span className={`text-right font-display font-bold tabular-nums ${aw ? "text-foreground" : "text-muted"}`}>{a}</span>
      <span className="px-2 text-center text-[11px] uppercase tracking-wide text-zinc-600">{label}</span>
      <span className={`font-display font-bold tabular-nums ${bw ? "text-foreground" : "text-muted"}`}>{b}</span>
    </div>
  );
}

const AX = {
  stroke: "#52525b",
  tick: { fill: "#a1a1aa", fontSize: 11 },
  tickLine: false,
  axisLine: false,
} as const;
