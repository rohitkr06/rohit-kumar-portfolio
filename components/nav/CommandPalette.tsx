'use client';

import { useEffect, useState } from 'react';
import { Command } from 'cmdk';
import {
  Home, BarChart3, Briefcase, Sparkles, Award, Mail, Github, Linkedin, TerminalSquare, MessageSquareText,
} from 'lucide-react';
import { personal } from '@/content/profile';
import { useTerminalMode } from '@/components/terminal/terminal-context';

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const terminal = useTerminalMode();

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || e.key === '/') {
        // don't hijack "/" while typing in an input/textarea
        if (e.key === '/' && ['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;
        e.preventDefault();
        setOpen((v) => !v);
      }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  function run(action: () => void) {
    setOpen(false);
    setTimeout(action, 80);
  }

  return (
    <Command.Dialog
      open={open}
      onOpenChange={setOpen}
      label="Command menu"
      className="fixed left-1/2 top-28 z-[90] w-full max-w-lg -translate-x-1/2 overflow-hidden rounded-xl border border-white/10 bg-black/90 shadow-[0_0_60px_-10px_rgba(51,225,230,0.35)] backdrop-blur-2xl"
    >
      <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
        <span className="font-mono text-signal-cyan">❯</span>
        <Command.Input
          placeholder="Jump to a section, ask a question, open a link..."
          className="w-full bg-transparent font-mono text-sm text-white placeholder:text-white/30 outline-none"
        />
        <kbd className="rounded border border-white/10 px-1.5 py-0.5 font-mono text-[10px] text-white/45">esc</kbd>
      </div>
      <Command.List className="max-h-80 overflow-y-auto p-2">
        <Command.Empty className="px-3 py-6 text-center text-sm text-white/55">No matches. Try &quot;experience&quot; or &quot;contact&quot;.</Command.Empty>

        <Command.Group heading="Navigate" className="px-1 py-1 font-mono text-[10px] uppercase tracking-widest text-white/45 [&_[cmdk-group-heading]]:mb-1 [&_[cmdk-group-heading]]:mt-2">
          <Item icon={<Home className="h-4 w-4" />} onSelect={() => run(() => scrollToId('home'))}>Home</Item>
          <Item icon={<BarChart3 className="h-4 w-4" />} onSelect={() => run(() => scrollToId('impact'))}>Impact</Item>
          <Item icon={<Briefcase className="h-4 w-4" />} onSelect={() => run(() => scrollToId('experience'))}>Experience</Item>
          <Item icon={<Sparkles className="h-4 w-4" />} onSelect={() => run(() => scrollToId('skills'))}>Skills</Item>
          <Item icon={<Award className="h-4 w-4" />} onSelect={() => run(() => scrollToId('achievements'))}>Achievements &amp; Education</Item>
          <Item icon={<Mail className="h-4 w-4" />} onSelect={() => run(() => scrollToId('contact'))}>Contact</Item>
        </Command.Group>

        <Command.Group heading="Actions" className="px-1 py-1 font-mono text-[10px] uppercase tracking-widest text-white/45 [&_[cmdk-group-heading]]:mb-1 [&_[cmdk-group-heading]]:mt-3">
          <Item icon={<MessageSquareText className="h-4 w-4" />} onSelect={() => run(() => scrollToId('ask-me-anything'))}>
            Ask me anything about Rohit
          </Item>
          <Item icon={<TerminalSquare className="h-4 w-4" />} onSelect={() => run(() => terminal.open())}>
            Enter terminal mode
          </Item>
        </Command.Group>

        <Command.Group heading="Links" className="px-1 py-1 font-mono text-[10px] uppercase tracking-widest text-white/45 [&_[cmdk-group-heading]]:mb-1 [&_[cmdk-group-heading]]:mt-3">
          <Item icon={<Github className="h-4 w-4" />} onSelect={() => run(() => window.open(personal.github, '_blank'))}>
            Open GitHub
          </Item>
          <Item icon={<Linkedin className="h-4 w-4" />} onSelect={() => run(() => window.open(personal.linkedin, '_blank'))}>
            Open LinkedIn
          </Item>
          <Item icon={<Mail className="h-4 w-4" />} onSelect={() => run(() => (window.location.href = `mailto:${personal.email}`))}>
            Email {personal.name}
          </Item>
        </Command.Group>
      </Command.List>
    </Command.Dialog>
  );
}

function Item({ icon, children, onSelect }: { icon: React.ReactNode; children: React.ReactNode; onSelect: () => void }) {
  return (
    <Command.Item
      onSelect={onSelect}
      className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white/80 aria-selected:bg-signal-cyan/10 aria-selected:text-signal-cyan"
    >
      {icon}
      {children}
    </Command.Item>
  );
}
