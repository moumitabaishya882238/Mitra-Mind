import './globals.css';
import Link from 'next/link';
import type { ReactNode } from 'react';

export const metadata = {
  title: 'Mitra Volunteering Portal',
  description: 'Verified volunteer listener application and operations portal.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <main className="page">
          <h1>MitraMind Listener Portal</h1>
          <p>Verification, training, and activation workflow for volunteer listeners.</p>

          <nav className="nav">
            <Link href="/">Home</Link>
            <Link href="/apply">Apply</Link>
            <Link href="/training">Training</Link>
            <Link href="/dashboard">Availability</Link>
            <Link href="/login">Workspace Login</Link>
            <Link href="/admin/review">Admin Review</Link>
          </nav>

          {children}
        </main>
      </body>
    </html>
  );
}
