import './src/env.mjs';

/**
 * Next.js configuration.
 *
 * `transpilePackages` lets Next compile the shared workspace package, which is
 * published as TypeScript source. Importing `./src/env.mjs` validates the web
 * app's environment at config load, so misconfiguration fails fast.
 *
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@resume-roast/shared'],
};

export default nextConfig;
