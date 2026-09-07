'use client';

import { useEffect, useState } from 'react';
import { useReducedMotion } from '@/lib/use-reduced-motion';

const SCRAMBLE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ01</>{}[]#$%*';

/** A terminal-style "decoding" text effect: characters scramble briefly before locking in, left to right. */
export function TypingText({ text, className, startDelay = 300 }: { text: string; className?: string; startDelay?: number }) {
  const reducedMotion = useReducedMotion();
  const [display, setDisplay] = useState(reducedMotion ? text : '');
  const [done, setDone] = useState(reducedMotion);

  useEffect(() => {
    if (reducedMotion) {
      setDisplay(text);
      setDone(true);
      return;
    }

    let frame = 0;
    let raf: ReturnType<typeof setTimeout>;
    const revealSpeed = 2; // frames per character lock-in
    let cancelled = false;

    const start = setTimeout(() => {
      const tick = () => {
        if (cancelled) return;
        const revealCount = Math.floor(frame / revealSpeed);
        if (revealCount >= text.length) {
          setDisplay(text);
          setDone(true);
          return;
        }
        const next = text
          .split('')
          .map((char, i) => {
            if (char === ' ') return ' ';
            if (i < revealCount) return char;
            return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
          })
          .join('');
        setDisplay(next);
        frame++;
        raf = setTimeout(tick, 28);
      };
      tick();
    }, startDelay);

    return () => {
      cancelled = true;
      clearTimeout(start);
      clearTimeout(raf);
    };
  }, [text, reducedMotion, startDelay]);

  return (
    <span className={className}>
      {display}
      {!done && <span className="animate-caret-blink text-signal-cyan">▍</span>}
    </span>
  );
}
