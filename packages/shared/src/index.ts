/**
 * Public entry point for the shared workspace package.
 *
 * Holds cross-workspace constants/types plus the privacy guardrail helpers.
 * Kept as a single module on purpose: the package is consumed as TypeScript
 * source by bundlers (Turbopack, esbuild) whose `.js`-specifier resolution
 * differs, so avoiding intra-package relative imports keeps every consumer
 * happy. Future stories can split this once a compiled-package build is added.
 */

/** Human-readable product name, shared across web and API. */
export const APP_NAME = 'AI Resume Roast Generator' as const;

/** The npm package name, used in tests to assert the workspace resolves. */
export const SHARED_PACKAGE_NAME = '@resume-roast/shared' as const;

/** Shape returned by the API health/readiness endpoints. */
export interface HealthStatus {
  /** Overall status of the service or a dependency it depends on. */
  status: 'ok' | 'degraded' | 'error';
  /** Logical name of the service reporting the status. */
  service: string;
  /** Build/version identifier, where available. */
  version: string;
  /** Process uptime in seconds. */
  uptimeSeconds: number;
  /** ISO-8601 timestamp the status was generated. */
  timestamp: string;
}

/**
 * Readiness payload: the health status plus the result of each dependency
 * check. Empty for the Story 1 baseline (no external dependencies required).
 */
export interface ReadinessStatus extends HealthStatus {
  checks: Record<string, 'ok' | 'error'>;
}

/* -------------------------------------------------------------------------- */
/* Privacy guardrail helpers                                                  */
/* -------------------------------------------------------------------------- */

/**
 * Résumé content is sensitive PII, so anything that might be logged, cached, or
 * echoed should be scrubbed first. These helpers establish the pattern; future
 * stories build on them (e.g. before sending derived data anywhere external).
 */

/** Replacement token written in place of redacted content. */
export const REDACTED = '[REDACTED]';

/** Matches email addresses. */
const EMAIL_PATTERN = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;

/**
 * Matches phone-number-like runs: an optional `+`, then at least 8 digits that
 * may be separated by spaces, dots, hyphens, or parentheses. Bounded quantifier
 * to avoid catastrophic backtracking.
 */
const PHONE_PATTERN = /\+?\d(?:[\d().\s-]{6,40}\d)/g;

/**
 * Redact obvious PII (emails, phone numbers) from a free-text string.
 *
 * Intentionally conservative — a safety net for accidental leakage, not a
 * substitute for never handling raw content in the first place.
 */
export function redactPII(input: string): string {
  return input.replace(EMAIL_PATTERN, REDACTED).replace(PHONE_PATTERN, REDACTED);
}

/** Keys whose values are always replaced wholesale, regardless of content. */
const DEFAULT_SENSITIVE_KEYS: readonly string[] = [
  'password',
  'token',
  'secret',
  'authorization',
  'cookie',
  'apikey',
  'resume',
  'resumetext',
  'content',
  'body',
  'email',
  'phone',
];

/** A JSON-like value that {@link scrubObject} can walk. */
export type Scrubbable =
  | string
  | number
  | boolean
  | null
  | undefined
  | Scrubbable[]
  | ScrubbableObject;
export interface ScrubbableObject {
  [key: string]: Scrubbable;
}

/**
 * Deep-clone a plain object/array, replacing values under sensitive keys with
 * {@link REDACTED} and redacting PII inside any remaining strings. Use this to
 * sanitise structured data before it is logged.
 *
 * @param value - the value to scrub (objects, arrays, and primitives supported)
 * @param sensitiveKeys - case-insensitive key names to redact wholesale
 */
export function scrubObject<T extends Scrubbable>(
  value: T,
  sensitiveKeys: readonly string[] = DEFAULT_SENSITIVE_KEYS,
): Scrubbable {
  const sensitive = new Set(sensitiveKeys.map((key) => key.toLowerCase()));
  return scrubValue(value, sensitive);
}

function scrubValue(value: Scrubbable, sensitive: ReadonlySet<string>): Scrubbable {
  if (typeof value === 'string') {
    return redactPII(value);
  }
  if (Array.isArray(value)) {
    return value.map((item) => scrubValue(item, sensitive));
  }
  if (value !== null && typeof value === 'object') {
    const result: ScrubbableObject = {};
    for (const [key, val] of Object.entries(value)) {
      result[key] = sensitive.has(key.toLowerCase()) ? REDACTED : scrubValue(val, sensitive);
    }
    return result;
  }
  return value;
}
