import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/firebase/auth-context';

export const metadata: Metadata = {
  title: {
    default: 'CSR Flow — Plan • Track • Impact',
    template: '%s | CSR Flow',
  },
  description:
    'CSR Flow is an enterprise platform for planning, tracking, and measuring the impact of Corporate Social Responsibility initiatives.',
  keywords: ['CSR', 'CSR Flow', 'Corporate Social Responsibility', 'Impact Management', 'ESG Audit'],
  authors: [{ name: 'CSR Flow Team' }],
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
