import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const siteAccess = cookieStore.get('site_access');

  if (siteAccess?.value === 'verified') {
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

