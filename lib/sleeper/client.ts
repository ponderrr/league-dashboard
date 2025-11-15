import {
  SleeperUser,
  SleeperLeague,
  SleeperRoster,
  SleeperMatchup,
  SleeperDraft,
  SleeperDraftPick,
  SleeperPlayer,
} from '@/types/sleeper';

const SLEEPER_BASE_URL = 'https://api.sleeper.app/v1';

// Exponential backoff for rate limiting
async function fetchWithRetry<T>(
  url: string,
  retries = 3,
  backoff = 1000
): Promise<T> {
  try {
    const response = await fetch(url);

    if (response.status === 429) {
      // Rate limited
      if (retries > 0) {
        await new Promise((resolve) => setTimeout(resolve, backoff));
        return fetchWithRetry<T>(url, retries - 1, backoff * 2);
      }
      throw new Error('Rate limit exceeded');
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    if (retries > 0) {
      await new Promise((resolve) => setTimeout(resolve, backoff));
      return fetchWithRetry<T>(url, retries - 1, backoff * 2);
    }
    throw error;
  }
}

export const sleeperApi = {
  // User endpoints
  async getUser(username: string): Promise<SleeperUser> {
    return fetchWithRetry<SleeperUser>(
      `${SLEEPER_BASE_URL}/user/${username}`
    );
  },

  async getUserById(userId: string): Promise<SleeperUser> {
    return fetchWithRetry<SleeperUser>(
      `${SLEEPER_BASE_URL}/user/${userId}`
    );
  },

  async getUserLeagues(
    userId: string,
    sport: string,
    season: string
  ): Promise<SleeperLeague[]> {
    return fetchWithRetry<SleeperLeague[]>(
      `${SLEEPER_BASE_URL}/user/${userId}/leagues/${sport}/${season}`
    );
  },

  // League endpoints
  async getLeague(leagueId: string): Promise<SleeperLeague> {
    return fetchWithRetry<SleeperLeague>(
      `${SLEEPER_BASE_URL}/league/${leagueId}`
    );
  },

  async getLeagueRosters(leagueId: string): Promise<SleeperRoster[]> {
    return fetchWithRetry<SleeperRoster[]>(
      `${SLEEPER_BASE_URL}/league/${leagueId}/rosters`
    );
  },

  async getLeagueUsers(leagueId: string): Promise<SleeperUser[]> {
    return fetchWithRetry<SleeperUser[]>(
      `${SLEEPER_BASE_URL}/league/${leagueId}/users`
    );
  },

  async getLeagueMatchups(
    leagueId: string,
    week: number
  ): Promise<SleeperMatchup[]> {
    return fetchWithRetry<SleeperMatchup[]>(
      `${SLEEPER_BASE_URL}/league/${leagueId}/matchups/${week}`
    );
  },

  async getLeagueDrafts(leagueId: string): Promise<SleeperDraft[]> {
    return fetchWithRetry<SleeperDraft[]>(
      `${SLEEPER_BASE_URL}/league/${leagueId}/drafts`
    );
  },

  // Draft endpoints
  async getDraft(draftId: string): Promise<SleeperDraft> {
    return fetchWithRetry<SleeperDraft>(
      `${SLEEPER_BASE_URL}/draft/${draftId}`
    );
  },

  async getDraftPicks(draftId: string): Promise<SleeperDraftPick[]> {
    return fetchWithRetry<SleeperDraftPick[]>(
      `${SLEEPER_BASE_URL}/draft/${draftId}/picks`
    );
  },

  // Players endpoint
  async getAllPlayers(sport: string): Promise<Record<string, SleeperPlayer>> {
    return fetchWithRetry<Record<string, SleeperPlayer>>(
      `${SLEEPER_BASE_URL}/players/${sport}`
    );
  },

  // Helper to get all matchups for a season
  async getAllMatchupsForSeason(
    leagueId: string,
    totalWeeks: number
  ): Promise<Record<number, SleeperMatchup[]>> {
    const matchupsByWeek: Record<number, SleeperMatchup[]> = {};

    for (let week = 1; week <= totalWeeks; week++) {
      try {
        const matchups = await this.getLeagueMatchups(leagueId, week);
        matchupsByWeek[week] = matchups;
      } catch (error) {
        console.error(`Failed to fetch matchups for week ${week}:`, error);
        matchupsByWeek[week] = [];
      }
    }

    return matchupsByWeek;
  },

  // Helper to get all historical leagues for a user (optimized with parallel requests)
  async getAllUserLeagues(
    userId: string,
    sport: string,
    startYear: number,
    endYear: number
  ): Promise<SleeperLeague[]> {
    const years = Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i);
    
    // Fetch recent years first (last 3 years), then older years
    const recentYears = years.slice(-3).reverse();
    const olderYears = years.slice(0, -3).reverse();
    const orderedYears = [...recentYears, ...olderYears];

    // Process in batches of 3 to avoid rate limits
    const batchSize = 3;
    const allLeagues: SleeperLeague[] = [];

    for (let i = 0; i < orderedYears.length; i += batchSize) {
      const batch = orderedYears.slice(i, i + batchSize);
      
      const batchPromises = batch.map(async (year) => {
        try {
          const leagues = await this.getUserLeagues(userId, sport, year.toString());
          return leagues;
        } catch (error) {
          // 404 is normal for years with no leagues, don't log as error
          if (error instanceof Error && !error.message.includes('404')) {
            console.error(`Failed to fetch leagues for ${year}:`, error);
          }
          return [];
        }
      });

      const batchResults = await Promise.all(batchPromises);
      batchResults.forEach(leagues => allLeagues.push(...leagues));

      // Small delay between batches to be respectful of rate limits
      if (i + batchSize < orderedYears.length) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }

    return allLeagues;
  },
};

