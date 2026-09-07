'use client';

import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { ParticleField } from './ParticleField';

/**
 * Isolated on purpose: this file (and everything it imports — three.js,
 * @react-three/fiber) is loaded via next/dynamic from CanvasBackground.tsx
 * with `ssr: false` and no eager preload, so the ~150-200KB (gzipped)
 * three.js dependency graph never blocks first paint or counts toward the
 * initial JS bundle for the page. It's fetched only once this component
 * actually mounts, after the rest of the page is already interactive.
 */
export function Scene3D() {
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 7], fov: 55 }}
      gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
      className="!absolute inset-0"
    >
      <Suspense fallback={null}>
        <ParticleField reducedMotion={false} />
      </Suspense>
    </Canvas>
  );
}
