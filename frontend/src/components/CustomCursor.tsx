'use client';

import { useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function CustomCursor() {
    return (
        <>
            {/* Hide default cursor */}
            <style jsx global>{`
        * {
          cursor: none !important;
        }
      `}</style>

            {/* Custom cursor dot */}
            <div className="fixed pointer-events-none z-[9999]" id="cursor-dot">
                <div className="w-3 h-3 bg-blue-500 rounded-full mix-blend-difference" />
            </div>

            {/* Three.js particle trail */}
            <div className="fixed inset-0 pointer-events-none z-[9998]">
                <Canvas camera={{ position: [0, 0, 5] }}>
                    <CursorTrail />
                </Canvas>
            </div>
        </>
    );
}

function CursorTrail() {
    const particlesRef = useRef<THREE.Points>(null);
    const mousePos = useRef({ x: 0, y: 0 });
    const particles = useRef<Array<{
        position: THREE.Vector3;
        velocity: THREE.Vector3;
        life: number;
        maxLife: number;
    }>>([]);
    const maxParticles = 50;

    useEffect(() => {
        // Update cursor dot position
        const handleMouseMove = (e: MouseEvent) => {
            const dot = document.getElementById('cursor-dot');
            if (dot) {
                dot.style.left = `${e.clientX - 6}px`;
                dot.style.top = `${e.clientY - 6}px`;
            }

            // Convert to normalized device coordinates
            mousePos.current = {
                x: (e.clientX / window.innerWidth) * 2 - 1,
                y: -(e.clientY / window.innerHeight) * 2 + 1,
            };

            // Spawn new particle
            if (particles.current.length < maxParticles) {
                particles.current.push({
                    position: new THREE.Vector3(
                        mousePos.current.x * 5,
                        mousePos.current.y * 5,
                        0
                    ),
                    velocity: new THREE.Vector3(
                        (Math.random() - 0.5) * 0.02,
                        (Math.random() - 0.5) * 0.02,
                        0
                    ),
                    life: 1.0,
                    maxLife: 1.0,
                });
            }
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    useFrame(() => {
        if (!particlesRef.current) return;

        // Update particles
        particles.current = particles.current.filter(particle => {
            particle.life -= 0.02;
            particle.position.add(particle.velocity);
            return particle.life > 0;
        });

        // Update geometry
        const positions = new Float32Array(particles.current.length * 3);
        const sizes = new Float32Array(particles.current.length);
        const colors = new Float32Array(particles.current.length * 3);

        particles.current.forEach((particle, i) => {
            positions[i * 3] = particle.position.x;
            positions[i * 3 + 1] = particle.position.y;
            positions[i * 3 + 2] = particle.position.z;

            sizes[i] = particle.life * 0.1;

            // Color gradient from blue to purple
            const lifePct = particle.life / particle.maxLife;
            colors[i * 3] = 0.3 + lifePct * 0.5; // R
            colors[i * 3 + 1] = 0.4 + lifePct * 0.3; // G
            colors[i * 3 + 2] = 1.0; // B
        });

        const geometry = particlesRef.current.geometry;
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.attributes.position.needsUpdate = true;
        geometry.attributes.size.needsUpdate = true;
        geometry.attributes.color.needsUpdate = true;
    });

    return (
        <points ref={particlesRef}>
            <bufferGeometry />
            <pointsMaterial
                size={0.1}
                vertexColors
                transparent
                opacity={0.8}
                sizeAttenuation
                blending={THREE.AdditiveBlending}
            />
        </points>
    );
}
