'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('3D Scene Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="w-full h-full min-h-[600px] rounded-2xl overflow-hidden flex items-center justify-center bg-[#0f172a] border border-accent-red/30">
          <div className="text-center space-y-4 p-8">
            <div className="text-accent-red text-4xl">⚠️</div>
            <h3 className="font-heading text-xl font-semibold text-primary">
              3D Scene Error
            </h3>
            <p className="text-secondary text-sm max-w-md">
              {this.state.error?.message || 'An error occurred while rendering the 3D scene.'}
            </p>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="glass-button mt-4"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

