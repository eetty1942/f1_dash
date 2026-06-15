// Jolpica F1 API client (Ergast-compatible successor).
// Docs: https://github.com/jolpica/jolpica-f1
// All responses are wrapped in an `MRData` envelope.

const BASE = "https://api.jolpi.ca/ergast/f1";

// Revalidate cached responses once per hour. Season standings change only on
// race weekends, so aggressive caching is safe and keeps us within rate limits.
const REVALIDATE_SECONDS = 60 * 60;

// ---------------------------------------------------------------------------
// Domain types (subset of the Ergast schema that this dashboard consumes)
// ---------------------------------------------------------------------------

export interface Driver {
  driverId: string;
  permanentNumber?: string;
  code?: string;
  url: string;
  givenName: string;
  familyName: string;
  dateOfBirth: string;
  nationality: string;
}

export interface Constructor {
  constructorId: string;
  url: string;
  name: string;
  nationality: string;
}

export interface DriverStanding {
  position: string;
  positionText: string;
  points: string;
  wins: string;
  Driver: Driver;
  Constructors: Constructor[];
}

export interface ConstructorStanding {
  position: string;
  positionText: string;
  points: string;
  wins: string;
  Constructor: Constructor;
}

export interface Location {
  lat: string;
  long: string;
  locality: string;
  country: string;
}

export interface Circuit {
  circuitId: string;
  url: string;
  circuitName: string;
  Location: Location;
}

export interface RaceResult {
  number: string;
  position: string;
  positionText: string;
  points: string;
  grid?: string;
  laps?: string;
  status?: string;
  Time?: { time: string };
  FastestLap?: {
    rank?: string;
    lap?: string;
    Time?: { time: string };
  };
  Driver: Driver;
  Constructor: Constructor;
}

export interface Race {
  season: string;
  round: string;
  url: string;
  raceName: string;
  Circuit: Circuit;
  date: string;
  time?: string;
  Results?: RaceResult[];
}

// ---------------------------------------------------------------------------
// Low-level fetch
// ---------------------------------------------------------------------------

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}/${path}`, {
    next: { revalidate: REVALIDATE_SECONDS },
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    throw new Error(`Jolpica request failed (${res.status}) for ${path}`);
  }
  return (await res.json()) as T;
}

// ---------------------------------------------------------------------------
// High-level helpers
// ---------------------------------------------------------------------------

export async function getDriverStandings(
  season: string,
): Promise<DriverStanding[]> {
  const data = await get<{
    MRData: {
      StandingsTable: { StandingsLists: { DriverStandings: DriverStanding[] }[] };
    };
  }>(`${season}/driverStandings.json`);
  return data.MRData.StandingsTable.StandingsLists[0]?.DriverStandings ?? [];
}

export async function getConstructorStandings(
  season: string,
): Promise<ConstructorStanding[]> {
  const data = await get<{
    MRData: {
      StandingsTable: {
        StandingsLists: { ConstructorStandings: ConstructorStanding[] }[];
      };
    };
  }>(`${season}/constructorStandings.json`);
  return data.MRData.StandingsTable.StandingsLists[0]?.ConstructorStandings ?? [];
}

export async function getDriverResults(
  season: string,
  driverId: string,
): Promise<Race[]> {
  const data = await get<{
    MRData: { RaceTable: { Races: Race[] } };
  }>(`${season}/drivers/${driverId}/results.json?limit=100`);
  return data.MRData.RaceTable.Races ?? [];
}

export async function getSchedule(season: string): Promise<Race[]> {
  const data = await get<{
    MRData: { RaceTable: { Races: Race[] } };
  }>(`${season}.json?limit=100`);
  return data.MRData.RaceTable.Races ?? [];
}
