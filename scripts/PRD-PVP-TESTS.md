# PVP Tests: Gameplay & Friends → Duel

**Purpose:** Test PVP flow from room create/join through duel, winner, and leaderboard. After implementation, also test Friends → Duel and Play vs Computer.

---

## 1. Scope

| Area | What to test |
|------|----------------|
| **Lobby** | Create room, refresh list, room appears with correct status and COPY LINK / JOIN / ENTER DUEL / CLOSE. |
| **Join** | Open room link in second context (incognito or second device); join as player2; room goes in_progress; both see duel view. |
| **Duel** | Timer counts down; clicks increment for each player; realtime or polled updates; END GAME button. |
| **End & winner** | Timer 0 or END GAME → status finished; winner_wallet set; result screen (YOU WIN / YOU LOSE / DRAW). |
| **Leaderboard** | Winner’s pvp_wins +1; Friends page TOP 5 and full list show winner. |
| **Rematch / Lobby** | REMATCH creates new room; BACK TO LOBBY returns to room list. |
| **Friends → Duel** (when built) | Invited list shows Duel per friend; Duel creates room; share link; friend joins → both in duel. |
| **Play vs Computer** (when built) | When no friends, Play vs Computer available; bot clicks; result; no stake; practice only. |

---

## 2. Prerequisites

- Supabase configured; `rooms` and `leaderboard` (with `pvp_wins`, `player1_name`, `player2_name`, `game_ends_at` etc.) and RPC `increment_pvp_clicks` working.
- Two test identities (e.g. two browsers or one normal + one incognito) with names and, for stake, wallets with ≥1 $CARD (or stub backend so stake check passes).
- Optional: Backend running locally if wallet/swap/withdraw are tested.

---

## 3. Test Cases

### 3.1 Lobby & Create Room

| ID | Step | Expected |
|----|------|----------|
| L1 | Open MULTIPLAYER (PVP). | Lobby shows CREATE ROOM, REFRESH LIST, and room list (or empty). |
| L2 | Enter name (if not set); ensure wallet connected and 1 $CARD (or stub). Click CREATE ROOM. | Room created; status message “Room created! Share the link…”; new room appears in list with player1 name, OPEN, COPY LINK, CLOSE ROOM. |
| L3 | Click COPY LINK. | Room URL (with `?room=<id>` or `#multiplayer` + room id) copied; paste in notepad to use in Join tests. |
| L4 | Click REFRESH LIST. | List updates (same room still visible). |

### 3.2 Join Room (Second Player)

| ID | Step | Expected |
|----|------|----------|
| J1 | In second browser/incognito, open the copied room link. | Game loads; MULTIPLAYER or “You’re invited to a duel” shown; JOIN & PLAY or room card with JOIN available. |
| J2 | Set name and wallet (and 1 $CARD if required). Click JOIN (or JOIN & PLAY). | Join succeeds; room status → in_progress; both clients see duel view (or creator sees “Waiting for opponent” until second joins). |
| J3 | Creator view: after J2. | Duel view appears; timer shows (e.g. 0:30); both player names and 0–0 clicks visible. |

### 3.3 Duel Gameplay

| ID | Step | Expected |
|----|------|----------|
| D1 | Both in duel view. | Timer counts down (e.g. 0:30 → 0:00); two panels (You / Opponent) with click counts. |
| D2 | Player1 taps click button repeatedly. | Your clicks increase; opponent’s stay 0 (or their own on their device). |
| D3 | Player2 taps click button repeatedly. | On player2’s screen their clicks increase; on player1’s screen opponent clicks update (realtime or within ~1s poll). |
| D4 | Wait for timer to reach 0. | Game ends; duel view hides; result screen shows (YOU WIN / YOU LOSE / DRAW). |
| D5 | Alternative: click END GAME before timer 0. | Game ends; backend sets status finished and winner; same result screen. |
| D6 | Check result text. | Winner sees “YOU WIN!” and message about leaderboard; loser sees “YOU LOSE” and opponent name; tie shows “DRAW”. |

### 3.4 Leaderboard

| ID | Step | Expected |
|----|------|----------|
| LB1 | After a duel where player1 wins. | Friends page → PVP DUEL WINS (TOP 5): player1’s name has +1 win (or appears in list with 1 win). |
| LB2 | Open “full list” or scroll. | Winner appears in PVP leaderboard with correct win count. |
| LB3 | Play second duel; player2 wins. | Player2’s pvp_wins increase; TOP 5 updates. |

### 3.5 Rematch & Lobby

| ID | Step | Expected |
|----|------|----------|
| R1 | On result screen, click REMATCH. | New room created; creator in duel view; can share new link; opponent can join again. |
| R2 | On result screen, click BACK TO LOBBY. | Duel view and result hidden; lobby shows CREATE ROOM and room list. |
| R3 | Creator closes room (CLOSE ROOM) from list. | Room status → finished; no longer joinable; list refreshes. |

### 3.6 Edge Cases & Errors

| ID | Step | Expected |
|----|------|----------|
| E1 | Try JOIN on same room from a third tab (same or different user). | Error: room full or game already started. |
| E2 | Try JOIN as same wallet as creator (same room). | Error: “You already created this room…” (or equivalent). |
| E3 | Create room, do not join with second player; click ENTER DUEL as creator. | Allowed; duel view shows “Waiting for opponent”; timer may not start until player2 joins (per current logic). |
| E4 | Open an expired or finished room link. | No crash; message that room is full/finished or “Room not found.” |

---

## 4. Friends → Duel (When Implemented)

| ID | Step | Expected |
|----|------|----------|
| FD1 | Have at least one row in FRIENDS (INVITED) (use invite link once from another identity). | List shows friend name and a **Duel** button. |
| FD2 | Click **Duel** next to that friend. | Room is created; copy-link and “Challenge sent to [FriendName]” (or similar) shown; MULTIPLAYER may open with this room. |
| FD3 | As the invited friend, open the shared room link. | Can join as player2; both enter duel view; game runs as in 3.3. |
| FD4 | Complete duel; winner. | Winner appears on PVP leaderboard as in 3.4. |

---

## 5. Play vs Computer (When Implemented)

| ID | Step | Expected |
|----|------|----------|
| B1 | Clear or use account with no invited friends. FRIENDS (INVITED) empty. | **Play vs Computer** (or Practice) option visible. |
| B2 | Click Play vs Computer. | No wallet/stake required (or practice mode); “room” starts with bot as opponent. |
| B3 | Duel view: tap to score; bot’s clicks increase over time. | Timer and both scores visible; game ends at 0 or END GAME. |
| B4 | Result: player wins. | “You win!”; practice win not added to main PVP leaderboard (or in separate “Practice” section). |
| B5 | Result: bot wins. | “Computer wins!”; option to Play again. |

---

## 6. Manual Test Run Checklist (High Level)

- [ ] Create room (L1–L4).
- [ ] Join from second context (J1–J3).
- [ ] Play duel; verify clicks and timer (D1–D3).
- [ ] Finish by timer or END GAME (D4–D6).
- [ ] Verify winner on Friends → PVP DUEL WINS (LB1–LB3).
- [ ] Rematch and Back to Lobby (R1–R3).
- [ ] Edge cases: double join, same user join, finished room (E1–E4).
- [ ] (After implementation) Friends → Duel (FD1–FD4).
- [ ] (After implementation) Play vs Computer (B1–B5).

---

## 7. Automation Notes

- **E2E (e.g. Playwright):** Can automate: open app → set name (localStorage or form) → MULTIPLAYER → CREATE ROOM → copy room URL → second browser context opens URL → JOIN → both contexts tap duel button in loop → assert timer and scores → assert result screen and winner. Requires test Supabase and optional stub for wallet/stake.
- **Unit:** If duel logic (winner calculation, timer) is extracted to a module, add unit tests for winner (p1 > p2, p2 > p1, tie) and timer boundaries.
- **API:** If backend exposes create/join/end duel, test with HTTP client (create room, join room, increment clicks, end game, then query leaderboard).

---

## 8. References

- PRD: `scripts/PRD-PVP-FRIENDS-AND-GAMEPLAY.md`
- Implementation: `index.html` (PVP and Friends sections); Supabase `rooms`, `leaderboard`, RPC `increment_pvp_clicks`.
