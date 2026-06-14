/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Allow loading GLB models and large transpiled three.js packages cleanly.
  transpilePackages: ["three"],
};

export default nextConfig;

// Enable Cloudflare bindings (env vars, etc.) when running `next dev` locally,
// so the dev server matches the Workers runtime. No-op in production builds.
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
initOpenNextCloudflareForDev();
