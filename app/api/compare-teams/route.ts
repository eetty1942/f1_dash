import { NextRequest, NextResponse } from "next/server";
import {
  getConstructorStandings,
  getSeasonResults,
  getSeasonSprintResults,
  type RaceResult,
} from "@/lib/jolpica";
import { resolveSeason } from "@/lib/season";
import type {
  CompareRoundPoint,
  CompareTeam,
  CompareTeamDriver,
} from "@/lib/types";

interface Agg {
  podiums: number;
  fastestLaps: number;
  oneTwos: number;
  dnfs: number;
  bestFinish: number | null;
}

// Per-season constructor comparison: championship-ordered teams with aggregate
// stats (podiums, fastest laps, 1-2s, DNFs, best finish, lineup) plus each
// team's per-round points & running cumulative (sprint points folded in so the
// cumulative matches the official standings).
export async function GET(request: NextRequest) {
  const season = resolveSeason(request.nextUrl.searchParams.get("season"));

  try {
    const [standings, races, sprints] = await Promise.all([
      getConstructorStandings(season),
      getSeasonResults(season),
      getSeasonSprintResults(season),
    ]);

    // Sprint points keyed for fold-in.
    const sprintTeam = new Map<string, number>(); // `${round}:${cid}`
    const sprintDriver = new Map<string, number>(); // `${round}:${driverId}`
    for (const sr of sprints) {
      for (const res of sr.SprintResults ?? []) {
        const cid = res.Constructor.constructorId;
        const tk = `${sr.round}:${cid}`;
        sprintTeam.set(tk, (sprintTeam.get(tk) ?? 0) + Number(res.points));
        sprintDriver.set(`${sr.round}:${res.Driver.driverId}`, Number(res.points));
      }
    }

    const series: Record<string, CompareRoundPoint[]> = {};
    const cum: Record<string, number> = {};
    const agg = new Map<string, Agg>();
    const drivers = new Map<
      string,
      { name: string; code: string | null; points: number; constructorId: string }
    >();

    const numeric = (r: RaceResult) =>
      /^\d+$/.test(r.positionText) ? Number(r.position) : null;

    for (const race of races) {
      const round = Number(race.round);
      const byTeam = new Map<string, RaceResult[]>();
      for (const res of race.Results ?? []) {
        (byTeam.get(res.Constructor.constructorId) ?? setGet(byTeam, res.Constructor.constructorId)).push(res);
        // driver season points (race part; sprint added below)
        const id = res.Driver.driverId;
        const d =
          drivers.get(id) ??
          drivers
            .set(id, {
              name: `${res.Driver.givenName} ${res.Driver.familyName}`,
              code: res.Driver.code ?? null,
              points: 0,
              constructorId: res.Constructor.constructorId,
            })
            .get(id)!;
        d.points += Number(res.points);
        d.constructorId = res.Constructor.constructorId;
      }

      for (const [cid, cars] of byTeam) {
        const racePts = cars.reduce((s, r) => s + Number(r.points), 0);
        const roundPts = racePts + (sprintTeam.get(`${round}:${cid}`) ?? 0);
        cum[cid] = (cum[cid] ?? 0) + roundPts;
        const finishes = cars.map(numeric).filter((n): n is number => n != null);
        const best = finishes.length ? Math.min(...finishes) : null;
        (series[cid] ??= []).push({
          round,
          points: roundPts,
          cumulative: cum[cid],
          finishPos: best,
        });

        const a = agg.get(cid) ?? setGet2(agg, cid);
        a.podiums += finishes.filter((p) => p <= 3).length;
        a.fastestLaps += cars.filter((r) => r.FastestLap?.rank === "1").length;
        a.dnfs += cars.filter((r) => !/^\d+$/.test(r.positionText)).length;
        if (finishes.includes(1) && finishes.includes(2)) a.oneTwos += 1;
        if (best != null) a.bestFinish = a.bestFinish == null ? best : Math.min(a.bestFinish, best);
      }
    }

    // fold sprint points into each driver's season total
    for (const sr of sprints) {
      for (const res of sr.SprintResults ?? []) {
        const d = drivers.get(res.Driver.driverId);
        if (d) d.points += Number(res.points);
      }
    }

    const teams: CompareTeam[] = standings.map((s) => {
      const cid = s.Constructor.constructorId;
      const a = agg.get(cid) ?? { podiums: 0, fastestLaps: 0, oneTwos: 0, dnfs: 0, bestFinish: null };
      const lineup: CompareTeamDriver[] = [...drivers.entries()]
        .filter(([, d]) => d.constructorId === cid)
        .map(([driverId, d]) => ({ driverId, name: d.name, code: d.code, points: d.points }))
        .sort((x, y) => y.points - x.points);
      return {
        constructorId: cid,
        name: s.Constructor.name,
        position: Number(s.position),
        points: Number(s.points),
        wins: Number(s.wins),
        podiums: a.podiums,
        fastestLaps: a.fastestLaps,
        oneTwos: a.oneTwos,
        dnfs: a.dnfs,
        bestFinish: a.bestFinish,
        drivers: lineup,
      };
    });

    return NextResponse.json({ season, rounds: races.length, teams, series });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 502 });
  }
}

function setGet(m: Map<string, RaceResult[]>, k: string): RaceResult[] {
  const v: RaceResult[] = [];
  m.set(k, v);
  return v;
}

function setGet2(m: Map<string, Agg>, k: string): Agg {
  const v: Agg = { podiums: 0, fastestLaps: 0, oneTwos: 0, dnfs: 0, bestFinish: null };
  m.set(k, v);
  return v;
}
