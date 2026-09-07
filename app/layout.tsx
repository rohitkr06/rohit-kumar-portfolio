import type { Metadata } from 'next';
import './globals.css';
import { siteMeta, personal } from '@/content/profile';
import { CanvasBackground } from '@/components/background/CanvasBackground';
import { Navbar } from '@/components/nav/Navbar';
import { CommandPalette } from '@/components/nav/CommandPalette';
import { CustomCursor } from '@/components/cursor/CustomCursor';
import { TerminalMode } from '@/components/terminal/TerminalMode';
import { TerminalModeProvider } from '@/components/terminal/terminal-context';

export const metadata: Metadata = {
  metadataBase: new URL(siteMeta.url),
  title: { default: siteMeta.title, template: `%s — ${personal.name}` },
  description: siteMeta.description,
  keywords: [
    'Rohit Kumar', 'Backend Engineer', 'Node.js', 'TypeScript', 'Distributed Systems',
    'AI Voice Agent', 'JustCall', 'AIVA', 'SaaS Labs', 'System Design',
  ],
  authors: [{ name: personal.name, url: siteMeta.url }],
  creator: personal.name,
  openGraph: {
    type: 'website',
    url: siteMeta.url,
    title: siteMeta.title,
    description: siteMeta.description,
    siteName: `${personal.name} — Portfolio`,
  },
  twitter: {
    card: 'summary_large_image',
    title: siteMeta.title,
    description: siteMeta.description,
  },
  icons: {
    icon: '/favicon.svg',
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        {/* Loaded via <link> rather than next/font/google so this repo builds
            fully offline too — only the browser needs to reach Google Fonts,
            not the build machine. Swap to next/font/google any time for
            self-hosted, zero-request fonts; see README for the one-line change. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased">
        <TerminalModeProvider>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[999] focus:rounded-lg focus:bg-signal-cyan focus:px-4 focus:py-2 focus:text-void"
          >
            Skip to content
          </a>
          <CanvasBackground />
          <CustomCursor />
          <Navbar />
          <CommandPalette />
          <TerminalMode />
          <div id="main-content">{children}</div>
        </TerminalModeProvider>
      </body>
    </html>
  );
}
