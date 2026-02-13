# PRD: Next Steps – Polish & UX

**Purpose:** Polish the game with high-impact, low-risk improvements: Supabase fallback messaging, Friends page layout, Multiplayer nav access, and onboarding clarity.

**Priority:** Execute in order 1 → 2 → 3 → 4.

---

## 1. Supabase Fallback Messaging

When `window.supabaseClient` is null (no config, or config failed), show clear user-facing messages instead of developer-centric copy.

| Location | Current | New |
|----------|---------|-----|
| PVP wins list (Multiplayer) | "Leaderboard unavailable. Add Supabase in supabase-config.js." | "Leaderboard unavailable." |
| Friends invited list | "Friends unavailable. Add Supabase in supabase-config.js." | "Friends unavailable." |
| Friends added list | Same | Same |
| Friends page – Top Clickers | Uses localStorage fallback (Alpha, Beta, You) – no change | Keep; already works offline |

**Tasks:**
- [x] Update `loadLeaderboardPvp()` fallback message
- [x] Update `loadFriendsInvited()` fallback message  
- [x] Update `loadFriendsAddedByCode()` fallback message

---

## 2. Friends Page Layout

Per `prd.txt`: Move PVP Duel Wins to top of Friends page; add "VIEW FULL LIST" button.

| # | Requirement |
|---|-------------|
| R1 | Move **PVP Duel Wins** block to the **top** of the Friends page (above Top Clickers) |
| R2 | Add a **VIEW FULL LIST** button that opens a modal/popup with the full PVP leaderboard (top 100) |

**Current:** Friends page has Top Clickers first, then Friends Invited, then Add by Code. PVP Duel Wins is only on the Multiplayer page.

**Change:** Add PVP Duel Wins block at top of Friends page (same content as Multiplayer page). Add VIEW FULL LIST button alongside it.

**Tasks:**
- [x] Add PVP Duel Wins block at top of Friends page (copy structure from Multiplayer)
- [x] Add VIEW FULL LIST button
- [x] Create modal/popup for full PVP list (reuse `loadPvpFullList` logic)
- [x] Wire `loadLeaderboardPvp` when Friends page is shown

---

## 3. Multiplayer Access from Bottom Nav

**Current:** Bottom nav has HOME, BOOSTS, BOUNTIES, FRIENDS, WALLET. PVP is only via header link.

**Change:** Add MULTIPLAYER (or PVP) to the bottom nav so users can reach it from any page.

**Tasks:**
- [x] Add PVP/Multiplayer link to bottom nav
- [x] Ensure it routes to `#multiplayer` and shows the multiplayer page

---

## 4. Room Link in Duel Waiting State

**Current:** When waiting for opponent, there's a "Share the room link" text and `pvp-duel-room-link` element.

**Change:** Ensure the room link is visible and copyable when waiting. Add a "COPY" button next to it for quick copy.

**Tasks:**
- [x] Verify room link is populated when waiting
- [x] Add COPY button next to room link for one-tap copy

---

## 5. Out of Scope (for later)

- Friend request flow (request/accept)
- New bounties or boosts
- Sound / haptics settings
- Backend schema changes

---

## Acceptance Criteria

- [x] Supabase null: "Leaderboard unavailable." / "Friends unavailable." (no dev config mention)
- [x] Friends page: PVP Duel Wins at top; VIEW FULL LIST opens modal with full list
- [x] Bottom nav: PVP/Multiplayer link present
- [x] Duel waiting: Room link visible and copyable when waiting for opponent

---

## References

- `loadLeaderboardPvp`, `loadFriendsInvited`, `loadFriendsAddedByCode` in index.html
- `loadPvpFullList` – full PVP list (needs modal target)
- Friends page: `#page-friends`
- Multiplayer page: `#page-multiplayer`
