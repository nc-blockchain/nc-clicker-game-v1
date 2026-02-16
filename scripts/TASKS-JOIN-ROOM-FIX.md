# Task list: Join room fix (player1_ready / player2_ready)

## Problem
Clicking **JOIN** on a room shows:  
`Could not find the 'player1_ready' column of 'rooms' in the schema cache`

The app expects `player1_ready` and `player2_ready` on the `rooms` table for the "both players ready" flow; the column was missing in the database.

---

## Tasks

### 1. Run migration (required)
- [x] Migration file added: `supabase/migrations/018_rooms_player_ready.sql`
- [ ] **Run in Supabase:** Dashboard → SQL Editor → New query → paste contents of `018_rooms_player_ready.sql` → Run

### 2. Verify
- [ ] Open the app → Multiplayer → OPEN ROOMS (or use a room link with `?room=...`)
- [ ] Click JOIN on a room
- [ ] No "player1_ready" / "player2_ready" / "schema cache" error
- [ ] Join completes (name/balance checks as normal) and duel lobby or ready screen appears

### 3. Optional: full join flow test
- [ ] Create room (player A) → copy share link
- [ ] Open link in another browser/incognito (player B) → JOIN & PLAY
- [ ] Both see duel view; both click READY → countdown → race starts

---

## Files changed
- **New:** `supabase/migrations/018_rooms_player_ready.sql` – adds `player1_ready`, `player2_ready` to `rooms`
- **New:** `scripts/TASKS-JOIN-ROOM-FIX.md` – this task list

No code changes required; the app already uses these columns. Only the database was missing them.
