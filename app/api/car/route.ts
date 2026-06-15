import { NextRequest, NextResponse } from "next/server";
import {
  getDriverLaps,
  getDriverPit,
  getDriverPositions,
  getDriverStints,
  getLatestRaceSession,
  getSessionDrivers,
  getSessionResult,
  getSessionWeather,
  type OpenF1Lap,
  type OpenF1Pit,
  type OpenF1Position,
  type OpenF1SessionResult,
  type OpenF1Stint,
  type OpenF1Weather,
} from "@/lib/openf1";
import { SEASON } from "@/lib/season";
import type { CarResponse } from "@/lib/types";

// Categorized car/telemetry details for one driver, from the most recent
// completed race. The driver is matched to OpenF1 by their three-letter code
// (Ergast `code` == OpenF1 `name_acronym`), e.g. "NOR", "HAM".
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  if (!code) {
    return NextResponse.json(
      { error: "`code` query parameter is required." },
      { status: 400 },
    );
  }

  try {
    const session = await getLatestRaceSession(SEASON);
    if (!session) return NextResponse.json(empty());

    const sessionInfo = {
      name: session.session_name,
      country: session.country_name,
      sessionKey: session.session_key,
    };

    const drivers = await getSessionDrivers(session.session_key);
    const driver = drivers.find(
      (d) => d.name_acronym.toUpperCase() === code.toUpperCase(),
    );
    if (!driver) {
      return NextResponse.json({ ...empty(), session: sessionInfo });
    }

    const sk = session.session_key;
    const num = driver.driver_number;
    // Serialized to stay under OpenF1's burst rate limit; each call is cached.
    const laps = await getDriverLaps(sk, num);
    const pit = await getDriverPit(sk, num);
    const stints = await getDriverStints(sk, num);
    const positions = await getDriverPositions(sk, num);
    const results = await getSessionResult(sk, num);
    const weather = await getSessionWeather(sk);

    const body: CarResponse = {
      source: "openf1",
      session: sessionInfo,
      driver: {
        number: driver.driver_number,
        acronym: driver.name_acronym,
        fullName: driver.full_name,
        teamName: driver.team_name,
        teamColour: driver.team_colour,
      },
      result: summarizeResult(results[0], positions),
      performance: summarizePerformance(laps),
      tyres: summarizeTyres(stints, pit),
      conditions: summarizeConditions(weather),
    };
    return NextResponse.json(body);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 502 });
  }
}

function summarizeResult(
  result: OpenF1SessionResult | undefined,
  positions: OpenF1Position[],
): CarResponse["result"] {
  if (!result && positions.length === 0) return null;

  const sorted = [...positions].sort((a, b) => a.date.localeCompare(b.date));
  const grid = sorted[0]?.position ?? null;
  const finish = result?.position ?? sorted[sorted.length - 1]?.position ?? null;

  const status: NonNullable<CarResponse["result"]>["status"] = result?.dsq
    ? "DSQ"
    : result?.dns
      ? "DNS"
      : result?.dnf
        ? "DNF"
        : "FINISHED";

  return {
    position: finish,
    points: result?.points ?? null,
    grid,
    positionsGained:
      grid != null && finish != null ? grid - finish : null,
    gapToLeader: formatGap(result?.gap_to_leader),
    totalTimeSec:
      typeof result?.duration === "number" ? result.duration : null,
    laps: result?.number_of_laps ?? null,
    status,
  };
}

// gap_to_leader may be a number (seconds), a string ("+1 LAP"), 0, or null.
function formatGap(gap: number | string | null | undefined): string | null {
  if (gap == null) return null;
  if (typeof gap === "string") return gap.trim() || null;
  return gap > 0 ? `+${gap.toFixed(1)}s` : null; // 0 = leader
}

function summarizePerformance(laps: OpenF1Lap[]): CarResponse["performance"] {
  if (laps.length === 0) return null;

  const speeds: number[] = [];
  const durations: number[] = [];
  const s1: number[] = [];
  const s2: number[] = [];
  const s3: number[] = [];
  for (const lap of laps) {
    for (const s of [lap.st_speed, lap.i1_speed, lap.i2_speed]) {
      if (typeof s === "number") speeds.push(s);
    }
    // Ignore in/out laps for representative lap/sector times.
    if (!lap.is_pit_out_lap && typeof lap.lap_duration === "number") {
      durations.push(lap.lap_duration);
    }
    if (typeof lap.duration_sector_1 === "number") s1.push(lap.duration_sector_1);
    if (typeof lap.duration_sector_2 === "number") s2.push(lap.duration_sector_2);
    if (typeof lap.duration_sector_3 === "number") s3.push(lap.duration_sector_3);
  }

  const min = (a: number[]) => (a.length ? Math.min(...a) : null);
  const avg = (a: number[]) =>
    a.length ? a.reduce((x, y) => x + y, 0) / a.length : null;

  return {
    topSpeed: speeds.length ? Math.max(...speeds) : null,
    fastestLapSec: min(durations),
    avgLapSec: avg(durations),
    bestSector1: min(s1),
    bestSector2: min(s2),
    bestSector3: min(s3),
  };
}

function summarizeTyres(
  stints: OpenF1Stint[],
  pit: OpenF1Pit[],
): CarResponse["tyres"] {
  const compounds = [...stints]
    .sort((a, b) => a.stint_number - b.stint_number)
    .map((s) => s.compound)
    .filter((c): c is string => !!c);

  const pitDurations = pit
    .map((p) => p.pit_duration)
    .filter((d): d is number => typeof d === "number");

  return {
    compounds,
    pitStops: pit.length,
    fastestPitSec: pitDurations.length ? Math.min(...pitDurations) : null,
    totalPitSec: pitDurations.length
      ? Number(pitDurations.reduce((a, b) => a + b, 0).toFixed(1))
      : null,
  };
}

function summarizeConditions(
  weather: OpenF1Weather[],
): CarResponse["conditions"] {
  if (weather.length === 0) return null;
  const mean = (key: keyof OpenF1Weather) => {
    const vals = weather
      .map((w) => w[key])
      .filter((v): v is number => typeof v === "number");
    return vals.length
      ? Number((vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1))
      : null;
  };
  return {
    airTemp: mean("air_temperature"),
    trackTemp: mean("track_temperature"),
    humidity: mean("humidity"),
    windSpeed: mean("wind_speed"),
    rainfall: weather.some((w) => (w.rainfall ?? 0) > 0),
  };
}

function empty(): CarResponse {
  return {
    source: "openf1",
    session: null,
    driver: null,
    result: null,
    performance: null,
    tyres: null,
    conditions: null,
  };
}
