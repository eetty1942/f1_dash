"use client";

import { ArrowUpRight, TriangleAlert } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { teamColor } from "@/lib/season";
import type { CompareDriver, CompareResponse } from "@/lib/types";

const DEFAULT_TOP = 8;

// Per-season driver comparison. Cumulative-points line + finishing-position and
// points-per-race scatters over the season, with a toggleable driver legend
// (top N by default). A chip's arrow opens that driver's detail page.
export default function CompareView({
  season,
  onDriverSelect,
}: {
  season: string;
  onDriverSelect?: (d: CompareDriver) => void;
}) {
  const [data, setData] = useState<CompareResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [active, setActive] = useState<Set<string>>(new Set());

  useEffect(() => {
    let on = true;
    setData(null);
    setError(null);
    fetch(`/api/compare?season=${season}`)
      .then((r) => {
        if (!r.ok) throw new Error("비교 데이터를 불러오지 못했습니다.");
        return r.json();
      })
      .then((d: CompareResponse) => {
        if (!on) return;
        setData(d);
        setActive(new Set(d.drivers.slice(0, DEFAULT_TOP).map((x) => x.driverId)));
      })
      .catch((e: Error) => on && setError(e.message));
    return () => {
      on = false;
    };
  }, [season]);

  const styles = useMemo(() => styleFor(data?.drivers ?? []), [data]);

  const cumData = useMemo(() => {
    if (!data) return [];
    return Array.from({ length: data.rounds }, (_, i) => {
      const round = i + 1;
      const row: Record<string, number | string | null> = {
        round,
        label: `R${round}`,
      };
      for (const id of active) {
        let v: number | null = null;
        for (const p of data.series[id] ?? []) {
          if (p.round <= round) v = p.cumulative;
          else break;
        }
        row[id] = v;
      }
      return row;
    });
  }, [data, active]);

  if (error) {
    return (
      <div className="mt-8 flex flex-col items-center gap-2 rounded-xl border border-line bg-surface px-6 py-12 text-center">
        <TriangleAlert className="h-6 w-6 text-red-400" />
        <p className="text-sm text-red-400">{error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="mt-8 space-y-3">
        <div className="h-10 animate-pulse rounded-xl bg-surface" />
        <div className="h-56 animate-pulse rounded-xl bg-surface" />
        <div className="grid gap-3 lg:grid-cols-2">
          <div className="h-52 animate-pulse rounded-xl bg-surface" />
          <div className="h-52 animate-pulse rounded-xl bg-surface" />
        </div>
      </div>
    );
  }

  const activeDrivers = data.drivers.filter((d) => active.has(d.driverId));

  function toggle(id: string) {
    setActive((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="mt-6 space-y-4">
      {/* driver legend / toggles */}
      <div className="flex flex-wrap gap-2">
        {data.drivers.map((d) => {
          const on = active.has(d.driverId);
          const st = styles[d.driverId];
          return (
            <span
              key={d.driverId}
              className={`flex items-center gap-1.5 rounded-full border py-1 pl-2.5 pr-1.5 text-xs transition ${
                on ? "border-transparent bg-white/5" : "border-line opacity-50"
              }`}
              style={on ? { boxShadow: `inset 0 0 0 1px ${st.color}` } : undefined}
            >
              <button
                onClick={() => toggle(d.driverId)}
                className="flex items-center gap-1.5 font-semibold"
                aria-pressed={on}
              >
                <span
                  className="inline-block h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: st.color }}
                />
                {d.code ?? d.name}
                <span className="font-mono text-[10px] text-muted">{d.points}</span>
              </button>
              <button
                onClick={() => onDriverSelect?.(d)}
                aria-label={`${d.name} 상세`}
                className="rounded p-0.5 text-muted transition hover:text-foreground"
              >
                <ArrowUpRight className="h-3.5 w-3.5" />
              </button>
            </span>
          );
        })}
      </div>

      {/* cumulative points — championship progression */}
      <ChartCard title="누적 포인트 (챔피언십 추이)">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={cumData} margin={CHART_MARGIN}>
            {grid()}
            <XAxis dataKey="label" {...axisProps} />
            <YAxis {...axisProps} allowDecimals={false} />
            <Tooltip content={<CmpTooltip drivers={activeDrivers} styles={styles} suffix="pt" />} />
            {activeDrivers.map((d) => (
              <Line
                key={d.driverId}
                type="monotone"
                dataKey={d.driverId}
                name={d.code ?? d.name}
                stroke={styles[d.driverId].color}
                strokeWidth={2}
                strokeDasharray={styles[d.driverId].dash}
                dot={false}
                connectNulls
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <div className="grid gap-3 lg:grid-cols-2">
        <ChartCard title="완주 순위 (라운드별)">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={CHART_MARGIN}>
              {grid()}
              <XAxis
                type="number"
                dataKey="round"
                domain={[1, data.rounds]}
                tickFormatter={(v) => `R${v}`}
                {...axisProps}
              />
              <YAxis
                type="number"
                dataKey="y"
                reversed
                allowDecimals={false}
                domain={[1, "dataMax"]}
                {...axisProps}
              />
              <Tooltip content={<ScatterTooltip prefix="P" />} cursor={{ stroke: "#3f3f46" }} />
              {activeDrivers.map((d) => (
                <Scatter
                  key={d.driverId}
                  name={d.code ?? d.name}
                  data={pointsOf(data, d.driverId, "finishPos")}
                  fill={styles[d.driverId].color}
                  shape={styles[d.driverId].shape}
                  isAnimationActive={false}
                />
              ))}
            </ScatterChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="라운드별 획득 포인트">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={CHART_MARGIN}>
              {grid()}
              <XAxis
                type="number"
                dataKey="round"
                domain={[1, data.rounds]}
                tickFormatter={(v) => `R${v}`}
                {...axisProps}
              />
              <YAxis type="number" dataKey="y" allowDecimals={false} {...axisProps} />
              <Tooltip content={<ScatterTooltip suffix="pt" />} cursor={{ stroke: "#3f3f46" }} />
              {activeDrivers.map((d) => (
                <Scatter
                  key={d.driverId}
                  name={d.code ?? d.name}
                  data={pointsOf(data, d.driverId, "points")}
                  fill={styles[d.driverId].color}
                  shape={styles[d.driverId].shape}
                  isAnimationActive={false}
                />
              ))}
            </ScatterChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}

// Per-driver colour + teammate differentiation (2nd of a team → dashed line /
// triangle marker) so same-coloured teammates stay distinguishable.
function styleFor(drivers: CompareDriver[]) {
  const map: Record<
    string,
    { color: string; dash?: string; shape: "circle" | "triangle" }
  > = {};
  const seen: Record<string, number> = {};
  for (const d of drivers) {
    const n = (seen[d.constructorId] = (seen[d.constructorId] ?? 0) + 1);
    map[d.driverId] = {
      color: teamColor(d.constructorId),
      dash: n > 1 ? "5 3" : undefined,
      shape: n > 1 ? "triangle" : "circle",
    };
  }
  return map;
}

function pointsOf(
  data: CompareResponse,
  driverId: string,
  key: "finishPos" | "points",
): { round: number; y: number }[] {
  const out: { round: number; y: number }[] = [];
  for (const p of data.series[driverId] ?? []) {
    const y = p[key];
    if (y != null) out.push({ round: p.round, y });
  }
  return out;
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-line bg-surface p-4">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">
        {title}
      </p>
      <div className="h-56">{children}</div>
    </div>
  );
}

const CHART_MARGIN = { top: 4, right: 10, bottom: 0, left: -18 };

const axisProps = {
  stroke: "#52525b",
  tick: { fill: "#a1a1aa", fontSize: 11 },
  tickLine: false,
  axisLine: false,
} as const;

function grid() {
  return <CartesianGrid stroke="#27272a" vertical={false} />;
}

// Shared tooltip for the cumulative line: lists each visible driver's value.
function CmpTooltip({
  active,
  payload,
  label,
  drivers,
  styles,
  suffix = "",
}: {
  active?: boolean;
  payload?: Array<{ dataKey: string; value: number }>;
  label?: string;
  drivers: CompareDriver[];
  styles: Record<string, { color: string }>;
  suffix?: string;
}) {
  if (!active || !payload || payload.length === 0) return null;
  const rows = [...payload]
    .filter((p) => p.value != null)
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);
  const nameOf = (id: string) => {
    const d = drivers.find((x) => x.driverId === id);
    return d?.code ?? d?.name ?? id;
  };
  return (
    <div className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs shadow-lg">
      <p className="mb-1 font-semibold text-zinc-200">{label}</p>
      {rows.map((r) => (
        <p key={r.dataKey} className="tabular-nums" style={{ color: styles[r.dataKey]?.color }}>
          {nameOf(r.dataKey)}: {r.value}
          {suffix}
        </p>
      ))}
    </div>
  );
}

function ScatterTooltip({
  active,
  payload,
  prefix = "",
  suffix = "",
}: {
  active?: boolean;
  payload?: Array<{ name?: string; value: number; payload: { round: number; y: number } }>;
  prefix?: string;
  suffix?: string;
}) {
  if (!active || !payload || payload.length === 0) return null;
  const p = payload[0];
  return (
    <div className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs shadow-lg">
      <p className="font-semibold text-zinc-200">
        {p.name} · R{p.payload.round}
      </p>
      <p className="tabular-nums text-zinc-300">
        {prefix}
        {p.payload.y}
        {suffix}
      </p>
    </div>
  );
}
