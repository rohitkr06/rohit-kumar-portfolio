'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Command, Download, Menu, TerminalSquare, X } from 'lucide-react';
import { personal } from '@/content/profile';
import { useTerminalMode } from '@/components/terminal/terminal-context';
import { cn } from '@/lib/utils';

const LINKS = [
  { id: 'impact', label: 'Impact' },
  { id: 'experience', label: 'Experience' },
  { id: 'skills', label: 'Skills' },
  { id: 'achievements', label: 'Achievements' },
  { id: 'contact', label: 'Contact' },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const terminal = useTerminalMode();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close the mobile menu automatically if the viewport grows past the
  // breakpoint where the inline nav takes over, so it can't be left open
  // and hidden behind the (now visible) desktop links.
  useEffect(() => {
    const mql = window.matchMedia('(min-width: 768px)');
    const onChange = () => setMobileOpen(false);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  function openPalette() {
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }));
  }

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-300',
        scrolled || mobileOpen ? 'border-b border-white/10 bg-black/50 backdrop-blur-xl' : 'border-b border-transparent bg-transparent',
      )}
    >
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <a href="#home" className="font-mono text-sm font-semibold text-white">
          <span className="text-signal-cyan">~/</span>
          {personal.name.toLowerCase().replace(' ', '-')}
        </a>

        {/* Always-visible section nav on desktop — the command palette is a
            shortcut for power users, not the only way to get around. */}
        <div className="hidden items-center gap-7 font-mono text-xs uppercase tracking-wider text-white/70 md:flex">
          {LINKS.map((link) => (
            <a key={link.id} href={`#${link.id}`} className="transition-colors hover:text-signal-cyan">
              {link.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={terminal.toggle}
            aria-label="Toggle terminal mode"
            className="hidden h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-white/60 transition-colors hover:border-signal-cyan/50 hover:text-signal-cyan sm:flex"
          >
            <TerminalSquare className="h-4 w-4" />
          </button>
          <button
            onClick={openPalette}
            title="Press ⌘K (or Ctrl+K) to jump to any section"
            className="flex h-9 items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 text-xs text-white/60 transition-colors hover:border-signal-cyan/50 hover:text-signal-cyan"
            aria-label="Open command palette to navigate the site"
          >
            <Command className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">⌘K to navigate</span>
          </button>

          {/* Mobile-only menu button — on small screens the links above are
              hidden, so this is the visible, always-present way to get to
              any section without needing to discover the palette. */}
          <button
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-white/70 transition-colors hover:border-signal-cyan/50 hover:text-signal-cyan md:hidden"
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-white/10 bg-black/80 backdrop-blur-xl md:hidden"
          >
            <div className="flex flex-col gap-1 px-6 py-4 font-mono text-sm uppercase tracking-wider text-white/70">
              {LINKS.map((link) => (
                <a
                  key={link.id}
                  href={`#${link.id}`}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg px-2 py-2.5 transition-colors hover:bg-white/[0.05] hover:text-signal-cyan"
                >
                  {link.label}
                </a>
              ))}
              <a
                href="/rohit-kumar-resume.pdf"
                download="Rohit-Kumar-Resume.pdf"
                onClick={() => setMobileOpen(false)}
                className="mt-1 flex items-center gap-2 rounded-lg border border-white/10 px-2 py-2.5 normal-case tracking-normal text-white/80 transition-colors hover:border-signal-cyan/50 hover:text-signal-cyan"
              >
                <Download className="h-3.5 w-3.5" />
                Download Résumé
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
