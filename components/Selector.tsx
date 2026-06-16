"use client";

import {
  CalendarDays,
  Construction,
  GitCompareArrows,
  Info,
  TriangleAlert,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import { type CSSProperties, useEffect, useState } from "react";
import Banner, { type BannerItem } from "@/components/Banner";
import ComingSoonModal from "@/components/ComingSoonModal";
import CompareView from "@/components/CompareView";
import ScheduleView from "@/components/ScheduleView";
import DriverHeadshot from "@/components/DriverHeadshot";
import SeasonProgress from "@/components/SeasonProgress";
import { teamColor, teamLogo } from "@/lib/season";
import type { Favorite, OptionsResponse, TeamOption } from "@/lib/types";

// Promo banners shown below the team grid. Today there is one sample; more can
// be appended and the carousel auto-slides between them.
const BANNERS: BannerItem[] = [
  {
    id: "match",
    title: "나에게 맞는 팀과 드라이버는?",
    subtitle: "취향 기반 추천으로 응원할 팀을 찾아보세요",
  },
];

// In-page views switched by the bottom feature bar (tab-like, not modals).
export type ViewKey = "teams" | "schedule" | "driver-cmp" | "constructor-cmp";

const VIEW_TITLE: Record<ViewKey, string> = {
  teams: "팀을 선택하세요",
  schedule: "시즌 일정",
  "driver-cmp": "선수 비교",
  "constructor-cmp": "컨스트럭터 비교",
};

// First-run screen: pick a team (logo grid) → a modal lists that team's drivers
// with their official F1 headshots → choosing one saves the favorite.
export default function Selector({
  season,
  initialView = "teams",
  onSelect,
  onDriverDetail,
}: {
  season: string;
  initialView?: ViewKey;
  onSelect: (fav: Favorite) => void;
  // Navigate to a driver's detail page, remembering the comparison origin.
  onDriverDetail?: (fav: Favorite) => void;
}) {
  const [options, setOptions] = useState<OptionsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [modalTeam, setModalTeam] = useState<TeamOption | null>(null);
  // Feature name whose "coming soon" modal is open, or null when closed.
  const [comingSoon, setComingSoon] = useState<string | null>(null);
  // Which in-page view the bottom feature bar has switched to.
  const [view, setView] = useState<ViewKey>(initialView);

  function changeView(v: ViewKey) {
    setView(v);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  useEffect(() => {
    let active = true;
    setOptions(null);
    setError(null);
    fetch(`/api/options?season=${season}`)
      .then((res) => {
        if (!res.ok) throw new Error("옵션을 불러오지 못했습니다.");
        return res.json();
      })
      .then((data: OptionsResponse) => active && setOptions(data))
      .catch((err: Error) => active && setError(err.message));
    return () => {
      active = false;
    };
  }, [season]);

  if (error) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-2 rounded-xl border border-line bg-surface px-6 py-12 text-center">
        <TriangleAlert className="h-6 w-6 text-red-400" />
        <p className="text-sm text-red-400">{error}</p>
      </div>
    );
  }

  if (!options) return <SelectorSkeleton />;

  return (
    <div className="mx-auto w-full max-w-3xl">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-team">
        {options.season} Season
      </p>
      <h1 className="mt-1.5 font-display text-3xl font-extrabold tracking-tight">
        {VIEW_TITLE[view]}
      </h1>
      {view === "teams" && (
        <p className="mt-2 text-sm text-muted">
          팀을 고르면 소속 드라이버를 선택할 수 있어요. 선택은 이 브라우저에
          저장됩니다.
        </p>
      )}

      <div className="mt-6 rounded-xl border border-line bg-surface p-4">
        <SeasonProgress
          completed={options.completedRounds}
          total={options.totalRounds}
          accent="#e10600"
        />
      </div>

      {/* In-page content for the active feature (switched via the bar below). */}
      {view === "teams" && (
        <>
          <div className="mt-8 grid grid-cols-3 gap-x-4 gap-y-6 sm:grid-cols-4">
            {options.teams.map((t) => (
              <button
                key={t.constructorId}
                onClick={() => setModalTeam(t)}
                className="group flex flex-col items-center gap-3 transition hover:-translate-y-1"
              >
                <div className="flex h-16 items-center justify-center">
                  <TeamLogo team={t} season={season} />
                </div>
                <span className="text-center text-xs font-semibold text-zinc-300 group-hover:text-foreground">
                  {t.name}
                </span>
              </button>
            ))}
          </div>

          {/* Promo banner — auto-sliding; tapping opens a "coming soon" modal. */}
          <div className="mt-8">
            <Banner
              items={BANNERS}
              onItemClick={(item) => setComingSoon(item.title)}
            />
          </div>
        </>
      )}

      {view === "schedule" && (
        <div className="mt-8">
          <ScheduleView season={season} />
        </div>
      )}

      {view === "driver-cmp" && (
        <CompareView
          season={season}
          onDriverSelect={(d) =>
            (onDriverDetail ?? onSelect)({
              constructorId: d.constructorId,
              teamName: d.constructorName,
              driverId: d.driverId,
              driverName: d.name,
            })
          }
        />
      )}

      {view === "constructor-cmp" && (
        <InlineComingSoon label={VIEW_TITLE["constructor-cmp"]} />
      )}

      {/* Bottom feature bar — switches the in-page view above (tab-like). */}
      <div className="mt-8">
        <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
          더 보기
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <FeatureCard
            icon={Info}
            label="팀/상세정보"
            active={view === "teams"}
            onClick={() => changeView("teams")}
          />
          <FeatureCard
            icon={CalendarDays}
            label="일정"
            active={view === "schedule"}
            onClick={() => changeView("schedule")}
          />
          <FeatureCard
            icon={Users}
            label="선수 비교"
            active={view === "driver-cmp"}
            onClick={() => changeView("driver-cmp")}
          />
          <FeatureCard
            icon={GitCompareArrows}
            label="컨스트럭터 비교"
            active={view === "constructor-cmp"}
            onClick={() => changeView("constructor-cmp")}
          />
        </div>
      </div>

      {comingSoon && (
        <ComingSoonModal
          title={comingSoon}
          onClose={() => setComingSoon(null)}
        />
      )}

      {modalTeam && (
        <DriverModal
          team={modalTeam}
          season={season}
          onClose={() => setModalTeam(null)}
          onPick={(d) =>
            onSelect({
              constructorId: modalTeam.constructorId,
              teamName: modalTeam.name,
              driverId: d.driverId,
              driverName: d.name,
            })
          }
        />
      )}
    </div>
  );
}

function DriverModal({
  team,
  season,
  onClose,
  onPick,
}: {
  team: TeamOption;
  season: string;
  onClose: () => void;
  onPick: (d: TeamOption["drivers"][number]) => void;
}) {
  const accent = teamColor(team.constructorId);

  // Close on Escape.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={onClose}
      style={{ "--team": accent } as CSSProperties}
    >
      <div
        className="rise-in w-full max-w-lg overflow-hidden rounded-2xl border border-line bg-surface shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header
          className="team-glow flex items-center justify-between border-b border-line px-5 py-4"
        >
          <div className="flex items-center gap-3">
            <TeamLogo team={team} season={season} small />
            <div>
              <p className="text-[11px] uppercase tracking-wide text-muted">
                드라이버 선택
              </p>
              <p className="font-display text-lg font-bold leading-tight">
                {team.name}
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

        <div className="max-h-[70vh] overflow-y-auto p-5">
          {team.drivers.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted">
              이 팀의 드라이버 정보가 아직 없습니다.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {team.drivers.map((d) => (
                <button
                  key={d.driverId}
                  onClick={() => onPick(d)}
                  className="group overflow-hidden rounded-xl border border-line bg-elevated text-left transition hover:-translate-y-1 hover:border-zinc-600"
                >
                  <div
                    className="relative h-36 w-full overflow-hidden"
                    style={{
                      background: `radial-gradient(120% 120% at 50% 0%, ${accent}33, transparent 70%)`,
                    }}
                  >
                    <DriverHeadshot
                      constructorId={team.constructorId}
                      name={d.name}
                      accent={accent}
                      season={season}
                      className="h-full w-full transition group-hover:scale-105"
                    />
                    <span
                      className="absolute left-0 top-0 h-1 w-full"
                      style={{ backgroundColor: accent }}
                    />
                  </div>
                  <div className="p-3">
                    <p className="truncate text-sm font-semibold">{d.name}</p>
                    {d.code ? (
                      <p className="font-mono text-[11px] text-muted">
                        {d.code}
                      </p>
                    ) : null}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// One entry in the bottom feature launcher. `active` marks the live feature
// (team/detail) with the team accent; others are muted placeholders.
function FeatureCard({
  icon: Icon,
  label,
  active = false,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`group flex flex-col items-center gap-2 rounded-xl border bg-surface px-3 py-4 text-center transition hover:-translate-y-0.5 ${
        active ? "border-transparent bg-white/5" : "border-line hover:border-zinc-600"
      }`}
      style={active ? { boxShadow: "inset 0 0 0 1px #e10600" } : undefined}
    >
      <Icon
        className="h-5 w-5"
        style={{ color: active ? "#e10600" : undefined }}
      />
      <span
        className={`text-xs font-semibold ${active ? "text-foreground" : "text-zinc-300 group-hover:text-foreground"}`}
      >
        {label}
      </span>
    </button>
  );
}

// Temporary in-page placeholder for features not built yet (선수/컨스트럭터 비교).
function InlineComingSoon({ label }: { label: string }) {
  return (
    <div className="mt-8 flex flex-col items-center gap-2 rounded-xl border border-dashed border-line bg-surface px-6 py-16 text-center">
      <Construction className="h-7 w-7 text-muted" />
      <p className="font-display text-base font-bold">{label} · 준비중</p>
      <p className="max-w-xs text-sm text-muted">
        해당 기능은 준비중입니다. 곧 항목별 상세 가이드와 함께 제공될 예정입니다.
      </p>
    </div>
  );
}

function SelectorSkeleton() {
  return (
    <div className="mx-auto w-full max-w-3xl animate-pulse">
      <div className="h-8 w-56 rounded-lg bg-surface" />
      <div className="mt-3 h-4 w-80 max-w-full rounded bg-surface" />
      <div className="mt-8 grid grid-cols-3 gap-6 sm:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-20 rounded-xl bg-surface" />
        ))}
      </div>
    </div>
  );
}

// Team logo (official white wordmark). Falls back to a team-coloured initials
// badge for unknown teams or load failures.
function TeamLogo({
  team,
  season,
  small = false,
}: {
  team: TeamOption;
  season?: string;
  small?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const src = teamLogo(team.constructorId, season);
  const size = small ? "max-h-8" : "max-h-12";

  if (src && !failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={`${team.name} 로고`}
        className={`${size} w-auto object-contain transition group-hover:scale-110`}
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <div
      className={`flex items-center justify-center rounded-full text-[11px] font-bold text-black ${
        small ? "h-8 w-8" : "h-12 w-12"
      }`}
      style={{ backgroundColor: teamColor(team.constructorId) }}
    >
      {team.name.slice(0, 3).toUpperCase()}
    </div>
  );
}
