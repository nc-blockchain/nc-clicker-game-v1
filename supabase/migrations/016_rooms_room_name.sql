-- Optional display name for a PVP room (e.g. "Friday duel")
ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS room_name TEXT;
