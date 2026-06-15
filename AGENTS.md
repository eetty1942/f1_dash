<!-- Generated: 2026-06-15 | Updated: 2026-06-15 -->

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# f1_dash

## Purpose
A web dashboard that shows the current-season standings and race results for a
user's favorite F1 team and driver. On first visit the user picks a team, then a
driver; the choice is saved in `localStorage` and the dashboard renders that
driver's championship position, points, wins, the constructor's position, the
next race, and a per-round results table. Data comes from the free, key-less
[Jolpica F1 API](https://github.com/jolpica/jolpica-f1) (Ergast successor).

## Key Files
| File | Description |
|------|-------------|
| `package.json` | Dependencies and scripts (`dev`, `build`, `start`, `lint`) |
| `next.config.ts` | Next config; pins `turbopack.root` to this dir |
| `tsconfig.json` | TypeScript config; `@/*` import alias maps to repo root |
| `eslint.config.mjs` | ESLint (eslint-config-next) flat config |
| `postcss.config.mjs` | Tailwind v4 PostCSS plugin |
| `README.md` | Project overview, run instructions, structure (Korean) |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `app/` | Next.js App Router pages, layout, and API routes (see `app/AGENTS.md`) |
| `components/` | Client React components for selection and dashboard (see `components/AGENTS.md`) |
| `lib/` | API client, season config, shared types (see `lib/AGENTS.md`) |
| `public/` | Static SVG assets from the scaffold (no app logic) |

## For AI Agents

### Working In This Directory
- Stack: Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS v4.
- This is a newer Next.js than most training data — see the rules block above.
- Import with the `@/` alias (e.g. `@/lib/jolpica`), which resolves to repo root.
- No environment variables or secrets are needed; the data API is public.

### Testing Requirements
- `npm run build` runs the production build + TypeScript check; keep it green.
- `npm run lint` runs ESLint.
- Manual smoke test: `npm run dev`, then verify `/api/options` and
  `/api/dashboard?driver=<id>&team=<id>` return data and the page renders.

### Common Patterns
- Server-only data fetching lives in `lib/jolpica.ts`; route handlers in
  `app/api/**` call it and shape responses for the client.
- Client components fetch from the app's own `/api/*` routes (never Jolpica
  directly), keeping caching and error handling on the server.

## Dependencies

### External
- `next` 16 — framework (App Router, Turbopack)
- `react` / `react-dom` 19 — UI
- `recharts` — season trend charts
- `lucide-react` — icons
- `tailwindcss` v4 — styling
- Jolpica F1 API (`https://api.jolpi.ca/ergast/f1`) — standings/results, via `lib/jolpica.ts`
- OpenF1 API (`https://api.openf1.org/v1`) — car/telemetry data, via `lib/openf1.ts`

<!-- MANUAL: Custom project notes can be added below -->
