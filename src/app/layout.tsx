import type { Metadata } from 'next';
import { Space_Grotesk, Inter } from 'next/font/google';
import './globals.css';
import { Logo } from '@/components/Logo';
import { Navigation } from '@/components/Navigation';
import { ArchiveProvider } from '@/components/ArchiveProvider';

const displayFont = Space_Grotesk({
  subsets: ['latin'],
  weight: ['700'],
  variable: '--font-display',
  display: 'swap',
});

const bodyFont = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-body',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Side Hustle — Research-Based Artist Organization',
    template: '%s | Side Hustle',
  },
  description:
    'Side Hustle is a research-based artist organization dedicated to archiving and presenting contemporary artistic practice.',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXTAUTH_URL ?? 'https://sidehustle.art',
    siteName: 'Side Hustle',
    title: 'Side Hustle — Research-Based Artist Organization',
    description:
      'Side Hustle is a research-based artist organization dedicated to archiving and presenting contemporary artistic practice.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Side Hustle — Research-Based Artist Organization',
    description:
      'Side Hustle is a research-based artist organization dedicated to archiving and presenting contemporary artistic practice.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${displayFont.variable} ${bodyFont.variable}`}>
      <body>
        <ArchiveProvider>
          {/* Top bar — backs the logo; right edge stops at nav panel's left border */}
          <div
            className="fixed top-0 left-0 z-30 bg-white border-b border-black pointer-events-none"
            style={{ height: '3.25rem', right: 0 }}
            aria-hidden="true"
          />
          <Logo />
          <Navigation />
          <div>{children}</div>
        </ArchiveProvider>
      </body>
    </html>
  );
}
