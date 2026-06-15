<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-06-15 | Updated: 2026-06-15 -->

# api

## Purpose
Server-side route handlers that sit between the client UI and the Jolpica F1
API. They call the typed client in `@/lib/jolpica`, combine/reshape the results,
and return compact JSON. Routing the data through the server keeps caching and
error handling off the client and avoids any CORS concerns.

## Subdirectories
| Directory | Route | Purpose |
|-----------|-------|---------|
| `options/` | `GET /api/options` | Returns `{ season, teams }` where each team carries its drivers; powers the first-run selector |
| `dashboard/` | `GET /api/dashboard?driver=<id>&team=<id>` | Returns driver + constructor standings, the driver's per-race results, the next race, and season progress (`completedRounds`/`totalRounds`) |
| `car/` | `GET /api/car?code=<acronym>` | Categorized car details from OpenF1 for the latest completed race: identity, `result` (grid/finish/points/gap/status), `performance` (top speed, fastest/avg lap, best sectors), `tyres` (compounds, pit stops), `conditions` (weather). Calls are serialized to respect OpenF1 rate limits. Matches the driver by three-letter `code` |

Each subdirectory contains a single `route.ts` (Next.js App Router convention).

## For AI Agents

### Working In This Directory
- Read the `season` from `@/lib/season` (`SEASON`); don't hardcode a year.
- `dashboard/route.ts` validates that both `driver` and `team` query params are
  present, returning `400` otherwise; upstream failures return `502`.
- `dashboard/route.ts` fetches its four Jolpica calls with `Promise.all` and
  computes `nextRace` by comparing race start datetimes to now.
- Response shapes are mirrored in `@/lib/types` (`OptionsResponse`,
  `DashboardResponse`) — update both together when changing a response.

### Testing Requirements
- With `npm run dev` running:
  - `curl /api/options` → 11 teams with drivers.
  - `curl "/api/dashboard?driver=hamilton&team=ferrari"` → standings + results.
  - `curl /api/dashboard` (no params) → `400`.

### Common Patterns
- `NextResponse.json(...)` for all responses; errors as `{ error: message }`.
- Caching is handled inside `@/lib/jolpica` (1-hour `revalidate`), not here.

## Dependencies

### Internal
- `@/lib/jolpica` — standings/results/schedule data access + types
- `@/lib/openf1` — car/telemetry data access (used by `car/`)
- `@/lib/season` — `SEASON` constant
- `@/lib/types` — response shapes (`CarResponse`, …)

### External
- `next/server` — `NextRequest`, `NextResponse`

<!-- MANUAL: -->
