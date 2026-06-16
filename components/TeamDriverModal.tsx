"use client";

import { ChevronLeft, TriangleAlert, X } from "lucide-react";
import { type CSSProperties, useEffect, useState } from "react";
import DriverHeadshot from "@/components/DriverHeadshot";
import { teamColor, teamLogo } from "@/lib/season";
import type { Favorite, OptionsResponse, TeamOption } from "@/lib/types";

// Two-step modal for changing the favorite from within the dashboard:
// team grid → driver headshots → onSelect. The current favorite is highlighted.
export default function TeamDriverModal({
  current,
  season,
  onClose,
  onSelect,
}: {
  current: Favorite;
  season: string;
  onClose: () => void;
  onSelect: (fav: Favorite) => void;
}) {
  const [options, setOptions] = useState<OptionsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [team, setTeam] = useState<TeamOption | null>(null);

  useEffect(() => {
    let active = true;
    setOptions(null);
    setError(null);
    setTeam(null);
    fetch(`/api/options?season=${season}`)
      .then((res) => {
        if (!res.ok) throw new Error("옵션을 불러오지 못했습니다.");
        return res.json();
      })
      .then((d: OptionsResponse) => active && setOptions(d))
      .catch((err: Error) => active && setError(err.message));
    return () => {
      active = false;
    };
  }, [season]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const accent = teamColor(team?.constructorId ?? current.constructorId);

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
        <header className="team-glow flex items-center justify-between border-b border-line px-5 py-4">
          <div className="flex items-center gap-3">
            {team ? (
              <button
                onClick={() => setTeam(null)}
                aria-label="팀 다시 선택"
                className="rounded-lg p-1.5 text-muted transition hover:bg-white/10 hover:text-foreground"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            ) : null}
            <div>
              <p className="text-[11px] uppercase tracking-wide text-muted">
                {team ? "드라이버 선택" : "팀 선택"}
              </p>
              <p className="font-display text-lg font-bold leading-tight">
                {team ? team.name : "팀/드라이버 변경"}
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
          {error && (
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <TriangleAlert className="h-6 w-6 text-red-400" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {!options && !error && (
            <div className="grid grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-20 animate-pulse rounded-xl bg-elevated" />
              ))}
            </div>
          )}

          {options && !team && (
            <div className="grid grid-cols-3 gap-x-3 gap-y-5 sm:grid-cols-4">
              {options.teams.map((t) => {
                const isCurrent = t.constructorId === current.constructorId;
                return (
                  <button
                    key={t.constructorId}
                    onClick={() => setTeam(t)}
                    className={`group flex flex-col items-center gap-2 rounded-xl p-2 transition hover:-translate-y-0.5 ${
                      isCurrent ? "bg-white/5" : ""
                    }`}
                    style={
                      isCurrent
                        ? { boxShadow: `inset 0 0 0 1px ${teamColor(t.constructorId)}` }
                        : undefined
                    }
                  >
                    <div className="flex h-12 items-center justify-center">
                      <TeamLogoImg team={t} season={season} />
                    </div>
                    <span className="text-center text-[11px] font-semibold text-zinc-300 group-hover:text-foreground">
                      {t.name}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {options && team && (
            <div className="grid grid-cols-2 gap-3">
              {team.drivers.length === 0 ? (
                <p className="col-span-2 py-8 text-center text-sm text-muted">
                  이 팀의 드라이버 정보가 아직 없습니다.
                </p>
              ) : (
                team.drivers.map((d) => {
                  const isCurrent = d.driverId === current.driverId;
                  return (
                    <button
                      key={d.driverId}
                      onClick={() =>
                        onSelect({
                          constructorId: team.constructorId,
                          teamName: team.name,
                          driverId: d.driverId,
                          driverName: d.name,
                        })
                      }
                      className={`group overflow-hidden rounded-xl border bg-elevated text-left transition hover:-translate-y-1 ${
                        isCurrent ? "border-transparent" : "border-line hover:border-zinc-600"
                      }`}
                      style={
                        isCurrent ? { boxShadow: `0 0 0 1px ${accent}` } : undefined
                      }
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
                          <p className="font-mono text-[11px] text-muted">{d.code}</p>
                        ) : null}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Team logo (official white wordmark) with a team-coloured initials fallback.
function TeamLogoImg({ team, season }: { team: TeamOption; season?: string }) {
  const [failed, setFailed] = useState(false);
  const src = teamLogo(team.constructorId, season);

  if (src && !failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={`${team.name} 로고`}
        className="max-h-10 w-auto object-contain transition group-hover:scale-110"
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <div
      className="flex h-10 w-10 items-center justify-center rounded-full text-[11px] font-bold text-black"
      style={{ backgroundColor: teamColor(team.constructorId) }}
    >
      {team.name.slice(0, 3).toUpperCase()}
    </div>
  );
}
