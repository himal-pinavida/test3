import { describe, expect, it } from 'vitest';

import { APP_NAME, REDACTED, redactPII, scrubObject } from './index.js';

// NOTE: all fixtures below are synthetic — no real résumé content or PII.

describe('APP_NAME', () => {
  it('is the product name', () => {
    expect(APP_NAME).toBe('AI Resume Roast Generator');
  });
});

describe('redactPII', () => {
  it('masks email addresses', () => {
    expect(redactPII('reach me at jane.doe@example.com please')).toBe(
      `reach me at ${REDACTED} please`,
    );
  });

  it('masks phone-number-like sequences', () => {
    expect(redactPII('call +1 (555) 123-4567 today')).toBe(`call ${REDACTED} today`);
  });

  it('leaves text without PII unchanged', () => {
    expect(redactPII('a tidy, impactful summary')).toBe('a tidy, impactful summary');
  });
});

describe('scrubObject', () => {
  it('redacts values under sensitive keys', () => {
    expect(scrubObject({ name: 'Sample', password: 'hunter2' })).toEqual({
      name: 'Sample',
      password: REDACTED,
    });
  });

  it('walks nested objects and arrays, redacting PII in strings', () => {
    expect(
      scrubObject({
        profile: { note: 'email sample@example.com' },
        tags: ['ok', 'phone 555-987-6543'],
      }),
    ).toEqual({
      profile: { note: `email ${REDACTED}` },
      tags: ['ok', `phone ${REDACTED}`],
    });
  });

  it('does not mutate the input object', () => {
    const input = { token: 'abc', items: ['x'] };
    scrubObject(input);
    expect(input).toEqual({ token: 'abc', items: ['x'] });
  });
});
