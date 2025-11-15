'use client';

// CRITICAL: Import React FIRST to ensure it's available before R3F accesses internals
import React, { ReactNode, Suspense } from 'react';
// Ensure React is fully loaded before importing R3F
// This prevents "Cannot read properties of undefined (reading 'ReactCurrentOwner')" errors
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera } from '@react-three/drei';
import { EffectComposer, Bloom, SSAO } from '@react-three/postprocessing';
import * as THREE from 'three';
import { ErrorBoundary } from './ErrorBoundary';

interface Scene3DProps {
  children: ReactNode;
  cameraPosition?: [number, number, number];
  enableControls?: boolean;
  enableEffects?: boolean;
  backgroundColor?: string;
  showGrid?: boolean;
}

function GridHelper3D() {
  return (
    <gridHelper 
      args={[20, 20, 0x444444, 0x222222]} 
      position={[0, -0.01, 0]}
    />
  );
}

function Lighting() {
  return (
    <>
      {/* Ambient light for overall illumination */}
      <ambientLight intensity={0.4} />
      
      {/* Main directional light (sun) */}
      <directionalLight
        position={[10, 10, 5]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      
      {/* Fill light from the side */}
      <directionalLight
        position={[-5, 5, -5]}
        intensity={0.3}
      />
      
      {/* Rim light from behind */}
      <pointLight
        position={[0, 5, -10]}
        intensity={0.5}
        color="#a78bfa"
      />
    </>
  );
}

function LoadingFallback() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#6366f1" />
    </mesh>
  );
}

export default function Scene3D({
  children,
  cameraPosition = [8, 6, 8],
  enableControls = true,
  enableEffects = true,
  backgroundColor = '#0f172a',
  showGrid = true,
}: Scene3DProps) {
  return (
    <ErrorBoundary>
      <div className="w-full h-full min-h-[600px] rounded-2xl overflow-hidden">
        <Canvas
          shadows
          gl={{
            antialias: true,
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 1.2,
          }}
          style={{ background: backgroundColor }}
        >
          {/* Camera setup */}
          <PerspectiveCamera
            makeDefault
            position={cameraPosition}
            fov={50}
            near={0.1}
            far={1000}
          />

          {/* Lighting */}
          <Lighting />

          {/* Environment map for reflections */}
          <Environment preset="night" />

          {/* Grid helper */}
          {showGrid && <GridHelper3D />}

          {/* Orbit controls with limited rotation */}
          {enableControls && (
            <OrbitControls
              enablePan={false}
              enableZoom={true}
              enableRotate={true}
              minDistance={5}
              maxDistance={20}
              minPolarAngle={Math.PI / 6}
              maxPolarAngle={Math.PI / 2.5}
              minAzimuthAngle={-Math.PI / 4}
              maxAzimuthAngle={Math.PI / 4}
              dampingFactor={0.05}
              rotateSpeed={0.5}
            />
          )}

          {/* Scene content */}
          <Suspense fallback={<LoadingFallback />}>
            {children}
          </Suspense>

          {/* Post-processing effects */}
          {enableEffects && (
            <EffectComposer>
              <Bloom
                intensity={0.5}
                luminanceThreshold={0.9}
                luminanceSmoothing={0.9}
              />
              <SSAO
                intensity={20}
                radius={5}
                samples={16}
                worldDistanceThreshold={0}
                worldDistanceFalloff={0}
                worldProximityThreshold={0}
                worldProximityFalloff={0}
              />
            </EffectComposer>
          )}
        </Canvas>
      </div>
    </ErrorBoundary>
  );
}

