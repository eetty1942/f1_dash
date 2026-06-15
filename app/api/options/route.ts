import { NextResponse } from "next/server";
import {
  getConstructorStandings,
  getDriverStandings,
} from "@/lib/jolpica";
import { SEASON } from "@/lib/season";

// Returns the teams and drivers available for selection in the current season.
// Each team carries the list of its drivers so the UI can offer a dependent
// driver picker once a team is chosen.
export async function GET() {
  try {
    const [driverStandings, constructorStandings] = await Promise.all([
      getDriverStandings(SEASON),
      getConstructorStandings(SEASON),
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

    return NextResponse.json({ season: SEASON, teams });
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 502 },
    );
  }
}
