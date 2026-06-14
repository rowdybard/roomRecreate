import { defineCloudflareConfig } from "@opennextjs/cloudflare";

/**
 * OpenNext adapter config for Cloudflare Workers.
 *
 * Defaults are fine for this demo: static assets are served by the Workers
 * `ASSETS` binding (see wrangler.jsonc) and the `/api/generate-kit` route runs
 * in the Worker. No incremental cache / R2 is needed because the app persists
 * to localStorage on the client.
 *
 * To add Cloudflare-backed caching later, configure an incrementalCache here,
 * e.g. r2IncrementalCache, and add the matching R2 binding to wrangler.jsonc.
 */
export default defineCloudflareConfig({});
