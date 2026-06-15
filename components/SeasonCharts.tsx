"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Race } from "@/lib/jolpica";

interface Point {
  round: string;
  label: string; // axis tick, e.g. "R1"
  name: string; // full GP name (tooltip)
  finish: number | null;
  grid: number | null;
  points: number;
  cumPoints: number;
  flRank: number | null;
}

// Season trend charts derived entirely from the driver's per-race results
// (no extra API calls). Lower-is-better axes (position, fastest-lap rank) are
// rendered reversed so P1 sits at the top.
export default function SeasonCharts({
  results,
  driverId,
  accent,
}: {
  results: Race[];
  driverId: string;
  accent: string;
}) {
  const data = buildSeries(results, driverId);

  if (data.length === 0) {
    return (
      <section className="mt-6">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
          시즌 추이 차트
        </h2>
        <p className="text-sm text-muted">아직 차트로 그릴 결과가 없습니다.</p>
      </section>
    );
  }

  return (
    <section className="mt-6">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500">
        시즌 추이 차트
      </h2>
      <div className="grid gap-3 lg:grid-cols-2">
        <ChartCard title="누적 포인트">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={CHART_MARGIN}>
              <defs>
                <linearGradient id="ptsFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={accent} stopOpacity={0.5} />
                  <stop offset="100%" stopColor={accent} stopOpacity={0} />
                </linearGradient>
              </defs>
              {grid()}
              {xAxis()}
              <YAxis {...axisProps} allowDecimals={false} />
              <Tooltip content={<TrendTooltip suffix="pt" valueKey="cumPoints" />} />
              <Area
                type="monotone"
                dataKey="cumPoints"
                stroke={accent}
                strokeWidth={2}
                fill="url(#ptsFill)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="라운드별 결과 순위 (출발 vs 도착)">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={CHART_MARGIN}>
              {grid()}
              {xAxis()}
              <YAxis {...axisProps} reversed allowDecimals={false} domain={[1, "dataMax"]} />
              <Tooltip content={<TrendTooltip prefix="P" />} />
              <Line
                type="monotone"
                dataKey="grid"
                name="출발"
                stroke="#71717a"
                strokeWidth={1.5}
                strokeDasharray="4 3"
                dot={false}
                connectNulls
              />
              <Line
                type="monotone"
                dataKey="finish"
                name="도착"
                stroke={accent}
                strokeWidth={2}
                dot={{ r: 2 }}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="퍼포먼스: 패스티스트 랩 순위">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={CHART_MARGIN}>
              {grid()}
              {xAxis()}
              <YAxis {...axisProps} reversed allowDecimals={false} domain={[1, "dataMax"]} />
              <Tooltip content={<TrendTooltip prefix="순위 " valueKey="flRank" />} />
              <Line
                type="monotone"
                dataKey="flRank"
                name="패스티스트 랩 순위"
                stroke="#a78bfa"
                strokeWidth={2}
                dot={{ r: 2 }}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="라운드별 획득 포인트">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={CHART_MARGIN}>
              {grid()}
              {xAxis()}
              <YAxis {...axisProps} allowDecimals={false} />
              <Tooltip content={<TrendTooltip suffix="pt" valueKey="points" />} />
              <Area
                type="step"
                dataKey="points"
                stroke={accent}
                strokeWidth={2}
                fill={accent}
                fillOpacity={0.15}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </section>
  );
}

function buildSeries(results: Race[], driverId: string): Point[] {
  let cum = 0;
  return [...results]
    .sort((a, b) => Number(a.round) - Number(b.round))
    .map((race) => {
      const r = race.Results?.find((x) => x.Driver.driverId === driverId);
      const points = r ? Number(r.points) : 0;
      cum += points;
      return {
        round: race.round,
        label: `R${race.round}`,
        name: race.raceName,
        finish: numeric(r?.positionText, r?.position),
        grid: r?.grid ? Number(r.grid) || null : null,
        points,
        cumPoints: cum,
        flRank: r?.FastestLap?.rank ? Number(r.FastestLap.rank) || null : null,
      };
    });
}

// Only treat a finishing position as a chartable number when it's numeric
// (skip "R"/"D"/"W" classifications).
function numeric(
  positionText: string | undefined,
  position: string | undefined,
): number | null {
  if (!positionText || !position) return null;
  return /^\d+$/.test(positionText) ? Number(position) : null;
}

function ChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-line bg-surface p-4">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">
        {title}
      </p>
      <div className="h-52">{children}</div>
    </div>
  );
}

const CHART_MARGIN = { top: 4, right: 8, bottom: 0, left: -20 };

const axisProps = {
  stroke: "#52525b",
  tick: { fill: "#a1a1aa", fontSize: 11 },
  tickLine: false,
  axisLine: false,
} as const;

function grid() {
  return <CartesianGrid stroke="#27272a" vertical={false} />;
}

function xAxis() {
  return <XAxis dataKey="label" {...axisProps} />;
}

function TrendTooltip({
  active,
  payload,
  prefix = "",
  suffix = "",
  valueKey,
}: {
  active?: boolean;
  payload?: Array<{ payload: Point; value: number; name?: string; color?: string }>;
  prefix?: string;
  suffix?: string;
  valueKey?: keyof Point;
}) {
  if (!active || !payload || payload.length === 0) return null;
  const p = payload[0].payload;
  return (
    <div className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs shadow-lg">
      <p className="mb-1 font-semibold text-zinc-200">
        R{p.round} · {p.name}
      </p>
      {valueKey ? (
        <p className="tabular-nums text-zinc-300">
          {prefix}
          {fmt(p[valueKey])}
          {suffix}
        </p>
      ) : (
        payload.map((entry, i) => (
          <p key={i} className="tabular-nums" style={{ color: entry.color }}>
            {entry.name}: {prefix}
            {fmt(entry.value)}
            {suffix}
          </p>
        ))
      )}
    </div>
  );
}

function fmt(v: number | string | null): string {
  return v == null ? "—" : String(v);
}
