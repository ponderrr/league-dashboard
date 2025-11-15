export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          sleeper_username: string | null;
          created_at: string;
          last_sync_at: string | null;
        };
        Insert: {
          id: string;
          email: string;
          sleeper_username?: string | null;
          created_at?: string;
          last_sync_at?: string | null;
        };
        Update: {
          id?: string;
          email?: string;
          sleeper_username?: string | null;
          last_sync_at?: string | null;
        };
      };
      leagues: {
        Row: {
          id: string;
          name: string;
          season: string;
          total_rosters: number;
          settings: Json;
          status: string;
          sport: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name: string;
          season: string;
          total_rosters: number;
          settings: Json;
          status: string;
          sport: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          season?: string;
          total_rosters?: number;
          settings?: Json;
          status?: string;
          sport?: string;
          updated_at?: string;
        };
      };
      league_members: {
        Row: {
          id: string;
          league_id: string;
          sleeper_user_id: string;
          sleeper_username: string;
          display_name: string;
          avatar: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          league_id: string;
          sleeper_user_id: string;
          sleeper_username: string;
          display_name: string;
          avatar?: string | null;
          created_at?: string;
        };
        Update: {
          sleeper_username?: string;
          display_name?: string;
          avatar?: string | null;
        };
      };
      rosters: {
        Row: {
          id: string;
          league_id: string;
          roster_id: number;
          league_member_id: string;
          players: Json;
          starters: Json;
          settings: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          league_id: string;
          roster_id: number;
          league_member_id: string;
          players: Json;
          starters: Json;
          settings: Json;
          created_at?: string;
        };
        Update: {
          players?: Json;
          starters?: Json;
          settings?: Json;
        };
      };
      matchups: {
        Row: {
          id: string;
          league_id: string;
          week: number;
          matchup_id: number;
          roster_id: number;
          points: number;
          starters: Json;
          players_points: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          league_id: string;
          week: number;
          matchup_id: number;
          roster_id: number;
          points: number;
          starters: Json;
          players_points: Json;
          created_at?: string;
        };
        Update: {
          points?: number;
          starters?: Json;
          players_points?: Json;
        };
      };
      drafts: {
        Row: {
          id: string;
          league_id: string;
          status: string;
          type: string;
          settings: Json;
          created_at: string;
        };
        Insert: {
          id: string;
          league_id: string;
          status: string;
          type: string;
          settings: Json;
          created_at?: string;
        };
        Update: {
          status?: string;
          settings?: Json;
        };
      };
      draft_picks: {
        Row: {
          id: string;
          draft_id: string;
          pick_no: number;
          round: number;
          roster_id: number;
          player_id: string;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          draft_id: string;
          pick_no: number;
          round: number;
          roster_id: number;
          player_id: string;
          metadata: Json;
          created_at?: string;
        };
        Update: {
          metadata?: Json;
        };
      };
      players: {
        Row: {
          player_id: string;
          name: string;
          position: string;
          team: string | null;
          metadata: Json;
          updated_at: string;
        };
        Insert: {
          player_id: string;
          name: string;
          position: string;
          team?: string | null;
          metadata: Json;
          updated_at?: string;
        };
        Update: {
          name?: string;
          position?: string;
          team?: string | null;
          metadata?: Json;
          updated_at?: string;
        };
      };
      sync_logs: {
        Row: {
          id: string;
          user_id: string;
          league_id: string;
          status: string;
          details: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          league_id: string;
          status: string;
          details: Json;
          created_at?: string;
        };
        Update: {
          status?: string;
          details?: Json;
        };
      };
    };
  };
}

