import { NextRequest, NextResponse } from "next/server";
import {
  getDriverStandings,
  getSeasonResults,
  getSeasonSprintResults,
} from "@/lib/jolpica";
import { resolveSeason } from "@/lib/season";
import type { CompareDriver, CompareRoundPoint } from "@/lib/types";

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

    // Sprint points are awarded separately; fold them into each round's total
    // so the cumulative line matches the official championship standings.
    const sprintPts = new Map<string, number>(); // `${round}:${driverId}` → pts
    for (const sr of sprints) {
      for (const res of sr.SprintResults ?? []) {
        sprintPts.set(`${sr.round}:${res.Driver.driverId}`, Number(res.points));
      }
    }

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

    // driverId → running per-round points (races are already round-sorted).
    const series: Record<string, CompareRoundPoint[]> = {};
    const totals: Record<string, number> = {};
    for (const race of races) {
      const round = Number(race.round);
      for (const r of race.Results ?? []) {
        const id = r.Driver.driverId;
        const pts = Number(r.points) + (sprintPts.get(`${race.round}:${id}`) ?? 0);
        totals[id] = (totals[id] ?? 0) + pts;
        (series[id] ??= []).push({
          round,
          points: pts,
          cumulative: totals[id],
          finishPos: /^\d+$/.test(r.positionText) ? Number(r.position) : null,
        });
      }
    }

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
