import { NextRequest, NextResponse } from "next/server";
import { getSchedule, type Race } from "@/lib/jolpica";
import { resolveSeason } from "@/lib/season";

// Returns the season's calendar shaped for the dot-map: each round with its
// circuit coordinates and a derived status (past / next / upcoming).
export async function GET(request: NextRequest) {
  const season = resolveSeason(request.nextUrl.searchParams.get("season"));

  try {
    const schedule = await getSchedule(season);
    const now = Date.now();

    // The "next" race is the earliest one whose start is still in the future.
    const nextRound =
      [...schedule].sort((a, b) => raceStart(a) - raceStart(b)).find(
        (r) => raceStart(r) >= now,
      )?.round ?? null;

    const rounds = schedule.map((r) => ({
      round: Number(r.round),
      raceName: r.raceName,
      circuitName: r.Circuit.circuitName,
      locality: r.Circuit.Location.locality,
      country: r.Circuit.Location.country,
      lat: Number(r.Circuit.Location.lat),
      long: Number(r.Circuit.Location.long),
      date: r.date,
      time: r.time ?? null,
      status:
        raceStart(r) < now
          ? "past"
          : r.round === nextRound
            ? "next"
            : "upcoming",
    }));

    return NextResponse.json({ season, rounds });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 502 });
  }
}

function raceStart(race: Race): number {
  return new Date(`${race.date}T${race.time ?? "00:00:00Z"}`).getTime();
}
