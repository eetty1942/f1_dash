// Season configuration and team branding.

// The season the dashboard displays. Bump this once a year (or wire it to the
// Jolpica `/current` alias if you prefer it to roll over automatically).
export const SEASON = "2026";

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
};

// NOTE: F1 media assets are versioned per season; bump the "2026" tokens (and
// re-check the slugs/version) when the season changes.
export function teamLogo(constructorId: string | undefined): string | null {
  if (!constructorId) return null;
  const slug = F1_SLUG[constructorId];
  if (!slug) return null;
  return `https://media.formula1.com/image/upload/c_lfill,w_96/q_auto/v1740000001/common/f1/2026/${slug}/2026${slug}logowhite.webp`;
}

// Official F1 team car image — photographic, transparent background, side view.
// Uses the same separator-free F1 slug as the logo/headshot, with a Cloudinary
// fallback so unknown teams yield a generic car.
export function teamCar(constructorId: string | undefined): string | null {
  if (!constructorId) return null;
  const slug = F1_SLUG[constructorId];
  if (!slug) return null;
  return `https://media.formula1.com/image/upload/c_lfill,w_512/q_auto/d_common:f1:2026:fallback:car:2026fallbackcarright.webp/v1740000001/common/f1/2026/${slug}/2026${slug}carright.webp`;
}

// Official F1 driver headshot. The 6-char code is firstname(3)+lastname(3); the
// URL carries a Cloudinary fallback so an unknown code yields a silhouette, not
// a broken image.
export function driverHeadshot(
  constructorId: string | undefined,
  fullName: string,
): string | null {
  if (!constructorId) return null;
  const slug = F1_SLUG[constructorId];
  const code = driverCode(fullName);
  if (!slug || !code) return null;
  return `https://media.formula1.com/image/upload/c_lfill,w_440/q_auto/d_common:f1:2026:fallback:driver:2026fallbackdriverright.webp/v1740000001/common/f1/2026/${slug}/${code}/2026${slug}${code}right.webp`;
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
