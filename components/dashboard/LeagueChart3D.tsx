'use client';

import { Bar3DData } from '@/types/charts';
import ChartContainer3D from '@/components/charts/ChartContainer3D';
import Bar3DChart from '@/components/charts/Bar3DChart';

interface LeagueChart3DProps {
  leagues: Array<{
    id: string;
    season: string;
    total_rosters: number;
  }>;
}

export default function LeagueChart3D({ leagues }: LeagueChart3DProps) {
  // Early return if no leagues (handled by parent, but defensive check)
  if (!leagues || leagues.length === 0) {
    return null;
  }

  const chartData: Bar3DData = {
    data: leagues.slice(0, 6).map(league => ({
      label: league.season.toString(),
      value: league.total_rosters,
      metadata: league,
    })),
    title: 'Teams Per Season',
  };

  return (
    <ChartContainer3D
      title="League Overview"
      description="3D visualization of your fantasy football leagues"
    >
      <Bar3DChart data={chartData} />
    </ChartContainer3D>
  );
}

