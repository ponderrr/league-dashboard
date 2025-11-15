import { NextRequest, NextResponse } from 'next/server';
import { sleeperApi } from '@/lib/sleeper/client';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ leagueId: string }> }
) {
  try {
    const { leagueId } = await params;
    const league = await sleeperApi.getLeague(leagueId);
    return NextResponse.json(league);
  } catch (error) {
    console.error('Error fetching league:', error);
    return NextResponse.json(
      { error: 'Failed to fetch league' },
      { status: 500 }
    );
  }
}

