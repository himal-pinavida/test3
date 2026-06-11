import { z } from 'zod';

/**
 * Environment schema for the web app.
 *
 * Kept minimal for the bootstrap story: a single, optional public base URL for
 * the API with a sensible default. Imported by `next.config.mjs` so an invalid
 * value fails the build/start fast with a clear message.
 */
const envSchema = z.object({
  NEXT_PUBLIC_API_BASE_URL: z.string().url().default('http://localhost:4000'),
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
  const issues = result.error.issues
    .map((issue) => `  - ${issue.path.join('.') || '(root)'}: ${issue.message}`)
    .join('\n');
  throw new Error(`Invalid web environment configuration:\n${issues}`);
}

/** Validated, strongly-typed environment for the web app. */
export const webEnv = result.data;
