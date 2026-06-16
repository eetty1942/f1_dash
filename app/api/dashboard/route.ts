import { NextRequest, NextResponse } from "next/server";
import {
  getConstructorStandings,
  getDriverResults,
  getDriverStandings,
  getSchedule,
  type Race,
} from "@/lib/jolpica";
import { resolveSeason } from "@/lib/season";

// Aggregates everything the dashboard needs for one favorite team + driver:
// their standings, the driver's per-race results, and the next upcoming race.
export async function GET(request: NextRequest) {
  const driverId = request.nextUrl.searchParams.get("driver");
  const constructorId = request.nextUrl.searchParams.get("team");
  const season = resolveSeason(request.nextUrl.searchParams.get("season"));

  if (!driverId || !constructorId) {
    return NextResponse.json(
      { error: "Both `driver` and `team` query parameters are required." },
      { status: 400 },
    );
  }

  try {
    const [driverStandings, constructorStandings, driverResults, schedule] =
      await Promise.all([
        getDriverStandings(season),
        getConstructorStandings(season),
        getDriverResults(season, driverId),
        getSchedule(season),
      ]);

    const driverStanding =
      driverStandings.find((d) => d.Driver.driverId === driverId) ?? null;

    // The driver's real team for this season comes from the standings (last
    // constructor if they switched mid-season). Fall back to the requested
    // `team` only when the driver has no standing yet.
    const driverConstructor =
      driverStanding?.Constructors?.at(-1) ?? null;
    const resolvedConstructorId =
      driverConstructor?.constructorId ?? constructorId;
    const constructorStanding =
      constructorStandings.find(
        (c) => c.Constructor.constructorId === resolvedConstructorId,
      ) ?? null;

    return NextResponse.json({
      season,
      driverStanding,
      constructorStanding,
      driverConstructor,
      results: driverResults,
      nextRace: findNextRace(schedule),
      completedRounds: countCompletedRounds(schedule),
      totalRounds: schedule.length,
    });
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 502 },
    );
  }
}

// First race whose start datetime is still in the future, else null (season over).
function findNextRace(schedule: Race[]): Race | null {
  const now = Date.now();
  const upcoming = schedule
    .map((race) => ({
      race,
      start: raceStart(race),
    }))
    .filter((r) => r.start >= now)
    .sort((a, b) => a.start - b.start);
  return upcoming[0]?.race ?? null;
}

// Number of races whose start datetime is already in the past.
function countCompletedRounds(schedule: Race[]): number {
  const now = Date.now();
  return schedule.filter((race) => raceStart(race) < now).length;
}

function raceStart(race: Race): number {
  return new Date(`${race.date}T${race.time ?? "00:00:00Z"}`).getTime();
}
