'use client';

// CRITICAL: Import React FIRST to ensure it's available before R3F accesses internals
import React, { useRef, useState } from 'react';
// Ensure React is fully loaded before importing R3F
// This prevents "Cannot read properties of undefined (reading 'ReactCurrentOwner')" errors
import { useFrame } from '@react-three/fiber';
import { Text, Center } from '@react-three/drei';
import * as THREE from 'three';
import { Bar3DData, Chart3DProps } from '@/types/charts';

interface Bar3DChartProps extends Chart3DProps {
  data: Bar3DData;
}

function Bar3D({ 
  position, 
  height, 
  color, 
  label,
  index,
  onClick 
}: { 
  position: [number, number, number];
  height: number;
  color: string;
  label: string;
  index: number;
  onClick?: () => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  // Animate on hover
  useFrame((state) => {
    if (meshRef.current) {
      const targetY = hovered ? 0.2 : 0;
      meshRef.current.position.y += (targetY - meshRef.current.position.y) * 0.1;
      
      // Subtle rotation animation
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime + index) * 0.05;
    }
  });

  return (
    <group position={position}>
      {/* Bar */}
      <mesh
        ref={meshRef}
        castShadow
        receiveShadow
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={onClick}
      >
        <boxGeometry args={[0.8, height, 0.8]} />
        <meshStandardMaterial
          color={color}
          transparent
          opacity={hovered ? 1 : 0.8}
          emissive={color}
          emissiveIntensity={hovered ? 0.3 : 0.1}
          roughness={0.3}
          metalness={0.7}
        />
      </mesh>

      {/* Glow effect on hover */}
      {hovered && (
        <mesh position={[0, 0, 0]} scale={1.1}>
          <boxGeometry args={[0.9, height + 0.2, 0.9]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.2}
          />
        </mesh>
      )}

      {/* Label below bar */}
      <Center position={[0, -0.5, 0]}>
        <Text
          fontSize={0.2}
          color="rgba(249, 250, 251, 0.9)"
          anchorX="center"
          anchorY="middle"
        >
          {label}
        </Text>
      </Center>

      {/* Value label on top */}
      <Center position={[0, height + 0.3, 0]}>
        <Text
          fontSize={0.15}
          color="rgba(249, 250, 251, 0.9)"
          anchorX="center"
          anchorY="middle"
        >
          {height.toFixed(1)}
        </Text>
      </Center>
    </group>
  );
}

export default function Bar3DChart({ 
  data, 
  width = 10, 
  height = 6,
  showGrid = true,
  interactive = true 
}: Bar3DChartProps) {
  // Handle empty data
  if (!data.data || data.data.length === 0) {
    return (
      <group>
        <Center position={[0, height / 2, 0]}>
          <Text
            fontSize={0.3}
            color="rgba(249, 250, 251, 0.9)"
            anchorX="center"
            anchorY="middle"
          >
            No data available
          </Text>
        </Center>
      </group>
    );
  }

  // Calculate max value for scaling
  const maxValue = data.maxValue || Math.max(...data.data.map(d => d.value), 1);
  const barSpacing = width / (data.data.length + 1);

  // Color palette - using design system accent colors
  const colors = [
    '#2563eb', // Blue (primary)
    '#3b82f6', // Blue-light
    '#a855f7', // Purple
    '#9333ea', // Purple-dark
    '#22d3ee', // Cyan
    '#22c55e', // Green
  ];

  return (
    <group>
      {/* Bars */}
      {data.data.map((dataPoint, index) => {
        const barHeight = (dataPoint.value / maxValue) * height;
        const xPosition = (index - (data.data.length - 1) / 2) * barSpacing;
        const color = dataPoint.color || colors[index % colors.length];

        return (
          <Bar3D
            key={index}
            position={[xPosition, barHeight / 2, 0]}
            height={barHeight}
            color={color}
            label={dataPoint.label}
            index={index}
            onClick={() => {
              if (interactive) {
                console.log('Clicked:', dataPoint);
              }
            }}
          />
        );
      })}

      {/* Base platform */}
      <mesh receiveShadow position={[0, -0.1, 0]}>
        <boxGeometry args={[width, 0.1, 2]} />
        <meshStandardMaterial
          color="#1e1e2e"
          transparent
          opacity={0.8}
          roughness={0.8}
          metalness={0.2}
        />
      </mesh>

      {/* Title */}
      {data.title && (
        <Center position={[0, height + 1.5, 0]}>
          <Text
            fontSize={0.3}
            color="rgba(249, 250, 251, 0.9)"
            anchorX="center"
            anchorY="middle"
          >
            {data.title}
          </Text>
        </Center>
      )}
    </group>
  );
}

