import { APP_NAME } from '@resume-roast/shared';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import HomePage from './page.js';

afterEach(() => {
  cleanup();
});

describe('HomePage', () => {
  it('renders the product name as a heading', () => {
    render(<HomePage />);

    // getByRole throws if the heading is absent, which is itself an assertion.
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading.textContent).toBe(APP_NAME);
  });
});
