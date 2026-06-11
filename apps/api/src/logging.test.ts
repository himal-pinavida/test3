import { Writable } from 'node:stream';

import pino from 'pino';
import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { createApp } from './app.js';

/** Capture log output into an in-memory buffer for assertions. */
function captureLogger(): { logger: pino.Logger; output: () => string } {
  const chunks: string[] = [];
  const stream = new Writable({
    write(chunk: Buffer, _encoding, callback) {
      chunks.push(chunk.toString());
      callback();
    },
  });
  return { logger: pino({ level: 'info' }, stream), output: () => chunks.join('\n') };
}

describe('request logging privacy', () => {
  it('logs the correlation id, method, and url but never bodies or sensitive headers', async () => {
    const { logger, output } = captureLogger();
    const app = createApp({ logger });

    // Synthetic, clearly-fake "résumé" content and a secret header.
    await request(app)
      .post('/')
      .set('authorization', 'Bearer super-secret-token')
      .send({ resumeText: 'Sample private resume content for Test Persona' });

    // Let pino-http's on-finish handler flush.
    await new Promise((resolve) => setImmediate(resolve));

    const logged = output();

    // Safe, expected fields are present.
    expect(logged).toContain('"method":"POST"');
    expect(logged).toContain('"url":"/"');
    expect(logged).toContain('"id":');

    // The body and sensitive header must never appear in logs.
    expect(logged).not.toContain('super-secret-token');
    expect(logged).not.toContain('resumeText');
    expect(logged).not.toContain('Sample private resume content');
  });
});
