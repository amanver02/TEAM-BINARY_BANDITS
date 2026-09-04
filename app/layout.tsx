import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/firebase/auth-context';

export const metadata: Metadata = {
  title: {
    default: 'CSR360 — One Source of Truth',
    template: '%s | CSR360',
  },
  description:
    'CSR360 is an enterprise platform for managing Corporate Social Responsibility projects, partners, budgets, milestones, and impact reporting in one place.',
  keywords: ['CSR', 'Corporate Social Responsibility', 'Project Management', 'Impact Reporting'],
  authors: [{ name: 'CSR360' }],
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
