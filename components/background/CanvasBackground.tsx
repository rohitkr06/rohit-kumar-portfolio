'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useReducedMotion } from '@/lib/use-reduced-motion';

// Loaded lazily, client-only, with no SSR and no eager preload — three.js
// and @react-three/fiber only get fetched once this actually mounts, so
// they never inflate the initial page bundle. See Scene3D.tsx.
const Scene3D = dynamic(() => import('./Scene3D').then((m) => m.Scene3D), { ssr: false });

/**
 * Fixed, full-viewport background that sits behind all page content: a
 * static CSS aurora/grain layer everywhere, plus a lightweight WebGL
 * particle field layered on top — unless the visitor has
 * `prefers-reduced-motion` set, in which case the WebGL layer is skipped
 * entirely rather than just paused.
 */
export function CanvasBackground() {
  const reducedMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <div aria-hidden className="fixed inset-0 -z-10 bg-void">
      <div className="absolute inset-0 bg-aurora" />
      <div className="absolute inset-0 bg-grain mix-blend-overlay opacity-30" />
      {mounted && !reducedMotion && <Scene3D />}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-void" />
    </div>
  );
}
