'use client';

import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';

type TerminalContextValue = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
};

const TerminalContext = createContext<TerminalContextValue | null>(null);

export function TerminalModeProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((v) => !v), []);

  return <TerminalContext.Provider value={{ isOpen, open, close, toggle }}>{children}</TerminalContext.Provider>;
}

export function useTerminalMode() {
  const ctx = useContext(TerminalContext);
  if (!ctx) throw new Error('useTerminalMode must be used within TerminalModeProvider');
  return ctx;
}
