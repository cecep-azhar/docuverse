import '../../globals.css';
import { ReactNode } from 'react';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <section className="min-h-dvh">
      {children}
    </section>
  );
}
