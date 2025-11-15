export interface SleeperUser {
  user_id: string;
  username: string;
  display_name: string;
  avatar: string | null;
  metadata: Record<string, any>;
}

export interface SleeperLeague {
  league_id: string;
  name: string;
  season: string;
  season_type: string;
  status: 'pre_draft' | 'drafting' | 'in_season' | 'complete';
  sport: string;
  settings: {
    num_teams: number;
    playoff_teams: number;
    playoff_week_start: number;
    playoff_round_type: number;
    [key: string]: any;
  };
  scoring_settings: Record<string, number>;
  roster_positions: string[];
  total_rosters: number;
  draft_id: string | null;
  previous_league_id: string | null;
  metadata: Record<string, any>;
}

export interface SleeperRoster {
  roster_id: number;
  owner_id: string;
  league_id: string;
  players: string[];
  starters: string[];
  reserve: string[] | null;
  taxi: string[] | null;
  settings: {
    wins: number;
    losses: number;
    ties: number;
    fpts: number;
    fpts_decimal: number;
    fpts_against: number;
    fpts_against_decimal: number;
    total_moves: number;
    waiver_position: number;
    waiver_budget_used: number;
    [key: string]: any;
  };
  metadata: Record<string, any>;
}

export interface SleeperMatchup {
  roster_id: number;
  matchup_id: number;
  points: number;
  starters: string[];
  starters_points: number[];
  players: string[];
  players_points: Record<string, number>;
  custom_points: number | null;
}

export interface SleeperDraft {
  draft_id: string;
  type: 'snake' | 'linear' | 'auction';
  status: 'pre_draft' | 'drafting' | 'complete';
  sport: string;
  settings: {
    teams: number;
    slots_wr: number;
    slots_rb: number;
    slots_qb: number;
    slots_te: number;
    slots_k: number;
    slots_def: number;
    slots_flex: number;
    slots_bn: number;
    rounds: number;
    [key: string]: any;
  };
  season: string;
  season_type: string;
  start_time: number;
  league_id: string;
  metadata: Record<string, any>;
}

export interface SleeperDraftPick {
  player_id: string;
  picked_by: string;
  roster_id: number;
  round: number;
  draft_slot: number;
  pick_no: number;
  metadata: {
    years_exp: string;
    team: string;
    status: string;
    sport: string;
    position: string;
    player_id: string;
    number: string;
    news_updated: string;
    last_name: string;
    injury_status: string;
    first_name: string;
    [key: string]: any;
  };
  is_keeper: boolean | null;
  draft_id: string;
}

export interface SleeperPlayer {
  player_id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  sport: string;
  position: string;
  team: string | null;
  age: number | null;
  height: string | null;
  weight: string | null;
  years_exp: number | null;
  college: string | null;
  status: string;
  fantasy_positions: string[];
  number: number | null;
  injury_status: string | null;
  metadata: Record<string, any>;
}

