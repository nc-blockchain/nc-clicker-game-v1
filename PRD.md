# Product Requirements Document: 1N Token Clicker PVP Duel

## Overview

1N Token Clicker is a browser-based clicker game with a **1v1 PVP duel** mode. Players stake 1 $CARD to enter a room; they race to click the most in 30 seconds. The winner is added to the leaderboard; the loser loses their stake. Gameplay is inspired by real-time click-racing games (e.g. ClickRacer.io, Space Bar Clicker multiplayer).

---

## Competitor Reference (Best Opponent Clicker Games)

| Game | Mechanics we emulate |
|------|----------------------|
| **ClickRacer.io** | 1v1 click race, timed round, live score, leaderboards (daily/weekly/all-time). |
| **Space Bar Clicker** | Real-time PvP, live CPS (clicks per second), direct challenge via link. |
| **Click Battle (TinyPlay)** | Simple 2-player click duel. |
| **TimerBattle / reaction games** | Clear start/end, single round, rematch option. |

**Core patterns we follow:**
- **Real-time competition**: Both players click at the same time; scores update live.
- **Fixed time round**: 30-second duel (industry common: 30–60s).
- **Highest clicks wins**: No power-ups during duel; pure click count.
- **Invite by link**: Share room link; only one opponent can join (room locks at 2 players).
- **Quick rematch**: After result, one-tap rematch or back to lobby.
- **Leaderboard**: Winners tracked (we use PVP wins).

---

## User Flows & Requirements Checklist

### 1. Onboarding (first-time / from invite)

| Step | Requirement | Status |
|------|-------------|--------|
| 1.1 | User opens game (or play.html?room=XXX). | ✅ |
| 1.2 | If URL has `?room=`, show “You’re invited to a duel” card and/or onboarding. | ✅ |
| 1.3 | User must enter **name** (stored in localStorage). | ✅ |
| 1.4 | User must **connect TON wallet** (Wallet tab). | ✅ |
| 1.5 | User must have **≥ 1 $CARD** to create or join a duel (stake). | ✅ |
| 1.6 | “Save & continue” closes modal and continues to lobby/invite. | ✅ |

### 2. Lobby & Rooms

| Step | Requirement | Status |
|------|-------------|--------|
| 2.1 | **Create room**: Name + wallet + 1 $CARD required. Room created with status `open`. | ✅ |
| 2.2 | **Share link**: Room link uses play.html?room=UUID. Copy link button works. | ✅ |
| 2.3 | **Only one opponent can join**: Room is open only while status=open and player2 is null. | ✅ |
| 2.4 | **Opponent cannot enter** once game started: Join allowed only when status=open and no player2. | ✅ |
| 2.5 | **Close room**: Creator can “Close room” on their open room (no second player yet). | ✅ |
| 2.6 | **Auto-close**: Open rooms with no join after 1 minute are set to finished when lobby is loaded. | ✅ |
| 2.7 | **Clear pending games**: Admin can run CLEAR-PENDING-GAMES.sql to set all open/in_progress to finished. | ✅ |
| 2.8 | Clicking a room card or JOIN joins (with validation). Clicking ENTER DUEL opens duel view. | ✅ |

### 3. Join Flow (Opponent)

| Step | Requirement | Status |
|------|-------------|--------|
| 3.1 | Opponent opens play.html?room=XXX (or index?room=XXX). | ✅ |
| 3.2 | Onboarding if no name / no wallet / &lt; 1 $CARD. | ✅ |
| 3.3 | **Join validation**: If room is not open or already has 2 players, show “Room is full or game already started. No other players can enter.” | ✅ |
| 3.4 | On success: room updated to in_progress, game_ends_at = now + 30s, player2 set; both enter duel view. | ✅ |

### 4. Duel (In-Game)

| Step | Requirement | Status |
|------|-------------|--------|
| 4.1 | **Side-by-side view**: You (left) vs Opponent (right) with names and live click counts. | ✅ |
| 4.2 | **Real-time clicks**: Your clicks sent via increment_pvp_clicks RPC; opponent count updated via polling (and Realtime if enabled). | ✅ |
| 4.3 | **30-second timer**: Countdown shown; when 0, game ends. | ✅ |
| 4.4 | **End game button**: Either player can click “End game” to end the round early; winner = higher clicks at that time. | ✅ |
| 4.5 | **Click cooldown**: 200ms between clicks to avoid spam. | ✅ |
| 4.6 | Only the two players in the room can be in the duel (no third player can join). | ✅ |

### 5. End of Game & Winner

| Step | Requirement | Status |
|------|-------------|--------|
| 5.1 | When time runs out or “End game”: room status = finished, winner_wallet = player with more clicks (or null if draw). | ✅ |
| 5.2 | **Leaderboard**: Winner upserted to leaderboard (pvp_wins incremented). | ✅ |
| 5.3 | Result screen: “YOU WIN!”, “YOU LOSE”, or “DRAW” with short copy (e.g. loser loses 1 $CARD stake). | ✅ |
| 5.4 | **Rematch**: Button creates a new room (same flow as Create room). | ✅ |
| 5.5 | **Back to lobby**: Returns to room list; duel view and result hidden. | ✅ |

### 6. Technical & Data

| Step | Requirement | Status |
|------|-------------|--------|
| 6.1 | Supabase: rooms (with duel columns), leaderboard (pvp_wins), increment_pvp_clicks(room_id, player_num). | ✅ |
| 6.2 | RUN-IN-SUPABASE.sql run in existing project (no new Supabase needed). | ✅ |
| 6.3 | CLEAR-PENDING-GAMES.sql available to set all pending rooms to finished. | ✅ |
| 6.4 | Play page: play.html redirects to index.html#multiplayer (and keeps ?room=). | ✅ |

---

## Out of Scope (Current Version)

- **On-chain stake transfer**: Loser’s 1 $CARD to winner (backend/contract); currently described in UI only.
- **CPS display**: Clicks-per-second during duel (optional enhancement).
- **Daily/weekly leaderboard**: Only all-time PVP wins for now.
- **Spectators**: Only 2 players per room; no watch-only mode.

---

## Summary

All steps above are implemented. The game supports: onboarding (name, wallet, 1 $CARD), create/join with validation so only one opponent can enter, side-by-side real-time duel, 30s timer, End game button, winner to leaderboard, rematch and back to lobby, auto-close and clear pending games. Deploy to GitHub Pages for play online.
