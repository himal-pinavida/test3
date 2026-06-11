import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { createApp } from './app.js';

const app = createApp({ version: '9.9.9' });

describe('GET /healthz', () => {
  it('returns 200 with a small JSON liveness payload', async () => {
    const res = await request(app).get('/healthz');

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ status: 'ok', service: 'api', version: '9.9.9' });
    expect(typeof res.body.uptimeSeconds).toBe('number');
    expect(typeof res.body.timestamp).toBe('string');
  });

  it('sets a correlation id header on the response', async () => {
    const res = await request(app).get('/healthz');
    expect(res.headers['x-request-id']).toBeTruthy();
  });

  it('echoes an inbound x-request-id', async () => {
    const res = await request(app).get('/healthz').set('x-request-id', 'test-correlation-1');
    expect(res.headers['x-request-id']).toBe('test-correlation-1');
  });
});

describe('GET /readyz', () => {
  it('returns 200 and reports readiness with no required dependencies', async () => {
    const res = await request(app).get('/readyz');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.checks).toEqual({});
  });
});
