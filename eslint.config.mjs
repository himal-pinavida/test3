import { baseConfig } from '@resume-roast/config/eslint';

/**
 * Root ESLint flat config.
 *
 * Builds on the shared base config from `@resume-roast/config` and layers on
 * per-area environment globals so each workspace is linted with the right
 * runtime context (browser for the web app, Node for the API/shared package).
 */
export default [
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.next/**',
      '**/coverage/**',
      '**/*.config.mjs',
    ],
  },
  ...baseConfig,
];
