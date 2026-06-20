/**
 * Organize downloaded GLB models into per-style folders.
 *
 * After running download-models.mjs, this script:
 *  1. Assigns different model variants to different styles for visual variety
 *  2. Copies/renames them into every /public/models/<style-slug>/ folder
 *     with the names expected by generateLayout.ts (bed.glb, desk.glb, etc.)
 *
 * Usage:  node scripts/organize-models.mjs
 */

import { readdir, copyFile, mkdir, access, stat, rm } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const MODELS_DIR = join(ROOT, "public", "models");
const SHARED_DIR = join(MODELS_DIR, "shared");

// Per-style model picks. Each style gets different variants for visual variety.
// Key = expected filename in style folder, value = source filename in shared/.
const STYLE_PICKS = {
  "cozy-neutral": {
    bed: "bed.glb", sofa: "sofa.glb", chair: "chair.glb", desk: "desk.glb",
    nightstand: "nightstand.glb", shelf: "shelf.glb", storage: "storage.glb",
    lamp: "lamp.glb", mirror: "mirror.glb", plant: "plant.glb",
    rug: "rug.glb", gallery: "gallery.glb", vanity: "desk.glb", plants: "plant.glb",
  },
  "dark-feminine": {
    bed: "bed_double.glb", sofa: "couch_large.glb", chair: "chair_q2.glb", desk: "desk.glb",
    nightstand: "nightstand.glb", shelf: "shelf_tall.glb", storage: "storage.glb",
    lamp: "lamp_floor.glb", mirror: "mirror_alt.glb", plant: "plant.glb",
    rug: "rug_round.glb", gallery: "gallery.glb", vanity: "table_q.glb", plants: "plant.glb",
  },
  "soft-glam": {
    bed: "bed_king.glb", sofa: "lounge_sofa.glb", chair: "chair_q1.glb", desk: "table_kenney.glb",
    nightstand: "nightstand.glb", shelf: "bookcase.glb", storage: "storage.glb",
    lamp: "lamp_floor.glb", mirror: "mirror.glb", plant: "plant.glb",
    rug: "rug_round_q.glb", gallery: "gallery.glb", vanity: "table_round.glb", plants: "plant.glb",
  },
  "minimal-modern": {
    bed: "bed_single.glb", sofa: "couch_small.glb", chair: "chair_q3.glb", desk: "desk.glb",
    nightstand: "nightstand.glb", shelf: "shelf.glb", storage: "storage.glb",
    lamp: "lamp.glb", mirror: "mirror.glb", plant: "plant.glb",
    rug: "rug.glb", gallery: "gallery.glb", vanity: "desk.glb", plants: "plant.glb",
  },
  "boho-warm": {
    bed: "bed.glb", sofa: "couch_ct.glb", chair: "stool_ct.glb", desk: "table_q.glb",
    nightstand: "stool_q.glb", shelf: "shelf_tall.glb", storage: "storage.glb",
    lamp: "lamp_table.glb", mirror: "mirror_alt.glb", plant: "plant.glb",
    rug: "rug_round.glb", gallery: "gallery.glb", vanity: "table_q2.glb", plants: "plant.glb",
  },
  "pink-modern": {
    bed: "bed_double.glb", sofa: "couch_small.glb", chair: "chair_q4.glb", desk: "desk.glb",
    nightstand: "nightstand.glb", shelf: "shelf.glb", storage: "storage.glb",
    lamp: "lamp_floor.glb", mirror: "mirror.glb", plant: "plant.glb",
    rug: "rug.glb", gallery: "gallery.glb", vanity: "desk.glb", plants: "plant.glb",
  },
  "earthy-organic": {
    bed: "bed_king.glb", sofa: "lounge_sofa.glb", chair: "stool_q2.glb", desk: "table_q2.glb",
    nightstand: "stool_bar.glb", shelf: "shelf_tall.glb", storage: "storage.glb",
    lamp: "lamp.glb", mirror: "mirror_alt.glb", plant: "plant.glb",
    rug: "rug_round_q.glb", gallery: "gallery.glb", vanity: "table_kenney.glb", plants: "plant.glb",
  },
  "colorful-maximalist": {
    bed: "bed.glb", sofa: "couch_large.glb", chair: "chair_q1.glb", desk: "table_round.glb",
    nightstand: "nightstand.glb", shelf: "bookcase.glb", storage: "storage.glb",
    lamp: "lamp_ceiling.glb", mirror: "mirror.glb", plant: "plant.glb",
    rug: "rug.glb", gallery: "gallery.glb", vanity: "table_q.glb", plants: "plant.glb",
  },
};

const STYLE_SLUGS = Object.keys(STYLE_PICKS);

async function exists(path) {
  try { await access(path); return true; } catch { return false; }
}

async function main() {
  console.log("\n📁 Organizing models into style folders...\n");

  if (!(await exists(SHARED_DIR))) {
    console.log(`✗ Shared directory not found: ${SHARED_DIR}`);
    console.log("  Run 'node scripts/download-models.mjs' first.");
    process.exit(1);
  }

  const files = await readdir(SHARED_DIR);
  const glbFiles = files.filter((f) => f.endsWith(".glb"));
  if (glbFiles.length === 0) {
    console.log(`✗ No .glb files found in ${SHARED_DIR}`);
    process.exit(1);
  }

  console.log(`Found ${glbFiles.length} GLB files in shared/\n`);

  let copied = 0;
  let missing = 0;

  for (const slug of STYLE_SLUGS) {
    const styleDir = join(MODELS_DIR, slug);
    await mkdir(styleDir, { recursive: true });

    const picks = STYLE_PICKS[slug];
    console.log(`  ${slug}:`);

    for (const [expectedName, sourceFile] of Object.entries(picks)) {
      const srcPath = join(SHARED_DIR, sourceFile);
      const destPath = join(styleDir, `${expectedName}`);

      if (!(await exists(srcPath))) {
        console.log(`    ✗ ${expectedName} <- ${sourceFile} (source missing)`);
        missing++;
        continue;
      }

      if (await exists(destPath)) {
        const srcStat = await stat(srcPath);
        const destStat = await stat(destPath);
        if (srcStat.size === destStat.size) {
          console.log(`    ✓ ${expectedName} (same, skipped)`);
          continue;
        }
        await rm(destPath);
      }

      await copyFile(srcPath, destPath);
      console.log(`    ✓ ${expectedName} <- ${sourceFile}`);
      copied++;
    }
  }

  console.log(`\n${"=".repeat(50)}`);
  console.log(`Copied: ${copied}  |  Missing: ${missing}`);
  console.log(`Styles: ${STYLE_SLUGS.length}`);
  console.log(`${"=".repeat(50)}\n`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
