# Next Tasks – Executable Frontend Items

**Status:** Created from PRD review. Execute in order.

---

## Completed (Section 15)

| # | Task | Notes |
|---|------|-------|
| 15.1 | Hide bounty category when all claimed | ✓ |
| 15.2 | First bounty claim hint "Check the 🔔" | ✓ |
| 15.3 | aria-live for token count | ✓ |

---

## Remaining (Optional / Future)

| # | Task | Source | Notes |
|---|------|--------|-------|
| 1 | Bounty claimable notification (e.g. "50 taps today – ready to claim") | PRD-BUGS-AND-PLAYABILITY §2.1 | When new bounty becomes claimable, push to bell |
| 2 | Sound toggle: tap/claim sounds | PRD-BUGS-AND-PLAYABILITY §2.2 | Optional; requires audio assets |
| 3 | "Friend joined via your link" notification | PRD-BUGS-AND-PLAYABILITY §2.4 | When invitedBy set first time |
| 4 | First-visit tooltip: "Tap the bird" / "Spend tokens in Boosts" | PRD-BUGS-AND-PLAYABILITY §2.5 | Onboarding hint |
| 5 | One-time "Change name in Wallet → Settings" footer | PRD-BUGS-AND-PLAYABILITY §2.5 | Friends or notification |
| 6 | aria-live for notifications list | PRD-BUGS-AND-PLAYABILITY §2.6 | Screen reader for new notifications |

---

## Backend / Migrations (Manual)

Run in Supabase SQL Editor for full functionality:

- **006:** `rematch_until`, `player1_wants_rematch`, `player2_wants_rematch` (rematch window)
- **008–010:** Referrals, Realtime, `ref_code` (friend flow, add by code)

See `PRD-BUGS-AND-FIXES-2025.md` §2 for migration list.
