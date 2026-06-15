// Shapes returned by the dashboard's own API routes, shared by client UI.
import type { ConstructorStanding, DriverStanding, Race } from "@/lib/jolpica";

export interface TeamOption {
  constructorId: string;
  name: string;
  drivers: { driverId: string; name: string; code: string | null }[];
}

export interface OptionsResponse {
  season: string;
  teams: TeamOption[];
  // Season-wide progress (same for everyone) — shown on the team-selection page.
  completedRounds: number;
  totalRounds: number;
}

export interface DashboardResponse {
  season: string;
  driverStanding: DriverStanding | null;
  constructorStanding: ConstructorStanding | null;
  results: Race[];
  nextRace: Race | null;
  completedRounds: number;
  totalRounds: number;
}

// Car / telemetry details sourced from OpenF1 for the selected driver, grouped
// into categories for display. Any group may be null when data is unavailable.
export interface CarResponse {
  source: "openf1";
  session: { name: string; country: string | null; sessionKey: number } | null;
  driver: {
    number: number;
    acronym: string;
    fullName: string;
    teamName: string | null;
    teamColour: string | null;
  } | null;
  result: {
    position: number | null;
    points: number | null;
    grid: number | null;
    positionsGained: number | null; // grid - finish (positive = gained)
    gapToLeader: string | null; // display-ready, e.g. "+40.5s" or "+1 LAP"
    totalTimeSec: number | null;
    laps: number | null;
    status: "FINISHED" | "DNF" | "DNS" | "DSQ";
  } | null;
  performance: {
    topSpeed: number | null;
    fastestLapSec: number | null;
    avgLapSec: number | null;
    bestSector1: number | null;
    bestSector2: number | null;
    bestSector3: number | null;
  } | null;
  tyres: {
    compounds: string[]; // in stint order, e.g. ["MEDIUM", "HARD"]
    pitStops: number;
    fastestPitSec: number | null;
    totalPitSec: number | null;
  } | null;
  conditions: {
    airTemp: number | null;
    trackTemp: number | null;
    humidity: number | null;
    windSpeed: number | null;
    rainfall: boolean;
  } | null;
}

// The user's saved favorites, persisted in localStorage.
export interface Favorite {
  constructorId: string;
  teamName: string;
  driverId: string;
  driverName: string;
}

export const FAVORITE_KEY = "f1dash.favorite";
