import { useState, useEffect } from 'react';

interface SyncStatus {
  canSync: boolean;
  hoursRemaining: number;
  lastSyncAt: string | null;
  loading: boolean;
  error: string | null;
}

export function useSyncStatus(): SyncStatus {
  const [status, setStatus] = useState<SyncStatus>({
    canSync: true,
    hoursRemaining: 0,
    lastSyncAt: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch('/api/sync');
        
        if (response.ok) {
          const data = await response.json();
          setStatus({
            canSync: data.canSync,
            hoursRemaining: data.hoursRemaining,
            lastSyncAt: data.lastSyncAt,
            loading: false,
            error: null,
          });
        } else {
          setStatus(prev => ({
            ...prev,
            loading: false,
            error: 'Failed to fetch sync status',
          }));
        }
      } catch (error) {
        setStatus(prev => ({
          ...prev,
          loading: false,
          error: 'Network error',
        }));
      }
    };

    fetchStatus();

    // Refresh status every minute
    const interval = setInterval(fetchStatus, 60000);

    return () => clearInterval(interval);
  }, []);

  return status;
}

