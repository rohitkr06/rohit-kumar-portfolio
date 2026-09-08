'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTerminalMode } from './terminal-context';
import { personal, experience, skillGroups, achievements, education } from '@/content/profile';

type Line = { type: 'input' | 'output'; text: string };

const BANNER = [
  `${personal.name.toUpperCase()} — TERMINAL MODE`,
  `Type 'help' to see available commands. Press Esc or type 'exit' to leave.`,
];

function runCommand(raw: string): string[] {
  const [cmd, ...args] = raw.trim().toLowerCase().split(/\s+/);
  const flags = args.join(' ');

  switch (cmd) {
    case '':
      return [];
    case 'help':
      return [
        'available commands:',
        '  whoami                 — who is this',
        '  experience --list      — work history',
        '  skills --top           — core skill areas',
        '  achievements           — awards & honors',
        '  education              — academic background',
        '  contact                — how to reach him',
        '  clear                  — clear the screen',
        '  exit                   — leave terminal mode',
      ];
    case 'whoami':
      return [personal.name, personal.title, personal.tagline];
    case 'experience':
      if (flags.includes('--list') || flags === '') {
        return experience.flatMap((e) => [`${e.role} @ ${e.company} (${e.companyDetail})`, `  ${e.start} — ${e.end} · ${e.location}`]);
      }
      return [`unknown flag for experience: ${flags}`];
    case 'skills':
      if (flags.includes('--top') || flags === '') {
        return skillGroups.slice(0, 4).map((g) => `${g.label}: ${g.items.join(', ')}`);
      }
      return [`unknown flag for skills: ${flags}`];
    case 'achievements':
      return achievements.map((a) => `${a.title} — ${a.org}${a.date ? ` (${a.date})` : ''}: ${a.detail}`);
    case 'education':
      return [`${education.degree}`, `${education.school}`, `${education.start}—${education.end} · ${education.gpa}`];
    case 'contact':
      return [`email: ${personal.email}`, `linkedin: ${personal.linkedin}`, `github: ${personal.github}`];
    case 'sudo':
      return ["nice try. permission denied — this isn't that kind of portfolio."];
    default:
      return [`command not found: ${cmd}. type 'help' for a list of commands.`];
  }
}

export function TerminalMode() {
  const { isOpen, close } = useTerminalMode();
  const [lines, setLines] = useState<Line[]>(() => BANNER.map((text) => ({ type: 'output', text })));
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [lines]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && isOpen) close();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, close]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = input;
    setInput('');

    if (trimmed.trim().toLowerCase() === 'clear') {
      setLines([]);
      return;
    }
    if (trimmed.trim().toLowerCase() === 'exit') {
      setLines((prev) => [...prev, { type: 'input', text: trimmed }]);
      setTimeout(close, 200);
      return;
    }

    const output = runCommand(trimmed);
    setLines((prev) => [...prev, { type: 'input', text: trimmed }, ...output.map((text): Line => ({ type: 'output', text }))]);
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Terminal mode"
          onClick={(e) => e.target === e.currentTarget && close()}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.2 }}
            className="flex h-[70vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-signal-cyan/30 bg-black shadow-[0_0_80px_-10px_rgba(51,225,230,0.4)]"
          >
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-2.5">
              <span className="font-mono text-xs text-white/55">rohit@portfolio: ~ (terminal mode)</span>
              <button onClick={close} aria-label="Close terminal mode" className="font-mono text-xs text-white/55 hover:text-white">
                esc
              </button>
            </div>
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 font-mono text-sm text-signal-cyan/90">
              {lines.map((line, i) => (
                <div key={i} className={line.type === 'input' ? 'text-white' : 'whitespace-pre-wrap text-signal-cyan/80'}>
                  {line.type === 'input' ? <span className="text-signal-violet">❯ </span> : null}
                  {line.text}
                </div>
              ))}
            </div>
            <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-white/10 px-4 py-3">
              <span className="font-mono text-signal-violet">❯</span>
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 bg-transparent font-mono text-sm text-white outline-none"
                spellCheck={false}
                autoComplete="off"
                aria-label="Terminal input"
              />
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
