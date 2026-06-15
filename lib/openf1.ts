// OpenF1 API client (https://openf1.org) — free, no key for historical data.
// Used for per-driver car/telemetry details that the Ergast/Jolpica schema lacks
// (top speed, sectors, pit stops, tyres, finishing data, track conditions).

const BASE = "https://api.openf1.org/v1";

// Completed-session data is immutable; cache aggressively.
const REVALIDATE_SECONDS = 60 * 60;

export interface OpenF1Session {
  session_key: number;
  session_name: string;
  country_name: string | null;
  location: string | null;
  date_start: string;
}

export interface OpenF1Driver {
  driver_number: number;
  full_name: string;
  name_acronym: string;
  team_name: string | null;
  team_colour: string | null;
  headshot_url: string | null;
}

export interface OpenF1Lap {
  lap_number: number;
  lap_duration: number | null;
  duration_sector_1: number | null;
  duration_sector_2: number | null;
  duration_sector_3: number | null;
  st_speed: number | null;
  i1_speed: number | null;
  i2_speed: number | null;
  is_pit_out_lap: boolean;
}

export interface OpenF1Pit {
  pit_duration: number | null;
  lap_number: number;
}

export interface OpenF1Stint {
  stint_number: number;
  compound: string | null;
  lap_start: number;
  lap_end: number;
}

export interface OpenF1Position {
  position: number;
  date: string;
}

export interface OpenF1SessionResult {
  position: number | null;
  number_of_laps: number | null;
  points: number | null;
  dnf: boolean;
  dns: boolean;
  dsq: boolean;
  // Seconds behind the leader, or a string like "+1 LAP" for lapped cars, or null.
  gap_to_leader: number | string | null;
  duration: number | null;
}

export interface OpenF1Weather {
  air_temperature: number | null;
  track_temperature: number | null;
  humidity: number | null;
  wind_speed: number | null;
  rainfall: number | null;
}

// OpenF1's free tier rate-limits bursts (HTTP 429). Retry a few times with
// linear backoff; responses are cached for an hour once they succeed.
async function get<T>(path: string, attempt = 0): Promise<T> {
  const res = await fetch(`${BASE}/${path}`, {
    next: { revalidate: REVALIDATE_SECONDS },
    headers: { Accept: "application/json" },
  });
  if (res.status === 429 && attempt < 4) {
    await sleep(400 * (attempt + 1));
    return get<T>(path, attempt + 1);
  }
  if (!res.ok) {
    throw new Error(`OpenF1 request failed (${res.status}) for ${path}`);
  }
  return (await res.json()) as T;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// OpenF1 returns `{ detail: "No results found." }` (not an array) for empty
// filters; treat that as an empty list.
async function getList<T>(path: string): Promise<T[]> {
  const data = await get<T[] | { detail: string }>(path);
  return Array.isArray(data) ? data : [];
}

// Most recent race session of the year whose start time is in the past.
export async function getLatestRaceSession(
  year: string,
): Promise<OpenF1Session | null> {
  const sessions = await getList<OpenF1Session>(
    `sessions?year=${year}&session_name=Race`,
  );
  const now = Date.now();
  const past = sessions
    .filter((s) => new Date(s.date_start).getTime() <= now)
    .sort(
      (a, b) =>
        new Date(b.date_start).getTime() - new Date(a.date_start).getTime(),
    );
  return past[0] ?? null;
}

export function getSessionDrivers(sessionKey: number) {
  return getList<OpenF1Driver>(`drivers?session_key=${sessionKey}`);
}

export function getDriverLaps(sessionKey: number, driverNumber: number) {
  return getList<OpenF1Lap>(
    `laps?session_key=${sessionKey}&driver_number=${driverNumber}`,
  );
}

export function getDriverPit(sessionKey: number, driverNumber: number) {
  return getList<OpenF1Pit>(
    `pit?session_key=${sessionKey}&driver_number=${driverNumber}`,
  );
}

export function getDriverStints(sessionKey: number, driverNumber: number) {
  return getList<OpenF1Stint>(
    `stints?session_key=${sessionKey}&driver_number=${driverNumber}`,
  );
}

export function getDriverPositions(sessionKey: number, driverNumber: number) {
  return getList<OpenF1Position>(
    `position?session_key=${sessionKey}&driver_number=${driverNumber}`,
  );
}

export function getSessionResult(sessionKey: number, driverNumber: number) {
  return getList<OpenF1SessionResult>(
    `session_result?session_key=${sessionKey}&driver_number=${driverNumber}`,
  );
}

export function getSessionWeather(sessionKey: number) {
  return getList<OpenF1Weather>(`weather?session_key=${sessionKey}`);
}
