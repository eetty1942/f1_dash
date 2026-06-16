// Pure season-aggregation helpers shared by API routes (and unit-tested).

import type { Race } from "@/lib/jolpica";
import type { CompareRoundPoint } from "@/lib/types";

// Per-driver, per-round points with running cumulative, built from a season's
// race results. Sprint points are folded into the round they belong to so the
// cumulative matches the official championship standings. `finishPos` is the
// numeric race finishing position, or null for non-classified results (R/D/W…).
export function buildDriverSeries(
  races: Race[],
  sprints: Race[],
): Record<string, CompareRoundPoint[]> {
  const sprintPts = new Map<string, number>(); // `${round}:${driverId}` → pts
  for (const sr of sprints) {
    for (const res of sr.SprintResults ?? []) {
      sprintPts.set(`${sr.round}:${res.Driver.driverId}`, Number(res.points));
    }
  }

  const series: Record<string, CompareRoundPoint[]> = {};
  const totals: Record<string, number> = {};
  for (const race of races) {
    const round = Number(race.round);
    for (const r of race.Results ?? []) {
      const id = r.Driver.driverId;
      const pts = Number(r.points) + (sprintPts.get(`${round}:${id}`) ?? 0);
      totals[id] = (totals[id] ?? 0) + pts;
      (series[id] ??= []).push({
        round,
        points: pts,
        cumulative: totals[id],
        finishPos: /^\d+$/.test(r.positionText) ? Number(r.position) : null,
      });
    }
  }
  return series;
}
