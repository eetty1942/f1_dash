import { describe, expect, it } from "vitest";
import {
  SEASON,
  availableSeasons,
  driverHeadshots,
  resolveSeason,
  teamColor,
  tyreColor,
} from "@/lib/season";

describe("availableSeasons", () => {
  it("returns 5 seasons, newest first, ending 4 years back", () => {
    const s = availableSeasons();
    expect(s).toHaveLength(5);
    expect(s[0]).toBe(SEASON);
    expect(s[4]).toBe(String(Number(SEASON) - 4));
    // strictly descending
    expect(s).toEqual([...s].sort((a, b) => Number(b) - Number(a)));
  });
});

describe("resolveSeason", () => {
  it("keeps a season inside the selectable window", () => {
    expect(resolveSeason("2024")).toBe("2024");
  });
  it("falls back to the current season for missing/out-of-range input", () => {
    expect(resolveSeason(null)).toBe(SEASON);
    expect(resolveSeason("1999")).toBe(SEASON);
    expect(resolveSeason("not-a-year")).toBe(SEASON);
  });
});

describe("teamColor / tyreColor", () => {
  it("maps known keys and falls back to grey for unknown", () => {
    expect(teamColor("ferrari")).toBe("#E8002D");
    expect(teamColor(undefined)).toBe("#9CA3AF");
    expect(teamColor("nope")).toBe("#9CA3AF");
    expect(tyreColor("soft")).toBe("#e8002d");
    expect(tyreColor("UNKNOWN")).toBe("#9CA3AF");
  });
});

describe("driverHeadshots", () => {
  it("prefers a locally-stored portrait when available", () => {
    // Max Verstappen → code maxver01; the generated manifest has 2024/2026.
    expect(driverHeadshots("red_bull", "Max Verstappen", "2024")[0]).toBe(
      "/headshots/2024/maxver01.png",
    );
    expect(driverHeadshots("red_bull", "Max Verstappen", "2026")[0]).toBe(
      "/headshots/2026/maxver01.webp",
    );
  });

  it("returns no candidates for an unusable name", () => {
    expect(driverHeadshots("red_bull", "Madonna")).toEqual([]);
  });

  it("falls back to the legacy CDN portrait when not stored locally", () => {
    const urls = driverHeadshots(undefined, "Nonexistent Driver", "2024");
    expect(urls.length).toBeGreaterThan(0);
    expect(urls[urls.length - 1]).toContain(
      "2018-redesign-assets/drivers/2024/nondri01.png",
    );
  });
});
