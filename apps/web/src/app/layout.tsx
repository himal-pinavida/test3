import { APP_NAME } from '@resume-roast/shared';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: APP_NAME,
  description: 'Funny-but-constructive résumé feedback.',
};

const fontStack = 'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

export default function RootLayout({ children }: { children: ReactNode }): ReactNode {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: fontStack, lineHeight: 1.5 }}>{children}</body>
    </html>
  );
}
