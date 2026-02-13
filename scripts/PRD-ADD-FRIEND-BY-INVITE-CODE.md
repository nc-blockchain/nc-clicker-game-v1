# PRD: Add Friend via Invite Code

## Overview

Users can add friends by entering the friend’s **invite code** (e.g. `REF7T&R13`) on the Friends page and clicking **ADD FRIEND**. This sends a friend request; the other user sees it in pending requests and can Accept or Reject. On Accept, both users appear in each other’s “Added by code” list and can duel.

## Current Implementation (as of PRD date)

### Flow

1. **User A (sender)**  
   - Opens Friends tab → “ADD FRIEND BY INVITE CODE”.  
   - Enters User B’s invite code, clicks **ADD FRIEND**.

2. **Backend**  
   - `getPvpPlayerId()` must return a value (Ton wallet or `guest_xxx`).  
   - Lookup `leaderboard` by `ref_code` (case-insensitive) → get `name`, `wallet_address`.  
   - If found and not self: insert into `friend_requests` (from_wallet: A, to_wallet: B, from_name, to_name, status: `pending`).

3. **User B (receiver)**  
   - Sees pending request in Friends (or notifications).  
   - Accept → insert both directions into `friends_by_code`, update request to `accepted`.  
   - Reject → update request to `rejected`.

### Dependencies

- **Supabase**  
  - Tables: `leaderboard` (with `ref_code`), `friend_requests`, `friends_by_code`.  
  - Migrations: `001_initial_tables.sql` (leaderboard + ref_code), `003_friends_by_code.sql`, `011_friend_requests.sql`.  
  - RLS: anon can SELECT/INSERT/UPDATE as used by the app.

- **Sender (User A)**  
  - Must have “player id”: Wallet connected **or** name set in Wallet → Settings (so `getPvpPlayerId()` returns wallet or `guest_xxx`).  
  - App shows “Set your name in Wallet → Settings first” if `!me`.

- **Receiver (User B) – code must be findable**  
  - Their **invite code** must exist in `leaderboard.ref_code`.  
  - Today this is only synced when **persistNameToLeaderboard()** runs, which **skips guest users** (`if (wallet.indexOf('guest_') === 0) return`).  
  - So: **only users who have connected a Ton wallet** get their ref_code into leaderboard. Guest-only users are never in leaderboard, so their code cannot be found and “Add friend” will always show “Unknown invite code”.

### Known failure modes

1. **Table missing**  
   - Error: “Could not find the table 'public.friend_requests' in the schema cache”.  
   - Fix: Run `011_friend_requests.sql` in Supabase SQL Editor.

2. **Sender has no player id**  
   - Message: “Set your name in Wallet → Settings first.”  
   - Fix: Set name in Wallet → Settings (or connect wallet).

3. **Unknown invite code**  
   - Message: “Your friend should open the app, go to Wallet → Settings, and SAVE their name so their code is synced.”  
   - Cause: No row in `leaderboard` with that `ref_code`.  
   - Likely if the “friend” is guest-only (ref_code never persisted) or they never saved name after connecting wallet.

4. **Special characters in code**  
   - Invite codes are generated as `REF` + random alphanumeric (e.g. `REF7T&R13` – `&` may appear in `toString(36)`).  
   - Lookup uses `.ilike('ref_code', code)`. In SQL `ilike`, `%` and `_` are wildcards; other characters (e.g. `&`) are literal. So `&` in code is fine; only codes containing `%` or `_` could behave unexpectedly.

5. **RLS or schema**  
   - Leaderboard or friend_requests SELECT/INSERT/UPDATE blocked or column missing → generic Supabase error.  
   - App shows a clearer message when error message contains `friend_requests` or `schema cache`.

## Goals for this feature

- **Reliability**: Add friend by invite code works for the intended flows (wallet users, and optionally guest users).  
- **Clarity**: Errors are clear and actionable (e.g. “run migration 011”, “set name in Settings”, “friend must save name”).  
- **Testability**: PRD and test tasks document exact steps and expected outcomes so the feature can be verified and regressed.

## Acceptance criteria

- [ ] User with player id (wallet or guest) can open Friends, enter another user’s invite code, click ADD FRIEND, and see “Request sent to &lt;name&gt;” when the code is valid.  
- [ ] When the code is invalid or table missing, the user sees a clear, actionable message (no raw schema cache error).  
- [ ] Receiver sees the pending request and can Accept (both appear in “Added by code”) or Reject.  
- [ ] Optional: Guest users who set a name get their ref_code into leaderboard so they can be found by invite code (requires changing persistNameToLeaderboard to allow guest_ ids).

## Out of scope for this PRD

- Invite **link** (URL with ref) flow; only **invite code** (paste in box) is in scope.  
- PVP duel flow after adding friend (separate feature).  
- Changing how invite codes are generated (e.g. disallowing `&`).

## Appendix: Code references

- Add friend handler: `addFriendByCode()` in index.html.  
- Player id: `getPvpPlayerId()` (Ton wallet or `guest_xxx`).  
- Sync ref_code to leaderboard: `persistNameToLeaderboard()` (skips `guest_`).  
- Tables: `leaderboard`, `friend_requests`, `friends_by_code`.  
- Migrations: `001_initial_tables.sql`, `003_friends_by_code.sql`, `011_friend_requests.sql`.
