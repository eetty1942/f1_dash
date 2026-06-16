import { NextRequest, NextResponse } from "next/server";
import {
  getConstructorStandings,
  getDriverStandings,
  getSchedule,
  type Race,
} from "@/lib/jolpica";
import { SEASON, resolveSeason } from "@/lib/season";

// Returns the teams and drivers available for selection in the requested season
// (defaults to the current season). Round progress is always reported for the
// *current* season — past seasons are already complete, so their progress is
// meaningless and the selection page keeps showing this year's real progress.
export async function GET(request: NextRequest) {
  const season = resolveSeason(request.nextUrl.searchParams.get("season"));

  try {
    const [driverStandings, constructorStandings, progressSchedule] =
      await Promise.all([
        getDriverStandings(season),
        getConstructorStandings(season),
        // Progress is pinned to the current season regardless of `season`.
        getSchedule(SEASON),
      ]);

    const teams = constructorStandings.map((cs) => {
      const drivers = driverStandings
        .filter((ds) =>
          ds.Constructors.some(
            (c) => c.constructorId === cs.Constructor.constructorId,
          ),
        )
        .map((ds) => ({
          driverId: ds.Driver.driverId,
          name: `${ds.Driver.givenName} ${ds.Driver.familyName}`,
          code: ds.Driver.code ?? null,
        }));

      return {
        constructorId: cs.Constructor.constructorId,
        name: cs.Constructor.name,
        drivers,
      };
    });

    return NextResponse.json({
      season,
      teams,
      completedRounds: countCompletedRounds(progressSchedule),
      totalRounds: progressSchedule.length,
    });
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 502 },
    );
  }
}

// Number of races whose start datetime is already in the past.
function countCompletedRounds(schedule: Race[]): number {
  const now = Date.now();
  return schedule.filter(
    (race) =>
      new Date(`${race.date}T${race.time ?? "00:00:00Z"}`).getTime() < now,
  ).length;
}
