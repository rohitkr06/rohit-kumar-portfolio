'use client';

import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { useReducedMotion } from '@/lib/use-reduced-motion';

const INTERACTIVE_SELECTOR = 'a, button, input, textarea, [role="button"], [data-cursor-hover]';

export function CustomCursor() {
  const reducedMotion = useReducedMotion();
  const [enabled, setEnabled] = useState(false);
  const [hovering, setHovering] = useState(false);
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const springX = useSpring(x, { damping: 28, stiffness: 320, mass: 0.4 });
  const springY = useSpring(y, { damping: 28, stiffness: 320, mass: 0.4 });

  useEffect(() => {
    // Only enable on devices with a real pointer (skip touch), and never
    // fight prefers-reduced-motion.
    const hasFinePointer = window.matchMedia('(pointer: fine)').matches;
    if (!hasFinePointer || reducedMotion) return;
    setEnabled(true);

    const move = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      const target = e.target as HTMLElement;
      setHovering(Boolean(target?.closest?.(INTERACTIVE_SELECTOR)));
    };
    window.addEventListener('mousemove', move);
    return () => window.removeEventListener('mousemove', move);
  }, [reducedMotion, x, y]);

  if (!enabled) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[200] hidden md:block" aria-hidden>
      <motion.div
        className="fixed left-0 top-0 h-2 w-2 rounded-full bg-signal-cyan"
        style={{ x: springX, y: springY, translateX: '-50%', translateY: '-50%' }}
      />
      <motion.div
        className="fixed left-0 top-0 rounded-full border border-signal-cyan/50"
        animate={{ width: hovering ? 44 : 28, height: hovering ? 44 : 28, opacity: hovering ? 0.8 : 0.4 }}
        transition={{ duration: 0.2 }}
        style={{ x: springX, y: springY, translateX: '-50%', translateY: '-50%' }}
      />
    </div>
  );
}
