import { APP_NAME } from '@resume-roast/shared';
import type { ReactNode } from 'react';

export default function HomePage(): ReactNode {
  return (
    <main style={{ maxWidth: 640, margin: '0 auto', padding: '4rem 1.5rem' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{APP_NAME}</h1>
      <p style={{ color: '#555' }}>
        Baseline scaffolding is up and running. Paste-or-upload résumé flows arrive in a later
        story.
      </p>
    </main>
  );
}
