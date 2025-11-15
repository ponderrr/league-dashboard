'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/stores/authStore';

export default function SetupPage() {
  const [sleeperUsername, setSleeperUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  const { user, setUser, setSleeperUsername: setStoreUsername } = useAuthStore();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/login');
        return;
      }

      setUser(session.user);

      // Check if user already has Sleeper username
      const { data: profile } = await supabase
        .from('users')
        .select('sleeper_username')
        .eq('id', session.user.id)
        .single();

      if (profile?.sleeper_username) {
        router.push('/dashboard');
      }
    };

    checkAuth();
  }, [supabase, router, setUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Verify Sleeper username exists
      const response = await fetch(`https://api.sleeper.app/v1/user/${sleeperUsername}`);
      
      if (!response.ok) {
        throw new Error('Sleeper username not found');
      }

      const sleeperUser = await response.json();

      if (!user) {
        throw new Error('User not authenticated');
      }

      // Update user profile
      const { error: updateError } = await supabase
        .from('users')
        .upsert({
          id: user.id,
          email: user.email!,
          sleeper_username: sleeperUsername,
        });

      if (updateError) throw updateError;

      setStoreUsername(sleeperUsername);
      router.push('/dashboard');
    } catch (error: any) {
      setError(error.message || 'Invalid Sleeper username');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass-card max-w-md w-full p-8 space-y-6">
        {/* STYLING: Follow design-agent.cursorrule for all visual styling */}
        <div className="text-center space-y-2">
          <h1 className="font-heading text-3xl font-bold text-white">
            Connect Your Sleeper Account
          </h1>
          <p className="text-white/60 text-sm">
            Enter your Sleeper username to load your leagues
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Sleeper Username
            </label>
            <input
              type="text"
              value={sleeperUsername}
              onChange={(e) => setSleeperUsername(e.target.value)}
              placeholder="your_sleeper_username"
              className="glass-input w-full text-white placeholder:text-white/40"
              disabled={loading}
              required
              autoFocus
            />
            <p className="mt-2 text-xs text-white/50">
              Find your username in the Sleeper app under your profile
            </p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-200 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !sleeperUsername}
            className="glass-button w-full disabled:opacity-50 disabled:cursor-not-allowed text-white"
          >
            {loading ? 'Verifying...' : 'Continue to Dashboard'}
          </button>
        </form>
      </div>
    </div>
  );
}

