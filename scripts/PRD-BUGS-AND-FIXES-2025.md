# PRD: Bugs, Fixes & Testing Report (Feb 2025)

**Document purpose:** Comprehensive bug list, fixes applied, and testing checklist from full game audit.  
**Scope:** All features—Home, Boosts, Bounties, Friends, Wallet, PVP/Multiplayer, Play vs Computer.

---

## 1. Bugs Found & Fixes Applied

### 1.1 PVP Lobby: "column rooms.rematch_until does not exist"

**Symptom:** On PVP/Multiplayer page, room list shows "Could not load rooms." and error "column rooms.rematch_until does not exist".

**Root cause:** Migration `006_rooms_rematch.sql` was not run on Supabase. The rooms query selects `rematch_until` which doesn't exist in older schema.

**Fix applied:** Frontend fallback in `loadPvpRooms()`. When the rooms query fails with "rematch" or "does not exist" in the error message, retry with a simplified select that omits `rematch_until`. Rooms load correctly; rematch window for finished games won't work until migration 006 is run.

**Action required:** Run migration 006 in Supabase SQL Editor for full rematch support:
```sql
ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS rematch_until TIMESTAMPTZ;
ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS player1_wants_rematch BOOLEAN DEFAULT false;
ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS player2_wants_rematch BOOLEAN DEFAULT false;
```

---

### 1.2 Ref link / Add friend: "could not find in the schema"

**Symptom:** Opening `?ref=REFCODE` or adding friend by code shows schema error.

**Root cause:** (a) `referrals` table not in Realtime publication; (b) `leaderboard` table may lack `ref_code` column in older deployments.

**Fixes applied:**
- Realtime subscription fails gracefully (no app crash)
- Add friend by code shows clear message: "Database schema outdated. Run migration 010 in Supabase."
- Migration 010 adds `ref_code` to leaderboard if missing
- Migration 009 adds `referrals` to Realtime publication

**Action required:** Run migrations 008, 009, 010 in Supabase (see Migrations section below).

---

### 1.3 Remove friend not working

**Symptom:** REMOVE button on Friends list did nothing.

**Root cause:** `referrals` table had no DELETE policy (RLS blocked deletes).

**Fix applied:** Migration 008 adds DELETE policy for referrals. Error logging added for debugging.

---

### 1.4 Friend token counts not real-time

**Symptom:** Token amounts next to friends didn't update without refresh.

**Fix applied:** Supabase Realtime on leaderboard + 15s polling when Friends page visible + localStorage cache. Token display styled (neon-yellow, on own line).

---

## 2. Migrations Required (Supabase)

Run these in order in Supabase SQL Editor:

| # | File | Purpose |
|---|------|---------|
| 001 | `001_initial_tables.sql` | Leaderboard, rooms, RLS |
| 002 | `002_rooms_stake_and_game_fields.sql` | Rooms game fields |
| 003 | `003_friends_by_code.sql` | Friends by code table |
| 004 | `004_friends_by_code_delete_policy.sql` | Delete friends |
| 005 | `005_rooms_rpc_and_realtime.sql` | Rooms Realtime |
| 006 | `006_rooms_rematch.sql` | Rematch window (60s) |
| 007 | `007_leaderboard_realtime.sql` | Leaderboard Realtime |
| 008 | `008_referrals_table_and_delete.sql` | Referrals table + DELETE |
| 009 | `009_referrals_realtime.sql` | Referrals Realtime |
| 010 | `010_referrals_realtime_fix.sql` | Leaderboard ref_code |

---

## 3. Features Verified Working

- **Home:** Tap to earn, token count, TAP/SEC, level badge
- **Boosts:** Balance, BUY/UPGRADE (disabled when insufficient tokens)
- **Bounties:** Available/Claimed tabs, CLAIM, balance update, Daily/Graduating/Fun categories
- **Friends:** Leaderboard, invite link, add by code, COPY INVITE LINK, Play vs Computer
- **Wallet:** Balance, swap/withdraw UI, SETTINGS
- **PVP:** Create room, room list (with fallback), Play vs Computer, duel view
- **Notifications:** Bell opens modal, recent activity
- **Navigation:** All nav links switch pages

---

## 4. Known Limitations

1. **Play vs Computer:** No wallet or stake required; practice only. Opponent is simulated.
2. **Rematch:** Requires migration 006. Without it, lobby loads but rematch button/window won't work.
3. **Friend-accepted toast:** Requires migration 009 (referrals in Realtime). Without it, invited friends still appear on refresh; no real-time toast.
4. **Wallet on localhost:** May require backend; use live site for production wallet flow.

---

## 5. Testing Checklist

Use this for regression testing:

- [ ] **Home:** Tap bird; tokens, TAP/SEC, total taps update; feathers (if on)
- [ ] **Boosts:** Balance shown; 60s buff activates when enough tokens; countdown on button & Home; rebuy extends
- [ ] **Bounties:** Claim bounty → balance updates; Available/Claimed tabs; refresh persists
- [ ] **Friends:** Leaderboard loads; invite link copies; add by code (with valid code); Remove friend works
- [ ] **Wallet:** Balance, SETTINGS, name change persists
- [ ] **PVP:** Room list loads (or "No rooms yet"); Create room; Play vs Computer starts
- [ ] **Ref link:** Open `?ref=CODE` → ref stored; set name → referral registered (if Supabase configured)
- [ ] **Navigation:** All nav links work; no broken pages

---

## 6. Summary

| Bug | Severity | Fix |
|-----|----------|-----|
| rooms.rematch_until missing | High (blocks PVP lobby) | Frontend fallback; run migration 006 |
| Schema error on ref/add friend | Medium | Graceful failure; migrations 008–010 |
| Remove friend not working | High | Migration 008 DELETE policy |
| Friend tokens not real-time | Low | Realtime + polling + cache |

**Recommendation:** Run all migrations 001–010 on Supabase for full functionality.
