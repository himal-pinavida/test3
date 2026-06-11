import { APP_NAME } from '@resume-roast/shared';
import express, { type Express, type Request, type Response } from 'express';
import { type Logger } from 'pino';

import { getHealth, getReadiness } from './health.js';
import { createHttpLogger, createLogger } from './logger.js';

export interface AppOptions {
  /** Version/build identifier surfaced by the health endpoints. */
  version?: string;
  /** Logger to use; one is created if not supplied (handy for tests). */
  logger?: Logger;
}

/**
 * Build the Express application.
 *
 * Kept free of `listen()` so it can be exercised directly by integration tests
 * (Supertest) without binding a port.
 */
export function createApp(options: AppOptions = {}): Express {
  const version = options.version ?? '0.0.0';
  const logger = options.logger ?? createLogger();

  const app = express();

  // Don't advertise the framework.
  app.disable('x-powered-by');

  // Safe request logging (correlation id; never logs bodies or user content).
  app.use(createHttpLogger(logger));

  // Liveness: process is up. No external dependencies.
  app.get('/healthz', (_req: Request, res: Response) => {
    res.status(200).json(getHealth(version));
  });

  // Readiness: dependencies required for the baseline are available.
  app.get('/readyz', (_req: Request, res: Response) => {
    res.status(200).json(getReadiness(version));
  });

  // Root route: minimal, and proves the shared workspace package is wired in.
  app.get('/', (_req: Request, res: Response) => {
    res.json({ name: APP_NAME, service: 'api' });
  });

  return app;
}
