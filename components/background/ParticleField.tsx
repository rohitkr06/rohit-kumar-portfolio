'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const PARTICLE_COUNT = 1400;
const FIELD_RADIUS = 9;

// Soft, circular, glowing points instead of three.js's default hard-edged
// square sprites — a custom shader gives full control over the falloff
// (radial glow via gl_PointCoord) and lets per-particle "depth" drive size,
// brightness, and parallax response, which a plain PointsMaterial can't do.
const VERTEX_SHADER = /* glsl */ `
  attribute vec3 color;
  attribute float aSize;
  attribute float aDepth;
  attribute float aSeed;

  uniform float uTime;
  uniform float uPixelRatio;
  uniform vec2 uPointer;
  uniform float uScroll;

  varying vec3 vColor;
  varying float vDepth;

  void main() {
    vColor = color;
    vDepth = aDepth;

    vec3 pos = position;

    // Gentle ambient drift — faster and wider for particles simulated
    // closer to the camera (higher aDepth), slower/tighter for far ones.
    float driftSpeed = mix(0.05, 0.2, aDepth);
    float driftAmount = mix(0.06, 0.3, aDepth);
    pos.x += sin(uTime * driftSpeed + aSeed * 6.2831) * driftAmount;
    pos.y += cos(uTime * driftSpeed * 0.85 + aSeed * 6.2831) * driftAmount;

    // Depth-based parallax: nearer particles move noticeably more in
    // response to the pointer and page scroll than farther ones, which is
    // what actually reads as "depth" rather than a single flat plane.
    pos.x += uPointer.x * mix(0.15, 1.1, aDepth);
    pos.y += uPointer.y * mix(0.1, 0.75, aDepth);
    pos.y += uScroll * mix(0.5, 2.2, aDepth);

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    // Clamp the camera distance before dividing so a particle that drifts
    // very close to (or behind) the camera can't blow up into a giant
    // blob — without this, near-zero/negative -mvPosition.z produced huge
    // or inverted point sizes.
    float camDist = max(-mvPosition.z, 4.0);
    float pointSize = aSize * uPixelRatio * mix(14.0, 34.0, aDepth) / camDist;
    gl_PointSize = min(pointSize, 22.0);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const FRAGMENT_SHADER = /* glsl */ `
  precision mediump float;

  uniform float uOpacity;

  varying vec3 vColor;
  varying float vDepth;

  void main() {
    vec2 uv = gl_PointCoord - vec2(0.5);
    float dist = length(uv);
    if (dist > 0.5) discard;

    float core = smoothstep(0.5, 0.0, dist);
    float glow = smoothstep(0.5, 0.2, dist);
    float alpha = core * 0.4 + glow * 0.3;
    float depthFade = mix(0.25, 1.0, vDepth); // farther particles noticeably dimmer

    gl_FragColor = vec4(vColor, alpha * uOpacity * depthFade);
  }
`;

/** Generates a deterministic pseudo-random particle field so SSR/CSR output stays in sync. */
function useParticleGeometry() {
  return useMemo(() => {
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const colors = new Float32Array(PARTICLE_COUNT * 3);
    const sizes = new Float32Array(PARTICLE_COUNT);
    const depths = new Float32Array(PARTICLE_COUNT);
    const seeds = new Float32Array(PARTICLE_COUNT);

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

      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta) * 0.6;
      const z = r * Math.cos(phi);

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      const t = rand();
      const color = t < 0.55 ? cyan : t < 0.85 ? violet : magenta;
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;

      // "Depth" (0 = far, 1 = near) is derived from how close the particle
      // sits to the camera-facing plane. Bigger/brighter/faster-drifting
      // near particles vs. smaller/dimmer/slower far ones is what sells
      // the illusion of real depth instead of a flat sprite plane.
      depths[i] = 1 - Math.min(Math.abs(z) / FIELD_RADIUS, 1);
      sizes[i] = rand() * 1.4 + 0.6;
      seeds[i] = rand();
    }

    return { positions, colors, sizes, depths, seeds };
  }, []);
}

export function ParticleField({ reducedMotion }: { reducedMotion: boolean }) {
  const { positions, colors, sizes, depths, seeds } = useParticleGeometry();
  const groupRef = useRef<THREE.Group>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const pointer = useThree((s) => s.pointer);

  const smoothPointer = useRef({ x: 0, y: 0 });
  const rawScroll = useRef(0);
  const smoothScroll = useRef(0);

  useEffect(() => {
    function onScroll() {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      rawScroll.current = max > 0 ? window.scrollY / max : 0;
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uPixelRatio: { value: typeof window !== 'undefined' ? Math.min(window.devicePixelRatio, 1.5) : 1 },
      uPointer: { value: new THREE.Vector2(0, 0) },
      uScroll: { value: 0 },
      uOpacity: { value: 0.55 },
    }),
    [],
  );

  useFrame((_, delta) => {
    const material = materialRef.current;
    if (!material) return;

    material.uniforms.uTime.value += delta;
    if (reducedMotion) return;

    const ease = Math.min(delta * 2, 1);
    smoothPointer.current.x += (pointer.x - smoothPointer.current.x) * ease;
    smoothPointer.current.y += (pointer.y - smoothPointer.current.y) * ease;
    smoothScroll.current += (rawScroll.current - smoothScroll.current) * ease;

    material.uniforms.uPointer.value.set(smoothPointer.current.x, smoothPointer.current.y);
    material.uniforms.uScroll.value = smoothScroll.current;

    const group = groupRef.current;
    if (group) {
      group.rotation.y += delta * 0.015;
      group.rotation.x = -smoothPointer.current.y * 0.1;
      group.rotation.z = smoothPointer.current.x * 0.035;
    }
  });

  return (
    <group ref={groupRef}>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[colors, 3]} />
          <bufferAttribute attach="attributes-aSize" args={[sizes, 1]} />
          <bufferAttribute attach="attributes-aDepth" args={[depths, 1]} />
          <bufferAttribute attach="attributes-aSeed" args={[seeds, 1]} />
        </bufferGeometry>
        <shaderMaterial
          ref={materialRef}
          vertexShader={VERTEX_SHADER}
          fragmentShader={FRAGMENT_SHADER}
          uniforms={uniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}
