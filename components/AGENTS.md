<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-06-15 | Updated: 2026-06-17 -->

# components

## Purpose
Client React components for the app's UI: choosing a favorite team/driver,
viewing that favorite's season dashboard, the schedule dot-map, and per-season
driver/constructor comparisons. All are Client Components that fetch from the
app's own `/api/*` routes (via the `useFetch` hook in `@/lib/useFetch`).

## Key Files
| File | Description |
|------|-------------|
| `AppShell.tsx` | App-like shell: sticky branded top bar (logo + **season dropdown** + optional right slot) and a centered content column. Exposes the team accent as the CSS var `--team` |
| `DriverHeadshot.tsx` | Official F1 driver headshot `<img>` that walks a candidate list (`driverHeadshots()` → local `/headshots/…` → modern/legacy CDN), falling back to an initials badge. Takes `season` |
| `SeasonProgress.tsx` | Season-wide round progress bar with an F1 car marker; shown on the selector (always current-season progress) |
| `TeamDriverModal.tsx` | Two-step modal (team grid → driver headshots) for changing the favorite; respects the selected `season`; calls `onSelect(favorite)` |
| `Intro.tsx` | F1-opening splash (start lights, streaking car, title reveal) over a looping background video; full-screen click calls `onStart` |
| `Selector.tsx` | Selection page **and in-page view switcher**: the bottom feature bar swaps `teams` / `schedule` (`ScheduleView`) / `driver-cmp` (`CompareView`) / `constructor-cmp` (`CompareTeamsView`) views (tab-like, exported `ViewKey`). Team grid → `DriverModal`. Also hosts the auto-sliding `Banner` |
| `Dashboard.tsx` | Fetches `/api/dashboard` for the favorite + `season`; renders the **season-resolved team** (headshot/car/logo/accent) hero, stat tiles, and `성적`/`차량`/`차트` tabs (`CarPanel` uses season-accurate OpenF1). Floating `[+ 다른 드라이버와 비교]` opens `OneVsOne`. Empty state when the driver didn't race that season |
| `SeasonCharts.tsx` | Recharts single-driver trend charts derived from the dashboard `results` (no extra API calls) |
| `Banner.tsx` | Auto-sliding (2.5s) promo carousel below the team grid; tapping a slide bubbles up (currently a "준비중" `ComingSoonModal`) |
| `ComingSoonModal.tsx` | Reusable "준비중입니다" dialog |
| `ScheduleView.tsx` / `DotMap.tsx` | Schedule view: a self-generated **dotted world map** (`/dotmap/world-dots.json`) with status-coloured round markers (past=green/next=pulse/upcoming=dim) + pin-anchored info popover, and a synced round list |
| `CompareView.tsx` | Per-season driver comparison: cumulative-points line + finishing-position & points scatters + toggleable driver chips (top 8 default). Chip `↗` opens the driver detail page |
| `CompareTeamsView.tsx` | Per-season constructor comparison: rich summary table + cumulative line + scatter; row `›` opens an inline team detail panel; `⚔` opens `TeamVsTeam` |
| `OneVsOne.tsx` / `TeamVsTeam.tsx` | 1:1 head-to-head layers (driver / team): pick an opponent, then multi-metric comparison + overlaid cumulative lines |

## For AI Agents

### Working In This Directory
- All files start with `"use client"`.
- Data fetching uses the shared **`useFetch`** hook (`@/lib/useFetch`) — derived
  loading + abort, no `setState` in effects. Don't reintroduce raw
  `fetch`-in-`useEffect` with synchronous resets (trips `set-state-in-effect`).
- Post-load defaults that must reset on season change (visible drivers/teams,
  selected round) use a **season-scoped override** (`{ season, … }`), not a reset
  effect — keep that pattern.
- Team accent colors come from `teamColor(constructorId)`; media URLs/headshots
  take a `season`. The `Favorite` shape and API types come from `@/lib/types`.
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
- `@/lib/types` — `Favorite`, response/compare/schedule types
- `@/lib/season` — `teamColor`, season-parameterized media helpers
- `@/lib/useFetch` — shared JSON fetch hook

### External
- `react` — `useState`, `useEffect`, `useMemo`
- `recharts` — charts (`SeasonCharts`, `CompareView`, `CompareTeamsView`, 1:1 layers)
- `lucide-react` — icons

<!-- MANUAL: -->
