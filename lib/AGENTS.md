<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-06-15 | Updated: 2026-06-17 -->

# lib

## Purpose
Framework-agnostic logic shared across the app: the Jolpica F1 API client and
its domain types, season/branding configuration, and the types describing the
app's own API responses and persisted favorite.

## Key Files
| File | Description |
|------|-------------|
| `jolpica.ts` | Server-side Jolpica/Ergast client. Domain types (`Driver`, `Constructor`, standings, `Race`, `RaceResult`, `SprintResults`, …) and helpers: `getDriverStandings`, `getConstructorStandings`, `getDriverResults`, `getSchedule`, `getSeasonResults`, `getSeasonSprintResults` (both paginate and merge by round). 1-hour `revalidate` cache |
| `openf1.ts` | Server-side [OpenF1](https://openf1.org) client for car data Ergast lacks. `getLatestRaceSession(year)` (per-year), plus per-session/driver fetchers. 1-hour cache + 429 retry-with-backoff. Coverage is 2023+ |
| `season.ts` | `SEASON` (currently `"2026"`), `availableSeasons()` (last 5), `resolveSeason(value)` (validate/fallback), `teamColor`, `tyreColor`, and **season-parameterized** media: `teamLogo`/`teamCar`/`driverHeadshots(constructorId, fullName, season)`. `driverHeadshots` returns an ordered URL candidate list (local manifest → modern/legacy CDN). `MEDIA_ERA_START = 2024` (per-year CDN assets exist 2024+; older logos reuse current) |
| `compute.ts` | Pure, unit-tested aggregation. `buildDriverSeries(races, sprints)` → per-driver per-round points with running cumulative (sprint points folded in) |
| `useFetch.ts` | Client JSON fetch hook with **derived** loading (no `setState` in the effect body) + abort; used by all components |
| `headshots.generated.ts` | Auto-generated `LOCAL_HEADSHOTS` manifest (`<season>/<code>` → `/headshots/…`). Regenerate via `scripts/fetch-headshots.mjs` |
| `types.ts` | Shared types: `TeamOption`, `OptionsResponse`, `DashboardResponse` (with `driverConstructor`), `CarResponse`, `ScheduleResponse`, `Compare*`/`CompareTeams*`, `Favorite`, and the `FAVORITE_KEY` / `SEASON_KEY` localStorage keys |

## For AI Agents

### Working In This Directory
- `jolpica.ts` and `openf1.ts` are server-only (use `fetch` with Next
  `next.revalidate`); call them from route handlers in `app/api/**`, never from
  client components.
- OpenF1 keys data by `driver_number` / `session_key`; drivers are matched to
  Ergast via `name_acronym` == Ergast `code` (e.g. "HAM"). The two data sources
  are bridged in `app/api/car/route.ts`, not inside the lib clients.
- Jolpica wraps every response in an `MRData` envelope; the helpers unwrap it and
  return the inner array (empty array when missing).
- `SEASON` is the current/default season; selectable seasons come from
  `availableSeasons()` and requests are normalized via `resolveSeason`.
- Keep pure, branch-y logic (aggregation, parsing) in `compute.ts` so it stays
  unit-testable; `useFetch.ts` is the only client-side module here.
- When adding a new API response field, update the matching type in `types.ts`.

### Testing Requirements
- `npm test` (vitest) covers `season.ts` helpers and `compute.ts`.
- `npm run build` type-checks these modules. For data shape changes, verify
  against live endpoints, e.g.
  `curl "https://api.jolpi.ca/ergast/f1/2026/driverStandings.json"`.

### Common Patterns
- Each exported helper takes `season` as its first argument.
- Types mirror the Ergast schema (PascalCase nested objects like `Driver`,
  `Constructor`, `Results`) — keep that casing to match the API.
- `teamColor` falls back to neutral gray for unknown `constructorId`.

## Dependencies

### Internal
- `types.ts` and `compute.ts` re-use domain types from `jolpica.ts`.
- `season.ts` imports the generated `headshots.generated.ts` manifest.

### External
- Jolpica F1 API (`https://api.jolpi.ca/ergast/f1`) — standings/results/schedule/sprint.
- OpenF1 (`https://api.openf1.org/v1`) — car/telemetry (via `openf1.ts`).

<!-- MANUAL: -->
