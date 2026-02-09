# PRD: Bugs, Errors & Playability

**Document purpose:** List known bugs/errors and playability improvements so the game is reliable and fun.  
**Settings:** All player and gameplay options live in **Wallet → SETTINGS** (profile name, feather effects).  
**Notifications:** Bell icon opens the notification center (in-app activity feed + optional browser notification permission).

---

## 1. Bugs & Errors (Fixed or Documented)

### 1.1 Fixed in this pass
- **Bounty claim not persisting:** Claiming a bounty did not call `save()`, so progress could be lost on refresh. **Fixed:** `save()` is now called after any successful bounty claim.
- **Notifications did nothing:** The 🔔 button had no handler. **Fixed:** Bell opens a notifications modal with (1) browser notification permission status and ENABLE button, (2) “Recent activity” list (bounty claims, etc.). Claiming a bounty pushes an entry to this feed.

### 1.2 Harmless / no change needed
- **Removed click-count label:** The “X clicks” box under the bird was removed; `click-count-label` is still referenced in JS but guarded with `if (clickCountLabel)`, so no error.
- **PVP full list modal removed:** `loadPvpFullList()` and `pvp-full-list-content` still exist but are never called; no functional impact.

### 1.3 Potential issues to monitor
- **Supabase / leaderboard:** If `supabase-config.js` is missing or invalid, PVP Duel Wins and Friends-invited lists show “No duel wins yet” / “Loading…” and never update. Consider showing a short “Leaderboard unavailable” message when `window.supabaseClient` is null.
- **Wallet on localhost:** Wallet connect flow is built for production (e.g. Tonkeeper). On localhost, connection may fail unless backend is running; the UI already shows a file-warning and suggests using the live site.
- **Bounty categories and hidden rows:** When all bounties in a category (e.g. “Fun Bounties”) are claimed, the category heading still appears with no rows below it (rows are hidden). Optional improvement: hide the whole category block when all its bounties are claimed.

---

## 2. Playability & Fun

### 2.1 Clarity and feedback
- **Tap feedback:** Feathers and “+1” float on tap; feather effect can be turned off in Wallet → Settings. Good.
- **Stats:** TAP/SEC, TOTAL TAPS, TAP RATE and “Every 10 clicks = 1 token” are clear.
- **Bounties:** Categories (Daily, Graduating, Fun) and TO CLAIM / MY CLAIMED tabs make goals clear. Progress (e.g. “Progress: 12/50”) helps.
- **Notifications:** After this pass, bounty claims show in the notification center so players see that something happened.

**Suggestions:**
- Optional: On first bounty claim, show a one-time hint like “Check the 🔔 for activity” to surface the notification center.
- Optional: When a new bounty becomes claimable (e.g. 50 taps reached), add a notification like “50 taps today – ready to claim” so the bell feels useful even without claiming yet.

### 2.2 Progression and balance
- **Boosts:** Tap Power (50), Autoclicker (100), Cooldown (75) give a clear upgrade path. Balance feels reasonable for early game.
- **Bounties:** Mix of daily/weekly, tap milestones, and one-offs (share, first friend, Lucky 777, Speed demon, Hoarder) gives short- and long-term goals.
- **Badges:** 1 click, 1K, 10K are visible; 7-day and 30-day streaks are placeholders. Consider implementing streak logic and surfacing “next badge” to increase stickiness.

**Suggestions:**
- Add a simple “Next milestone” line on Home (e.g. “Next token in 7 taps” or “Next bounty: 50 taps today – 12/50”).
- Consider sound (toggle in Wallet → Settings): optional tap/claim sounds to make actions more satisfying.

### 2.3 Settings and options (Wallet)
- **Current:** Profile name (CHANGE NAME), Feather effects (On/Off). Centralizing these in Wallet is correct.
- **Suggestions:**  
  - **Sound:** Mute / unmute (and store in localStorage).  
  - **Haptics (mobile):** Optional vibration on tap (if supported).  
  - **Reduced motion:** Option to shorten or disable feather animation for accessibility.

### 2.4 Social and PVP
- **Friends:** Invite link, referral code, PVP Duel Wins (top 5), and “No one has used your invite link yet” are clear.
- **PVP:** Lobby, create/join room, 30s click race. Invite/duel popups are disabled per prior requirements; flow is intact for users who navigate to PVP and create/join from there.
- **Suggestions:**  
  - After a PVP win, push a notification (“You won the duel!”) so it appears in the notification center.  
  - Optional: “Friend joined via your link” notification when `tokenClicker_invitedBy` is set (first time) to encourage checking Friends.

### 2.5 First-time and onboarding
- **Splash:** “START TAPPING!” is clear. Welcome/name modal is no longer auto-shown; name is set in Wallet → Settings.
- **Suggestions:**  
  - Optional first-visit tooltip: “Tap the bird to earn tokens” and “Spend tokens in Boosts” so new players know where to go.  
  - Optional: One-time “You can change your name in Wallet → Settings” in the notification center or as a small footer on Friends.

### 2.6 Technical and polish
- **Persistence:** All important state (taps, tokens, boosts, bounties, tab preference) is in localStorage and saved on key actions (tap, buy, claim). Good.
- **Performance:** Feather DOM nodes are removed after animation (closure bug was fixed earlier). No obvious leaks from testing.
- **Accessibility:** `aria-label` on main actions (e.g. “Click to earn tokens”, “Notifications”). Consider `aria-live` for token count or notification list so screen readers announce updates.

---

## 3. Testing checklist (manual)

Use this to regression-test after changes:

- [ ] **Splash:** Start game with “START TAPPING!”; app and header appear.
- [ ] **Home:** Tap bird; TAP/SEC, TOTAL TAPS, token count update; feathers appear (if on) and disappear; cooldown prevents spam.
- [ ] **Boosts:** Balance shown; BUY enables when enough tokens; after purchase, OWNED and balance update; save and refresh to confirm persistence.
- [ ] **Bounties:** TO CLAIM shows list by category; MY CLAIMED shows claimed cards; claim a bounty → balance and MY CLAIMED update; refresh → claim state persists; notification center shows “Bounty claimed: +X tokens”.
- [ ] **Friends:** PVP Duel Wins (top 5) loads or shows “No duel wins yet”; invite link and code visible; COPY INVITE LINK gives feedback.
- [ ] **Wallet:** SETTINGS shows profile name and CHANGE NAME; Feather effects toggle works; name change persists; balance and withdraw UI present.
- [ ] **Notifications:** 🔔 opens modal; permission label and ENABLE (if not granted); recent activity list; after a claim, new entry appears; CLOSE closes modal.
- [ ] **PVP (multiplayer):** Page loads; create room / room list (or message) visible; no unwanted popups (invite/onboarding disabled).
- [ ] **Navigation:** All nav links (HOME, BOOSTS, BOUNTIES, FRIENDS, WALLET, PVP) switch pages; state (e.g. current tab on Bounties) is consistent.

---

## 4. Summary

- **Bugs addressed:** Bounty claim now calls `save()`; notifications are implemented (bell → modal + in-app feed, optional browser permission).
- **Settings:** Wallet → SETTINGS remains the single place for profile name and gameplay options (feather effects); extend there for sound/haptics/reduced motion if desired.
- **Playability:** Clear stats, categories, and notifications improve feedback; optional improvements (next milestone, sound, haptics, streak badges, PVP/friend notifications) are listed above for prioritization.
- Use the testing checklist to ensure core loops (tap → earn → spend → claim bounties → see notifications) stay playable and fun.
