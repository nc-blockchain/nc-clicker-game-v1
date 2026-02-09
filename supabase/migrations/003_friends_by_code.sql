-- Friends added by entering invite code: when a user enters a friend's ref code,
-- we store it so the code owner's name appears in their friend list.
-- Run in Supabase SQL Editor.

CREATE TABLE IF NOT EXISTS public.friends_by_code (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_wallet TEXT NOT NULL,
  friend_ref_code TEXT NOT NULL,
  friend_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.friends_by_code ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read friends_by_code"
  ON public.friends_by_code FOR SELECT TO anon USING (true);

CREATE POLICY "Anyone can insert friends_by_code"
  ON public.friends_by_code FOR INSERT TO anon WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_friends_by_code_user ON public.friends_by_code (user_wallet);
CREATE UNIQUE INDEX IF NOT EXISTS idx_friends_by_code_user_ref ON public.friends_by_code (user_wallet, friend_ref_code);
