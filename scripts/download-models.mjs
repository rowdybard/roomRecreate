/**
 * Download CC0 GLB furniture models from Poly Pizza / Quaternius / Kenney
 * and place them into /public/models/<style-slug>/ folders.
 *
 * Usage:  node scripts/download-models.mjs
 *
 * All models are Public Domain (CC0). See attributions below.
 *
 * If automatic download fails (CDN changes, rate limits, etc.), see
 * the MANUAL_FALLBACK section at the bottom of this file for direct URLs.
 */

import { mkdir, writeFile, access } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const MODELS_DIR = join(ROOT, "public", "models");

// ---- Model sources (Poly Pizza model page IDs) ----
// We fetch the page HTML and extract the GLB download URL.
const POLY_PIZZA_BASE = "https://poly.pizza/m/";

const MODELS = [
  // === Base models (already downloaded) ===
  // Quaternius Furniture Pack (CC0)
  { id: "9N9rYOD8On", name: "bed.glb",        source: "Quaternius — Bed Twin" },
  { id: "BuRay4fVFr", name: "bed_double.glb", source: "Quaternius — Bed Double" },
  { id: "V86Go2rlnq", name: "desk.glb",       source: "Quaternius — Desk" },
  { id: "BHEVb1DIuH", name: "storage.glb",    source: "Quaternius — Closet" },
  { id: "9kIjuRFMFw", name: "chair.glb",      source: "Quaternius — Chair" },
  { id: "A9vPgVUrF9", name: "nightstand.glb", source: "Quaternius — Night Stand" },
  { id: "3FmjkLClVE", name: "shelf.glb",      source: "Quaternius — Shelf Large" },
  { id: "7H5qKjuxVY", name: "rug.glb",        source: "Quaternius — Rug" },
  { id: "eBQtooeh43", name: "lamp.glb",       source: "Quaternius — Light Floor" },
  // Kenney furniture (CC0)
  { id: "YhhExKQQCs", name: "lamp_floor.glb", source: "Kenney — Lamp Square Floor" },
  { id: "REpBXIXfO7", name: "mirror.glb",     source: "Kenney — Bathroom Mirror" },
  { id: "MTH8ZwnA27", name: "bookcase.glb",   source: "Kenney — Bookcase Open" },
  { id: "WQzDPpFCp1", name: "sofa.glb",       source: "Kenney — Lounge Sofa Ottoman" },
  { id: "jeDDiN69Ze", name: "rug_round.glb",  source: "Kenney — Rug Round" },
  // scaranto (CC0)
  { id: "auhzQHajHd", name: "plant.glb",      source: "scaranto — Potted Plant" },
  // CreativeTrio (CC0)
  { id: "Pi6oReAizt", name: "gallery.glb",    source: "CreativeTrio — Painting" },
  // MilkAndBanana (CC0)
  { id: "HIeVDCNgbA", name: "mirror_alt.glb", source: "MilkAndBanana — Mirror" },
  // Quaternius — Light Floor variant (CC0)
  { id: "sRBBvofo58", name: "lamp_table.glb",  source: "Quaternius — Light Floor (variant)" },

  // === Extra variants for visual variety ===
  // Beds
  { id: "3kiLmRcb1o", name: "bed_king.glb",    source: "Quaternius — Bed King" },
  { id: "ianC28eMOF", name: "bed_single.glb",  source: "Quaternius — Bed Single" },
  { id: "XpysaEDXJQ", name: "bed_bunk.glb",    source: "Quaternius — Bunk Bed" },
  // Couches / Sofas
  { id: "6MoOyPtetL", name: "couch_large.glb", source: "Quaternius — Couch Large" },
  { id: "ZOPP3KzNIk", name: "couch_small.glb", source: "Quaternius — Couch Small" },
  { id: "jMu2iCmGxU", name: "lounge_sofa.glb", source: "Kenney — Lounge Sofa" },
  { id: "ZAezzWDcmU", name: "couch_ct.glb",    source: "CreativeTrio — Couch" },
  // Tables
  { id: "AXbvcMDC8j", name: "table_round.glb", source: "Kenney — Round Table" },
  { id: "41R2HTYj1O", name: "table_kenney.glb",source: "Kenney — Table" },
  { id: "yYEEJzKxb4", name: "table_q.glb",     source: "Quaternius — Table" },
  { id: "HkPCEdQ5d5", name: "table_q2.glb",    source: "Quaternius — Table (variant)" },
  // Chairs
  { id: "IRLaR71Pyn", name: "chair_q1.glb",    source: "Quaternius — Chair (2023)" },
  { id: "zMmKNm8w4a", name: "chair_q2.glb",    source: "Quaternius — Chair (2021)" },
  { id: "Rlyhe93NNe", name: "chair_q3.glb",    source: "Quaternius — Chair (oct 2021)" },
  { id: "iMNqRzPwwe", name: "chair_q4.glb",    source: "Quaternius — Chair (variant)" },
  // Stools
  { id: "VZw6xzQbOb", name: "stool_ct.glb",    source: "CreativeTrio — Stool" },
  { id: "9QpPhjLcMV", name: "stool_q.glb",     source: "Quaternius — Stool" },
  { id: "ngWUQ7Dt9u", name: "stool_q2.glb",    source: "Quaternius — Stool (2023)" },
  { id: "2EwBIClO8u", name: "stool_bar.glb",   source: "Kenney — Stool Bar Square" },
  // Shelves
  { id: "TDgvIuorcX", name: "shelf_tall.glb",  source: "Quaternius — Shelf Tall" },
  // Lighting
  { id: "JT44JUXU2d", name: "lamp_ceiling.glb",source: "Quaternius — Light Ceiling Single" },
  { id: "74FEuNrLJ5", name: "lamp_wall.glb",   source: "Kenney — Lamp Wall" },
  // Round rug
  { id: "ZYBzMHnSbM", name: "rug_round_q.glb", source: "Quaternius — Round Rug" },
  // Window
  { id: "yRpmaYy3Wq", name: "window.glb",      source: "Kenney — Wall Window Wide" },
];

// Style slugs that need model folders.
const STYLE_SLUGS = [
  "cozy-neutral",
  "dark-feminine",
  "soft-glam",
  "minimal-modern",
  "boho-warm",
  "pink-modern",
  "earthy-organic",
  "colorful-maximalist",
];

// ---- Helpers ----

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function fetchText(url) {
  const res = await fetch(url, {
    headers: { "User-Agent": "room-recreator-asset-downloader/1.0" },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.text();
}

async function fetchBuffer(url) {
  const res = await fetch(url, {
    headers: { "User-Agent": "room-recreator-asset-downloader/1.0" },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return Buffer.from(await res.arrayBuffer());
}

/**
 * Scrape a Poly Pizza model page to find the .glb download URL.
 * The page HTML contains a link like: href="https://static.poly.pizza/...glb"
 */
function extractGlbUrl(html) {
  // Look for static.poly.pizza URLs ending in .glb
  const match = html.match(/https:\/\/static\.poly\.pizza\/[^"'\s]+\.glb/i);
  if (match) return match[0];

  // Fallback: look for any .glb URL
  const fallback = html.match(/https:\/\/[^"'\s]+\.glb/i);
  if (fallback) return fallback[0];

  return null;
}

// ---- Main ----

async function main() {
  console.log("\n📦 Room Recreator — Asset Pack Downloader\n");

  // Create style folders.
  for (const slug of STYLE_SLUGS) {
    const dir = join(MODELS_DIR, slug);
    await mkdir(dir, { recursive: true });
  }

  // Also create a shared folder for models that are style-agnostic.
  const sharedDir = join(MODELS_DIR, "shared");
  await mkdir(sharedDir, { recursive: true });

  let downloaded = 0;
  let skipped = 0;
  let failed = 0;

  console.log("Downloading CC0 models from Poly Pizza...\n");

  for (const model of MODELS) {
    const outPath = join(sharedDir, model.name);
    if (await exists(outPath)) {
      console.log(`  ✓ ${model.name} (already exists)`);
      skipped++;
      continue;
    }

    try {
      console.log(`  → ${model.name} from ${model.source}...`);
      const pageUrl = POLY_PIZZA_BASE + model.id;
      const html = await fetchText(pageUrl);
      const glbUrl = extractGlbUrl(html);

      if (!glbUrl) {
        console.log(`    ✗ Could not find GLB URL on page ${pageUrl}`);
        failed++;
        continue;
      }

      const buf = await fetchBuffer(glbUrl);
      await writeFile(outPath, buf);
      console.log(`    ✓ Saved ${model.name} (${(buf.length / 1024).toFixed(0)} KB)`);
      downloaded++;
    } catch (err) {
      console.log(`    ✗ Failed: ${err.message}`);
      failed++;
    }
  }

  // --- Summary ---
  console.log(`\n${"=".repeat(50)}`);
  console.log(`Downloaded: ${downloaded}  |  Skipped: ${skipped}  |  Failed: ${failed}`);
  console.log(`\nModels saved to: ${sharedDir}`);
  console.log(`\nNext step: Run 'node scripts/organize-models.mjs' to`);
  console.log(`distribute models into style folders and rename them.`);
  console.log(`${"=".repeat(50)}\n`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});

/*
MANUAL_FALLBACK
===============

If the automatic script fails, download manually from these Poly Pizza pages:

  Bed:          https://poly.pizza/m/9N9rYOD8On
  Bed Double:   https://poly.pizza/m/BuRay4fVFr
  Desk:         https://poly.pizza/m/V86Go2rlnq
  Closet:       https://poly.pizza/m/BHEVb1DIuH
  Chair:        https://poly.pizza/m/9kIjuRFMFw
  Night Stand:  https://poly.pizza/m/A9vPgVUrF9
  Shelf:        https://poly.pizza/m/3FmjkLClVE
  Rug:          https://poly.pizza/m/7H5qKjuxVY
  Lamp:         https://poly.pizza/m/eBQtooeh43
  Lamp Floor:   https://poly.pizza/m/YhhExKQQCs
  Mirror:       https://poly.pizza/m/REpBXIXfO7
  Bookcase:     https://poly.pizza/m/MTH8ZwnA27
  Sofa:         https://poly.pizza/m/WQzDPpFCp1
  Plant:        https://poly.pizza/m/auhzQHajHd
  Painting:     https://poly.pizza/m/Pi6oReAizt

Place .glb files in /public/models/shared/ then run:
  node scripts/organize-models.mjs

All models are CC0 (Public Domain). No attribution required.
*/
