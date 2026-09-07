'use client';

import { motion } from 'framer-motion';
import { ArrowDown, Github, Linkedin, Mail } from 'lucide-react';
import { personal } from '@/content/profile';
import { TypingText } from './TypingText';
import { AskMeAnything } from '@/components/ama/AskMeAnything';
import { Badge } from '@/components/ui/badge';

export function Hero() {
  return (
    <section id="home" className="relative flex min-h-[100svh] flex-col items-center justify-center px-6 pb-16 pt-32 sm:pt-40">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-6"
      >
        <Badge className="font-mono">
          <span className="mr-1.5 inline-block h-1.5 w-1.5 animate-glow-pulse rounded-full bg-signal-cyan" />
          available for backend / infra roles
        </Badge>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="text-center text-5xl font-bold tracking-tight text-white sm:text-7xl"
      >
        {personal.name}
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mt-3 max-w-2xl text-center font-mono text-sm text-signal-cyan/80 sm:text-base"
      >
        <TypingText text={personal.tagline} />
      </motion.p>

      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="mt-5 max-w-xl text-balance text-center text-base text-white/50 sm:text-lg"
      >
        {personal.subtitle} — 3 years scaling AI voice infrastructure at{' '}
        <span className="text-white/80">SaaS Labs (JustCall / AIVA)</span>.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="mt-6 flex items-center gap-4"
      >
        <a
          href={`mailto:${personal.email}`}
          aria-label="Email Rohit"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-white/60 transition-colors hover:border-signal-cyan/50 hover:text-signal-cyan"
        >
          <Mail className="h-4 w-4" />
        </a>
        <a
          href={personal.github}
          target="_blank"
          rel="noreferrer"
          aria-label="Rohit's GitHub"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-white/60 transition-colors hover:border-signal-cyan/50 hover:text-signal-cyan"
        >
          <Github className="h-4 w-4" />
        </a>
        <a
          href={personal.linkedin}
          target="_blank"
          rel="noreferrer"
          aria-label="Rohit's LinkedIn"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-white/60 transition-colors hover:border-signal-cyan/50 hover:text-signal-cyan"
        >
          <Linkedin className="h-4 w-4" />
        </a>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.55 }}
        className="mt-14 flex w-full justify-center"
      >
        <AskMeAnything />
      </motion.div>

      <motion.a
        href="#impact"
        aria-label="Scroll to impact section"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 1 }}
        className="mt-16 flex flex-col items-center gap-2 text-white/30 transition-colors hover:text-signal-cyan"
      >
        <span className="font-mono text-[10px] uppercase tracking-[0.3em]">scroll</span>
        <ArrowDown className="h-4 w-4 animate-bounce" />
      </motion.a>
    </section>
  );
}
