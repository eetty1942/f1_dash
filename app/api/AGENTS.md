<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-06-15 | Updated: 2026-06-17 -->

# api

## Purpose
Server-side route handlers that sit between the client UI and the Jolpica F1
API. They call the typed client in `@/lib/jolpica`, combine/reshape the results,
and return compact JSON. Routing the data through the server keeps caching and
error handling off the client and avoids any CORS concerns.

All routes accept an optional `season` query param (validated by `resolveSeason`
in `@/lib/season`, falling back to the current `SEASON`).

## Subdirectories
| Directory | Route | Purpose |
|-----------|-------|---------|
| `options/` | `GET /api/options?season=` | `{ season, teams, completedRounds, totalRounds }`; teams/drivers for the requested season. Round **progress is always pinned to the current season** (past seasons are complete) |
| `dashboard/` | `GET /api/dashboard?driver=&team=&season=` | Driver + constructor standings, per-race results, next race, progress, and `driverConstructor` — the driver's **actual team for that season** (resolved from standings; e.g. Pérez→Red Bull in 2024) |
| `car/` | `GET /api/car?code=&season=` | Categorized OpenF1 telemetry for that **season's** most recent completed race: identity, `result`, `performance`, `tyres`, `conditions`. Serialized calls; matches the driver by three-letter `code`. OpenF1 covers 2023+ |
| `schedule/` | `GET /api/schedule?season=` | `{ season, rounds }` — each round's circuit coordinates + status (`past`/`next`/`upcoming`); powers the dotted-map schedule view |
| `compare/` | `GET /api/compare?season=` | Championship-ordered drivers + per-driver per-round series (points/cumulative/finishPos). Aggregation lives in `@/lib/compute.buildDriverSeries`; sprint points folded in so cumulative matches standings |
| `compare-teams/` | `GET /api/compare-teams?season=` | Constructor comparison: teams with aggregate stats (podiums, fastest laps, 1-2s, DNFs, best finish, lineup) + per-team cumulative series |

Each subdirectory contains a single `route.ts` (Next.js App Router convention).

## For AI Agents

### Working In This Directory
- Resolve the season with `resolveSeason(searchParams.get("season"))`; never
  hardcode a year. The current default lives in `@/lib/season` (`SEASON`).
- `dashboard/route.ts` validates that both `driver` and `team` query params are
  present, returning `400` otherwise; upstream failures return `502`.
- Routes fetch their Jolpica calls with `Promise.all`; date-based helpers
  (`nextRace`, `completedRounds`) compare race start datetimes to now.
- Pure aggregation (cumulative points, sprint fold-in) lives in `@/lib/compute`
  so it can be unit-tested — prefer extending it over inlining new logic.
- Response shapes are mirrored in `@/lib/types` (`OptionsResponse`,
  `DashboardResponse`, `ScheduleResponse`, `CompareResponse`,
  `CompareTeamsResponse`) — update both together when changing a response.

### Testing Requirements
- `npm test` covers the pure aggregation in `@/lib/compute`.
- With `npm run dev` running:
  - `curl "/api/options?season=2024"` → that season's teams with drivers.
  - `curl "/api/dashboard?driver=perez&team=red_bull&season=2024"` → `driverConstructor` resolves to red_bull.
  - `curl "/api/compare?season=2024"` → final `cumulative` equals each driver's standings points.
  - `curl /api/dashboard` (no params) → `400`.

### Common Patterns
- `NextResponse.json(...)` for all responses; errors as `{ error: message }`.
- Caching is handled inside `@/lib/jolpica` (1-hour `revalidate`), not here.

## Dependencies

### Internal
- `@/lib/jolpica` — standings/results/schedule/sprint data access + types
- `@/lib/openf1` — car/telemetry data access (used by `car/`)
- `@/lib/season` — `SEASON`, `resolveSeason`
- `@/lib/compute` — `buildDriverSeries` (used by `compare/`)
- `@/lib/types` — response shapes (`CarResponse`, `CompareResponse`, …)

### External
- `next/server` — `NextRequest`, `NextResponse`

<!-- MANUAL: -->
