"use client";

import { TriangleAlert, X } from "lucide-react";
import { type CSSProperties, useEffect, useState } from "react";
import DriverHeadshot from "@/components/DriverHeadshot";
import { teamColor, teamLogo } from "@/lib/season";
import type { Favorite, OptionsResponse, TeamOption } from "@/lib/types";

// First-run screen: pick a team (logo grid) → a modal lists that team's drivers
// with their official F1 headshots → choosing one saves the favorite.
export default function Selector({
  onSelect,
}: {
  onSelect: (fav: Favorite) => void;
}) {
  const [options, setOptions] = useState<OptionsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [modalTeam, setModalTeam] = useState<TeamOption | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/options")
      .then((res) => {
        if (!res.ok) throw new Error("옵션을 불러오지 못했습니다.");
        return res.json();
      })
      .then((data: OptionsResponse) => active && setOptions(data))
      .catch((err: Error) => active && setError(err.message));
    return () => {
      active = false;
    };
  }, []);

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
        팀을 선택하세요
      </h1>
      <p className="mt-2 text-sm text-muted">
        팀을 고르면 소속 드라이버를 선택할 수 있어요. 선택은 이 브라우저에
        저장됩니다.
      </p>

      <div className="mt-8 grid grid-cols-3 gap-x-4 gap-y-6 sm:grid-cols-4">
        {options.teams.map((t) => (
          <button
            key={t.constructorId}
            onClick={() => setModalTeam(t)}
            className="group flex flex-col items-center gap-3 transition hover:-translate-y-1"
          >
            <div className="flex h-16 items-center justify-center">
              <TeamLogo team={t} />
            </div>
            <span className="text-center text-xs font-semibold text-zinc-300 group-hover:text-foreground">
              {t.name}
            </span>
          </button>
        ))}
      </div>

      {modalTeam && (
        <DriverModal
          team={modalTeam}
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
  onClose,
  onPick,
}: {
  team: TeamOption;
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
            <TeamLogo team={team} small />
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
function TeamLogo({ team, small = false }: { team: TeamOption; small?: boolean }) {
  const [failed, setFailed] = useState(false);
  const src = teamLogo(team.constructorId);
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
