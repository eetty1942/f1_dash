import { NextRequest, NextResponse } from "next/server";
import {
  getConstructorStandings,
  getDriverResults,
  getDriverStandings,
  getSchedule,
  type Race,
} from "@/lib/jolpica";
import { SEASON } from "@/lib/season";

// Aggregates everything the dashboard needs for one favorite team + driver:
// their standings, the driver's per-race results, and the next upcoming race.
export async function GET(request: NextRequest) {
  const driverId = request.nextUrl.searchParams.get("driver");
  const constructorId = request.nextUrl.searchParams.get("team");

  if (!driverId || !constructorId) {
    return NextResponse.json(
      { error: "Both `driver` and `team` query parameters are required." },
      { status: 400 },
    );
  }

  try {
    const [driverStandings, constructorStandings, driverResults, schedule] =
      await Promise.all([
        getDriverStandings(SEASON),
        getConstructorStandings(SEASON),
        getDriverResults(SEASON, driverId),
        getSchedule(SEASON),
      ]);

    const driverStanding =
      driverStandings.find((d) => d.Driver.driverId === driverId) ?? null;
    const constructorStanding =
      constructorStandings.find(
        (c) => c.Constructor.constructorId === constructorId,
      ) ?? null;

    return NextResponse.json({
      season: SEASON,
      driverStanding,
      constructorStanding,
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
