// Generates a stylized dotted world map from public-domain Natural Earth land
// geometry (CC0). For every point on an equirectangular lon/lat grid we keep it
// when it falls on land (even-odd ray casting, which handles lakes/holes), and
// emit compact [col,row] integer pairs to public/dotmap/world-dots.json.
//
// The renderer maps col/row → normalized x,y; race markers are projected with
// the SAME equirectangular formula, so they line up with the dots.
//   x = (lon + 180) / 360 ,  y = (90 - lat) / 180
//
// Re-run when changing density:  node scripts/gen-dotmap.mjs
//
// Tunables:
const STEP = 1.8; // grid spacing in degrees (smaller = denser/heavier)
const LAT_MIN = -58; // skip deep Antarctica / empty southern ocean
const LAT_MAX = 84;

import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "public", "dotmap", "world-dots.json");
const LAND_URL =
  "https://raw.githubusercontent.com/martynafford/natural-earth-geojson/master/110m/physical/ne_110m_land.json";

// Even-odd ray casting across one ring; returns crossing parity contribution.
function ringCrossings(lon, lat, ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0],
      yi = ring[i][1];
    const xj = ring[j][0],
      yj = ring[j][1];
    const intersect =
      yi > lat !== yj > lat &&
      lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

// A point is on land if it is inside any polygon (even-odd over all that
// polygon's rings → outer minus holes).
function onLand(lon, lat, polygons) {
  for (const rings of polygons) {
    let inside = false;
    for (const ring of rings) {
      if (ringCrossings(lon, lat, ring)) inside = !inside;
    }
    if (inside) return true;
  }
  return false;
}

async function main() {
  const res = await fetch(LAND_URL);
  if (!res.ok) throw new Error(`land fetch failed: ${res.status}`);
  const geo = await res.json();

  // Flatten all features into a list of polygons (each = array of rings).
  const polygons = [];
  for (const f of geo.features ?? [geo]) {
    const g = f.geometry ?? f;
    if (g.type === "Polygon") polygons.push(g.coordinates);
    else if (g.type === "MultiPolygon")
      for (const poly of g.coordinates) polygons.push(poly);
  }

  const points = [];
  let col = 0;
  for (let lon = -180; lon < 180; lon += STEP, col++) {
    let row = 0;
    for (let lat = LAT_MAX; lat > LAT_MIN; lat -= STEP, row++) {
      if (onLand(lon, lat, polygons)) points.push([col, row]);
    }
  }
  const cols = Math.ceil(360 / STEP);
  const rows = Math.ceil((LAT_MAX - LAT_MIN) / STEP);

  await mkdir(dirname(OUT), { recursive: true });
  await writeFile(
    OUT,
    JSON.stringify({ step: STEP, latMin: LAT_MIN, latMax: LAT_MAX, cols, rows, points }),
  );
  console.log(
    `dots: ${points.length}  grid: ${cols}x${rows}  step: ${STEP}°  -> ${OUT}`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
