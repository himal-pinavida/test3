/**
 * Shared Prettier configuration for the monorepo.
 *
 * Consumed by the root `prettier.config.mjs`, which Prettier picks up when run
 * across the whole repository (`pnpm format` / `pnpm format:check`).
 *
 * @type {import('prettier').Config}
 */
const config = {
  printWidth: 100,
  singleQuote: true,
  semi: true,
  trailingComma: 'all',
  arrowParens: 'always',
  endOfLine: 'lf',
};

export default config;
