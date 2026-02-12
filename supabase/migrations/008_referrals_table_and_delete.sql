-- Referrals: ensure table exists and add DELETE policy so users can remove invited friends
-- Run in Supabase SQL Editor if not using migrations

CREATE TABLE IF NOT EXISTS public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inviter_ref_code TEXT NOT NULL,
  invited_name TEXT NOT NULL,
  invited_wallet TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- Fix: add DELETE policy (RLS blocks deletes without it)
DROP POLICY IF EXISTS "Anyone can delete referrals" ON public.referrals;
CREATE POLICY "Anyone can delete referrals"
  ON public.referrals FOR DELETE TO anon USING (true);

CREATE INDEX IF NOT EXISTS idx_referrals_inviter ON public.referrals (inviter_ref_code);
