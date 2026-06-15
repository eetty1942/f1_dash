"use client";

import {
  BarChart3,
  Car,
  CloudSun,
  Disc3,
  Flag,
  Gauge,
  MapPin,
  TriangleAlert,
  Trophy,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import DriverHeadshot from "@/components/DriverHeadshot";
import SeasonCharts from "@/components/SeasonCharts";
import type { Driver } from "@/lib/jolpica";
import { teamColor, tyreColor } from "@/lib/season";
import type { CarResponse, DashboardResponse, Favorite } from "@/lib/types";

type TabKey = "results" | "car" | "charts";

export default function Dashboard({ favorite }: { favorite: Favorite }) {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<TabKey>("results");

  useEffect(() => {
    let active = true;
    setData(null);
    setError(null);
    const params = new URLSearchParams({
      driver: favorite.driverId,
      team: favorite.constructorId,
    });
    fetch(`/api/dashboard?${params}`)
      .then((res) => {
        if (!res.ok) throw new Error("데이터를 불러오지 못했습니다.");
        return res.json();
      })
      .then((d: DashboardResponse) => active && setData(d))
      .catch((err: Error) => active && setError(err.message));
    return () => {
      active = false;
    };
  }, [favorite.driverId, favorite.constructorId]);

  const accent = teamColor(favorite.constructorId);
  const ds = data?.driverStanding ?? null;
  const cs = data?.constructorStanding ?? null;

  return (
    <div className="space-y-5 pb-20 sm:pb-0">
      {error && <StateMessage icon={TriangleAlert} tone="error" text={error} />}
      {!data && !error && <DashboardSkeleton />}

      {data && (
        <>
          <section className="team-glow rise-in overflow-hidden rounded-2xl border border-line p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-5">
              <div className="flex items-center gap-4">
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl">
                  <DriverHeadshot
                    constructorId={favorite.constructorId}
                    name={favorite.driverName}
                    accent={accent}
                    className="h-full w-full"
                  />
                  {ds?.Driver.permanentNumber ? (
                    <span
                      className="absolute bottom-0 right-0 rounded-tl-lg px-1.5 py-0.5 font-display text-xs font-extrabold tabular-nums text-black"
                      style={{ backgroundColor: accent }}
                    >
                      {ds.Driver.permanentNumber}
                    </span>
                  ) : null}
                </div>
                <div>
                  <h1 className="font-display text-2xl font-extrabold leading-tight sm:text-3xl">
                    {favorite.driverName}
                  </h1>
                  <p className="mt-1 text-sm text-muted">
                    {favorite.teamName}
                    {ds?.Driver.nationality ? ` · ${ds.Driver.nationality}` : ""}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-5 sm:gap-7">
                <HeroStat label="순위" value={ordinal(ds?.position)} accent={accent} />
                <HeroStat label="포인트" value={ds?.points ?? "—"} />
                <HeroStat label="우승" value={ds?.wins ?? "—"} />
              </div>
            </div>
            <SeasonProgress
              completed={data.completedRounds}
              total={data.totalRounds}
              accent={accent}
            />
          </section>

          <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard label="팀 순위" value={ordinal(cs?.position)} accent={accent} />
            <StatCard label="팀 포인트" value={cs?.points ?? "—"} />
            <StatCard
              label="베스트 피니시"
              value={bestFinish(data, favorite.driverId)}
              accent={accent}
            />
            <StatCard
              label="다음 경기"
              value={data.nextRace ? `R${data.nextRace.round}` : "—"}
            />
          </section>

          <Tabs tab={tab} onChange={setTab} accent={accent} />

          {tab === "results" && (
            <div className="rise-in space-y-5">
              {data.nextRace ? (
                <section className="team-glow rounded-xl border border-line p-4">
                  <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted">
                    <MapPin className="h-3.5 w-3.5" style={{ color: "var(--team)" }} />
                    다음 경기 · Round {data.nextRace.round}
                  </p>
                  <p className="mt-1.5 font-display text-lg font-bold">
                    {data.nextRace.raceName}
                  </p>
                  <p className="text-sm text-muted">
                    {data.nextRace.Circuit.Location.locality},{" "}
                    {data.nextRace.Circuit.Location.country} ·{" "}
                    {formatDate(data.nextRace.date)}
                  </p>
                </section>
              ) : (
                <section className="rounded-xl border border-line bg-surface p-4 text-sm text-muted">
                  이번 시즌 남은 경기가 없습니다.
                </section>
              )}
              <section>
                <SectionTitle>레이스 결과</SectionTitle>
                <ResultsTable data={data} driverId={favorite.driverId} />
              </section>
            </div>
          )}

          {tab === "car" && (
            <div className="rise-in">
              <CarPanel
                ergDriver={ds?.Driver ?? null}
                constructorId={favorite.constructorId}
                accent={accent}
              />
            </div>
          )}

          {tab === "charts" && (
            <div className="rise-in">
              <SeasonCharts
                results={data.results}
                driverId={favorite.driverId}
                accent={accent}
              />
            </div>
          )}

          <MobileTabBar tab={tab} onChange={setTab} accent={accent} />
        </>
      )}
    </div>
  );
}

function SeasonProgress({
  completed,
  total,
  accent,
}: {
  completed: number;
  total: number;
  accent: string;
}) {
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  // Keep the car fully visible inside the track at both extremes.
  const carLeft = `calc(${Math.min(Math.max(pct, 0), 100)}% - 14px)`;

  return (
    <div className="mt-5">
      <div className="mb-2 flex items-baseline justify-between text-xs">
        <span className="font-semibold uppercase tracking-wide text-muted">
          시즌 진행률
        </span>
        <span className="tabular-nums text-zinc-300">
          {completed} / {total} 라운드 · {pct}%
        </span>
      </div>
      <div className="relative h-2.5 rounded-full bg-black/40">
        <div
          className="h-2.5 rounded-full transition-[width] duration-500"
          style={{ width: `${pct}%`, backgroundColor: accent }}
        />
        <RaceCar
          className="absolute top-1/2 h-6 w-6 -translate-y-1/2 drop-shadow"
          style={{ left: carLeft, color: accent }}
        />
      </div>
    </div>
  );
}

// Minimalist top-down F1 car silhouette (front wing, cockpit, rear wing, wheels).
function RaceCar({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      viewBox="0 0 64 32"
      fill="currentColor"
      className={className}
      style={style}
      aria-hidden
    >
      {/* body */}
      <path d="M6 16c0-2 2-3 5-3h10l6-4h6l2 4h12c4 0 7 1 9 3 -2 2-5 3-9 3H35l-2 4h-6l-6-4H11c-3 0-5-1-5-3z" />
      {/* front wing */}
      <rect x="2" y="11" width="4" height="10" rx="1" />
      {/* rear wing */}
      <rect x="58" y="9" width="4" height="14" rx="1" />
      {/* wheels */}
      <rect x="16" y="4" width="9" height="5" rx="2" fill="#18181b" />
      <rect x="16" y="23" width="9" height="5" rx="2" fill="#18181b" />
      <rect x="42" y="3" width="10" height="6" rx="2" fill="#18181b" />
      <rect x="42" y="23" width="10" height="6" rx="2" fill="#18181b" />
    </svg>
  );
}

function CarPanel({
  ergDriver,
  constructorId,
  accent,
}: {
  ergDriver: Driver | null;
  constructorId: string;
  accent: string;
}) {
  const code = ergDriver?.code ?? null;
  const [car, setCar] = useState<CarResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!code) return;
    let active = true;
    setCar(null);
    setError(null);
    fetch(`/api/car?code=${encodeURIComponent(code)}`)
      .then((res) => {
        if (!res.ok) throw new Error("차량 정보를 불러오지 못했습니다.");
        return res.json();
      })
      .then((d: CarResponse) => active && setCar(d))
      .catch((err: Error) => active && setError(err.message));
    return () => {
      active = false;
    };
  }, [code]);

  if (!code) return null;

  const g = car?.result?.positionsGained ?? null;

  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <SectionTitle>차량 상세</SectionTitle>
        {car?.session?.country ? (
          <span className="mb-3 text-xs text-zinc-600">
            · {car.session.country} GP 기준
          </span>
        ) : null}
      </div>

      {error && <StateMessage icon={TriangleAlert} tone="error" text={error} />}
      {!car && !error && <CarSkeleton />}
      {car && !car.driver && !error && (
        <StateMessage
          icon={Car}
          tone="muted"
          text="최근 레이스의 차량 데이터가 아직 없습니다."
        />
      )}

      {car?.driver && (
        <div className="space-y-3">
          {/* Identity — team-coloured number tile (driver photos from F1's CDN
              are often outdated, so we render an accurate badge instead) */}
          <div className="team-glow flex items-center gap-4 rounded-xl border border-line p-4">
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl">
              <DriverHeadshot
                constructorId={constructorId}
                name={car.driver.fullName}
                accent={accent}
                className="h-full w-full"
              />
              <span
                className="absolute bottom-0 right-0 rounded-tl-md px-1 py-0.5 font-display text-[10px] font-extrabold tabular-nums text-black"
                style={{ backgroundColor: accent }}
              >
                {car.driver.number}
              </span>
            </div>
            <div>
              <p className="font-display text-lg font-bold leading-tight">
                {car.driver.fullName}
              </p>
              <p className="text-sm text-muted">
                {car.driver.teamName ?? ""}
                {ergDriver?.nationality ? ` · ${ergDriver.nationality}` : ""}
                {ergDriver?.dateOfBirth
                  ? ` · 만 ${age(ergDriver.dateOfBirth)}세`
                  : ""}
              </p>
            </div>
          </div>

          {car.result && (
            <CategoryCard title="레이스 결과" icon={Flag}>
              <MiniStat label="출발" value={pos(car.result.grid)} />
              <MiniStat
                label="도착"
                value={pos(car.result.position)}
                accent={accent}
              />
              <MiniStat
                label="순위 변동"
                value={gained(g)}
                accent={
                  g != null && g > 0
                    ? "#22c55e"
                    : g != null && g < 0
                      ? "#ef4444"
                      : undefined
                }
              />
              <MiniStat label="포인트" value={numOr(car.result.points)} />
              <MiniStat label="완주 랩" value={numOr(car.result.laps)} />
              <MiniStat
                label="리더와 격차"
                value={car.result.gapToLeader ?? "—"}
              />
              <MiniStat
                label="총 레이스 시간"
                value={raceTime(car.result.totalTimeSec)}
              />
              <MiniStat label="상태" value={statusLabel(car.result.status)} />
            </CategoryCard>
          )}

          {car.performance && (
            <CategoryCard title="퍼포먼스" icon={Gauge}>
              <MiniStat
                label="최고 속도"
                value={
                  car.performance.topSpeed != null
                    ? `${car.performance.topSpeed} km/h`
                    : "—"
                }
                accent={accent}
              />
              <MiniStat
                label="패스티스트 랩"
                value={formatLap(car.performance.fastestLapSec)}
              />
              <MiniStat
                label="평균 랩"
                value={formatLap(car.performance.avgLapSec)}
              />
              <MiniStat
                label="베스트 S1"
                value={sector(car.performance.bestSector1)}
              />
              <MiniStat
                label="베스트 S2"
                value={sector(car.performance.bestSector2)}
              />
              <MiniStat
                label="베스트 S3"
                value={sector(car.performance.bestSector3)}
              />
            </CategoryCard>
          )}

          {car.tyres && (
            <CategoryCard title="타이어 & 핏스톱" icon={Disc3}>
              <div className="col-span-2 rounded-lg bg-black/30 p-3 sm:col-span-2">
                <p className="text-[11px] text-muted">컴파운드</p>
                <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                  {car.tyres.compounds.length ? (
                    car.tyres.compounds.map((c, i) => (
                      <TyrePill key={i} compound={c} />
                    ))
                  ) : (
                    <span className="text-base font-bold">—</span>
                  )}
                </div>
              </div>
              <MiniStat label="핏스톱" value={`${car.tyres.pitStops}회`} />
              <MiniStat
                label="최速 핏"
                value={
                  car.tyres.fastestPitSec != null
                    ? `${car.tyres.fastestPitSec.toFixed(1)}s`
                    : "—"
                }
              />
              <MiniStat
                label="총 핏 시간"
                value={
                  car.tyres.totalPitSec != null
                    ? `${car.tyres.totalPitSec.toFixed(1)}s`
                    : "—"
                }
              />
            </CategoryCard>
          )}

          {car.conditions && (
            <CategoryCard title="트랙 컨디션" icon={CloudSun}>
              <MiniStat label="기온" value={temp(car.conditions.airTemp)} />
              <MiniStat
                label="노면 온도"
                value={temp(car.conditions.trackTemp)}
              />
              <MiniStat
                label="습도"
                value={
                  car.conditions.humidity != null
                    ? `${car.conditions.humidity}%`
                    : "—"
                }
              />
              <MiniStat
                label="풍속"
                value={
                  car.conditions.windSpeed != null
                    ? `${car.conditions.windSpeed} m/s`
                    : "—"
                }
              />
              <MiniStat
                label="강우"
                value={car.conditions.rainfall ? "있음" : "없음"}
              />
            </CategoryCard>
          )}
        </div>
      )}
    </div>
  );
}

function CategoryCard({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: LucideIcon;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-line bg-surface p-4">
      <p className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted">
        <Icon className="h-3.5 w-3.5" style={{ color: "var(--team)" }} />
        {title}
      </p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{children}</div>
    </div>
  );
}

function TyrePill({ compound }: { compound: string }) {
  const color = tyreColor(compound);
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-black/30 px-2.5 py-1 text-xs font-semibold">
      <span
        className="h-2.5 w-2.5 rounded-full"
        style={{ backgroundColor: color }}
      />
      {compound}
    </span>
  );
}

function MiniStat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <div className="rounded-lg bg-black/30 p-3 text-center">
      <p className="text-[11px] text-muted">{label}</p>
      <p
        className="mt-0.5 font-display text-base font-bold tabular-nums"
        style={accent ? { color: accent } : undefined}
      >
        {value}
      </p>
    </div>
  );
}

function formatLap(seconds: number | null): string {
  if (seconds == null) return "—";
  const m = Math.floor(seconds / 60);
  const s = (seconds % 60).toFixed(3).padStart(6, "0");
  return `${m}:${s}`;
}

function pos(n: number | null): string {
  return n != null ? `P${n}` : "—";
}

function numOr(n: number | null): string {
  return n != null ? String(n) : "—";
}

function gained(n: number | null): string {
  if (n == null) return "—";
  if (n > 0) return `▲ ${n}`;
  if (n < 0) return `▼ ${-n}`;
  return "0";
}

function sector(seconds: number | null): string {
  return seconds != null ? seconds.toFixed(3) : "—";
}

function temp(t: number | null): string {
  return t != null ? `${t}°C` : "—";
}

function raceTime(seconds: number | null): string {
  if (seconds == null) return "—";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const pad = (n: number) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

function statusLabel(status: NonNullable<CarResponse["result"]>["status"]): string {
  return { FINISHED: "완주", DNF: "리타이어", DNS: "불출발", DSQ: "실격" }[status];
}

function age(dateOfBirth: string): number {
  const dob = new Date(dateOfBirth);
  const now = new Date();
  let years = now.getFullYear() - dob.getFullYear();
  const m = now.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) years--;
  return years;
}

function HeroStat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <div className="text-right">
      <p
        className="font-display text-2xl font-extrabold leading-none tabular-nums sm:text-3xl"
        style={accent ? { color: accent } : undefined}
      >
        {value}
      </p>
      <p className="mt-1 text-[11px] uppercase tracking-wide text-muted">
        {label}
      </p>
    </div>
  );
}

const TAB_ITEMS: { key: TabKey; label: string; icon: LucideIcon }[] = [
  { key: "results", label: "성적", icon: Trophy },
  { key: "car", label: "차량", icon: Car },
  { key: "charts", label: "차트", icon: BarChart3 },
];

// Inline pill tabs (desktop/tablet). Hidden on mobile, where MobileTabBar takes over.
function Tabs({
  tab,
  onChange,
  accent,
}: {
  tab: TabKey;
  onChange: (t: TabKey) => void;
  accent: string;
}) {
  return (
    <div className="hidden gap-1 rounded-xl border border-line bg-surface p-1 sm:flex">
      {TAB_ITEMS.map((it) => {
        const active = tab === it.key;
        const Icon = it.icon;
        return (
          <button
            key={it.key}
            onClick={() => onChange(it.key)}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition ${
              active ? "text-black" : "text-muted hover:text-zinc-200"
            }`}
            style={active ? { backgroundColor: accent } : undefined}
          >
            <Icon className="h-4 w-4" />
            {it.label}
          </button>
        );
      })}
    </div>
  );
}

// Fixed bottom navigation (mobile only) — app-like section switching.
function MobileTabBar({
  tab,
  onChange,
  accent,
}: {
  tab: TabKey;
  onChange: (t: TabKey) => void;
  accent: string;
}) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t border-line bg-background/90 backdrop-blur-md sm:hidden">
      {TAB_ITEMS.map((it) => {
        const active = tab === it.key;
        const Icon = it.icon;
        return (
          <button
            key={it.key}
            onClick={() => onChange(it.key)}
            className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-semibold transition ${
              active ? "" : "text-muted"
            }`}
            style={active ? { color: accent } : undefined}
          >
            <Icon className="h-5 w-5" />
            {it.label}
          </button>
        );
      })}
    </nav>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
      {children}
    </h2>
  );
}

function DashboardSkeleton() {
  return (
    <div className="animate-pulse space-y-5">
      <div className="h-36 rounded-2xl border border-line bg-surface" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-20 rounded-xl border border-line bg-surface" />
        ))}
      </div>
      <div className="h-11 rounded-xl border border-line bg-surface" />
      <div className="h-64 rounded-xl border border-line bg-surface" />
    </div>
  );
}

function CarSkeleton() {
  return (
    <div className="animate-pulse space-y-3">
      <div className="h-24 rounded-xl border border-line bg-surface" />
      <div className="h-28 rounded-xl border border-line bg-surface" />
      <div className="h-28 rounded-xl border border-line bg-surface" />
    </div>
  );
}

// Designed empty / error / info message block with an icon.
function StateMessage({
  icon: Icon,
  text,
  tone = "muted",
}: {
  icon: LucideIcon;
  text: string;
  tone?: "muted" | "error";
}) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-line bg-surface px-6 py-10 text-center">
      <Icon
        className={`h-6 w-6 ${tone === "error" ? "text-red-400" : "text-muted"}`}
      />
      <p className={`text-sm ${tone === "error" ? "text-red-400" : "text-muted"}`}>
        {text}
      </p>
    </div>
  );
}

// Best (lowest) numeric finishing position across the season, e.g. "P1".
function bestFinish(data: DashboardResponse, driverId: string): string {
  let best: number | null = null;
  for (const race of data.results) {
    const r = race.Results?.find((x) => x.Driver.driverId === driverId);
    if (r && /^\d+$/.test(r.positionText)) {
      const p = Number(r.position);
      if (best == null || p < best) best = p;
    }
  }
  return best != null ? `P${best}` : "—";
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <div className="rounded-xl border border-line bg-surface p-4 transition hover:border-zinc-600">
      <p className="text-xs text-muted">{label}</p>
      <p
        className="mt-1 font-display text-2xl font-extrabold tabular-nums"
        style={accent ? { color: accent } : undefined}
      >
        {value}
      </p>
    </div>
  );
}

function ResultsTable({
  data,
  driverId,
}: {
  data: DashboardResponse;
  driverId: string;
}) {
  if (data.results.length === 0) {
    return (
      <StateMessage icon={Flag} text="아직 완료된 경기가 없습니다." />
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-line">
      <table className="w-full text-sm">
        <thead className="bg-elevated text-left text-xs uppercase text-muted">
          <tr>
            <th className="px-4 py-2.5 font-medium">R</th>
            <th className="px-4 py-2.5 font-medium">그랑프리</th>
            <th className="px-4 py-2.5 text-center font-medium">순위</th>
            <th className="px-4 py-2.5 text-right font-medium">포인트</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {data.results.map((race) => {
            const result = race.Results?.find(
              (r) => r.Driver.driverId === driverId,
            );
            const pts = result ? Number(result.points) : 0;
            return (
              <tr key={race.round} className="bg-surface hover:bg-elevated">
                <td className="px-4 py-2.5 font-mono text-xs text-muted">
                  {race.round}
                </td>
                <td className="px-4 py-2.5">{race.raceName}</td>
                <td className="px-4 py-2.5 text-center">
                  <PositionBadge result={result} />
                </td>
                <td
                  className={`px-4 py-2.5 text-right font-display font-bold tabular-nums ${
                    pts > 0 ? "text-foreground" : "text-zinc-600"
                  }`}
                >
                  {result?.points ?? "0"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// Podium positions (P1–P3) get gold/silver/bronze badges; others are plain.
function PositionBadge({
  result,
}: {
  result: { position: string; positionText: string } | undefined;
}) {
  if (!result) return <span className="text-zinc-600">—</span>;
  const numeric = /^\d+$/.test(result.positionText);
  if (!numeric) {
    return (
      <span className="rounded-md bg-black/40 px-2 py-0.5 text-xs font-semibold text-zinc-500">
        {result.positionText}
      </span>
    );
  }
  const p = Number(result.position);
  const podium: Record<number, string> = {
    1: "#FFD700",
    2: "#C0C0C0",
    3: "#CD7F32",
  };
  const color = podium[p];
  if (color) {
    return (
      <span
        className="inline-flex h-6 min-w-6 items-center justify-center rounded-md px-1.5 text-xs font-extrabold tabular-nums text-black"
        style={{ backgroundColor: color }}
      >
        P{p}
      </span>
    );
  }
  return (
    <span className="font-semibold tabular-nums text-zinc-300">P{p}</span>
  );
}

function ordinal(position: string | undefined): string {
  if (!position) return "—";
  return `P${position}`;
}

function formatDate(date: string): string {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString("ko-KR", {
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}
