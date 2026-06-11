import { APP_NAME } from '@resume-roast/shared';
import express, { type Express, type Request, type Response } from 'express';

/**
 * Build the Express application.
 *
 * Kept free of `listen()` so it can be exercised directly by integration tests
 * (Supertest) without binding a port. Health/readiness endpoints, request
 * logging, and the redaction guardrail are added in Step 4.
 */
export function createApp(): Express {
  const app = express();

  // Root route: minimal, and proves the shared workspace package is wired in.
  app.get('/', (_req: Request, res: Response) => {
    res.json({ name: APP_NAME, service: 'api' });
  });

  return app;
}
