/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Allow loading GLB models and large transpiled three.js packages cleanly.
  transpilePackages: ["three"],
};

export default nextConfig;
