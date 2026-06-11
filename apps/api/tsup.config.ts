import { defineConfig } from 'tsup';

/**
 * Build the API to a runnable bundle.
 *
 * The shared workspace package is consumed as TypeScript source, so we bundle
 * (esbuild) rather than emit with `tsc`: this inlines `@resume-roast/shared`
 * into the output and keeps `node dist/index.js` runnable. Strict type-checking
 * is handled separately by `tsc --noEmit` (the `typecheck` script).
 */
export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  target: 'node20',
  platform: 'node',
  outDir: 'dist',
  clean: true,
  sourcemap: true,
  // Keep third-party deps external; only bundle workspace source.
  noExternal: [/^@resume-roast\//],
});
