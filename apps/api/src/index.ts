import 'dotenv/config';

import { createApp } from './app.js';
import { loadEnv } from './env.js';

/** Validate configuration first so misconfiguration fails fast at startup. */
const env = loadEnv();

const app = createApp();

const server = app.listen(env.PORT, () => {
  // eslint-disable-next-line no-console -- structured logging is introduced in Step 4
  console.log(`API listening on http://localhost:${env.PORT} (${env.NODE_ENV})`);
});

/** Graceful shutdown so the dev loop and container orchestration stay clean. */
const shutdown = (signal: string): void => {
  // eslint-disable-next-line no-console -- structured logging is introduced in Step 4
  console.log(`Received ${signal}, shutting down...`);
  server.close(() => process.exit(0));
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
