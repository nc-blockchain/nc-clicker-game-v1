# Test rematch (PVP duel)

Rematch lets both players start another round in the same room (same stake, 60s window). If it’s not working, use this checklist.

---

## 1. Database: run migration 006

Rematch uses three columns on `rooms`:

- `rematch_until` (TIMESTAMPTZ)
- `player1_wants_rematch` (BOOLEAN)
- `player2_wants_rematch` (BOOLEAN)

**If these are missing**, the REMATCH button will do nothing or show an error.

**Fix:** In **Supabase → SQL Editor**, run the contents of:

**`supabase/migrations/006_rooms_rematch.sql`**

```sql
ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS rematch_until TIMESTAMPTZ;
ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS player1_wants_rematch BOOLEAN DEFAULT false;
ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS player2_wants_rematch BOOLEAN DEFAULT false;
```

After running, try rematch again.

---

## 2. Manual test steps

1. **Create room** (player A): Multiplayer → CREATE ROOM → choose wager → CREATE ROOM.
2. **Join** (player B): Open share link → JOIN & PLAY (or join from OPEN ROOMS).
3. **Play:** Both click READY → countdown → race (30s). One player wins.
4. **Result screen:** Both see YOU WIN / YOU LOSE and “Rematch — 60s” plus REMATCH and BACK TO LOBBY.
5. **Rematch:**  
   - Player A clicks REMATCH.  
   - Player B clicks REMATCH.  
   - Within a few seconds both should see the duel view again (same room, new race).
6. **No rematch:** Wait 60s without both clicking REMATCH; countdown goes to 0, message says room will close.

---

## 3. If rematch still fails

- **Check console:** Open DevTools → Console. Look for Supabase errors mentioning `wants_rematch`, `rematch_until`, or “schema cache”.
- **Check result-screen hint:** If the app shows a pink message under the REMATCH button like “Rematch needs DB columns…”, run migration 006 as in step 1.
- **Realtime:** Rematch uses Supabase Realtime so the other player sees the room update when both want rematch. Ensure Realtime is enabled for the `rooms` table (e.g. migration 005 or Dashboard → Database → Replication).

---

## 4. Code references

- Rematch click: `#pvp-duel-rematch-btn` → update `player1_wants_rematch` / `player2_wants_rematch`, then if both true reset room and `enterDuel(roomId)`.
- Realtime: channel `rematch-{roomId}` on `rooms` UPDATE; when `status === 'in_progress'` and `game_ends_at` set, both clients call `enterDuel(roomId)`.
- Migration: `supabase/migrations/006_rooms_rematch.sql`.
