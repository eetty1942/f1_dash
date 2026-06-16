import { describe, expect, it } from "vitest";
import type { Race } from "@/lib/jolpica";
import { buildDriverSeries } from "@/lib/compute";

// Minimal result/race fixtures (only the fields buildDriverSeries reads).
function result(driverId: string, position: string, points: string) {
  return {
    position,
    positionText: position,
    points,
    Driver: { driverId },
  };
}
function race(round: string, results: ReturnType<typeof result>[]): Race {
  return { round, Results: results } as unknown as Race;
}
function sprint(round: string, sprintResults: ReturnType<typeof result>[]): Race {
  return { round, SprintResults: sprintResults } as unknown as Race;
}

describe("buildDriverSeries", () => {
  const races = [
    race("1", [result("ver", "1", "25"), result("ham", "2", "18")]),
    race("2", [result("ver", "2", "18"), result("ham", "1", "25")]),
  ];

  it("accumulates a running cumulative per driver", () => {
    const s = buildDriverSeries(races, []);
    expect(s.ver.map((p) => p.cumulative)).toEqual([25, 43]);
    expect(s.ham.map((p) => p.cumulative)).toEqual([18, 43]);
    expect(s.ver[1].points).toBe(18);
  });

  it("folds sprint points into the matching round", () => {
    const sprints = [sprint("1", [result("ver", "1", "8")])];
    const s = buildDriverSeries(races, sprints);
    // round 1: 25 race + 8 sprint = 33; round 2 unchanged (+18) → 51
    expect(s.ver.map((p) => p.points)).toEqual([33, 18]);
    expect(s.ver.map((p) => p.cumulative)).toEqual([33, 51]);
    // a driver with no sprint entry is unaffected
    expect(s.ham.map((p) => p.cumulative)).toEqual([18, 43]);
  });

  it("records numeric finish positions and null for non-classified results", () => {
    const dnf = [race("1", [result("ver", "R", "0")])];
    const s = buildDriverSeries(dnf, []);
    expect(s.ver[0].finishPos).toBeNull();
    expect(buildDriverSeries(races, [])).toMatchObject({
      ver: [{ finishPos: 1 }, { finishPos: 2 }],
    });
  });
});
