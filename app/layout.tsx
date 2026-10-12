import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '@/context/AppContext';
import { CreateHandoffModal } from '@/components/ui/CreateHandoffModal';
import { GlobalCommandPalette } from '@/components/ui/GlobalCommandPalette';
import { GlobalToast } from '@/components/ui/Toast';

export const metadata: Metadata = {
  title: 'CONTINUITY — Enterprise Engineering Knowledge Handoff Platform',
  description:
    'Mission-critical enterprise engineering knowledge handoff platform for verifiable, lossless developer rotations, shift handoffs, and project continuity.',
  openGraph: {
    title: 'CONTINUITY — Enterprise Engineering Knowledge Handoff Platform',
    description:
      'Mission-critical enterprise engineering knowledge handoff platform for verifiable, lossless developer rotations, shift handoffs, and project continuity.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CONTINUITY — Enterprise Engineering Knowledge Handoff Platform',
    description:
      'Mission-critical enterprise engineering knowledge handoff platform for verifiable, lossless developer rotations, shift handoffs, and project continuity.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" data-theme="dark" suppressHydrationWarning>
      <body className="antialiased min-h-screen transition-colors duration-300" suppressHydrationWarning>
        <AppProvider>
          {children}
          <CreateHandoffModal />
          <GlobalCommandPalette />
          <GlobalToast />
        </AppProvider>
      </body>
    </html>
  );
}
