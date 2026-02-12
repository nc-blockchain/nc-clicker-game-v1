-- Run migrations 006-010 in Supabase SQL Editor
-- Copy this entire file and paste into Supabase → SQL Editor → Run

-- ========== 006: Rematch window ==========
ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS rematch_until TIMESTAMPTZ;
ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS player1_wants_rematch BOOLEAN DEFAULT false;
ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS player2_wants_rematch BOOLEAN DEFAULT false;

-- ========== 007: Leaderboard Realtime ==========
-- If "already member" error: skip (table already in publication)
ALTER PUBLICATION supabase_realtime ADD TABLE public.leaderboard;

-- ========== 008: Referrals table + policies ==========
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

DROP POLICY IF EXISTS "Anyone can delete referrals" ON public.referrals;
CREATE POLICY "Anyone can delete referrals" ON public.referrals FOR DELETE TO anon USING (true);

CREATE INDEX IF NOT EXISTS idx_referrals_inviter ON public.referrals (inviter_ref_code);

-- ========== 009: Referrals Realtime ==========
-- If "already member" error: skip
ALTER PUBLICATION supabase_realtime ADD TABLE public.referrals;

-- ========== 010: Leaderboard ref_code ==========
ALTER TABLE public.leaderboard ADD COLUMN IF NOT EXISTS ref_code TEXT;
