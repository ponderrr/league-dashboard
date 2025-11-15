import { sleeperApi } from '@/lib/sleeper/client';
import { SleeperLeague, SleeperRoster, SleeperMatchup, SleeperDraft } from '@/types/sleeper';

export interface SyncProgress {
  stage: string;
  progress: number;
  total: number;
  message: string;
}

export interface SyncResult {
  success: boolean;
  leaguesProcessed: number;
  rostersProcessed: number;
  matchupsProcessed: number;
  draftsProcessed: number;
  errors: string[];
}

export class SyncService {
  private supabase: any;
  private onProgress?: (progress: SyncProgress) => void;
  private rostersProcessed = 0;
  private matchupsProcessed = 0;
  private draftsProcessed = 0;

  constructor(supabase: any, onProgress?: (progress: SyncProgress) => void) {
    this.supabase = supabase;
    this.onProgress = onProgress;
  }

  private reportProgress(stage: string, progress: number, total: number, message: string) {
    if (this.onProgress) {
      this.onProgress({ stage, progress, total, message });
    }
  }

  /**
   * Sync all leagues for a user
   */
  async syncUserLeagues(sleeperUsername: string): Promise<SyncResult> {
    const result: SyncResult = {
      success: true,
      leaguesProcessed: 0,
      rostersProcessed: 0,
      matchupsProcessed: 0,
      draftsProcessed: 0,
      errors: [],
    };

    // Reset counters
    this.rostersProcessed = 0;
    this.matchupsProcessed = 0;
    this.draftsProcessed = 0;

    try {
      // Step 1: Get Sleeper user
      this.reportProgress('user', 0, 1, 'Fetching Sleeper user...');
      const sleeperUser = await sleeperApi.getUser(sleeperUsername);
      this.reportProgress('user', 1, 1, 'User found');

      // Step 2: Get all leagues (prioritize recent years)
      this.reportProgress('leagues', 0, 1, 'Fetching all leagues...');
      const currentYear = new Date().getFullYear();
      // Fetch last 5 years by default (faster), can expand if needed
      const startYear = Math.max(2015, currentYear - 4);
      const allLeagues = await sleeperApi.getAllUserLeagues(
        sleeperUser.user_id,
        'nfl',
        startYear,
        currentYear
      );

      console.log(`[SyncService] Found ${allLeagues.length} leagues for user ${sleeperUsername} (${sleeperUser.user_id})`);

      if (allLeagues.length === 0) {
        console.warn(`[SyncService] No leagues found for user ${sleeperUsername}`);
        throw new Error('No leagues found for this user');
      }

      this.reportProgress('leagues', allLeagues.length, allLeagues.length, 
        `Found ${allLeagues.length} leagues`);

      // Step 3: Process leagues in parallel batches (faster)
      // Process 3 leagues at a time to balance speed and rate limits
      const batchSize = 3;
      for (let i = 0; i < allLeagues.length; i += batchSize) {
        const batch = allLeagues.slice(i, i + batchSize);
        
        const batchPromises = batch.map(async (league) => {
          try {
            console.log(`[SyncService] Syncing league: ${league.name} (${league.season}) - ${league.league_id}`);
            await this.syncLeague(league);
            console.log(`[SyncService] Successfully synced league: ${league.name}`);
            return { success: true, league };
          } catch (error: any) {
            console.error(`[SyncService] Failed to sync league ${league.league_id}:`, error);
            return { success: false, league, error: error.message || 'Unknown error' };
          }
        });

        const batchResults = await Promise.all(batchPromises);
        
        batchResults.forEach(({ success, league, error }) => {
          if (success) {
            result.leaguesProcessed++;
          } else {
            result.errors.push(`Failed to sync league ${league.league_id}: ${error}`);
            result.success = false;
          }
        });

        this.reportProgress('processing', Math.min(i + batchSize, allLeagues.length), allLeagues.length, 
          `Processed ${Math.min(i + batchSize, allLeagues.length)} of ${allLeagues.length} leagues...`);
      }

      result.rostersProcessed = this.rostersProcessed;
      result.matchupsProcessed = this.matchupsProcessed;
      result.draftsProcessed = this.draftsProcessed;

      this.reportProgress('complete', 1, 1, 'Sync complete!');
      return result;

    } catch (error: any) {
      result.success = false;
      result.errors.push(error.message || 'Unknown error occurred');
      return result;
    }
  }

  /**
   * Sync a single league and all its data
   */
  private async syncLeague(league: SleeperLeague): Promise<void> {
    // 1. Upsert league
    await this.upsertLeague(league);

    // 2. Fetch and upsert league users/members
    const leagueUsers = await sleeperApi.getLeagueUsers(league.league_id);
    await this.upsertLeagueMembers(league.league_id, leagueUsers);

    // 3. Fetch and upsert rosters
    const rosters = await sleeperApi.getLeagueRosters(league.league_id);
    await this.upsertRosters(league.league_id, rosters, leagueUsers);

    // 4. Fetch and upsert matchups (all weeks)
    if (league.status === 'in_season' || league.status === 'complete') {
      const totalWeeks = (league.settings?.playoff_week_start || 18) + 3; // Regular + playoffs
      await this.syncMatchups(league.league_id, totalWeeks);
    }

    // 5. Fetch and upsert draft data
    if (league.draft_id) {
      await this.syncDraft(league.league_id, league.draft_id);
    }
  }

  /**
   * Upsert league data
   */
  private async upsertLeague(league: SleeperLeague): Promise<void> {
    const { data, error } = await this.supabase
      .from('leagues')
      .upsert({
        id: league.league_id,
        name: league.name,
        season: league.season,
        total_rosters: league.total_rosters,
        settings: league.settings,
        status: league.status,
        sport: league.sport,
      }, {
        onConflict: 'id'
      })
      .select();

    if (error) {
      console.error('[SyncService] Failed to upsert league:', {
        leagueId: league.league_id,
        leagueName: league.name,
        error: error.message,
        errorDetails: error,
      });
      throw new Error(`Failed to upsert league: ${error.message}`);
    }
    
    console.log(`[SyncService] Upserted league: ${league.name} (${league.league_id})`);
  }

  /**
   * Upsert league members
   */
  private async upsertLeagueMembers(
    leagueId: string,
    users: any[]
  ): Promise<void> {
    console.log(`[SyncService] Upserting ${users.length} league members for league ${leagueId}`);
    for (const user of users) {
      const { data, error } = await this.supabase
        .from('league_members')
        .upsert({
          league_id: leagueId,
          sleeper_user_id: user.user_id,
          sleeper_username: user.username || user.display_name,
          display_name: user.display_name,
          avatar: user.avatar,
        }, {
          onConflict: 'league_id,sleeper_user_id'
        })
        .select();

      if (error) {
        console.error('[SyncService] Failed to upsert league member:', {
          leagueId,
          userId: user.user_id,
          username: user.username || user.display_name,
          error: error.message,
          errorDetails: error,
        });
        throw new Error(`Failed to upsert league member: ${error.message}`);
      }
    }
    console.log(`[SyncService] Successfully upserted ${users.length} league members`);
  }

  /**
   * Upsert rosters
   */
  private async upsertRosters(
    leagueId: string,
    rosters: SleeperRoster[],
    users: any[]
  ): Promise<void> {
    for (const roster of rosters) {
      // Find the league member
      const { data: member } = await this.supabase
        .from('league_members')
        .select('id')
        .eq('league_id', leagueId)
        .eq('sleeper_user_id', roster.owner_id)
        .single();

      if (!member) {
        console.warn(`Member not found for roster ${roster.roster_id}`);
        continue;
      }

      const { error } = await this.supabase
        .from('rosters')
        .upsert({
          league_id: leagueId,
          roster_id: roster.roster_id,
          league_member_id: member.id,
          players: roster.players || [],
          starters: roster.starters || [],
          settings: roster.settings,
        }, {
          onConflict: 'league_id,roster_id'
        });

      if (error) {
        throw new Error(`Failed to upsert roster: ${error.message}`);
      }

      this.rostersProcessed++;
    }
  }

  /**
   * Sync all matchups for a league (optimized with parallel week fetching)
   */
  private async syncMatchups(leagueId: string, totalWeeks: number): Promise<void> {
    // Process weeks in batches of 3 to avoid rate limits
    const batchSize = 3;
    
    for (let weekStart = 1; weekStart <= totalWeeks; weekStart += batchSize) {
      const weekEnd = Math.min(weekStart + batchSize - 1, totalWeeks);
      const weekBatch = Array.from({ length: weekEnd - weekStart + 1 }, (_, i) => weekStart + i);

      const weekPromises = weekBatch.map(async (week) => {
        try {
          const matchups = await sleeperApi.getLeagueMatchups(leagueId, week);
          
          const matchupPromises = matchups.map(async (matchup) => {
            const { error } = await this.supabase
              .from('matchups')
              .upsert({
                league_id: leagueId,
                week: week,
                matchup_id: matchup.matchup_id,
                roster_id: matchup.roster_id,
                points: matchup.points,
                starters: matchup.starters || [],
                players_points: matchup.players_points || {},
              }, {
                onConflict: 'league_id,week,roster_id'
              });

            if (error) {
              console.error(`Failed to upsert matchup: ${error.message}`);
              return false;
            } else {
              this.matchupsProcessed++;
              return true;
            }
          });

          await Promise.all(matchupPromises);
        } catch (error) {
          // 404 is normal for future weeks, don't log as error
          if (error instanceof Error && !error.message.includes('404')) {
            console.error(`Failed to fetch matchups for week ${week}:`, error);
          }
        }
      });

      await Promise.all(weekPromises);
      
      // Small delay between batches
      if (weekStart + batchSize <= totalWeeks) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
  }

  /**
   * Sync draft data
   */
  private async syncDraft(leagueId: string, draftId: string): Promise<void> {
    try {
      // Get draft details
      const draft = await sleeperApi.getDraft(draftId);

      // Upsert draft
      const { error: draftError } = await this.supabase
        .from('drafts')
        .upsert({
          id: draft.draft_id,
          league_id: leagueId,
          status: draft.status,
          type: draft.type,
          settings: draft.settings,
        }, {
          onConflict: 'id'
        });

      if (draftError) {
        throw new Error(`Failed to upsert draft: ${draftError.message}`);
      }

      // Get draft picks
      const picks = await sleeperApi.getDraftPicks(draftId);

      // Upsert picks
      for (const pick of picks) {
        const { error } = await this.supabase
          .from('draft_picks')
          .upsert({
            draft_id: draftId,
            pick_no: pick.pick_no,
            round: pick.round,
            roster_id: pick.roster_id,
            player_id: pick.player_id,
            metadata: pick.metadata || {},
          }, {
            onConflict: 'draft_id,pick_no'
          });

        if (error) {
          console.error(`Failed to upsert draft pick: ${error.message}`);
        }
      }

      this.draftsProcessed++;
    } catch (error) {
      console.error(`Failed to sync draft ${draftId}:`, error);
    }
  }

  /**
   * Sync player data (should be run periodically, not per-user)
   */
  static async syncPlayers(supabase: any): Promise<void> {
    try {
      const players = await sleeperApi.getAllPlayers('nfl');
      
      const playerArray = Object.entries(players).map(([id, player]) => ({
        player_id: id,
        name: `${player.first_name} ${player.last_name}`,
        position: player.position,
        team: player.team,
        metadata: player as any,
      }));

      // Batch upsert players (in chunks to avoid timeout)
      const chunkSize = 100;
      for (let i = 0; i < playerArray.length; i += chunkSize) {
        const chunk = playerArray.slice(i, i + chunkSize);
        
        const { error } = await supabase
          .from('players')
          .upsert(chunk, {
            onConflict: 'player_id'
          });

        if (error) {
          console.error(`Failed to upsert players chunk ${i}:`, error);
        }
      }

      console.log(`Synced ${playerArray.length} players`);
    } catch (error) {
      console.error('Failed to sync players:', error);
    }
  }
}

