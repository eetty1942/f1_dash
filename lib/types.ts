// Shapes returned by the dashboard's own API routes, shared by client UI.
import type {
  Constructor,
  ConstructorStanding,
  DriverStanding,
  Race,
} from "@/lib/jolpica";

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
  // The driver's actual constructor for THIS season (resolved from standings),
  // which may differ from the saved favorite's team in other seasons.
  driverConstructor: Constructor | null;
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

// One round shaped for the schedule dot-map: coordinates + display fields +
// a derived status used to colour its marker.
export interface ScheduleRound {
  round: number;
  raceName: string;
  circuitName: string;
  locality: string;
  country: string;
  lat: number;
  long: number;
  date: string;
  time: string | null;
  status: "past" | "next" | "upcoming";
}

export interface ScheduleResponse {
  season: string;
  rounds: ScheduleRound[];
}

// --- Driver comparison (per-season) -------------------------------------

// One driver's season summary, used for the comparison legend/colours.
export interface CompareDriver {
  driverId: string;
  name: string;
  code: string | null;
  constructorId: string;
  constructorName: string;
  position: number;
  points: number;
  wins: number;
}

// One driver's result in a single round of the season.
export interface CompareRoundPoint {
  round: number;
  points: number; // points scored that race
  cumulative: number; // running championship total
  finishPos: number | null; // numeric finishing position, or null (DNF/DSQ/…)
}

export interface CompareResponse {
  season: string;
  rounds: number; // number of rounds that have results
  drivers: CompareDriver[]; // sorted by championship position
  series: Record<string, CompareRoundPoint[]>; // driverId → per-round points
}

// --- Constructor (team) comparison (per-season) --------------------------

export interface CompareTeamDriver {
  driverId: string;
  name: string;
  code: string | null;
  points: number; // this driver's season points (race + sprint)
}

// A team's season summary with aggregate stats derived from results.
export interface CompareTeam {
  constructorId: string;
  name: string;
  position: number;
  points: number;
  wins: number;
  podiums: number; // car finishes in P1–P3
  fastestLaps: number; // race fastest-lap awards
  oneTwos: number; // rounds with both cars in P1 & P2
  dnfs: number; // non-classified finishes (R/D/W/…)
  bestFinish: number | null; // best single-car finishing position
  drivers: CompareTeamDriver[]; // season lineup, points desc
}

export interface CompareTeamsResponse {
  season: string;
  rounds: number;
  teams: CompareTeam[]; // sorted by championship position
  // constructorId → per-round (team points, cumulative, best finish that round)
  series: Record<string, CompareRoundPoint[]>;
}

// The user's saved favorites, persisted in localStorage.
export interface Favorite {
  constructorId: string;
  teamName: string;
  driverId: string;
  driverName: string;
}

export const FAVORITE_KEY = "f1dash.favorite";

// The user's last-selected season (header dropdown), persisted in localStorage.
export const SEASON_KEY = "f1dash.season";
