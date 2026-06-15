import { NextResponse } from "next/server";
import {
  getConstructorStandings,
  getDriverStandings,
  getSchedule,
  type Race,
} from "@/lib/jolpica";
import { SEASON } from "@/lib/season";

// Returns the teams and drivers available for selection in the current season,
// plus season-wide round progress (shown on the team-selection page).
export async function GET() {
  try {
    const [driverStandings, constructorStandings, schedule] = await Promise.all([
      getDriverStandings(SEASON),
      getConstructorStandings(SEASON),
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
      season: SEASON,
      teams,
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

// Number of races whose start datetime is already in the past.
function countCompletedRounds(schedule: Race[]): number {
  const now = Date.now();
  return schedule.filter(
    (race) =>
      new Date(`${race.date}T${race.time ?? "00:00:00Z"}`).getTime() < now,
  ).length;
}
