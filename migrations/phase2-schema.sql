-- =============================================
-- PHASE 2: Database Schema Migration
-- =============================================
-- This migration creates all tables for league data
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- LEAGUES TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS public.leagues (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  season TEXT NOT NULL,
  total_rosters INTEGER NOT NULL,
  settings JSONB NOT NULL DEFAULT '{}',
  status TEXT NOT NULL,
  sport TEXT NOT NULL DEFAULT 'nfl',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for leagues
CREATE INDEX IF NOT EXISTS leagues_season_idx ON public.leagues(season);
CREATE INDEX IF NOT EXISTS leagues_status_idx ON public.leagues(status);

-- RLS for leagues
ALTER TABLE public.leagues ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Leagues are viewable by authenticated users"
  ON public.leagues FOR SELECT
  TO authenticated
  USING (true);

-- =============================================
-- LEAGUE MEMBERS TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS public.league_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  league_id TEXT NOT NULL REFERENCES public.leagues(id) ON DELETE CASCADE,
  sleeper_user_id TEXT NOT NULL,
  sleeper_username TEXT NOT NULL,
  display_name TEXT NOT NULL,
  avatar TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(league_id, sleeper_user_id)
);

-- Indexes for league_members
CREATE INDEX IF NOT EXISTS league_members_league_id_idx ON public.league_members(league_id);
CREATE INDEX IF NOT EXISTS league_members_sleeper_username_idx ON public.league_members(sleeper_username);
CREATE INDEX IF NOT EXISTS league_members_sleeper_user_id_idx ON public.league_members(sleeper_user_id);

-- RLS for league_members
ALTER TABLE public.league_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "League members are viewable by authenticated users"
  ON public.league_members FOR SELECT
  TO authenticated
  USING (true);

-- =============================================
-- ROSTERS TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS public.rosters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  league_id TEXT NOT NULL REFERENCES public.leagues(id) ON DELETE CASCADE,
  roster_id INTEGER NOT NULL,
  league_member_id UUID NOT NULL REFERENCES public.league_members(id) ON DELETE CASCADE,
  players JSONB NOT NULL DEFAULT '[]',
  starters JSONB NOT NULL DEFAULT '[]',
  settings JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(league_id, roster_id)
);

-- Indexes for rosters
CREATE INDEX IF NOT EXISTS rosters_league_id_idx ON public.rosters(league_id);
CREATE INDEX IF NOT EXISTS rosters_league_member_id_idx ON public.rosters(league_member_id);
CREATE INDEX IF NOT EXISTS rosters_roster_id_idx ON public.rosters(roster_id);

-- RLS for rosters
ALTER TABLE public.rosters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Rosters are viewable by authenticated users"
  ON public.rosters FOR SELECT
  TO authenticated
  USING (true);

-- =============================================
-- MATCHUPS TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS public.matchups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  league_id TEXT NOT NULL REFERENCES public.leagues(id) ON DELETE CASCADE,
  week INTEGER NOT NULL,
  matchup_id INTEGER NOT NULL,
  roster_id INTEGER NOT NULL,
  points DECIMAL(10, 2) NOT NULL,
  starters JSONB NOT NULL DEFAULT '[]',
  players_points JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(league_id, week, roster_id)
);

-- Indexes for matchups
CREATE INDEX IF NOT EXISTS matchups_league_id_idx ON public.matchups(league_id);
CREATE INDEX IF NOT EXISTS matchups_league_id_week_idx ON public.matchups(league_id, week);
CREATE INDEX IF NOT EXISTS matchups_week_idx ON public.matchups(week);
CREATE INDEX IF NOT EXISTS matchups_roster_id_idx ON public.matchups(roster_id);

-- RLS for matchups
ALTER TABLE public.matchups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Matchups are viewable by authenticated users"
  ON public.matchups FOR SELECT
  TO authenticated
  USING (true);

-- =============================================
-- DRAFTS TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS public.drafts (
  id TEXT PRIMARY KEY,
  league_id TEXT NOT NULL REFERENCES public.leagues(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  type TEXT NOT NULL,
  settings JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for drafts
CREATE INDEX IF NOT EXISTS drafts_league_id_idx ON public.drafts(league_id);
CREATE INDEX IF NOT EXISTS drafts_status_idx ON public.drafts(status);

-- RLS for drafts
ALTER TABLE public.drafts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Drafts are viewable by authenticated users"
  ON public.drafts FOR SELECT
  TO authenticated
  USING (true);

-- =============================================
-- DRAFT PICKS TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS public.draft_picks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  draft_id TEXT NOT NULL REFERENCES public.drafts(id) ON DELETE CASCADE,
  pick_no INTEGER NOT NULL,
  round INTEGER NOT NULL,
  roster_id INTEGER NOT NULL,
  player_id TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(draft_id, pick_no)
);

-- Indexes for draft_picks
CREATE INDEX IF NOT EXISTS draft_picks_draft_id_idx ON public.draft_picks(draft_id);
CREATE INDEX IF NOT EXISTS draft_picks_player_id_idx ON public.draft_picks(player_id);
CREATE INDEX IF NOT EXISTS draft_picks_roster_id_idx ON public.draft_picks(roster_id);

-- RLS for draft_picks
ALTER TABLE public.draft_picks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Draft picks are viewable by authenticated users"
  ON public.draft_picks FOR SELECT
  TO authenticated
  USING (true);

-- =============================================
-- PLAYERS TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS public.players (
  player_id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  position TEXT NOT NULL,
  team TEXT,
  metadata JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for players
CREATE INDEX IF NOT EXISTS players_position_idx ON public.players(position);
CREATE INDEX IF NOT EXISTS players_team_idx ON public.players(team);
CREATE INDEX IF NOT EXISTS players_name_idx ON public.players(name);

-- RLS for players
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Players are viewable by authenticated users"
  ON public.players FOR SELECT
  TO authenticated
  USING (true);

-- =============================================
-- SYNC LOGS TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS public.sync_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  league_id TEXT NOT NULL,
  status TEXT NOT NULL,
  details JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for sync_logs
CREATE INDEX IF NOT EXISTS sync_logs_user_id_idx ON public.sync_logs(user_id);
CREATE INDEX IF NOT EXISTS sync_logs_league_id_idx ON public.sync_logs(league_id);
CREATE INDEX IF NOT EXISTS sync_logs_created_at_idx ON public.sync_logs(created_at DESC);

-- RLS for sync_logs
ALTER TABLE public.sync_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own sync logs"
  ON public.sync_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sync logs"
  ON public.sync_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- =============================================
-- TRIGGERS FOR UPDATED_AT
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for leagues
CREATE TRIGGER update_leagues_updated_at
  BEFORE UPDATE ON public.leagues
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

