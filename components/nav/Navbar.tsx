'use client';

import { useEffect, useState } from 'react';
import { Command, TerminalSquare } from 'lucide-react';
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
  const terminal = useTerminalMode();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-300',
        scrolled ? 'border-b border-white/10 bg-black/50 backdrop-blur-xl' : 'border-b border-transparent bg-transparent',
      )}
    >
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <a href="#home" className="font-mono text-sm font-semibold text-white">
          <span className="text-signal-cyan">~/</span>
          {personal.name.toLowerCase().replace(' ', '-')}
        </a>

        <div className="hidden items-center gap-7 font-mono text-xs uppercase tracking-wider text-white/50 md:flex">
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
            className="hidden h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-white/50 transition-colors hover:border-signal-cyan/50 hover:text-signal-cyan sm:flex"
          >
            <TerminalSquare className="h-4 w-4" />
          </button>
          <button
            onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))}
            className="flex h-9 items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 text-xs text-white/50 transition-colors hover:border-signal-cyan/50 hover:text-signal-cyan"
            aria-label="Open command palette"
          >
            <Command className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">⌘K</span>
          </button>
        </div>
      </nav>
    </header>
  );
}
