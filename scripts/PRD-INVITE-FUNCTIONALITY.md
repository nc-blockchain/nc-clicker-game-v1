# PRD: Invite Functionality

**Purpose:** Define how the invite (referral) flow works end-to-end so that when a user clicks a friend’s invite link, the invite is accepted and the friend appears on the inviter’s list. Include fixes and tests so the flow is reliable in the browser.

---

## 1. Overview

- **Inviter** shares a link that includes their referral code (e.g. `?ref=REFCODE`).
- **Invited user** opens the link → ref is stored → they enter a display name (if needed) → a referral row is created → they appear in the inviter’s **FRIENDS (INVITED)** list.
- **Accept** = opening the link and completing the flow (setting name so the referral can be registered).

---

## 2. Flow (Canonical)

| Step | Who | What |
|------|-----|------|
| 1 | Inviter | Copies invite link (Friends → COPY INVITE LINK). Link = `{origin}{path}/?ref={refCode}`. |
| 2 | Inviter | Shares link (messaging, etc.). |
| 3 | Invited | Opens link in browser. |
| 4 | App (load) | Reads `ref` from URL (`?ref=...` or from hash if present). Saves to `localStorage.tokenClicker_invitedBy`. |
| 5a | App | If invited and **no display name**: show welcome modal with “You were invited! Enter your display name to accept and join.” |
| 5b | App | If invited and **already has display name**: call `registerReferralIfNeeded(name)` once on load so referral is registered without opening Settings. |
| 6 | Invited | Enters name in welcome modal (or already had name in 5b) and saves. |
| 7 | App | On name save: `setPlayerName(name)` → `registerReferralIfNeeded(name)` → insert into `referrals` (inviter_ref_code, invited_name, invited_wallet). Clear `tokenClicker_invitedBy`. |
| 8 | Inviter | On next load of Friends page: **FRIENDS (INVITED)** list includes the new friend (from `referrals` where inviter_ref_code = my code). |

---

## 3. Requirements

### 3.1 Reading the ref from the URL

| ID | Requirement | Notes |
|----|-------------|--------|
| R1 | On page load, read `ref` from the **query string** (`window.location.search`). | Standard: `https://site.com/?ref=REFCODE`. |
| R2 | If `ref` is not in the query string, optionally read from the **hash** (e.g. `#ref=REFCODE` or `#path?ref=REFCODE`). | Handles odd redirects or share flows that put params in the hash. |
| R3 | When `ref` is present, store it in `localStorage` as `tokenClicker_invitedBy` so it survives navigation and is available when the user sets their name. | Already done; ensure it runs before any logic that uses it. |

### 3.2 Prompting for name when invited (no name yet)

| ID | Requirement | Notes |
|----|-------------|--------|
| R4 | If `tokenClicker_invitedBy` is set and the user has **no** display name, show the **welcome name modal** so they must enter a name to continue. | Ensures new users who click an invite link are prompted and thus register the referral when they save. |
| R5 | The welcome modal copy when shown for an invite should say something like: “You were invited! Enter your display name to accept and join.” | Makes it clear the link was an invite and that entering a name “accepts”. |

### 3.3 Registering the referral

| ID | Requirement | Notes |
|----|-------------|--------|
| R6 | When the user **sets or saves** their display name and `tokenClicker_invitedBy` is set, call `registerReferralIfNeeded(name)`. | Already in `setPlayerName()`. |
| R7 | When the user **already has** a display name and lands with a ref (invitedBy set on load), call `registerReferralIfNeeded(getPlayerName())` **once on load** so the referral is registered without requiring them to open Wallet → Settings. | Fix for “invite not accepting” when the user already had a name. |
| R8 | `registerReferralIfNeeded`: insert into Supabase `referrals` (inviter_ref_code, invited_name, invited_wallet). Then clear `tokenClicker_invitedBy`. | Backend must allow insert; table must exist. |

### 3.4 Inviter sees the friend

| ID | Requirement | Notes |
|----|-------------|--------|
| R9 | **FRIENDS (INVITED)** is loaded from `referrals` where `inviter_ref_code` = current user’s ref code. | Already: `loadFriendsInvited()`. |
| R10 | When the invited user is registered, the inviter sees them on the next load (or refresh) of the Friends page. | No change; ensure referral insert succeeds. |

---

## 4. Failure Modes and Fixes

| Problem | Cause | Fix |
|--------|--------|-----|
| “Invite not accepting” | Ref not read from URL (e.g. only checking search, not hash). | Read ref from both `location.search` and `location.hash` (R1–R2). |
| “Invite not accepting” | User never prompted for name (welcome modal not shown). | When invited and no name, show welcome modal (R4–R5). |
| “Invite not accepting” | User already had a name; they never open Settings so `setPlayerName` (and thus `registerReferralIfNeeded`) never runs. | On load, if invited and have name, call `registerReferralIfNeeded(getPlayerName())` (R7). |
| Ref lost on redirect | Some hosts strip query string on redirect. | Document that invite links must preserve `?ref=`. Optionally support ref in hash (R2). |
| Supabase error | `referrals` table missing or RLS blocking insert. | Ensure migration for `referrals` is run; RLS allows anon insert. |

---

## 5. Test Plan

### 5.1 New user clicks invite link

| ID | Step | Expected |
|----|------|----------|
| T1 | Inviter: copy invite link (Friends → COPY INVITE LINK). | Link contains `?ref=` and the inviter’s code. |
| T2 | Open link in **incognito** (or new device). | Game loads; ref stored in localStorage. |
| T3 | (New user, no name) Welcome modal appears with “You were invited! Enter your display name to accept and join.” | Modal is visible; user can type name. |
| T4 | Enter a name and click SAVE. | Modal closes; `referrals` has one row (inviter_ref_code, invited_name). |
| T5 | Inviter: refresh Friends page. | New friend appears in FRIENDS (INVITED). |

### 5.2 User who already has a name clicks invite link

| ID | Step | Expected |
|----|------|----------|
| T6 | Same browser already has a display name set. Open invite link (with ref). | No welcome modal (already have name). |
| T7 | On load, app calls `registerReferralIfNeeded(getPlayerName())`. | One row inserted into `referrals`. |
| T8 | Inviter: refresh Friends page. | New friend appears in FRIENDS (INVITED). |

### 5.3 Ref in URL variants

| ID | Step | Expected |
|----|------|----------|
| T9 | Open `https://origin/path/?ref=REF123`. | invitedBy = REF123; invite flow runs (name prompt or register). |
| T10 | If supported: open `https://origin/path/#ref=REF456`. | invitedBy = REF456 (from hash). |

### 5.4 Edge cases

| ID | Step | Expected |
|----|------|----------|
| T11 | Open link with ref; close modal without saving (or leave name blank). | invitedBy remains; next time they set name (e.g. in Settings), referral is registered then. |
| T12 | Supabase down or `referrals` insert fails. | invitedBy is cleared on error; user can try again by opening the invite link again. |

---

## 6. Acceptance Criteria

- [ ] Ref is read from query string on load; optionally from hash.
- [ ] When ref is set and user has no name, welcome modal is shown with invite-specific copy.
- [ ] When ref is set and user already has a name, referral is registered on load.
- [ ] When user saves name (welcome or Settings) with ref set, referral is registered and inviter sees friend in FRIENDS (INVITED).
- [ ] Manual test: new user opens invite link → sees modal → enters name → inviter sees friend (T1–T5).
- [ ] Manual test: user with name opens invite link → inviter sees friend after refresh (T6–T8).

---

## 7. Implementation Notes (Done)

- **Ref from search + hash:** On load, `refParam = params.get('ref') || (window.location.hash ? new URLSearchParams(window.location.hash.slice(1)).get('ref') : null)`.
- **Invited + no name:** Show welcome modal; set modal text to “You were invited! Enter your display name to accept and join. You can change it later in Wallet → Settings.”
- **Invited + has name:** On load, if `invitedBy && getPlayerName()`, call `registerReferralIfNeeded(getPlayerName())`.
- **Referral table:** `referrals` with columns e.g. inviter_ref_code, invited_name, invited_wallet, created_at. Supabase RLS must allow anon insert for the insert to succeed.

---

## 8. References

- Code: `window.addEventListener('load', ...)` (ref read, welcome modal, registerReferralIfNeeded on load); `setPlayerName` → `registerReferralIfNeeded`; `loadFriendsInvited()`.
- PRD-INVITE-PLAYER-LOOP-AND-FRIENDS-PAGE.md for full invite + duel flow.
