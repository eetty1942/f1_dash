<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-06-15 | Updated: 2026-06-15 -->

# lib

## Purpose
Framework-agnostic logic shared across the app: the Jolpica F1 API client and
its domain types, season/branding configuration, and the types describing the
app's own API responses and persisted favorite.

## Key Files
| File | Description |
|------|-------------|
| `jolpica.ts` | Server-side Jolpica/Ergast client. Domain types (`Driver`, `Constructor`, standings, `Race`, `RaceResult`, …) and helpers: `getDriverStandings`, `getConstructorStandings`, `getDriverResults`, `getSchedule`. Fetches with a 1-hour `revalidate` cache |
| `openf1.ts` | Server-side [OpenF1](https://openf1.org) client for car data the Ergast schema lacks. Per-session/driver fetchers: `getLatestRaceSession`, `getSessionDrivers`, `getDriverLaps`, `getDriverPit`, `getDriverStints`, `getDriverPositions`, `getSessionResult`, `getSessionWeather`. 1-hour cache + 429 retry-with-backoff |
| `season.ts` | `SEASON` constant (currently `"2026"`), `teamColor`, `teamLogo` (official 2026 white logo, all 11 teams), `driverHeadshot(constructorId, fullName)` (official F1 headshot; derives the `firstname3+lastname3+01` code, diacritics-stripped, with CDN fallback), and `tyreColor`. `F1_SLUG` maps constructorId → F1's separator-free media slug used by both logo and headshot URLs |
| `types.ts` | Client/server shared types: `TeamOption`, `OptionsResponse`, `DashboardResponse`, `CarResponse`, `Favorite`, and the `FAVORITE_KEY` localStorage key |

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
- To change the displayed season, edit `SEASON` in `season.ts` — it is the single
  source of truth consumed by the API routes.
- When adding a new API response field, update the matching type in `types.ts`.

### Testing Requirements
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
- `types.ts` re-uses domain types from `jolpica.ts`.

### External
- Jolpica F1 API (`https://api.jolpi.ca/ergast/f1`) — the only upstream service.

<!-- MANUAL: -->
