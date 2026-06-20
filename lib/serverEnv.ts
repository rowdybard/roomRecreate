import { getCloudflareContext } from "@opennextjs/cloudflare";

/**
 * Read a server-side secret.
 *
 * Priority:
 *  1. `x-openai-key` header (set by the DevKeyInput client component for quick
 *     testing without redeploying secrets).
 *  2. `process.env.<name>` (works locally via .env.local and on some platforms).
 *  3. `getCloudflareContext().env.<name>` (Cloudflare Workers binding).
 *
 * Returns `undefined` if the key is not found anywhere.
 */
export async function serverEnv(
  name: "OPENAI_API_KEY",
  request?: Request,
): Promise<string | undefined> {
  // 1. Client override header
  if (request) {
    const header = request.headers.get("x-openai-key");
    if (header) return header;
  }

  // 2. process.env (works in local dev and on some hosts)
  const fromProcess = process.env[name];
  if (fromProcess) return fromProcess;

  // 3. Cloudflare Workers binding
  try {
    const cf = getCloudflareContext({ async: true });
    const env = (await cf).env as Record<string, string | undefined>;
    return env[name];
  } catch {
    return undefined;
  }
}
