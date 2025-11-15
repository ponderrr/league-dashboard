-- =============================================
-- PHASE 3: RLS Policies for INSERT/UPDATE
-- =============================================
-- This migration adds INSERT and UPDATE policies for sync operations
-- Run this in your Supabase SQL Editor

-- =============================================
-- LEAGUES TABLE POLICIES
-- =============================================

-- Allow authenticated users to insert leagues (for sync)
CREATE POLICY "Authenticated users can insert leagues"
  ON public.leagues FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to update leagues (for sync)
CREATE POLICY "Authenticated users can update leagues"
  ON public.leagues FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- =============================================
-- LEAGUE MEMBERS TABLE POLICIES
-- =============================================

-- Allow authenticated users to insert league members (for sync)
CREATE POLICY "Authenticated users can insert league members"
  ON public.league_members FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to update league members (for sync)
CREATE POLICY "Authenticated users can update league members"
  ON public.league_members FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- =============================================
-- ROSTERS TABLE POLICIES
-- =============================================

-- Allow authenticated users to insert rosters (for sync)
CREATE POLICY "Authenticated users can insert rosters"
  ON public.rosters FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to update rosters (for sync)
CREATE POLICY "Authenticated users can update rosters"
  ON public.rosters FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- =============================================
-- MATCHUPS TABLE POLICIES
-- =============================================

-- Allow authenticated users to insert matchups (for sync)
CREATE POLICY "Authenticated users can insert matchups"
  ON public.matchups FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to update matchups (for sync)
CREATE POLICY "Authenticated users can update matchups"
  ON public.matchups FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- =============================================
-- DRAFTS TABLE POLICIES
-- =============================================

-- Allow authenticated users to insert drafts (for sync)
CREATE POLICY "Authenticated users can insert drafts"
  ON public.drafts FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to update drafts (for sync)
CREATE POLICY "Authenticated users can update drafts"
  ON public.drafts FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- =============================================
-- DRAFT PICKS TABLE POLICIES
-- =============================================

-- Allow authenticated users to insert draft picks (for sync)
CREATE POLICY "Authenticated users can insert draft picks"
  ON public.draft_picks FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to update draft picks (for sync)
CREATE POLICY "Authenticated users can update draft picks"
  ON public.draft_picks FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- =============================================
-- PLAYERS TABLE POLICIES
-- =============================================

-- Allow authenticated users to insert players (for sync)
CREATE POLICY "Authenticated users can insert players"
  ON public.players FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to update players (for sync)
CREATE POLICY "Authenticated users can update players"
  ON public.players FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

