# Short-Term Task List – Unfinished PRD Items

**Source PRDs:** PRD-GAME-CLEANUP-AND-FEATURES.md, prd.txt, PRD-BUGS-AND-PLAYABILITY.md, PRD-PVP-COUNTDOWN-TOKEN-WAGERS.md

**Status:** Execute in order. Mark complete and test after each section.

---

## Section 1: Bug Fixes & Cleanup

| # | Task | Source | Test |
|---|------|--------|------|
| 1.1 | Verify bounty claim persistence: `save()` runs on all claim paths | GAME-CLEANUP §1.1 | Claim bounty → refresh → state persists |
| 1.2 | Notifications: push bounty claims to notification center | GAME-CLEANUP §1.1 | Claim bounty → open bell → see "Bounty claimed: +X tokens" |
| 1.3 | Notifications: push PVP results to notification center | GAME-CLEANUP §1.1 | Win/lose duel → open bell → see result |
| 1.4 | Room list: show only open + in_progress + recent finished (30 min) | GAME-CLEANUP §1.1 | Lobby shows correct rooms; old finished hidden |
| 1.5 | Room lifecycle: auto-close stale open rooms (e.g. 5 min) | GAME-CLEANUP §1.1 | Server/cron or client filter; stale rooms excluded |
| 1.6 | Room lifecycle: mark in_progress past `game_ends_at` as finished | GAME-CLEANUP §1.1 | Stale in_progress rooms auto-finished |
| 1.7 | Remove dead code: `loadPvpFullList` unused refs (or keep if modal uses it) | GAME-CLEANUP §1.2 | No errors; modal works |
| 1.8 | Ensure PVP/Friends mutations call reload | GAME-CLEANUP §1.2 | Join room, add friend → lists refresh |

---

## Section 2: Economy & UI Copy

| # | Task | Source | Test |
|---|------|--------|------|
| 2.1 | PVP copy: all "need X to play" = tokens; no $CARD for playing | GAME-CLEANUP §2.1 | No $CARD mention in PVP flow |
| 2.2 | Multiplayer: show "Wager: X tokens" and "You have Y tokens" | GAME-CLEANUP §2.1 | Room cards + create room show tokens |
| 2.3 | Wallet: add "Use tokens for Boosts and PVP wagers" (optional) | GAME-CLEANUP §2.2 | Copy present if implemented |
| 2.4 | Bottom nav: left-aligned (justify-content: flex-start) | GAME-CLEANUP §3.1 | Nav items left-aligned on small screens |

---

## Section 3: Badges – 7-Day & 30-Day Streak

| # | Task | Source | Test |
|---|------|--------|------|
| 3.1 | Add streak logic: track consecutive days with activity | GAME-CLEANUP §2.3 | `lastDate`, `streakDays` in state |
| 3.2 | Persist streak in localStorage; reset if day skipped | GAME-CLEANUP §2.3 | 7-day streak persists; skip day → reset |
| 3.3 | Badge: 7-day streak – unlock at 7 consecutive days | GAME-CLEANUP §2.3 | Badge 8 (7-Day Streak) unlocks |
| 3.4 | Badge: 30-day streak – add if not exists; unlock at 30 days | GAME-CLEANUP §2.3 | New badge or extend existing |
| 3.5 | UX: unlocked badges full opacity; locked 50% | GAME-CLEANUP §2.3 | Badges reflect state |

---

## Section 4: Settings (Sound, Haptics, Reduced Motion)

| # | Task | Source | Test |
|---|------|--------|------|
| 4.1 | Settings: Sound On/Off toggle; localStorage | GAME-CLEANUP §3.2 | Toggle persists; sound plays when On |
| 4.2 | Settings: Haptics On/Off (mobile); localStorage | GAME-CLEANUP §3.2 | Vibration on tap when On (if supported) |
| 4.3 | Settings: Reduced motion – shorten/disable feather animation | GAME-CLEANUP §3.2, §6.3 | Feathers disabled or shortened when On |

---

## Section 5: Friend Request Flow

| # | Task | Source | Test |
|---|------|--------|------|
| 5.1 | Supabase: create `friend_requests` table (from_wallet, to_wallet, status, created_at) | GAME-CLEANUP §4.1 | Migration runs |
| 5.2 | Add by code: send friend request instead of direct add | GAME-CLEANUP §4.3 | A adds B's code → B sees request |
| 5.3 | Receiver: "Friend request from [name]" in notification center | GAME-CLEANUP §4.1, §4.4 | B gets notification |
| 5.4 | Receiver: Accept/Reject in Friends or Notifications | GAME-CLEANUP §4.2 | Accept → both in friends list |
| 5.5 | On Accept: insert into friends; notify sender (optional) | GAME-CLEANUP §4.2 | Both see each other |
| 5.6 | On Reject: mark rejected; no friend row | GAME-CLEANUP §4.2 | Reject → no add |

---

## Section 6: PVP Rematch Window

| # | Task | Source | Test |
|---|------|--------|------|
| 6.1 | Rematch: 60s window after duel ends; show countdown | GAME-CLEANUP §5.1 | "Rematch — 45s" countdown visible |
| 6.2 | Both click REMATCH within 60s: reuse room, reset clicks, new game | GAME-CLEANUP §5.1 | Rematch starts; no new wager |
| 6.3 | Rematch stake: same stake, no extra cost (Option A) | GAME-CLEANUP §5.3 | No second deduction |
| 6.4 | No rematch in 60s: room closed; hide from lobby | GAME-CLEANUP §5.2 | Finished rooms past 60s not shown |
| 6.5 | Copy: "If no rematch in 60s, this room will close." | GAME-CLEANUP §5.2 | Message on result screen |

---

## Section 7: PVP Tap Feedback & Animations

| # | Task | Source | Test |
|---|------|--------|------|
| 7.1 | PVP duel: tap feedback (scale/pulse or +1 float) | GAME-CLEANUP §6.2 | Tap shows feedback |
| 7.2 | PVP duel: feathers during taps if setting On (optional) | GAME-CLEANUP §6.2 | Feathers in duel when On |
| 7.3 | Countdown: optional glow on "GO!" | GAME-CLEANUP §6.2 | GO! has emphasis |

---

## Section 8: Bounties Layout (prd.txt)

| # | Task | Source | Test |
|---|------|--------|------|
| 8.1 | TO CLAIM: gray panels (bg-pixel-panel, border-2 border-gray-700) like Boosts | prd.txt §3 | Bounties match Boosts style |
| 8.2 | MY CLAIMED: colored square bird cards in grid | prd.txt §4 | Cards in grid; colored by type |
| 8.3 | Remove profile block from Friends (name in Wallet only) | prd.txt §2 | No name/CHANGE NAME on Friends |

---

## Section 9: Notifications Enhancements

| # | Task | Source | Test |
|---|------|--------|------|
| 9.1 | PVP win: push "You won the duel!" to notification center | BUGS-PLAYABILITY §2.4 | Win duel → bell shows entry |
| 9.2 | PVP lose: push "You lost the duel." (optional) | BUGS-PLAYABILITY §2.4 | Lose → optional entry |

---

## Section 10: Full Test Pass

| # | Task | Source | Test |
|---|------|--------|------|
| 10.1 | Splash: START TAPPING; app loads | BUGS-PLAYABILITY §3 | ✓ |
| 10.2 | Home: tap, stats update, feathers, cooldown | BUGS-PLAYABILITY §3 | ✓ |
| 10.3 | Boosts: buy, balance, persistence | BUGS-PLAYABILITY §3 | ✓ |
| 10.4 | Bounties: TO CLAIM, MY CLAIMED, claim, notification | BUGS-PLAYABILITY §3 | ✓ |
| 10.5 | Friends: PVP list, invite link, add by code | BUGS-PLAYABILITY §3 | ✓ |
| 10.6 | Wallet: Settings, name, Feather toggle | BUGS-PLAYABILITY §3 | ✓ |
| 10.7 | Notifications: bell, activity list, entries | BUGS-PLAYABILITY §3 | ✓ |
| 10.8 | PVP: create → share → join → play → result → rematch | GAME-CLEANUP §1.3 | ✓ |
| 10.9 | Navigation: all pages, state consistent | BUGS-PLAYABILITY §3 | ✓ |

---

## Dependencies

- **5.x (Friend request):** Needs Supabase migration for `friend_requests`
- **6.x (Rematch):** Uses existing `rematch_until`; verify 006_rooms_rematch migration
- **8.1–8.2 (Bounties):** UI-only; no backend

---

## Completion Log

| Section | Done | Notes |
|---------|------|-------|
| 1 | ✓ | Bounty persist, notifications, room lifecycle, dead code |
| 2 | ✓ | PVP copy, tokens, bottom nav |
| 3 | ✓ | 7-day & 30-day streak badges |
| 4 | ✓ | Settings: sound, haptics, reduced motion |
| 5 | ✓ | Friend request flow (run migration 011) |
| 6 | ✓ | Rematch 60s |
| 7 | ✓ | PVP tap feedback, GO! glow, +1 float |
| 8 | ✓ | Bounties layout (gray panels, bird cards) |
| 9 | ✓ | PVP notifications |
| 10 | ✓ | Manual full test pass – Home tap, Boosts 60s, Bounties, Nav OK |

---

## Section 11: Wallet Polish (PRD-IN-GAME-WALLET)

| # | Task | Source | Test |
|---|------|--------|------|
| 11.1 | Swap preview: "You get ~X tokens" when amount entered | §5 | Enter amount → see preview |
| 11.2 | Withdraw Max button | §5 | MAX fills current balance |
| 11.3 | Connection status in Settings | §5 | Settings shows Connected/Not connected |

| Section | Done | Notes |
|---------|------|-------|
| 11 | ✓ | Swap preview, Max btn, connection status |

---

## Section 12: UX Polish (Invite, Wallet, Errors)

| # | Task | Source | Test |
|---|------|--------|------|
| 12.1 | Need help link opens Settings modal | PRD-IN-GAME-WALLET §3.5 | Tap "Open SETTINGS" → modal opens |
| 12.2 | Read ref from URL hash (invite links) | PRD-INVITE R2 | `#ref=CODE` or `#path?ref=CODE` → ref stored |
| 12.3 | Swap error: show $CARD balance when "Not enough" | PRD-IN-GAME-WALLET §3.3 | Swap error includes balance |
| 12.4 | Wallet: "Use tokens for Boosts and PVP" copy | GAME-CLEANUP §2.2 | Copy under IN-GAME balance |

| Section | Done | Notes |
|---------|------|-------|
| 12 | ✓ | Need help btn, ref from hash, swap error, wallet copy |

---

## Section 13: Temporary Buffs & High Roller Bounties (User Request)

| # | Task | Test |
|---|------|------|
| 13.1 | Autoclicker & power buffs: 60s time limit, rebuy to extend | Boosts last 60s; countdown on button & Home |
| 13.2 | Buff countdown display on Home (below stats bar) | Active buffs show "Tap 2x: 45s · AC: 30s" etc. |
| 13.3 | High Roller bounties: token balance 500–50k | Bounties page → High Roller section with 7 tiers |

| Section | Done | Notes |
|---------|------|-------|
| 13 | ✓ | 60s buffs, countdown UI, High Roller (500–50k tokens) |

---

## Section 14: Next Milestone (PRD-BUGS-AND-PLAYABILITY §2.2)

| # | Task | Test |
|---|------|------|
| 14.1 | Home: "Next token in X taps" line below stats | Shows taps until next token from tapping |

| Section | Done | Notes |
|---------|------|-------|
| 14 | ✓ | Next milestone line on Home |

---

## Section 15: Optional Polish (PRD-BUGS-AND-PLAYABILITY)

| # | Task | Source | Test |
|---|------|--------|------|
| 15.1 | Hide bounty category when all bounties claimed | §1.3 | Category collapses when all claimed |
| 15.2 | First bounty claim: "Check the 🔔 for activity" hint | §2.1 | One-time push to notification center |
| 15.3 | aria-live for token count (accessibility) | §2.6 | Screen readers announce token updates |

| Section | Done | Notes |
|---------|------|-------|
| 15 | ✓ | Category hide, first-claim hint, aria-live |
