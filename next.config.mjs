/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
await import('./src/env.mjs');

import withPWAInit from '@ducanh2912/next-pwa';
import pkg from './package.json' assert { type: 'json' };

const withPWA = withPWAInit({
  dest: 'public',
});

/** @type {import("next").NextConfig} */
const config = withPWA({
  reactStrictMode: true,
  output: 'standalone',
  eslint: {
    ignoreDuringBuilds: true,
  },
  publicRuntimeConfig: {
    version: pkg.version,
  },
});

export default config;
