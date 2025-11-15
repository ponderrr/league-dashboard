'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';

export default function HomePage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { isPasswordVerified, setPasswordVerified } = useAuthStore();

  // Check if password is already verified
  useEffect(() => {
    const checkAccess = async () => {
      try {
        const response = await fetch('/api/check-access');
        if (response.ok) {
          setPasswordVerified(true);
          router.push('/login');
        }
      } catch (error) {
        // No access, stay on password gate
      }
    };

    if (!isPasswordVerified) {
      checkAccess();
    }
  }, [isPasswordVerified, setPasswordVerified, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/verify-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (response.ok) {
        setPasswordVerified(true);
        router.push('/login');
      } else {
        setError(data.error || 'Invalid password');
        setPassword('');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass-card max-w-md w-full p-8 space-y-6">
        {/* STYLING: Follow design-agent.cursorrule for all visual styling */}
        <div className="text-center space-y-2">
          <h1 className="font-heading text-4xl font-bold text-white">
            🏈 Fantasy Football Dashboard
          </h1>
          <p className="text-white/60 text-sm">
            Enter the site password to continue
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="glass-input w-full text-white placeholder:text-white/40"
              disabled={loading}
              autoFocus
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-200 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            className="glass-button w-full disabled:opacity-50 disabled:cursor-not-allowed text-white"
          >
            {loading ? 'Verifying...' : 'Continue'}
          </button>
        </form>
      </div>
    </div>
  );
}

