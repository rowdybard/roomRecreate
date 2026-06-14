# Room Recreator

**Turn a dream room into a real-life plan.**

Paste a room vibe, choose your style, and get a visual 2D layout, a 3D preview,
a color palette, a shopping checklist, budget swaps, and a shareable recreate
kit. Built with Next.js (App Router) + TypeScript + Tailwind + React Three
Fiber. Works fully offline — no API keys required.

## Quick start

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Pages

- `/` — Landing page
- `/recreate` — Main generator (inputs → animated reveal → kit)
- `/kit/[id]` — Shareable generated kit page (loads from localStorage)
- `/admin` — Internal kit creator + saved-kit list

## Environment variables (all optional)

Copy `.env.example` to `.env.local` and fill in what you want. The app runs
without any of these.

| Variable | Effect when set | When missing |
| --- | --- | --- |
| `OPENAI_API_KEY` | `/api/generate-kit` uses OpenAI for kit text | Deterministic local generation |
| `NEXT_PUBLIC_APP_URL` | Builds absolute share links | Relative share text |
| `NEXT_PUBLIC_STRIPE_FULL_KIT_URL` | "Get Full Kit — $9" opens this link | Toast: "Checkout coming soon." |
| `NEXT_PUBLIC_SUPABASE_URL` / `..._ANON_KEY` | Hook point for DB persistence | Saves to localStorage |

## Deploy to Cloudflare (Workers + OpenNext)

This app deploys to **Cloudflare Workers** via the OpenNext adapter
(`@opennextjs/cloudflare`). A single Worker serves the static assets *and* runs
the `/api/generate-kit` route — no separate Pages project needed.

```bash
# 1. Build the Worker bundle (runs `next build` + OpenNext bundling)
npm run preview   # build + run locally on the Workers runtime

# 2. Deploy (prompts a Cloudflare login the first time)
npm run deploy
```

Config lives in `wrangler.jsonc` (assets binding + `nodejs_compat`) and
`open-next.config.ts`.

**Secrets / env vars:**

- `OPENAI_API_KEY` is server-only. For local `npm run preview`, copy
  `.dev.vars.example` to `.dev.vars`. For production, set it with:
  ```bash
  npx wrangler secret put OPENAI_API_KEY
  ```
- `NEXT_PUBLIC_*` vars are inlined at **build time** — set them in `.env.local`
  before `npm run deploy`, not as Worker secrets.

> Note: the OpenNext build is supported on macOS/Linux. On Windows, build via
> WSL for reliable results (the adapter warns about native Windows).

> Pinned to `@opennextjs/cloudflare@~1.15.1`, the last line that supports
> Next.js 14. Upgrading to Next.js 15 unlocks newer adapter versions.

## How generation works

- **Kit text** comes from OpenAI when `OPENAI_API_KEY` is set, otherwise from a
  deterministic local generator. OpenAI output is validated; any failure or
  malformed JSON falls back to local generation. The key is server-only.
- **Layout** is always computed locally (`lib/generateLayout.ts`) — never by
  OpenAI.

## 3D models

The 3D preview loads GLB files from `/public/models/<style-slug>/<model>.glb`
when present and shows clean placeholder pieces otherwise. We never call Meshy
at runtime — models are prebuilt static asset packs. See
`public/models/README.md`.

## Key files

```
app/                  routes (landing, recreate, kit/[id], admin) + API
components/            UI components (visualizer, 3D, share card, etc.)
lib/                  types, generation, layout, mood swap, storage, utils
public/models/        optional GLB asset packs
```

## Wow factors

1. Animated room reveal (`GenerationReveal`)
2. Mood swap — cozier / darker / cheaper / luxury (`lib/moodSwap.ts`)
3. From Dream Pin to Real Room (`DreamToRealSection`)
4. Shareable kit card with real PNG export (`ShareCard`)
5. Locked full kit / paywall placeholder (`LockedFullKit`)

## Future hooks (commented in code)

Pinterest pin import · OpenAI structured outputs · Meshy GLB asset library ·
Supabase saved kits · Stripe checkout · affiliate product links · PDF export ·
user-uploaded room photo · drag-and-drop furniture editor.
