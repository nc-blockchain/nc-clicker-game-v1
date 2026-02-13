# PRD: PVP Invite Banner Redesign

## Overview
Redesign the PVP invite banner so it appears at the top of Boosts, Bounties, and Wallet pages—without overlaying content—and only when there is an active duel invite from a friend. Hide when no active duels exist.

## Requirements

### 1. Placement
- **Location**: Top of Boosts, Bounties, and Wallet pages only (not Home, Friends, or Multiplayer)
- **Layout**: In document flow—does NOT overlay content; pushes page content down
- **Visibility**: Only on those three pages when user navigates to them

### 2. Conditional Visibility
- **Show when**: User has an active duel invite (room exists, status is `open` or `in_progress`, user is invited to join)
- **Hide when**:
  - No room ID stored (no invite)
  - Room is finished or closed
  - Room not found in Supabase
  - User already joined the duel
  - User is on Home, Friends, or Multiplayer (banner not used on those pages)

### 3. No Overlay
- Banner must be inline (first block) at top of page content
- No `position: fixed` or `position: absolute` that would overlay other elements
- Content flows naturally below the banner

### 4. Banner Content (unchanged)
- "GAME ABOUT TO START"
- "You're invited! Tap to join the duel."
- "JOIN NOW" button → navigates to Multiplayer and triggers join flow

## Technical Approach

1. **Duplicate banner markup** into each of `page-boosts`, `page-bounties`, `page-wallet` as first child
2. **Remove** the global fixed banner from outside main content
3. **Add `checkActiveDuelInvite(roomId)`**: Fetch room from Supabase; return true if status is `open` or `in_progress` and user is not already player2
4. **Update `updatePvpInviteBanner()`**:
   - Get roomId from getPvpInvitedRoomId()
   - If no roomId → hide all banners, clear state
   - If roomId → call checkActiveDuelInvite(roomId); if false → hide all, optionally clear stored room
   - If active → show banner only in the currently active page (boosts, bounties, or wallet)
5. **Event delegation** for JOIN NOW since banners are duplicated—use class + closest

## Tasks

- [x] Create PRD document
- [x] Add inline banner to top of page-boosts
- [x] Add inline banner to top of page-bounties  
- [x] Add inline banner to top of page-wallet
- [x] Remove fixed overlay banner
- [x] Implement checkActiveDuelInvite(roomId) with Supabase fetch
- [x] Update updatePvpInviteBanner() for inline + conditional logic
- [x] Wire JOIN NOW via class selector (pvp-invite-banner-join-btn)
- [x] Clear invite when room is finished/not found
- [x] Test: no banner when no room
- [x] Test: no banner when room finished/not found (fake room ID)
- [x] Test: banner shows at top of Boosts/Bounties/Wallet when active invite (requires real open room)
- [x] Test: banner does not overlay content (inline, document flow)

## Dev Testing
- **?test_invite=1** – Add to URL with `?room=<roomId>` to bypass "am I in room" check and preview the banner as an invited user (e.g. `?room=xxx&test_invite=1#boosts`).
