-- 018: Rooms player ready (both players click Ready → countdown → race starts)
-- Fixes: "Could not find the 'player1_ready' column of 'rooms' in the schema cache"
-- Run in Supabase SQL Editor (Dashboard → SQL Editor → paste → Run).

ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS player1_ready BOOLEAN DEFAULT false;
ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS player2_ready BOOLEAN DEFAULT false;
