import { z } from 'zod';

export const sleeperUserSchema = z.object({
  user_id: z.string(),
  username: z.string(),
  display_name: z.string(),
  avatar: z.string().nullable(),
  metadata: z.record(z.any()),
});

export const sleeperLeagueSchema = z.object({
  league_id: z.string(),
  name: z.string(),
  season: z.string(),
  status: z.enum(['pre_draft', 'drafting', 'in_season', 'complete']),
  sport: z.string(),
  total_rosters: z.number(),
  settings: z.record(z.any()),
  roster_positions: z.array(z.string()),
  scoring_settings: z.record(z.number()),
});

export const sleeperRosterSchema = z.object({
  roster_id: z.number(),
  owner_id: z.string(),
  league_id: z.string(),
  players: z.array(z.string()),
  starters: z.array(z.string()),
  settings: z.object({
    wins: z.number(),
    losses: z.number(),
    ties: z.number(),
    fpts: z.number(),
  }),
});

export const sleeperMatchupSchema = z.object({
  roster_id: z.number(),
  matchup_id: z.number(),
  points: z.number(),
  starters: z.array(z.string()),
  players: z.array(z.string()),
  players_points: z.record(z.number()),
});

// Validate API responses
export function validateSleeperUser(data: unknown) {
  return sleeperUserSchema.parse(data);
}

export function validateSleeperLeague(data: unknown) {
  return sleeperLeagueSchema.parse(data);
}

export function validateSleeperRoster(data: unknown) {
  return sleeperRosterSchema.parse(data);
}

export function validateSleeperMatchup(data: unknown) {
  return sleeperMatchupSchema.parse(data);
}

