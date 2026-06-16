// Season configuration and team branding.

import { LOCAL_HEADSHOTS } from "@/lib/headshots.generated";

// The season the dashboard displays. Bump this once a year (or wire it to the
// Jolpica `/current` alias if you prefer it to roll over automatically).
export const SEASON = "2026";

// How many seasons (including the current one) the header dropdown offers.
const SEASON_WINDOW = 5;

// Selectable seasons for the header dropdown: the current season plus the
// previous `SEASON_WINDOW - 1`, newest first (e.g. 2026, 2025, …, 2022).
export function availableSeasons(): string[] {
  const current = Number(SEASON);
  return Array.from({ length: SEASON_WINDOW }, (_, i) => String(current - i));
}

// Normalizes an arbitrary season query value to a valid, selectable season,
// falling back to the current season for missing or out-of-range input.
export function resolveSeason(value: string | null | undefined): string {
  if (value && availableSeasons().includes(value)) return value;
  return SEASON;
}

// Brand colors keyed by Ergast constructorId. Used for accent bars and badges.
// Falls back to a neutral gray for unknown teams.
const TEAM_COLORS: Record<string, string> = {
  red_bull: "#3671C6",
  ferrari: "#E8002D",
  mercedes: "#27F4D2",
  mclaren: "#FF8000",
  aston_martin: "#229971",
  alpine: "#0093CC",
  williams: "#64C4FF",
  rb: "#6692FF",
  sauber: "#52E252",
  haas: "#B6BABD",
  audi: "#52E252",
  cadillac: "#C8A45C",
};

export function teamColor(constructorId: string | undefined): string {
  if (!constructorId) return "#9CA3AF";
  return TEAM_COLORS[constructorId] ?? "#9CA3AF";
}

// Maps an Ergast constructorId to F1's official logo slug. Teams without a
// published logo on the CDN (new entrants) return null → the UI shows a badge.
// Maps an Ergast constructorId to F1's separator-free media slug. The same slug
// is used for both the team logo and the driver headshot URLs.
const F1_SLUG: Record<string, string> = {
  mercedes: "mercedes",
  ferrari: "ferrari",
  mclaren: "mclaren",
  red_bull: "redbullracing",
  alpine: "alpine",
  rb: "racingbulls",
  haas: "haasf1team",
  williams: "williams",
  aston_martin: "astonmartin",
  audi: "audi",
  cadillac: "cadillac",
  // Sauber races under the "Kick Sauber" branding on F1's media CDN (2024–25).
  sauber: "kicksauber",
};

// NOTE: F1 media assets are organized per season under `common/f1/<year>/…`.
// Passing the viewed season builds that year's asset (e.g. Pérez's Red Bull
// headshot in 2024); unmapped/missing assets fall back gracefully in the UI.
// Per-year team logos exist on F1's CDN only for 2024+. Older seasons reuse the
// current-season logo (exactly as formula1.com does on its historical pages),
// which is correct for teams that still exist; defunct teams fall back to a
// badge via the unmapped-slug path.
const MEDIA_ERA_START = 2024;

export function teamLogo(
  constructorId: string | undefined,
  season: string = SEASON,
): string | null {
  if (!constructorId) return null;
  const slug = F1_SLUG[constructorId];
  if (!slug) return null;
  const year = Number(season) >= MEDIA_ERA_START ? season : SEASON;
  return `https://media.formula1.com/image/upload/c_lfill,w_96/q_auto/v1740000001/common/f1/${year}/${slug}/${year}${slug}logowhite.webp`;
}

// Official F1 team car image — photographic, transparent background, side view.
// Uses the same separator-free F1 slug as the logo/headshot, with a Cloudinary
// fallback so unknown teams yield a generic car.
export function teamCar(
  constructorId: string | undefined,
  season: string = SEASON,
): string | null {
  if (!constructorId) return null;
  const slug = F1_SLUG[constructorId];
  if (!slug) return null;
  // Per-year car renders exist only for 2024+; older seasons have no reliable
  // car image, so render nothing rather than a broken/wrong-era car.
  if (Number(season) < MEDIA_ERA_START) return null;
  return `https://media.formula1.com/image/upload/c_lfill,w_512/q_auto/d_common:f1:${season}:fallback:car:${season}fallbackcarright.webp/v1740000001/common/f1/${season}/${slug}/${season}${slug}carright.webp`;
}

// Ordered driver-portrait URL candidates for a season, tried in order by the
// headshot component (then initials). The modern Cloudinary cutout (2024+,
// team-aware, with a built-in silhouette fallback) comes first; the legacy F1
// portrait — hosted per-year for 2018–2023 and keyed only by driver code —
// covers older seasons and drivers whose team we can't map (e.g. AlphaTauri).
export function driverHeadshots(
  constructorId: string | undefined,
  fullName: string,
  season: string = SEASON,
): string[] {
  const code = driverCode(fullName);
  if (!code) return [];
  const urls: string[] = [];
  // Prefer the portrait we downloaded into /public (see scripts/fetch-headshots.mjs).
  const local = LOCAL_HEADSHOTS[`${season}/${code}`];
  if (local) urls.push(local);
  const slug = constructorId ? F1_SLUG[constructorId] : undefined;
  if (slug && Number(season) >= MEDIA_ERA_START) {
    urls.push(
      `https://media.formula1.com/image/upload/c_lfill,w_440/q_auto/d_common:f1:${season}:fallback:driver:${season}fallbackdriverright.webp/v1740000001/common/f1/${season}/${slug}/${code}/${season}${slug}${code}right.webp`,
    );
  }
  urls.push(
    `https://media.formula1.com/content/dam/fom-website/2018-redesign-assets/drivers/${season}/${code}.png`,
  );
  return urls;
}

function driverCode(fullName: string): string | null {
  const norm = (s: string) =>
    s
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .replace(/[^a-zA-Z]/g, "")
      .toLowerCase();
  const words = fullName.trim().split(/\s+/).filter(Boolean);
  if (words.length < 2) return null;
  const given = norm(words[0]).slice(0, 3);
  const family = norm(words[words.length - 1]).slice(0, 3);
  if (given.length < 3 || family.length < 3) return null;
  return `${given}${family}01`;
}

// Official Pirelli tyre-compound colours, keyed by OpenF1 compound name.
const TYRE_COLORS: Record<string, string> = {
  SOFT: "#e8002d",
  MEDIUM: "#f5c518",
  HARD: "#e5e5e5",
  INTERMEDIATE: "#43b02a",
  WET: "#00aeef",
};

export function tyreColor(compound: string): string {
  return TYRE_COLORS[compound.toUpperCase()] ?? "#9CA3AF";
}
