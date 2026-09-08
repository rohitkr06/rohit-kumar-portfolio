'use client';

import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { ParticleField } from './ParticleField';

/**
 * Isolated on purpose: this file (and everything it imports — three.js,
 * @react-three/fiber, @react-three/postprocessing) is loaded via
 * next/dynamic from CanvasBackground.tsx with `ssr: false` and no eager
 * preload, so this dependency graph never blocks first paint or counts
 * toward the initial JS bundle for the page. It's fetched only once this
 * component actually mounts, after the rest of the page is already
 * interactive.
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
        {/* Very subtle bloom on the particles only — a soft glow around the
            brightest points, not a full screen wash. Kept deliberately
            restrained (low intensity, high luminance threshold) so it reads
            as "premium starfield" rather than a hazy overlay. */}
        <EffectComposer multisampling={0}>
          <Bloom
            intensity={0.12}
            luminanceThreshold={0.45}
            luminanceSmoothing={0.85}
            mipmapBlur
            radius={0.35}
          />
        </EffectComposer>
      </Suspense>
    </Canvas>
  );
}
