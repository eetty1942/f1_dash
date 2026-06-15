<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-06-15 | Updated: 2026-06-15 -->

# app

## Purpose
Next.js App Router root. Holds the single client page that toggles between the
team/driver selector and the dashboard, the root layout/metadata, global styles,
and the server-side API routes that proxy and shape Jolpica F1 data.

## Key Files
| File | Description |
|------|-------------|
| `page.tsx` | Client home page; three-phase flow (`intro` → `select` → `dashboard`). First-time visitors see `Intro`; returning visitors with a saved favorite skip straight to `Dashboard`. The top-bar "팀/드라이버 변경" opens `TeamDriverModal` in place (no navigation) |
| `layout.tsx` | Root layout; Geist fonts, Korean metadata (title/description) |
| `globals.css` | Tailwind v4 import + design tokens (surface/elevated/line/muted, `--team` accent), `.team-glow` panel, `.checkered` finish-line, and intro/`.rise-in` animations |
| `favicon.ico` | App icon |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `api/` | Route handlers for selection options and dashboard data (see `api/AGENTS.md`) |

## For AI Agents

### Working In This Directory
- `page.tsx` is a Client Component (`"use client"`); it owns the favorite state
  and gates rendering on a `ready` flag to avoid a hydration flash.
- The persisted favorite shape and its storage key live in `@/lib/types`
  (`Favorite`, `FAVORITE_KEY`) — reuse them, don't redefine.
- Keep visual presentation here minimal; UI lives in `@/components`.

### Testing Requirements
- After edits, `npm run build` must pass. Smoke test the page in `npm run dev`.

### Common Patterns
- Layout sets `min-h-full flex flex-col`; `page.tsx`/`Intro` use `flex-1` to fill height.
- Intro/opening animations are CSS keyframes defined in `globals.css` (`.intro-*`, `.start-light`).
- Korean is the UI language for user-facing strings.

## Dependencies

### Internal
- `@/components/Selector`, `@/components/Dashboard` — rendered by `page.tsx`
- `@/lib/types` — `Favorite`, `FAVORITE_KEY`

### External
- `next/font/google` — Geist / Geist Mono (body/mono) + Sora (`--font-display`, headings)

<!-- MANUAL: -->
