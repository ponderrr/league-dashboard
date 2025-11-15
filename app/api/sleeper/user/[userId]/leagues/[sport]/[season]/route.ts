import { NextRequest, NextResponse } from 'next/server';
import { sleeperApi } from '@/lib/sleeper/client';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string; sport: string; season: string }> }
) {
  try {
    const { userId, sport, season } = await params;
    const leagues = await sleeperApi.getUserLeagues(
      userId,
      sport,
      season
    );
    return NextResponse.json(leagues);
  } catch (error) {
    console.error('Error fetching user leagues:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leagues' },
      { status: 500 }
    );
  }
}

