<!-- Generated: 2026-06-15 | Updated: 2026-06-17 -->

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# f1_dash

## Purpose
A web dashboard for a user's favorite F1 team and driver. The user picks a team
then a driver (saved in `localStorage`) and sees that driver's standings, race
results, next race, car telemetry, and trend charts. A header **season picker**
(last 5 seasons) re-scopes everything to the chosen year — including the driver's
actual team and per-season imagery. Also includes a dotted-map **schedule** view
and per-season **driver/constructor comparison** (charts + 1:1 head-to-head).
Data: [Jolpica F1 API](https://github.com/jolpica/jolpica-f1) (Ergast successor)
and [OpenF1](https://openf1.org) — both free and key-less.

## Key Files
| File | Description |
|------|-------------|
| `package.json` | Dependencies and scripts (`dev`, `build`, `start`, `lint`, `test`) |
| `next.config.ts` | Next config; pins `turbopack.root` to this dir |
| `tsconfig.json` | TypeScript config; `@/*` import alias maps to repo root |
| `eslint.config.mjs` | ESLint (eslint-config-next) flat config |
| `postcss.config.mjs` | Tailwind v4 PostCSS plugin |
| `vitest.config.ts` | Vitest config (mirrors the `@/*` alias) |
| `README.md` | Project overview, run instructions, structure (Korean) |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `app/` | Next.js App Router pages, layout, and API routes (see `app/AGENTS.md`) |
| `components/` | Client React components (selection, dashboard, schedule, comparisons; see `components/AGENTS.md`) |
| `lib/` | API clients, season/media config, aggregation, shared types, `useFetch` (see `lib/AGENTS.md`) |
| `scripts/` | One-off asset generators: `fetch-headshots.mjs`, `gen-dotmap.mjs` |
| `public/` | Static assets, incl. generated `headshots/` (driver portraits) and `dotmap/` (world-dots.json) |

## For AI Agents

### Working In This Directory
- Stack: Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS v4.
- This is a newer Next.js than most training data — see the rules block above.
- Import with the `@/` alias (e.g. `@/lib/jolpica`), which resolves to repo root.
- No environment variables or secrets are needed; the data API is public.

### Testing Requirements
- `npm run build` runs the production build + TypeScript check; keep it green.
- `npm run lint` runs ESLint (keep it clean — fetch in components via `useFetch`).
- `npm test` runs vitest (`lib/compute`, `lib/season` helpers).
- Manual smoke test: `npm run dev`, then verify the `/api/*` routes return data
  (e.g. `/api/compare?season=2024`) and the page renders.

### Common Patterns
- Server-only data fetching lives in `lib/jolpica.ts` / `lib/openf1.ts`; route
  handlers in `app/api/**` call them, fold in pure logic from `lib/compute.ts`,
  and shape responses for the client.
- Client components fetch the app's own `/api/*` routes via `lib/useFetch.ts`
  (never upstream directly), keeping caching and error handling on the server.
- Every route is season-scoped (`resolveSeason`); per-season imagery/headshots
  come from `lib/season.ts` with locally-stored assets preferred.

## Dependencies

### External
- `next` 16 — framework (App Router, Turbopack)
- `react` / `react-dom` 19 — UI
- `recharts` — trend/comparison charts
- `lucide-react` — icons
- `tailwindcss` v4 — styling
- `vitest` (dev) — unit tests
- Jolpica F1 API (`https://api.jolpi.ca/ergast/f1`) — standings/results/schedule/sprint, via `lib/jolpica.ts`
- OpenF1 API (`https://api.openf1.org/v1`) — car/telemetry data, via `lib/openf1.ts`

<!-- MANUAL: Custom project notes can be added below -->
