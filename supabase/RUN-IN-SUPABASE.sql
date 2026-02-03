-- =============================================================================
-- Run this in your EXISTING Supabase project (the one in supabase-config.js)
-- Dashboard: https://supabase.com/dashboard → your project → SQL Editor → New query → paste this → Run
-- =============================================================================

-- 1) Base tables (skip if you already ran 001_initial_tables.sql)
CREATE TABLE IF NOT EXISTS public.leaderboard (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  tokens BIGINT NOT NULL DEFAULT 0,
  wallet_address TEXT,
  ref_code TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.leaderboard ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read leaderboard" ON public.leaderboard;
CREATE POLICY "Anyone can read leaderboard" ON public.leaderboard FOR SELECT TO anon USING (true);
DROP POLICY IF EXISTS "Anyone can insert row" ON public.leaderboard;
CREATE POLICY "Anyone can insert row" ON public.leaderboard FOR INSERT TO anon WITH CHECK (true);
DROP POLICY IF EXISTS "Anyone can update row" ON public.leaderboard;
CREATE POLICY "Anyone can update row" ON public.leaderboard FOR UPDATE TO anon USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'finished')),
  player1_wallet TEXT,
  player2_wallet TEXT,
  winner_wallet TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read rooms" ON public.rooms;
CREATE POLICY "Anyone can read rooms" ON public.rooms FOR SELECT TO anon USING (true);
DROP POLICY IF EXISTS "Anyone can create room" ON public.rooms;
CREATE POLICY "Anyone can create room" ON public.rooms FOR INSERT TO anon WITH CHECK (true);
DROP POLICY IF EXISTS "Anyone can update room" ON public.rooms;
CREATE POLICY "Anyone can update room" ON public.rooms FOR UPDATE TO anon USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_leaderboard_tokens ON public.leaderboard (tokens DESC);
CREATE INDEX IF NOT EXISTS idx_rooms_status ON public.rooms (status);

-- 2) PVP duel columns and function (adds to existing tables)
ALTER TABLE public.rooms
  ADD COLUMN IF NOT EXISTS player1_name TEXT,
  ADD COLUMN IF NOT EXISTS player2_name TEXT,
  ADD COLUMN IF NOT EXISTS player1_clicks INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS player2_clicks INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS game_started_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS game_ends_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS stake_amount NUMERIC(20,9) NOT NULL DEFAULT 1;

ALTER TABLE public.leaderboard
  ADD COLUMN IF NOT EXISTS pvp_wins INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_rooms_game_ends_at ON public.rooms (game_ends_at) WHERE status = 'in_progress';

CREATE OR REPLACE FUNCTION public.increment_pvp_clicks(room_id UUID, player_num INTEGER)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_count INTEGER;
BEGIN
  IF player_num = 1 THEN
    UPDATE public.rooms SET player1_clicks = player1_clicks + 1, updated_at = now() WHERE id = room_id RETURNING player1_clicks INTO new_count;
  ELSIF player_num = 2 THEN
    UPDATE public.rooms SET player2_clicks = player2_clicks + 1, updated_at = now() WHERE id = room_id RETURNING player2_clicks INTO new_count;
  ELSE
    RETURN jsonb_build_object('error', 'invalid player_num');
  END IF;
  IF new_count IS NULL THEN
    RETURN jsonb_build_object('error', 'room not found');
  END IF;
  RETURN jsonb_build_object('clicks', new_count);
END;
$$;

GRANT EXECUTE ON FUNCTION public.increment_pvp_clicks(UUID, INTEGER) TO anon;

-- 3) Referrals: friends list (who joined via your invite link)
CREATE TABLE IF NOT EXISTS public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inviter_ref_code TEXT NOT NULL,
  invited_name TEXT NOT NULL,
  invited_wallet TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read referrals" ON public.referrals;
CREATE POLICY "Anyone can read referrals" ON public.referrals FOR SELECT TO anon USING (true);
DROP POLICY IF EXISTS "Anyone can insert referrals" ON public.referrals;
CREATE POLICY "Anyone can insert referrals" ON public.referrals FOR INSERT TO anon WITH CHECK (true);
CREATE INDEX IF NOT EXISTS idx_referrals_inviter ON public.referrals (inviter_ref_code);
