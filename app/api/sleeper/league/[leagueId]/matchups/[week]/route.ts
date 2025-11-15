import { NextRequest, NextResponse } from 'next/server';
import { sleeperApi } from '@/lib/sleeper/client';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ leagueId: string; week: string }> }
) {
  try {
    const { leagueId, week } = await params;
    const matchups = await sleeperApi.getLeagueMatchups(
      leagueId,
      parseInt(week)
    );
    return NextResponse.json(matchups);
  } catch (error) {
    console.error('Error fetching matchups:', error);
    return NextResponse.json(
      { error: 'Failed to fetch matchups' },
      { status: 500 }
    );
  }
}

