'use client';

import dynamic from 'next/dynamic';
import SyncButton from '@/components/dashboard/SyncButton';
import LeagueChart3D from '@/components/dashboard/LeagueChart3D';

interface DashboardContentProps {
  leagues: Array<{
    id: string;
    name: string;
    season: string;
    total_rosters: number;
    status: string;
  }> | null;
}

// Dynamically import 3D chart with SSR disabled to prevent hydration issues
const DynamicLeagueChart3D = dynamic(
  () => import('@/components/dashboard/LeagueChart3D'),
  { 
    ssr: false,
    loading: () => (
      <div className="glass-card p-6 space-y-4">
        <div className="w-full aspect-video flex items-center justify-center bg-[#0f172a] rounded-2xl">
          <div className="text-secondary">Loading 3D visualization...</div>
        </div>
      </div>
    ),
  }
);

export default function DashboardContent({ leagues }: DashboardContentProps) {
  return (
    <>
      {/* Sync button section */}
      <div className="flex justify-center mb-8">
        <div className="w-full max-w-md">
          <SyncButton />
        </div>
      </div>

      {/* Sample 3D Visualization */}
      {leagues && leagues.length > 0 && (
         <DynamicLeagueChart3D leagues={leagues} />
      )}

      {/* Leagues Display - max 3 columns per design system */}
      {leagues && leagues.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
          {leagues.map((league) => (
            <div key={league.id} className="glass-card glass-card-hover p-6 space-y-5">
              <div>
                <h3 className="font-heading text-xl font-semibold text-primary mb-2">
                  {league.name}
                </h3>
                <p className="text-muted text-sm">
                  Season {league.season}
                </p>
              </div>

              <div className="flex items-center gap-4 text-sm text-secondary">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-accent-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  {league.total_rosters} teams
                </div>

                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full animate-pulse ${
                    league.status === 'complete' ? 'bg-accent-blue' :
                    league.status === 'in_season' ? 'bg-accent-green' :
                    league.status === 'drafting' ? 'bg-accent-yellow' :
                    'bg-accent-purple'
                  }`} />
                  <span className="capitalize">{league.status.replace('_', ' ')}</span>
                </div>
              </div>

              <button 
                className="glass-button w-full"
                disabled
                title="League details page coming soon"
              >
                View Details
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-card p-16 text-center space-y-6">
          <div className="text-muted text-6xl">🏈</div>
          <h3 className="font-heading text-2xl font-semibold text-primary">
            No Leagues Found
          </h3>
          <p className="text-secondary">
            Click the &quot;Sync Data&quot; button above to load your leagues from Sleeper
          </p>
        </div>
      )}
    </>
  );
}

