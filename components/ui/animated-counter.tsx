'use client';

import { useEffect, useRef, useState } from 'react';
import { useInView } from 'framer-motion';
import { useReducedMotion } from '@/lib/use-reduced-motion';

function easeOutExpo(t: number) {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

export function AnimatedCounter({
  value,
  prefix = '',
  suffix = '',
  duration = 1600,
  decimals,
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  decimals?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const reducedMotion = useReducedMotion();
  const [display, setDisplay] = useState(0);
  const places = decimals ?? (Number.isInteger(value) ? 0 : 1);

  useEffect(() => {
    if (!inView) return;
    if (reducedMotion) {
      setDisplay(value);
      return;
    }
    let raf: number;
    const start = performance.now();
    const tick = (now: number) => {
      // Clamp to [0, 1], not just capped at 1: the timestamp a browser
      // hands a requestAnimationFrame callback can occasionally predate
      // the performance.now() captured just above (seen in practice right
      // after a big synchronous layout, e.g. a scroll jump), which without
      // a lower bound sends t negative and easeOutExpo wildly negative —
      // the counter would flash something like "-578" before correcting.
      const t = Math.max(0, Math.min((now - start) / duration, 1));
      setDisplay(value * easeOutExpo(t));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value, duration, reducedMotion]);

  return (
    <span ref={ref} className="tabular-nums">
      {prefix}
      {display.toLocaleString('en-US', { minimumFractionDigits: places, maximumFractionDigits: places })}
      {suffix}
    </span>
  );
}
