'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Terminal, CornerDownLeft, Loader2 } from 'lucide-react';
import { useAskMeAnything } from './use-ask-me-anything';
import { cn } from '@/lib/utils';

const SUGGESTED_QUESTIONS = [
  'What has he built at JustCall?',
  'What is AIVA?',
  'What was the impact of the MySQL migration?',
  'What are his core backend skills?',
  'Has he won any awards?',
];

export function AskMeAnything() {
  const { exchanges, ask, isBusy, reset } = useAskMeAnything();
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [exchanges]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || isBusy) return;
    void ask(input);
    setInput('');
  }

  function handleSuggested(q: string) {
    if (isBusy) return;
    void ask(q);
  }

  return (
    <motion.div
      id="ask-me-anything"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="relative w-full max-w-2xl scroll-mt-28"
    >
      {/* Ambient glow behind the terminal */}
      <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-signal-cyan/20 via-signal-violet/10 to-transparent blur-2xl" aria-hidden />

      <div className="relative rounded-2xl border border-white/10 bg-black/60 backdrop-blur-2xl shadow-[0_0_60px_-15px_rgba(51,225,230,0.35)] overflow-hidden">
        {/* Title bar */}
        <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.02] px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
            <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
            <span className="h-3 w-3 rounded-full bg-[#28c840]" />
            <span className="ml-3 flex items-center gap-1.5 font-mono text-xs text-white/50">
              <Terminal className="h-3.5 w-3.5" />
              ask-rohit.sh
            </span>
          </div>
          <div className="hidden items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-signal-cyan/70 sm:flex">
            <Sparkles className="h-3 w-3" />
            RAG · live retrieval
          </div>
        </div>

        {/* Conversation area */}
        <div ref={scrollRef} className="max-h-[360px] min-h-[180px] overflow-y-auto px-5 py-4 font-mono text-sm leading-relaxed">
          {exchanges.length === 0 && (
            <div className="space-y-3">
              <p className="text-white/50">
                <span className="text-signal-cyan">$</span> Ask anything about Rohit&apos;s experience, skills, or projects.
                Answers are retrieved live from his real background — not scripted.
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                {SUGGESTED_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => handleSuggested(q)}
                    className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-white/60 transition-colors hover:border-signal-cyan/50 hover:text-signal-cyan"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-5">
            {exchanges.map((ex) => (
              <div key={ex.id}>
                <p className="text-white/90">
                  <span className="text-signal-violet">❯</span> {ex.question}
                </p>
                <p className={cn('mt-1.5 whitespace-pre-wrap pl-4 text-white/70', ex.status === 'error' && 'text-red-400/80')}>
                  {ex.answer}
                  {ex.status === 'streaming' && <span className="ml-0.5 inline-block h-3.5 w-1.5 animate-caret-blink bg-signal-cyan align-middle" />}
                </p>
                {ex.sources.length > 0 && ex.status !== 'streaming' && (
                  <div className="mt-2 flex flex-wrap gap-1.5 pl-4">
                    {ex.sources.map((s) => (
                      <span
                        key={s.id}
                        title={`similarity ${(s.score * 100).toFixed(0)}%`}
                        className="rounded border border-signal-cyan/20 bg-signal-cyan/5 px-2 py-0.5 text-[10px] text-signal-cyan/70"
                      >
                        {s.section} · {s.title}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-white/10 bg-white/[0.02] px-4 py-3">
          <span className="font-mono text-signal-cyan">❯</span>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="ask-me-anything --about rohit"
            aria-label="Ask a question about Rohit Kumar"
            maxLength={300}
            disabled={isBusy}
            className="flex-1 bg-transparent font-mono text-sm text-white placeholder:text-white/25 outline-none disabled:opacity-50"
          />
          {exchanges.length > 0 && (
            <button
              type="button"
              onClick={reset}
              className="hidden font-mono text-[10px] uppercase tracking-wide text-white/50 hover:text-white/80 sm:block"
            >
              clear
            </button>
          )}
          <button
            type="submit"
            disabled={isBusy || !input.trim()}
            aria-label="Submit question"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-signal-cyan transition-colors hover:bg-signal-cyan/10 disabled:opacity-30"
          >
            {isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <CornerDownLeft className="h-4 w-4" />}
          </button>
        </form>
      </div>
    </motion.div>
  );
}
