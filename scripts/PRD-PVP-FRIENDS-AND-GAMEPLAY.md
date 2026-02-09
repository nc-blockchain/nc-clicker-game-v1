# PRD: PVP Friends, Duel Flow & Full Gameplay Loop

**Purpose:** Define the PVP experience from friends/invites through duel flow, add “Duel” from Friends (invited section), ensure winner appears on leaderboard, support play-vs-computer when no friends, and suggest improvements for fun.

---

## 1. Current State Summary

### Friends & Invites
- **FRIENDS (INVITED):** Lists people who used the player’s invite link (from `referrals` table: `inviter_ref_code` = my ref code). Display only: name + wallet snippet; **no Duel action**.
- **PVP entry:** Via MULTIPLAYER (PVP) tab: CREATE ROOM → share link → opponent opens link and JOINS. No direct “challenge this friend” from the Friends list.

### PVP Flow
- **Create room:** Player creates room (open), becomes player1. Room has share link.
- **Join:** Opponent opens link (or finds room in list), joins as player2 → room goes `in_progress`, `game_ends_at` set (e.g. 30s).
- **Duel:** Both see duel view; tap to increment clicks; timer counts down; at 0 or END GAME → `status = finished`, `winner_wallet` set. Winner gets +1 on leaderboard `pvp_wins`.
- **Leaderboard:** PVP Duel Wins (top 5) on Friends page; full list in modal. Winner is recorded after each finished duel.

### Gaps
- No “Duel” button next to an invited friend → create room and put both in game.
- No “play vs computer” when the player has no friends.
- Gameplay loop (start → end → winner on leaderboard) is partially documented; improvements for fun not centralized.

---

## 2. Goals

1. **Friends → Duel:** When a friend appears in FRIENDS (INVITED), show a **Duel** button next to them. Clicking Duel creates a room and places both players in the game (creator + invited friend as opponent when they accept).
2. **Test gameplay:** Clear test plan for PVP: room create/join, duel, timer, winner, leaderboard.
3. **Play vs computer:** If the player has no friends (empty invited list), offer **Play vs Computer** so they can still play the duel loop (no stake; optional leaderboard or “practice” only).
4. **Document full gameplay loop:** From start of game to end, including winner on leaderboard and ideas to make the game more fun.

---

## 3. Requirements

### 3.1 Friends (Invited) → Duel Button

| # | Requirement | Notes |
|---|-------------|--------|
| R1 | Each row in FRIENDS (INVITED) shows: friend name, optional wallet snippet, and a **Duel** button. | Reuse existing `referrals` data; add one action per row. |
| R2 | Clicking **Duel** (for a specific friend): create a PVP room as today (same rules: name, wallet, 1 $CARD stake). | Same `rooms` table and create flow. |
| R3 | After room creation, show share/copy link as today **and** indicate “Challenge sent to [FriendName].” Optionally: open MULTIPLAYER tab and show the created room with “Waiting for [FriendName]” or “Share link to start.” | Friend can join via same link; when they join, both enter duel. |
| R4 | When the invited friend opens the app (e.g. from shared link or later), they see a way to join: e.g. “You’re invited to a duel by [InviterName]” (from room or from a dedicated “pending duel” concept). | Can be implemented as room link shared via any channel; or future: store “challenge” by inviter_ref_code + invited wallet so friend sees pending duel in Friends or PVP. |
| R5 | When friend joins the room, both players are placed in the duel view (existing enterDuel flow). Game starts (timer, clicks) as today. | No change to duel mechanics; only entry point from Friends. |

**Implementation notes:**
- **Frontend:** In `loadFriendsInvited()`, render each invited friend as a row with a **Duel** button. On Duel click: call `createPvpRoom()` (or equivalent), then copy room link and optionally set a “challenge target” label (friend name) for this room. Show toast/status: “Room created. Share link with [FriendName] to start.”
- **Backend:** No new tables required. Room already has `player1_wallet`, `player1_name`. Optional: add `invited_friend_wallet` or `invited_friend_name` on `rooms` for UI display (“Waiting for Alice”). Or derive from room link sharing only.
- **Friend joining:** Same as today: friend gets link (in-app share or external) → opens → JOIN & PLAY → both in duel.

### 3.2 Play vs Computer (No Friends)

| # | Requirement | Notes |
|---|-------------|--------|
| R6 | If FRIENDS (INVITED) list is empty, show a **Play vs Computer** (or “Practice vs Bot”) option. | Single player can still experience the duel loop. |
| R7 | Play vs Computer: no wallet/$CARD stake required (or optional “practice mode” with 0 stake). | Lower friction; no loser transfer. |
| R8 | Bot behavior: computer opponent has simulated clicks (e.g. random interval, or fixed taps/sec) so the race is winnable but not trivial. | Configurable difficulty later (easy/medium/hard). |
| R9 | Winner: if player wins, can optionally show “You win!” and optionally add to a “Practice wins” or exclude from main PVP leaderboard. If bot wins, show “Computer wins!” and encourage playing vs a friend. | Main PVP leaderboard stays human-vs-human only unless product decision is to include practice. |
| R10 | Replay: offer “Play again” (same as rematch) to play another round vs computer. | Same UX as rematch. |

**Implementation notes:**
- **Room type:** Option A: same `rooms` table with `player2_wallet = 'bot'` or `is_bot_duel = true`. Option B: client-only “practice” mode (no room row, or a dedicated `practice_rooms` table). Option A keeps one duel view; backend may need to accept `player2_wallet = 'bot'` and not require stake.
- **Bot clicks:** Timer starts; client (or backend cron) increments `player2_clicks` on a schedule (e.g. every 200–400 ms random) until game ends. No real wallet for bot.
- **Leaderboard:** Do not add bot wins to `pvp_wins`; or add a separate “practice_wins” for display only.

### 3.3 Full Gameplay Loop (Start → End → Leaderboard)

| # | Requirement | Notes |
|---|-------------|--------|
| R11 | **Start:** Player opens game → optional onboarding (name, wallet for PVP) → Home (tap to earn) or MULTIPLAYER (create/join room) or Friends (invite, Duel). | Documented as canonical flow. |
| R12 | **Duel start:** Creator creates room OR clicks Duel next to friend. Opponent joins via link (or joins from room list). Room status → `in_progress`, `game_ends_at` set. Both clients show duel view. | Already implemented. |
| R13 | **During duel:** 30s timer (or configured duration), each tap increments that player’s clicks (realtime or polled). END GAME button for early finish. | Already implemented. |
| R14 | **End:** When timer hits 0 or END GAME, backend sets `status = finished`, `winner_wallet = player with more clicks` (or null if tie). | Already implemented. |
| R15 | **Winner & leaderboard:** Winner’s `pvp_wins` on `leaderboard` incremented (upsert by wallet). Friends page shows “PVP DUEL WINS (TOP 5)” and full list; winner appears there. | Already implemented. |
| R16 | **Post-duel:** Result screen (YOU WIN / YOU LOSE / DRAW), REMATCH and BACK TO LOBBY. Rematch creates a new room (same as today). | Already implemented. |

### 3.4 Fun & Improvements (Recommendations)

| # | Idea | Description |
|---|------|-------------|
| F1 | **Duel from Friends:** Duel button next to invited friends (see 3.1). | Primary ask. |
| F2 | **Play vs Computer:** When no friends, practice vs bot (see 3.2). | Reduces empty state; teaches duel mechanics. |
| F3 | **In-app duel invite:** When creator clicks Duel next to friend, optionally send a push or in-game “pending challenge” so friend sees “X challenged you” when they open the app (e.g. via room link or future notifications). | Improves conversion from invite to duel. |
| F4 | **Sound / haptics:** Tap sound or light haptic on duel click; winner fanfare. | Makes wins more satisfying. |
| F5 | **Duel duration options:** 15s / 30s / 60s when creating room (or vs computer). | Variety and accessibility. |
| F6 | **Streak or “revenge”:** Show “Rematch” prominently; optional “revenge” badge if you lost last time and win the rematch. | Encourages repeat play. |
| F7 | **Badges for PVP:** Bounties/badges like “First duel win”, “5 duel wins”, “Win 3 rematches”. | Ties PVP to progression. |
| F8 | **Leaderboard highlight:** On Friends page, highlight the current user’s row in PVP Duel Wins and Top Clickers. | Visibility and pride. |
| F9 | **Duel history:** “Last 5 duels” with result (W/L) and opponent name. | Context and bragging. |
| F10 | **Fair start:** 3–2–1 countdown when both players are in the duel view before timer starts (optional). | Reduces “they had a head start” feeling. |

---

## 4. Out of Scope (for this PRD)

- Actual on-chain transfer of 1 $CARD from loser to winner (currently noted as “transfer can be added later”).
- Changing Supabase RLS or auth model unless required for “pending challenge” or bot rooms.
- Full realtime (WebSocket) if current poll + optional Supabase Realtime is sufficient.

---

## 5. Acceptance Criteria (Summary)

### Friends → Duel
- [ ] FRIENDS (INVITED) lists each invited friend with a **Duel** button.
- [ ] Clicking Duel creates a room and shows copy-link + “Challenge sent to [FriendName]” (or equivalent).
- [ ] When the friend joins via the shared link, both players are placed in the duel view and game runs (timer, clicks, winner).
- [ ] Winner is recorded on PVP leaderboard after duel ends.

### Play vs Computer
- [ ] When FRIENDS (INVITED) is empty, **Play vs Computer** (or Practice) is available.
- [ ] Play vs Computer runs the same duel UI with a bot opponent (simulated clicks); no stake required.
- [ ] Result screen shows You win / Computer wins; practice wins do not affect main PVP leaderboard (or are clearly separated).

### Gameplay Loop
- [ ] Documented and testable: Start (onboarding, home, PVP, Friends) → Create/Join room → Duel (timer, taps) → End → Winner on leaderboard → Rematch/Lobby.
- [ ] Tests cover: create room, join room, duel clicks, timer end, winner calculation, leaderboard update, rematch.

### Fun
- [ ] At least F1 (Duel from Friends) and F2 (Play vs Computer) implemented; F3–F10 as backlog or follow-up.

---

## 6. Gameplay Loop (Canonical Flow)

```
1. Player opens game
   → Name set (welcome or Wallet → Settings)
   → Optional: connect wallet, 1 $CARD for PVP

2. Home
   → Tap to earn tokens; use Boosts/Bounties

3. PVP entry (one of)
   a) MULTIPLAYER: CREATE ROOM → share link → opponent joins
   b) FRIENDS: click Duel next to invited friend → room created → share link → friend joins
   c) FRIENDS: no friends → Play vs Computer (practice duel)

4. Duel
   → Both in duel view (or player + bot)
   → Timer counts down (e.g. 30s)
   → Each tap adds to that player’s clicks
   → At 0 or END GAME → winner determined (or draw)

5. Result
   → YOU WIN / YOU LOSE / DRAW
   → Winner (if any) gets +1 on PVP leaderboard
   → REMATCH (new room) or BACK TO LOBBY

6. Leaderboard
   → Friends page: PVP DUEL WINS (TOP 5) + full list
   → Winner of last duel appears in list after refresh
```

---

## 7. References

- Current implementation: `index.html` (Friends: `friends-invited-list`, `loadFriendsInvited`; PVP: `createPvpRoom`, `joinPvpRoom`, `enterDuel`, `showDuelResult`, `upsertLeaderboardWin`).
- Supabase: `rooms` (id, status, player1/2_wallet/name, player1/2_clicks, game_ends_at, winner_wallet), `leaderboard` (pvp_wins), `referrals` (inviter_ref_code, invited_name, invited_wallet).
- Test plan: `scripts/PRD-PVP-TESTS.md`.
