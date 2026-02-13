# Wallet Polish Task List

**Source:** PRD-IN-GAME-WALLET.md (optional items)

**Status:** Complete

---

## Completed Tasks

| # | Task | Notes |
|---|------|-------|
| 1 | Swap preview: "You get ~X tokens" when amount entered | Updates on input; rate 1 $CARD = 10 tokens |
| 2 | Withdraw Max button | Fills input with current in-game balance |
| 3 | Connection status in Settings | Shows "Connected: 0x1234…5678" or "Not connected" in Settings modal |

---

## Section 12: UX Polish (Completed)

| # | Task | Notes |
|---|------|-------|
| 1 | Need help link opens Settings | "Open SETTINGS" button in Wallet connect area |
| 2 | Read ref from URL hash | `#ref=CODE` or `#path?ref=CODE` → ref stored |
| 3 | Swap error shows $CARD balance | When "Not enough" error, appends balance |
| 4 | Wallet: Use tokens for Boosts & PVP | Copy under IN-GAME balance |

---

## Testing

- **Swap:** Enter $CARD amount → see "You get ~X tokens" below rate line
- **Withdraw Max:** Tap MAX → input fills with current balance
- **Settings:** Open Wallet → Settings → see WALLET STATUS with connection state
- **Need help:** Tap "Open SETTINGS" → Settings modal opens
- **Invite hash:** Open `#ref=REFCODE` → ref stored; already has name → referral registered
