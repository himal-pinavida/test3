import { z } from 'zod';

/**
 * Environment schema for the API.
 *
 * Required variables are intentionally minimal for the bootstrap story; every
 * value has a sensible default so the app runs with no `.env`, but malformed
 * values (e.g. a non-numeric PORT) fail fast with a clear message. Future
 * stories add provider keys and datastore URLs here.
 */
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().max(65535).default(4000),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
  /** Version/build identifier surfaced by the health endpoints. */
  APP_VERSION: z.string().default('0.0.0'),
});

/** Validated, strongly-typed environment for the API. */
export type Env = z.infer<typeof envSchema>;

/**
 * Parse and validate `process.env`, failing fast on invalid configuration.
 *
 * On failure this prints a clear, human-readable summary of the offending
 * variables and exits the process with a non-zero status so misconfiguration
 * is caught at startup rather than at first use.
 */
export function loadEnv(source: NodeJS.ProcessEnv = process.env): Env {
  const result = envSchema.safeParse(source);

  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `  - ${issue.path.join('.') || '(root)'}: ${issue.message}`)
      .join('\n');
    // eslint-disable-next-line no-console -- startup diagnostics before the logger exists
    console.error(`Invalid environment configuration:\n${issues}`);
    process.exit(1);
  }

  return result.data;
}
