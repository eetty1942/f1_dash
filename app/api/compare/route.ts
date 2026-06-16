import { NextRequest, NextResponse } from "next/server";
import {
  getDriverStandings,
  getSeasonResults,
  getSeasonSprintResults,
} from "@/lib/jolpica";
import { buildDriverSeries } from "@/lib/compute";
import { resolveSeason } from "@/lib/season";
import type { CompareDriver } from "@/lib/types";

// Per-season driver comparison data: a championship-ordered driver list (for the
// legend/colours) plus each driver's per-round points & running cumulative,
// built from the full season results.
export async function GET(request: NextRequest) {
  const season = resolveSeason(request.nextUrl.searchParams.get("season"));

  try {
    const [standings, races, sprints] = await Promise.all([
      getDriverStandings(season),
      getSeasonResults(season),
      getSeasonSprintResults(season),
    ]);

    const drivers: CompareDriver[] = standings.map((s) => {
      const constructor = s.Constructors.at(-1);
      return {
        driverId: s.Driver.driverId,
        name: `${s.Driver.givenName} ${s.Driver.familyName}`,
        code: s.Driver.code ?? null,
        constructorId: constructor?.constructorId ?? "",
        constructorName: constructor?.name ?? "",
        position: Number(s.position),
        points: Number(s.points),
        wins: Number(s.wins),
      };
    });

    const series = buildDriverSeries(races, sprints);

    return NextResponse.json({
      season,
      rounds: races.length,
      drivers,
      series,
    });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 502 });
  }
}
