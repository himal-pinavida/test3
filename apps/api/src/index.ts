import 'dotenv/config';

import { createApp } from './app.js';
import { loadEnv } from './env.js';
import { createLogger } from './logger.js';

/** Validate configuration first so misconfiguration fails fast at startup. */
const env = loadEnv();

const logger = createLogger(env.LOG_LEVEL);
const app = createApp({ version: env.APP_VERSION, logger });

const server = app.listen(env.PORT, () => {
  logger.info({ port: env.PORT, env: env.NODE_ENV }, 'API listening');
});

/** Graceful shutdown so the dev loop and container orchestration stay clean. */
const shutdown = (signal: string): void => {
  logger.info({ signal }, 'Shutting down');
  server.close(() => process.exit(0));
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
