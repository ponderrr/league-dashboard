'use client';

import { shaderMaterial } from '@react-three/drei';
import { extend } from '@react-three/fiber';
import * as THREE from 'three';

const GlassMaterialShader = shaderMaterial(
  {
    color: new THREE.Color(0.5, 0.5, 1.0),
    opacity: 0.6,
    time: 0,
  },
  // Vertex shader
  `
    varying vec3 vNormal;
    varying vec3 vPosition;
    
    void main() {
      vNormal = normalize(normalMatrix * normal);
      vPosition = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  // Fragment shader
  `
    uniform vec3 color;
    uniform float opacity;
    uniform float time;
    
    varying vec3 vNormal;
    varying vec3 vPosition;
    
    void main() {
      // Fresnel effect for glass edges
      vec3 viewDirection = normalize(cameraPosition - vPosition);
      float fresnel = pow(1.0 - abs(dot(viewDirection, vNormal)), 2.0);
      
      // Add subtle shimmer
      float shimmer = sin(vPosition.y * 3.0 + time) * 0.1 + 0.9;
      
      // Combine effects
      vec3 finalColor = color + fresnel * 0.3;
      float finalOpacity = opacity * shimmer;
      
      gl_FragColor = vec4(finalColor, finalOpacity);
    }
  `
);

extend({ GlassMaterialShader });

declare module '@react-three/fiber' {
  interface ThreeElements {
    glassMaterialShader: any;
  }
}

interface GlassMaterialProps {
  color?: THREE.ColorRepresentation;
  opacity?: number;
}

export function GlassMaterial({ color = '#2563eb', opacity = 0.6 }: GlassMaterialProps) {
  return (
    <glassMaterialShader
      color={color}
      opacity={opacity}
      transparent
      side={THREE.DoubleSide}
    />
  );
}

