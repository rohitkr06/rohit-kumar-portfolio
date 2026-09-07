'use client';

import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const PARTICLE_COUNT = 1400;
const FIELD_RADIUS = 9;

/** Generates a deterministic pseudo-random particle field so SSR/CSR output stays in sync. */
function useParticleGeometry() {
  return useMemo(() => {
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const colors = new Float32Array(PARTICLE_COUNT * 3);
    const sizes = new Float32Array(PARTICLE_COUNT);

    const cyan = new THREE.Color('#33e1e6');
    const violet = new THREE.Color('#8b5cf6');
    const magenta = new THREE.Color('#f472b6');

    let seed = 42;
    const rand = () => {
      // simple deterministic PRNG (mulberry32) — avoids hydration mismatches from Math.random()
      seed |= 0;
      seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const r = FIELD_RADIUS * Math.cbrt(rand());
      const theta = rand() * Math.PI * 2;
      const phi = Math.acos(2 * rand() - 1);

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.6;
      positions[i * 3 + 2] = r * Math.cos(phi);

      const t = rand();
      const color = t < 0.55 ? cyan : t < 0.85 ? violet : magenta;
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;

      sizes[i] = rand() * 1.6 + 0.4;
    }

    return { positions, colors, sizes };
  }, []);
}

export function ParticleField({ reducedMotion }: { reducedMotion: boolean }) {
  const { positions, colors, sizes } = useParticleGeometry();
  const pointsRef = useRef<THREE.Points>(null);
  const groupRef = useRef<THREE.Group>(null);
  const pointer = useThree((s) => s.pointer);
  const target = useRef({ x: 0, y: 0 });

  useFrame((_, delta) => {
    if (reducedMotion) return;
    const group = groupRef.current;
    if (!group) return;

    // Gentle constant drift
    group.rotation.y += delta * 0.02;

    // Cursor-reactive parallax: ease toward pointer position
    target.current.x += (pointer.x * 0.35 - target.current.x) * Math.min(delta * 2, 1);
    target.current.y += (pointer.y * 0.25 - target.current.y) * Math.min(delta * 2, 1);
    group.rotation.x = -target.current.y * 0.3;
    group.rotation.z = target.current.x * 0.08;
  });

  return (
    <group ref={groupRef}>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[colors, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.045}
          vertexColors
          transparent
          opacity={0.85}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}
