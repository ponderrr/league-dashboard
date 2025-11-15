import { NextRequest, NextResponse } from 'next/server';
import { sleeperApi } from '@/lib/sleeper/client';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;
    const user = await sleeperApi.getUser(username);
    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching Sleeper user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

