import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import DashboardContent from '@/components/dashboard/DashboardContent';

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient();
  
  const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

  if (authError || !authUser) {
    redirect('/login');
  }

  // Get user profile
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('sleeper_username, last_sync_at')
    .eq('id', authUser.id)
    .single();

  if (!user?.sleeper_username) {
    redirect('/setup');
  }

  // Get user's leagues
  // First, get all league members for this user
  const { data: members, error: membersError } = await supabase
    .from('league_members')
    .select('league_id')
    .eq('sleeper_username', user.sleeper_username);

  if (membersError) {
    console.error('Error fetching league members:', membersError);
  }

  const leagueIds = members?.map(m => m.league_id) || [];

  // Then get the leagues
  const { data: leagues, error: leaguesError } = leagueIds.length > 0
    ? await supabase
        .from('leagues')
        .select('*')
        .in('id', leagueIds)
        .order('season', { ascending: false })
    : { data: null, error: null };

  if (leaguesError) {
    console.error('Error fetching leagues:', leaguesError);
  }

  // Debug logging
  console.log('Dashboard Debug:', {
    sleeperUsername: user.sleeper_username,
    membersCount: members?.length || 0,
    leagueIdsCount: leagueIds.length,
    leaguesCount: leagues?.length || 0,
    membersError: membersError?.message,
    leaguesError: leaguesError?.message,
  });

  return (
    <div className="min-h-screen p-8 bg-[#0f172a]">
      {/* STYLING: Follow design-agent.cursorrule for all visual styling */}
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Header - centered title per design system */}
        <div className="text-center space-y-4 mb-12">
          <h1 className="font-heading font-bold text-primary">
            Fantasy Football Dashboard
          </h1>
          <p className="text-secondary text-lg">
            Welcome back, {user.sleeper_username}
          </p>
        </div>

        {/* Client component wrapper handles all dynamic imports */}
        <DashboardContent leagues={leagues} />
      </div>
    </div>
  );
}
