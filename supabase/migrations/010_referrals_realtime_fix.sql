-- Fix "could not find in the schema" when using ref links or add friend by code:
-- Ensure leaderboard has ref_code (some older deployments may not have it)

ALTER TABLE public.leaderboard ADD COLUMN IF NOT EXISTS ref_code TEXT;
