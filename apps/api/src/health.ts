import type { HealthStatus, ReadinessStatus } from '@resume-roast/shared';

const SERVICE_NAME = 'api';

/**
 * Liveness payload. Reports that the process is up; deliberately depends on
 * nothing external so it stays fast and always answerable.
 */
export function getHealth(version: string): HealthStatus {
  return {
    status: 'ok',
    service: SERVICE_NAME,
    version,
    uptimeSeconds: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
  };
}

/**
 * Readiness payload. For the Story 1 baseline there are no required external
 * dependencies, so `checks` is empty and the service is always ready. Future
 * stories add datastore/provider probes here without changing the contract.
 */
export function getReadiness(version: string): ReadinessStatus {
  return {
    ...getHealth(version),
    checks: {},
  };
}
