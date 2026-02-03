-- Clear all pending (open or in_progress) games.
-- Run in Supabase SQL Editor when you want to reset all active rooms.
-- This sets every non-finished room to finished (no winner).

UPDATE public.rooms
SET status = 'finished', updated_at = now()
WHERE status IN ('open', 'in_progress');

-- Optional: see how many were cleared
-- SELECT count(*) FROM public.rooms WHERE status = 'finished';
