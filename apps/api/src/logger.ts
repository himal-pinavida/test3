import { randomUUID } from 'node:crypto';

import pino, { type Logger } from 'pino';
import { pinoHttp, type HttpLogger } from 'pino-http';

/**
 * Create the application logger.
 *
 * Emits structured JSON. Silenced under `NODE_ENV=test` so integration tests
 * (Supertest) stay quiet. The `service` field tags every line for aggregation.
 */
export function createLogger(level?: string): Logger {
  const resolvedLevel = process.env.NODE_ENV === 'test' ? 'silent' : (level ?? 'info');
  return pino({ level: resolvedLevel, base: { service: 'api' } });
}

/** Minimal view of a request used by the safe serializer. */
interface LoggableRequest {
  id?: unknown;
  method?: string;
  url?: string;
}

/** Minimal view of a response used by the safe serializer. */
interface LoggableResponse {
  statusCode?: number;
}

/**
 * HTTP request-logging middleware.
 *
 * Privacy guardrail: the serializers below are a strict allow-list — only the
 * request id, method, and URL (and the response status) are logged. Request
 * bodies, headers (which can carry auth tokens/cookies), and any user-provided
 * content are never logged. A correlation id is taken from an inbound
 * `x-request-id` header when present, otherwise generated, and echoed back on
 * the response so clients and logs can be correlated. Health/readiness probes
 * are skipped to keep the logs signal-rich.
 */
export function createHttpLogger(logger: Logger): HttpLogger {
  return pinoHttp({
    logger,
    genReqId: (req, res) => {
      const header = req.headers['x-request-id'];
      const id = typeof header === 'string' && header.length > 0 ? header : randomUUID();
      res.setHeader('x-request-id', id);
      return id;
    },
    serializers: {
      req: (req: LoggableRequest) => ({ id: req.id, method: req.method, url: req.url }),
      res: (res: LoggableResponse) => ({ statusCode: res.statusCode }),
    },
    autoLogging: {
      ignore: (req) => req.url === '/healthz' || req.url === '/readyz',
    },
  });
}
