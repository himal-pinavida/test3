import js from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import tseslint from 'typescript-eslint';

/**
 * Shared flat ESLint config for the monorepo.
 *
 * Consumed by the root `eslint.config.mjs` (and available to any workspace that
 * wants to run ESLint in isolation). Provides JavaScript + TypeScript recommended
 * rules and turns off stylistic rules that Prettier owns. ESLint 10 only supports
 * flat config, so this is exported as a flat-config array.
 */
export const baseConfig = tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      // Allow intentionally-unused identifiers when prefixed with `_`.
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
    },
  },
  // Keep Prettier last so it disables any conflicting formatting rules.
  eslintConfigPrettier,
);

export default baseConfig;
