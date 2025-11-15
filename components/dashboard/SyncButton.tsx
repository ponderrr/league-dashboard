'use client';

import { useState } from 'react';
import { useSyncStatus } from '@/hooks/useSyncStatus';

interface SyncButtonProps {
  onSyncComplete?: () => void;
}

export default function SyncButton({ onSyncComplete }: SyncButtonProps) {
  const [syncing, setSyncing] = useState(false);
  const [progress, setProgress] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState(false);
  const syncStatus = useSyncStatus();

  const handleSync = async () => {
    if (!syncStatus.canSync || syncing) return;

    setSyncing(true);
    setError('');
    setSuccess(false);
    setProgress('Initializing sync...');

    try {
      // Add timeout (10 minutes for large syncs with multiple leagues)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.warn('Sync timeout reached, aborting request...');
        controller.abort();
      }, 10 * 60 * 1000); // 10 minutes

      let response: Response;
      try {
        response = await fetch('/api/sync', {
          method: 'POST',
          signal: controller.signal,
        });
      } catch (fetchError: any) {
        // Clear timeout if fetch throws (including abort)
        clearTimeout(timeoutId);
        if (fetchError.name === 'AbortError') {
          throw new Error('Sync timed out after 10 minutes. The sync may still be processing in the background. Please refresh the page in a few minutes.');
        }
        throw fetchError;
      }

      // Clear timeout on successful fetch
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        if (response.status === 429) {
          throw new Error(`Sync cooldown active. Available in ${Math.ceil(errorData.hoursRemaining)} hour${Math.ceil(errorData.hoursRemaining) !== 1 ? 's' : ''}`);
        }
        throw new Error(errorData.error || 'Sync failed');
      }

      const data = await response.json();

      setSuccess(true);
      setProgress('Sync complete!');
      
      if (onSyncComplete) {
        onSyncComplete();
      }

      // Refresh the page after 2 seconds
      setTimeout(() => {
        window.location.reload();
      }, 2000);

    } catch (error: any) {
      if (error.name === 'AbortError' || error.message?.includes('timed out')) {
        setError('Sync timed out after 10 minutes. The sync may still be processing in the background. Please refresh the page in a few minutes to see if leagues appear.');
        setProgress('Sync may still be running...');
      } else {
        setError(error.message || 'Failed to sync data');
      }
      console.error('Sync error:', error);
    } finally {
      setSyncing(false);
    }
  };

  // Format hours remaining
  const formatTimeRemaining = (hours: number): string => {
    if (hours < 1) {
      const minutes = Math.ceil(hours * 60);
      return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    }
    return `${Math.ceil(hours)} hour${Math.ceil(hours) !== 1 ? 's' : ''}`;
  };

  if (syncStatus.loading) {
    return (
      <button disabled className="glass-button opacity-50 cursor-not-allowed flex items-center justify-center gap-2">
        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span>Checking sync status...</span>
      </button>
    );
  }

  return (
    <div className="space-y-3">
      {/* STYLING: Follow design-agent.cursorrule for all visual styling */}
      <button
        onClick={handleSync}
        disabled={!syncStatus.canSync || syncing}
        className="glass-button w-full disabled:opacity-50 disabled:cursor-not-allowed text-white flex items-center justify-center gap-2"
      >
        {syncing ? (
          <>
            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Syncing...
          </>
        ) : syncStatus.canSync ? (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Sync Data
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Available in {formatTimeRemaining(syncStatus.hoursRemaining)}
          </>
        )}
      </button>

      {/* Status messages - glass cards with semantic colors */}
      {syncing && progress && (
        <div className="glass-card p-4 border-accent-blue/30 bg-accent-blue/10">
          <p className="text-accent-blue-light text-sm">{progress}</p>
        </div>
      )}

      {success && (
        <div className="glass-card p-4 border-accent-green/30 bg-accent-green/10">
          <p className="text-accent-green text-sm">✓ Data synced successfully! Refreshing...</p>
        </div>
      )}

      {error && (
        <div className="glass-card p-4 border-accent-red/30 bg-accent-red/10">
          <p className="text-accent-red text-sm">{error}</p>
        </div>
      )}

      {/* Last sync info */}
      {syncStatus.lastSyncAt && (
        <p className="text-xs text-muted text-center mt-2">
          Last synced: {new Date(syncStatus.lastSyncAt).toLocaleString()}
        </p>
      )}
    </div>
  );
}

