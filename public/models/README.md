# 3D Model Asset Packs

The 3D preview tries to load GLB files from:

```
/public/models/<style-slug>/<model>.glb
```

`<style-slug>` matches `modelSlug` in `lib/styles-data.ts`, e.g.:

```
/public/models/cozy-neutral/bed.glb
/public/models/cozy-neutral/nightstand.glb
/public/models/cozy-neutral/rug.glb
/public/models/cozy-neutral/mirror.glb
/public/models/cozy-neutral/lamp.glb
/public/models/cozy-neutral/plant.glb
/public/models/cozy-neutral/desk.glb
/public/models/cozy-neutral/chair.glb
/public/models/cozy-neutral/shelf.glb

/public/models/dark-feminine/bed.glb
/public/models/dark-feminine/desk.glb
/public/models/dark-feminine/chair.glb
/public/models/dark-feminine/mirror.glb
/public/models/dark-feminine/lamp.glb
/public/models/dark-feminine/plant.glb
```

## Important (V1 cost constraints)

- These files are **optional**. If a GLB is missing, the preview renders a clean
  placeholder box instead — the app never errors.
- We do **NOT** call the Meshy API at runtime. Treat these as **prebuilt static
  asset packs**.
- FUTURE: drop Meshy-generated GLBs into the folders above and they load
  automatically (see `components/RoomPreview3D.tsx`, which probes each file with
  a HEAD request before loading). An admin-only Meshy generation workflow could
  produce these packs offline.

Model filename keys are defined in `lib/generateLayout.ts` (`MODEL_FILE`).
