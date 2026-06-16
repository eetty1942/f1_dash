"use client";

import { ChevronRight, Swords, TriangleAlert, X } from "lucide-react";
import { useMemo, useState } from "react";
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
import DriverHeadshot from "@/components/DriverHeadshot";
import TeamVsTeam from "@/components/TeamVsTeam";
import { teamColor } from "@/lib/season";
import { useFetch } from "@/lib/useFetch";
import type {
  CompareRoundPoint,
  CompareTeam,
  CompareTeamsResponse,
} from "@/lib/types";

// Per-season constructor comparison: a rich summary table + cumulative-points
// line + points-per-round scatter, with team toggles (all on by default). A
// row's chevron opens that team's inline detail panel (onTeamSelect).
export default function CompareTeamsView({ season }: { season: string }) {
  const { data, error } = useFetch<CompareTeamsResponse>(
    `/api/compare-teams?season=${season}`,
    "팀 비교 데이터를 불러오지 못했습니다.",
  );
  const [detailId, setDetailId] = useState<string | null>(null);
  const [vsOpen, setVsOpen] = useState(false);

  // Visible teams default to all; user toggles are kept per-season.
  const defaultActive = useMemo(
    () => new Set(data?.teams.map((t) => t.constructorId) ?? []),
    [data],
  );
  const [override, setOverride] = useState<{ season: string; set: Set<string> } | null>(
    null,
  );
  const active =
    override && override.season === season ? override.set : defaultActive;

  const cumData = useMemo(() => {
    if (!data) return [];
    return Array.from({ length: data.rounds }, (_, i) => {
      const round = i + 1;
      const row: Record<string, number | string | null> = { label: `R${round}` };
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
        <div className="h-64 animate-pulse rounded-xl bg-surface" />
        <div className="h-56 animate-pulse rounded-xl bg-surface" />
      </div>
    );
  }

  if (data.rounds === 0 || data.teams.length === 0) {
    return (
      <div className="mt-8 rounded-xl border border-line bg-surface px-6 py-12 text-center text-sm text-muted">
        아직 이 시즌은 비교할 결과가 없습니다.
      </div>
    );
  }

  const activeTeams = data.teams.filter((t) => active.has(t.constructorId));

  function toggle(id: string) {
    const next = new Set(active);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setOverride({ season, set: next });
  }

  const detail = data.teams.find((t) => t.constructorId === detailId) ?? null;

  return (
    <div className="mt-6 space-y-4">
      <button
        onClick={() => setVsOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-4 py-2 text-xs font-semibold text-muted transition hover:border-zinc-600 hover:text-foreground"
      >
        <Swords className="h-4 w-4" />
        두 팀 1:1 비교
      </button>

      {vsOpen && (
        <TeamVsTeam
          teams={data.teams}
          series={data.series}
          rounds={data.rounds}
          onClose={() => setVsOpen(false)}
        />
      )}

      {detail && (
        <TeamDetailPanel
          team={detail}
          series={data.series[detail.constructorId] ?? []}
          season={season}
          onClose={() => setDetailId(null)}
        />
      )}

      {/* summary table (rows toggle chart series; chevron opens detail) */}
      <div className="overflow-x-auto rounded-xl border border-line">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="bg-elevated text-left text-[11px] uppercase text-muted">
            <tr>
              <th className="px-3 py-2 font-medium">#</th>
              <th className="px-3 py-2 font-medium">팀</th>
              <th className="px-3 py-2 text-right font-medium">포인트</th>
              <th className="px-3 py-2 text-center font-medium">승</th>
              <th className="px-3 py-2 text-center font-medium">포디움</th>
              <th className="px-3 py-2 text-center font-medium">패랩</th>
              <th className="px-3 py-2 text-center font-medium">1-2</th>
              <th className="px-3 py-2 text-center font-medium">DNF</th>
              <th className="px-3 py-2 text-center font-medium">베스트</th>
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {data.teams.map((t) => {
              const on = active.has(t.constructorId);
              const c = teamColor(t.constructorId);
              return (
                <tr key={t.constructorId} className={`bg-surface ${on ? "" : "opacity-45"}`}>
                  <td className="px-3 py-2 font-mono text-xs text-muted">{t.position}</td>
                  <td className="px-3 py-2">
                    <button
                      onClick={() => toggle(t.constructorId)}
                      className="flex items-center gap-2 font-semibold"
                      aria-pressed={on}
                    >
                      <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: c }} />
                      {t.name}
                    </button>
                  </td>
                  <td className="px-3 py-2 text-right font-display font-bold tabular-nums">{t.points}</td>
                  <td className="px-3 py-2 text-center tabular-nums">{t.wins}</td>
                  <td className="px-3 py-2 text-center tabular-nums">{t.podiums}</td>
                  <td className="px-3 py-2 text-center tabular-nums">{t.fastestLaps}</td>
                  <td className="px-3 py-2 text-center tabular-nums">{t.oneTwos}</td>
                  <td className="px-3 py-2 text-center tabular-nums text-muted">{t.dnfs}</td>
                  <td className="px-3 py-2 text-center tabular-nums">
                    {t.bestFinish != null ? `P${t.bestFinish}` : "—"}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <button
                      onClick={() => setDetailId(t.constructorId)}
                      aria-label={`${t.name} 상세`}
                      className="rounded p-1 text-muted transition hover:text-foreground"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <ChartCard title="누적 포인트 (컨스트럭터 추이)">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={cumData} margin={CHART_MARGIN}>
            <CartesianGrid stroke="#27272a" vertical={false} />
            <XAxis dataKey="label" {...AX} />
            <YAxis {...AX} allowDecimals={false} />
            <Tooltip content={<TeamTooltip teams={activeTeams} suffix="pt" />} />
            {activeTeams.map((t) => (
              <Line
                key={t.constructorId}
                type="monotone"
                dataKey={t.constructorId}
                name={t.name}
                stroke={teamColor(t.constructorId)}
                strokeWidth={2}
                dot={false}
                connectNulls
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="라운드별 획득 포인트">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={CHART_MARGIN}>
            <CartesianGrid stroke="#27272a" vertical={false} />
            <XAxis
              type="number"
              dataKey="round"
              domain={[1, data.rounds]}
              tickFormatter={(v) => `R${v}`}
              {...AX}
            />
            <YAxis type="number" dataKey="y" allowDecimals={false} {...AX} />
            <Tooltip content={<ScatterTooltip suffix="pt" />} cursor={{ stroke: "#3f3f46" }} />
            {activeTeams.map((t) => (
              <Scatter
                key={t.constructorId}
                name={t.name}
                data={(data.series[t.constructorId] ?? []).map((p) => ({
                  round: p.round,
                  y: p.points,
                }))}
                fill={teamColor(t.constructorId)}
                isAnimationActive={false}
              />
            ))}
          </ScatterChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}

// Inline expandable panel for one team: lineup (headshots + points share),
// aggregate stat chips, and the team's cumulative-points line.
function TeamDetailPanel({
  team,
  series,
  season,
  onClose,
}: {
  team: CompareTeam;
  series: CompareRoundPoint[];
  season: string;
  onClose: () => void;
}) {
  const c = teamColor(team.constructorId);
  const cumData = series.map((p) => ({ label: `R${p.round}`, y: p.cumulative }));
  const stats: [string, string | number][] = [
    ["순위", `P${team.position}`],
    ["포인트", team.points],
    ["우승", team.wins],
    ["포디움", team.podiums],
    ["패스티스트랩", team.fastestLaps],
    ["1-2 피니시", team.oneTwos],
    ["DNF", team.dnfs],
    ["베스트", team.bestFinish != null ? `P${team.bestFinish}` : "—"],
  ];

  return (
    <div
      className="rise-in rounded-xl border border-line bg-surface p-4"
      style={{ boxShadow: `inset 4px 0 0 ${c}` }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-wide text-muted">팀 상세</p>
          <p className="font-display text-lg font-bold leading-tight">{team.name}</p>
        </div>
        <button
          onClick={onClose}
          aria-label="닫기"
          className="rounded-lg p-1.5 text-muted transition hover:bg-white/10 hover:text-foreground"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* lineup */}
      <div className="mt-3 grid grid-cols-2 gap-3">
        {team.drivers.slice(0, 2).map((d) => {
          const share = team.points > 0 ? (d.points / team.points) * 100 : 0;
          return (
            <div key={d.driverId} className="rounded-lg border border-line bg-elevated p-2">
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg">
                  <DriverHeadshot
                    constructorId={team.constructorId}
                    name={d.name}
                    accent={c}
                    season={season}
                    className="h-full w-full"
                  />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{d.name}</p>
                  <p className="font-mono text-[11px] text-muted">{d.points} pt</p>
                </div>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-black/40">
                <div className="h-full rounded-full" style={{ width: `${share}%`, backgroundColor: c }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* aggregate chips */}
      <div className="mt-3 grid grid-cols-4 gap-2">
        {stats.map(([label, value]) => (
          <div key={label} className="rounded-lg bg-black/30 p-2 text-center">
            <p className="text-[10px] text-muted">{label}</p>
            <p className="mt-0.5 font-display text-sm font-bold tabular-nums">{value}</p>
          </div>
        ))}
      </div>

      {/* team cumulative line */}
      <div className="mt-3 h-40">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={cumData} margin={CHART_MARGIN}>
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
              dataKey="y"
              name="누적"
              stroke={c}
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-line bg-surface p-4">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">{title}</p>
      <div className="h-56">{children}</div>
    </div>
  );
}

const CHART_MARGIN = { top: 4, right: 10, bottom: 0, left: -18 };

const AX = {
  stroke: "#52525b",
  tick: { fill: "#a1a1aa", fontSize: 11 },
  tickLine: false,
  axisLine: false,
} as const;

function TeamTooltip({
  active,
  payload,
  label,
  teams,
  suffix = "",
}: {
  active?: boolean;
  payload?: Array<{ dataKey: string; value: number }>;
  label?: string;
  teams: CompareTeam[];
  suffix?: string;
}) {
  if (!active || !payload || payload.length === 0) return null;
  const rows = [...payload]
    .filter((p) => p.value != null)
    .sort((a, b) => b.value - a.value);
  const nameOf = (id: string) => teams.find((t) => t.constructorId === id)?.name ?? id;
  return (
    <div className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs shadow-lg">
      <p className="mb-1 font-semibold text-zinc-200">{label}</p>
      {rows.map((r) => (
        <p key={r.dataKey} className="tabular-nums" style={{ color: teamColor(r.dataKey) }}>
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
  suffix = "",
}: {
  active?: boolean;
  payload?: Array<{ name?: string; payload: { round: number; y: number } }>;
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
        {p.payload.y}
        {suffix}
      </p>
    </div>
  );
}
