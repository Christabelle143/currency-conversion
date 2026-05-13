/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // i18next v23 needs TS 4.7+, but we're pinned to 4.5.x for now.
  // Our code is still type-checked via npm run type-check.
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack: (config) => {
    // Don't need node-fetch's encoding polyfill
    config.resolve.fallback = { ...config.resolve.fallback, encoding: false };
    return config;
  },
  turbopack: {},
};

module.exports = nextConfig;
