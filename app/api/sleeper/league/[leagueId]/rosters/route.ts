import { NextRequest, NextResponse } from 'next/server';
import { sleeperApi } from '@/lib/sleeper/client';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ leagueId: string }> }
) {
  try {
    const { leagueId } = await params;
    const rosters = await sleeperApi.getLeagueRosters(leagueId);
    return NextResponse.json(rosters);
  } catch (error) {
    console.error('Error fetching rosters:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rosters' },
      { status: 500 }
    );
  }
}

