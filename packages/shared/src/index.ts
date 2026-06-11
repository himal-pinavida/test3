/**
 * Public entry point for the shared workspace package.
 *
 * Story 1 keeps this intentionally small: a couple of constants and a shared
 * type that the web and API apps import to prove cross-workspace wiring. Future
 * stories add redaction helpers, validation, and domain types here.
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
