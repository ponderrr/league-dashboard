'use client';

import { ReactNode } from 'react';
import Scene3D from '@/components/three/Scene3D';

interface ChartContainer3DProps {
  children: ReactNode;
  title?: string;
  description?: string;
  cameraPosition?: [number, number, number];
  showGrid?: boolean;
}

export default function ChartContainer3D({
  children,
  title,
  description,
  cameraPosition,
  showGrid = true,
}: ChartContainer3DProps) {
  return (
    <div className="glass-card p-6 space-y-4">
      {/* STYLING: Follow design-agent.cursorrule for all visual styling */}
      
      {/* Chart header */}
      {(title || description) && (
        <div className="space-y-2">
          {title && (
            <h3 className="font-heading text-2xl font-bold text-primary">
              {title}
            </h3>
          )}
          {description && (
            <p className="text-secondary text-sm">
              {description}
            </p>
          )}
        </div>
      )}

      {/* 3D Chart */}
      <div className="w-full aspect-video">
        <Scene3D
          cameraPosition={cameraPosition}
          enableControls={true}
          enableEffects={true}
          showGrid={showGrid}
        >
          {children}
        </Scene3D>
      </div>

      {/* Controls hint */}
      <div className="flex items-center gap-4 text-xs text-muted">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
          </svg>
          <span>Click and drag to rotate</span>
        </div>
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
          </svg>
          <span>Scroll to zoom</span>
        </div>
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
          </svg>
          <span>Hover for details</span>
        </div>
      </div>
    </div>
  );
}

