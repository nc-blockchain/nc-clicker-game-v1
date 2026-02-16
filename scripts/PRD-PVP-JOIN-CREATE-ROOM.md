# PRD: PVP Join & Create Room

**Purpose:** Define and test the PVP flow for creating a duel room and joining via link or open rooms list. Scope is the join/create experience and its acceptance criteria for automated tests.

---

## 1. Overview

- **Create room:** Player opens Multiplayer → CREATE ROOM (or DUEL from friend row) → chooses wager → CREATE ROOM → room is created; share link is shown.
- **Join room:** Opponent can join in two ways:
  1. **Via link:** Open URL with `?room=<roomId>`. App shows "YOU'RE INVITED TO A DUEL" and JOIN & PLAY. After joining, both see duel view.
  2. **Via open rooms list:** Multiplayer shows "OPEN ROOMS — tap to join". Tapping a room calls join; if accepted, both see duel view.

This PRD and the associated E2E tests validate that the UI and flows for join and create work as specified.

---

## 2. User Flows

### 2.1 Create room (creator)

| Step | Action | Expected result |
|------|--------|-----------------|
| 1 | Open app → Multiplayer | Multiplayer page visible; CREATE ROOM button and OPEN ROOMS section present. |
| 2 | Click CREATE ROOM | Create-room modal opens: title "CREATE NEW ROOM", wager options (e.g. 2, 5, 7, 10), custom input, CREATE ROOM and CANCEL buttons. |
| 3 | Select a wager (e.g. 5) | Wager selected; CREATE ROOM button enabled. |
| 4 | Click CREATE ROOM (with valid name & balance) | Room created; modal closes; status/UI shows share link or "Room created"; duel lobby/waiting view can appear. |
| 5 | (Optional) Copy share link | Link format: `.../?room=<roomId>`. |

### 2.2 Join via link (invitee)

| Step | Action | Expected result |
|------|--------|-----------------|
| 1 | Open URL with `?room=<roomId>` | App loads; if on Multiplayer (or when navigated there), "YOU'RE INVITED TO A DUEL" card is visible with JOIN & PLAY button. |
| 2 | Click JOIN & PLAY | Join flow runs (name/balance checks as implemented); on success, duel view or lobby is shown. |

### 2.3 Join via open rooms list

| Step | Action | Expected result |
|------|--------|-----------------|
| 1 | Open Multiplayer | "OPEN ROOMS — tap to join" and a list (or empty state) is visible. |
| 2 | Tap a room card (if any) | Join is triggered for that room; on success, duel view or lobby is shown. |

---

## 3. Acceptance criteria (for tests)

- **AC1** Multiplayer page shows CREATE ROOM button and OPEN ROOMS section (or "OPEN ROOMS — tap to join").
- **AC2** Clicking CREATE ROOM opens the create-room modal with:
  - Title containing "CREATE NEW ROOM" or "CREATE".
  - At least one wager option (e.g. 5 tokens).
  - A CREATE ROOM submit button and a way to cancel (e.g. CANCEL or close).
- **AC3** With a wager selected, CREATE ROOM button is enabled (or becomes enabled after selection).
- **AC4** When the URL contains `?room=<id>`, the invite card "YOU'RE INVITED TO A DUEL" and a JOIN & PLAY (or equivalent) button are present and visible when the user is on the Multiplayer/join context.
- **AC5** Open rooms list is present and shows room entries or an empty state; room entries are tappable to join (implementation detail: join handler attached).

---

## 4. Out of scope for this PRD

- Full duel gameplay (timer, clicks, winner) — covered by other PRDs.
- Backend room lifecycle (Supabase schema) — assumed existing.
- Play vs Computer / Training Room — separate flow.

---

## 5. Test plan

- **E2E (Playwright):** See `tests/pvp-join-create-room.spec.js`.
  - Create: Multiplayer visible; CREATE ROOM opens modal; modal has wager and CREATE ROOM button.
  - Join: Visit `/#multiplayer?room=<fake-id>` (or with hash handling); invite card and JOIN & PLAY visible (join may fail against backend; test only UI presence).
- **Manual:** Create room → copy link → open in second browser/incognito → JOIN & PLAY → both in duel (and optionally run through one full race).

---

## 6. References

- In-app: Multiplayer tab, `#pvp-open-create-room-btn`, `#pvp-create-room-modal`, `#pvp-invited-card`, `#pvp-invited-join-btn`, `#pvp-rooms-list`.
- PRD: PVP Friends, Duel Flow & Full Gameplay Loop (`PRD-PVP-FRIENDS-AND-GAMEPLAY.md`).
