-- Friend requests: when A adds B's code, send request instead of direct add.
-- B sees request in notifications; Accept adds both to friends, Reject marks rejected.
-- Run in Supabase SQL Editor.

CREATE TABLE IF NOT EXISTS public.friend_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_wallet TEXT NOT NULL,
  to_wallet TEXT NOT NULL,
  from_name TEXT NOT NULL,
  to_name TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.friend_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read friend_requests"
  ON public.friend_requests FOR SELECT TO anon USING (true);

CREATE POLICY "Anyone can insert friend_requests"
  ON public.friend_requests FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Anyone can update friend_requests"
  ON public.friend_requests FOR UPDATE TO anon USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_friend_requests_to_wallet ON public.friend_requests (to_wallet);
CREATE INDEX IF NOT EXISTS idx_friend_requests_from_wallet ON public.friend_requests (from_wallet);
CREATE INDEX IF NOT EXISTS idx_friend_requests_status ON public.friend_requests (status);
CREATE UNIQUE INDEX IF NOT EXISTS idx_friend_requests_pair ON public.friend_requests (from_wallet, to_wallet);
