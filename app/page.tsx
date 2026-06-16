"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import Dashboard from "@/components/Dashboard";
import Intro from "@/components/Intro";
import Selector from "@/components/Selector";
import TeamDriverModal from "@/components/TeamDriverModal";
import type { TabKey } from "@/components/Dashboard";
import { SEASON, availableSeasons, resolveSeason, teamColor } from "@/lib/season";
import { FAVORITE_KEY, SEASON_KEY, type Favorite } from "@/lib/types";

type Phase = "intro" | "select" | "dashboard";

const SEASONS = availableSeasons();

export default function Home() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [favorite, setFavorite] = useState<Favorite | null>(null);
  const [season, setSeasonState] = useState<string>(SEASON);
  const [ready, setReady] = useState(false);
  const [changeOpen, setChangeOpen] = useState(false);
  const [tab, setTab] = useState<TabKey>("results");

  // Returning visitors with a saved favorite skip the intro and go straight to
  // their dashboard; first-time visitors see the intro. Restore the last-used
  // season too (validated against the current selectable window).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(FAVORITE_KEY);
      if (raw) {
        setFavorite(JSON.parse(raw) as Favorite);
        setPhase("dashboard");
      }
      setSeasonState(resolveSeason(localStorage.getItem(SEASON_KEY)));
    } catch {
      // ignore malformed storage
    }
    setReady(true);
  }, []);

  function setSeason(next: string) {
    setSeasonState(next);
    try {
      localStorage.setItem(SEASON_KEY, next);
    } catch {
      // ignore storage failures (e.g. private mode)
    }
  }

  function select(fav: Favorite) {
    localStorage.setItem(FAVORITE_KEY, JSON.stringify(fav));
    setFavorite(fav);
    setPhase("dashboard");
    setChangeOpen(false);
  }

  if (!ready) return null;

  if (phase === "intro") {
    return <Intro season={SEASON} onStart={() => setPhase("select")} />;
  }

  // Logo / brand click: return to the team-selection page AND clear the saved
  // favorite, so a refresh starts fresh from the intro (not the old detail).
  function goHome() {
    localStorage.removeItem(FAVORITE_KEY);
    setFavorite(null);
    setChangeOpen(false);
    setTab("results");
    setPhase("select");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (phase === "dashboard" && favorite) {
    return (
      <AppShell
        accent={teamColor(favorite.constructorId)}
        onHome={goHome}
        season={season}
        seasons={SEASONS}
        onSeasonChange={setSeason}
        right={
          <button
            onClick={() => setChangeOpen(true)}
            className="rounded-lg border border-line px-3 py-1.5 text-xs font-medium text-muted transition hover:border-zinc-600 hover:text-zinc-200"
          >
            팀/드라이버 변경
          </button>
        }
      >
        <Dashboard
          favorite={favorite}
          season={season}
          tab={tab}
          onTabChange={setTab}
        />
        {changeOpen && (
          <TeamDriverModal
            current={favorite}
            season={season}
            onClose={() => setChangeOpen(false)}
            onSelect={select}
          />
        )}
      </AppShell>
    );
  }

  return (
    <AppShell season={season} seasons={SEASONS} onSeasonChange={setSeason}>
      <Selector season={season} onSelect={select} />
    </AppShell>
  );
}
