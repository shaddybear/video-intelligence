'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Vertex Shader for the Accretion Disk
const diskVertexShader = `
varying vec2 vUv;
varying vec3 vPos;
void main() {
  vUv = uv;
  vPos = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

// Fragment Shader for the Accretion Disk
const diskFragmentShader = `
varying vec2 vUv;
varying vec3 vPos;
uniform float uTime;
uniform vec3 uColorInner;
uniform vec3 uColorOuter;

// Simplex noise function (simplified)
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }
float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy) );
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289(i);
  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 ));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m*m ;
  m = m*m ;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

void main() {
  float r = length(vPos.xy);
  float angle = atan(vPos.y, vPos.x);
  
  // Swirling effect
  float noiseVal = snoise(vec2(r * 3.0 - uTime * 0.5, angle * 2.0 + uTime * 0.2));
  
  // Gradient from inner to outer
  float mixFactor = smoothstep(2.5, 6.0, r);
  vec3 color = mix(uColorInner, uColorOuter, mixFactor);
  
  // Add noise detail
  color += noiseVal * 0.2;
  
  // Soft edges
  float alpha = smoothstep(2.0, 2.5, r) * (1.0 - smoothstep(5.0, 6.0, r));
  
  // Glow intensity
  float intensity = 1.5 + noiseVal * 0.5;
  
  gl_FragColor = vec4(color * intensity, alpha * 0.8);
}
`;

function BlackHole() {
    const diskRef = useRef<THREE.Mesh>(null);
    const uniforms = useMemo(
        () => ({
            uTime: { value: 0 },
            uColorInner: { value: new THREE.Color('#ffaa00') }, // Gold/Orange
            uColorOuter: { value: new THREE.Color('#8b5cf6') }, // Purple
        }),
        []
    );

    useFrame((state) => {
        if (diskRef.current) {
            (diskRef.current.material as THREE.ShaderMaterial).uniforms.uTime.value = state.clock.elapsedTime;
            diskRef.current.rotation.z = state.clock.elapsedTime * 0.1;
        }
    });

    return (
        <group rotation={[Math.PI / 3, 0, 0]}>
            {/* Event Horizon (The Black Hole itself) */}
            <mesh>
                <sphereGeometry args={[2, 64, 64]} />
                <meshBasicMaterial color="#000000" />
            </mesh>

            {/* Accretion Disk */}
            <mesh ref={diskRef}>
                <ringGeometry args={[2.5, 6, 128]} />
                <shaderMaterial
                    vertexShader={diskVertexShader}
                    fragmentShader={diskFragmentShader}
                    uniforms={uniforms}
                    transparent
                    side={THREE.DoubleSide}
                    blending={THREE.AdditiveBlending}
                    depthWrite={false}
                />
            </mesh>
        </group>
    );
}

function StarField() {
    const points = useRef<THREE.Points>(null);

    const [positions, sizes] = useMemo(() => {
        const count = 2000;
        const positions = new Float32Array(count * 3);
        const sizes = new Float32Array(count);

        for (let i = 0; i < count; i++) {
            const r = 10 + Math.random() * 40;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);

            positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
            positions[i * 3 + 2] = r * Math.cos(phi);

            sizes[i] = Math.random() * 2;
        }

        return [positions, sizes];
    }, []);

    useFrame((state) => {
        if (!points.current) return;
        points.current.rotation.y = state.clock.elapsedTime * 0.02;
    });

    return (
        <points ref={points}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    args={[positions, 3]}
                />
                <bufferAttribute
                    attach="attributes-size"
                    args={[sizes, 1]}
                />
            </bufferGeometry>
            <pointsMaterial
                size={0.1}
                color="#ffffff"
                transparent
                opacity={0.8}
                sizeAttenuation
            />
        </points>
    );
}

export default function Background3D() {
    return (
        <div className="fixed inset-0 -z-10 bg-black">
            <Canvas
                camera={{ position: [0, 0, 18], fov: 45 }}
                gl={{
                    antialias: true,
                    alpha: true,
                    powerPreference: 'high-performance',
                }}
            >
                <color attach="background" args={['#000000']} />

                <BlackHole />
                <StarField />

                {/* Ambient glow */}
                <ambientLight intensity={0.2} />
            </Canvas>

            {/* Vignette and color grading overlays */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/40 pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_#000000_100%)] opacity-60 pointer-events-none" />
        </div>
    );
}
