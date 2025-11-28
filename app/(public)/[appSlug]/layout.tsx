import '../..//globals.css';
import { ReactNode } from 'react';

export default function AppDocsLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        {children}
      </body>
    </html>
  );
}
