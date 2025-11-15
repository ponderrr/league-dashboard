import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { SyncService } from '@/lib/sync/syncService';

// Increase timeout for long-running sync operations (10 minutes)
export const maxDuration = 600;

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();

    // Check authentication
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !authUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user's Sleeper username
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('sleeper_username, last_sync_at')
      .eq('id', authUser.id)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (!user.sleeper_username) {
      return NextResponse.json(
        { error: 'Sleeper username not set' },
        { status: 400 }
      );
    }

    // Check 24-hour cooldown
    if (user.last_sync_at) {
      const lastSync = new Date(user.last_sync_at);
      const now = new Date();
      const hoursSinceLastSync = (now.getTime() - lastSync.getTime()) / (1000 * 60 * 60);

      if (hoursSinceLastSync < 24) {
        const hoursRemaining = 24 - hoursSinceLastSync;
        return NextResponse.json(
          { 
            error: 'Sync cooldown active',
            hoursRemaining: Math.ceil(hoursRemaining),
            canSyncAt: new Date(lastSync.getTime() + 24 * 60 * 60 * 1000).toISOString(),
          },
          { status: 429 }
        );
      }
    }

    // Create sync log
    const { data: syncLog, error: syncLogError } = await supabase
      .from('sync_logs')
      .insert({
        user_id: authUser.id,
        league_id: 'all',
        status: 'in_progress',
        details: { started_at: new Date().toISOString() },
      })
      .select()
      .single();

    if (syncLogError) {
      console.error('Error creating sync log:', syncLogError);
    }

    // Perform sync with timeout protection
    console.log(`[Sync API] Starting sync for user: ${user.sleeper_username}`);
    const syncStartTime = Date.now();
    
    const syncService = new SyncService(supabase);
    const result = await syncService.syncUserLeagues(user.sleeper_username);
    
    const syncDuration = ((Date.now() - syncStartTime) / 1000).toFixed(2);
    console.log(`[Sync API] Sync completed in ${syncDuration}s`);

    // Update sync log
    if (syncLog) {
      await supabase
        .from('sync_logs')
        .update({
          status: result.success ? 'success' : 'failed',
          details: {
            ...result,
            completed_at: new Date().toISOString(),
          },
        })
        .eq('id', syncLog.id);
    }

    // Update user's last_sync_at
    if (result.success) {
      const { error: updateError } = await supabase
        .from('users')
        .update({ last_sync_at: new Date().toISOString() })
        .eq('id', authUser.id);
      
      if (updateError) {
        console.error('Error updating last_sync_at:', updateError);
      }
    }

    // Log sync result for debugging
    console.log('Sync completed:', {
      success: result.success,
      leaguesProcessed: result.leaguesProcessed,
      rostersProcessed: result.rostersProcessed,
      matchupsProcessed: result.matchupsProcessed,
      errors: result.errors,
    });

    return NextResponse.json({
      success: result.success,
      message: result.success 
        ? 'Data synced successfully' 
        : 'Sync completed with errors',
      details: result,
    });

  } catch (error: any) {
    console.error('Sync error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to sync data' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();

    // Check authentication
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !authUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user's sync status
    const { data: user } = await supabase
      .from('users')
      .select('last_sync_at')
      .eq('id', authUser.id)
      .single();

    // Get latest sync logs
    const { data: logs } = await supabase
      .from('sync_logs')
      .select('*')
      .eq('user_id', authUser.id)
      .order('created_at', { ascending: false })
      .limit(10);

    // Calculate cooldown status
    let canSync = true;
    let hoursRemaining = 0;

    if (user?.last_sync_at) {
      const lastSync = new Date(user.last_sync_at);
      const now = new Date();
      const hoursSinceLastSync = (now.getTime() - lastSync.getTime()) / (1000 * 60 * 60);

      if (hoursSinceLastSync < 24) {
        canSync = false;
        hoursRemaining = 24 - hoursSinceLastSync;
      }
    }

    return NextResponse.json({
      canSync,
      hoursRemaining: Math.ceil(hoursRemaining),
      lastSyncAt: user?.last_sync_at || null,
      logs: logs || [],
    });

  } catch (error: any) {
    console.error('Error fetching sync status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sync status' },
      { status: 500 }
    );
  }
}

