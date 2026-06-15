"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import Dashboard from "@/components/Dashboard";
import Intro from "@/components/Intro";
import Selector from "@/components/Selector";
import { SEASON, teamColor } from "@/lib/season";
import { FAVORITE_KEY, type Favorite } from "@/lib/types";

type Phase = "intro" | "select" | "dashboard";

export default function Home() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [favorite, setFavorite] = useState<Favorite | null>(null);
  const [ready, setReady] = useState(false);

  // Returning visitors with a saved favorite skip the intro and go straight to
  // their dashboard; first-time visitors see the intro.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(FAVORITE_KEY);
      if (raw) {
        setFavorite(JSON.parse(raw) as Favorite);
        setPhase("dashboard");
      }
    } catch {
      // ignore malformed storage
    }
    setReady(true);
  }, []);

  function select(fav: Favorite) {
    localStorage.setItem(FAVORITE_KEY, JSON.stringify(fav));
    setFavorite(fav);
    setPhase("dashboard");
  }

  // Reset returns to selection (not the intro — they're already in the app).
  function reset() {
    localStorage.removeItem(FAVORITE_KEY);
    setFavorite(null);
    setPhase("select");
  }

  if (!ready) return null;

  if (phase === "intro") {
    return <Intro season={SEASON} onStart={() => setPhase("select")} />;
  }

  if (phase === "dashboard" && favorite) {
    return (
      <AppShell
        accent={teamColor(favorite.constructorId)}
        right={
          <button
            onClick={reset}
            className="rounded-lg border border-line px-3 py-1.5 text-xs font-medium text-muted transition hover:border-zinc-600 hover:text-zinc-200"
          >
            팀/드라이버 변경
          </button>
        }
      >
        <Dashboard favorite={favorite} />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <Selector onSelect={select} />
    </AppShell>
  );
}
