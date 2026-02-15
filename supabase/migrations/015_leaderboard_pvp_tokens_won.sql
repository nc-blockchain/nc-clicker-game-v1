-- Total tokens won from PVP duels (sum of stake_amount for each win).
-- Required for the Multiplayer page to show "X wins (Y tokens won)" on the leaderboard.
-- Run in Supabase SQL Editor (Dashboard → SQL Editor → New query → paste → Run).

ALTER TABLE public.leaderboard ADD COLUMN IF NOT EXISTS pvp_tokens_won INTEGER DEFAULT 0;
