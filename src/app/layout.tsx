import type { Metadata } from 'next';
import './globals.css';
import { RoleProvider } from '@/components/RoleContext';
import AppWrapper from './AppWrapper';

export const metadata: Metadata = {
  title: 'KDOS SMP - Database Management & Staff System',
  description: 'Minecraft SMP Database Management System, Candidate Interview Portal, and Staff Supervision System',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen flex flex-col bg-[#090d16] text-gray-100 antialiased selection:bg-emerald-500/30 selection:text-emerald-300">
        <RoleProvider>
          <AppWrapper>
            {children}
          </AppWrapper>
        </RoleProvider>
      </body>
    </html>
  );
}
