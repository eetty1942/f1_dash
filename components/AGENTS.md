<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-06-15 | Updated: 2026-06-15 -->

# components

## Purpose
Client React components for the two UI states of the app: choosing a favorite
team/driver, and viewing that favorite's season dashboard. Both are Client
Components that fetch from the app's own `/api/*` routes.

## Key Files
| File | Description |
|------|-------------|
| `AppShell.tsx` | App-like shell: sticky branded top bar (logo + season + optional right slot) and a centered content column. Exposes the team accent as the CSS var `--team` |
| `DriverHeadshot.tsx` | Official F1 driver headshot `<img>` via `driverHeadshot()`, with an initials badge fallback on load failure |
| `TeamDriverModal.tsx` | Two-step modal (team grid → driver headshots) for changing the favorite from the dashboard without leaving the page; highlights the current selection, calls `onSelect(favorite)` |
| `Intro.tsx` | F1-opening splash (start lights, streaking car, display-font title reveal, checkered finish-line strip); click anywhere calls `onStart` to advance to team selection |
| `Selector.tsx` | Team picker: fetches `/api/options`; icon-only official team logos (`TeamLogo` + badge fallback). Clicking a team opens `DriverModal` — a modal of driver cards with official F1 headshots (`DriverHeadshot`) — and choosing one calls `onSelect(favorite)`. Skeleton while loading |
| `Dashboard.tsx` | Fetches `/api/dashboard` for the chosen favorite; renders a team-accent hero header (driver headshot + number badge/name/standings + season progress), stat tiles, and section tabs (`성적`/`차량`/`차트`) switching between the results table+next race, the `CarPanel` (OpenF1 via `/api/car`), and season charts. Inline `Tabs` on desktop, fixed `MobileTabBar` on mobile. Shows a skeleton while loading. Helpers: `HeroStat`, `Tabs`, `MobileTabBar`, `SeasonProgress`, `StatCard`, `CarPanel`, `ResultsTable`, `PositionBadge`, `TyrePill`, `StateMessage`, `DashboardSkeleton` |
| `SeasonCharts.tsx` | Recharts trend charts (cumulative points, finish vs grid position, fastest-lap rank, points per round) derived from the dashboard `results` array — no extra API calls. Uses design tokens for card/tooltip styling |

## For AI Agents

### Working In This Directory
- Both files start with `"use client"`.
- Data fetching uses `fetch` in `useEffect` with an `active` flag to ignore
  responses after unmount/param change — preserve this guard.
- Team accent colors come from `teamColor(constructorId)` in `@/lib/season`.
- The `Favorite` shape and API response types come from `@/lib/types`.
- User-facing copy is Korean.

### Testing Requirements
- Verify in `npm run dev`: selecting a team reveals its drivers; selecting a
  driver renders the dashboard; "팀/드라이버 변경" returns to the selector.
- `npm run build` must pass (these are part of the page bundle).

### Common Patterns
- Loading and error states are rendered inline as simple text.
- Styling is Tailwind utility classes; dark theme with zinc palette and a
  per-team accent bar/color.
- `ResultsTable` maps non-numeric `positionText` (e.g. "R", "D") through
  `positionLabel`; numeric finishes render as `P<n>`.

## Dependencies

### Internal
- `@/lib/types` — `Favorite`, `OptionsResponse`, `DashboardResponse`, `TeamOption`
- `@/lib/season` — `teamColor`

### External
- `react` — `useState`, `useEffect`
- `recharts` — chart primitives used by `SeasonCharts.tsx`
- `lucide-react` — icons (tabs, category cards, states)

<!-- MANUAL: -->
