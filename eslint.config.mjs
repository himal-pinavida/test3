import { baseConfig } from '@resume-roast/config/eslint';
import globals from 'globals';

/**
 * Root ESLint flat config.
 *
 * Builds on the shared base config from `@resume-roast/config` and layers on
 * per-area environment globals so each workspace is linted with the right
 * runtime context: browser for the web app, Node for the API, shared package,
 * and config/build scripts.
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
  {
    files: ['apps/web/**/*.{ts,tsx,mjs}'],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
  },
  {
    files: ['apps/api/**/*.ts', 'packages/**/*.ts', 'tooling/**/*.{js,mjs}', '**/*.{js,mjs,cjs}'],
    languageOptions: {
      globals: { ...globals.node },
    },
  },
];
