# PRD: In-Game Wallet Improvements

**Purpose:** Improve the Wallet tab flow, clarity, and trust so players can connect, swap, and withdraw with minimal friction.

---

## 1. Current State (After Latest Changes)

- **Wallet title row:** WALLET (left) + SETTINGS (right). Settings opens a modal with Profile name, Feather effects, and **Wallet help** (instructions + “I approved – check connection”).
- **Wallet page:** Balances (IN-GAME + $CARD), TON WALLET (connection status + CONNECT WALLET only), short “Need help? Open SETTINGS…” line, then Swap and Withdraw.
- **Swap:** $CARD → in-game tokens (rate 1:10), backend verifies $CARD balance; **realtime TON price** (e.g. “TON: $5.1234”) from CoinGecko in the swap section.
- **Withdraw:** In-game tokens → $CARD (backend mints to connected wallet).

---

## 2. Goals

- **Cleaner flow:** One primary action (CONNECT WALLET) on the Wallet tab; all instructions and “I approved” live in Settings.
- **Trust and clarity:** Show TON price in Swap; make rates and steps obvious.
- **Fewer support questions:** Wallet help in one place (Settings) with a single “I approved – check connection” action.

---

## 3. Recommended Improvements

### 3.1 Connection flow

- **Optional:** After CONNECT WALLET, show a short inline message: “Approve in Tonkeeper, then return here. Didn’t work? Open SETTINGS → I approved – check connection.” (Or keep current single line and rely on Settings.)
- **Optional:** If connection fails or is pending for >30s, show a soft prompt: “Open SETTINGS for connection help” with a link or button that opens the Settings modal (and optionally scrolls to Wallet help).
- **Keep:** Single CONNECT WALLET button; no duplicate “I approved” on the main Wallet tab.

### 3.2 Balances and display

- **Done:** Single balance card (IN-GAME + $CARD). No duplicate $CARD blocks.
- **Optional:** Refresh $CARD balance after Swap and After Withdraw (already triggered where applicable).
- **Optional:** On Wallet tab focus, refresh TON price and $CARD balance (e.g. when `pageId === 'wallet'`); TON price already fetched when opening Wallet; ensure $CARD refresh isn’t rate-limited too aggressively for that tab.

### 3.3 Swap

- **Done:** Realtime TON price in the swap section (e.g. “TON: $X.XXXX”).
- **Optional:** Show “You get ~X tokens” preview when the user types a $CARD amount (e.g. amount × 10).
- **Optional:** If backend returns “Not enough $CARD”, show user’s current $CARD balance in the error message.
- **Future:** If swap ever involves on-chain transfer of $CARD, add a “Confirm in wallet” step and clear success/error feedback.

### 3.4 Withdraw

- **Optional:** “Max” button to fill the input with current in-game token balance.
- **Optional:** After a successful withdraw, show a short message: “Check your wallet for $CARD” and refresh $CARD balance after a short delay.
- **Keep:** Backend mint flow; clear error messages (e.g. “Connect wallet first”, “Not enough in-game balance”).

### 3.5 Settings and help

- **Done:** All wallet instructions and “I approved – check connection” in Settings → Wallet help.
- **Optional:** In Settings, show connection status (e.g. “Connected: 0x1234…5678” or “Not connected”) so users can confirm state without closing the modal.
- **Optional:** Link “Need help?” on the Wallet tab to open Settings and, if possible, scroll or focus the Wallet help section.

### 3.6 Errors and edge cases

- **Network:** If TON price or $CARD balance fails to load, keep showing “TON: —” or last value; avoid blocking the rest of the Wallet tab.
- **Backend down:** Swap/Withdraw already show feedback; optional: detect backend unreachable and show a single “Wallet services temporarily unavailable” when appropriate.
- **CORS:** CoinGecko is public; if TON price fails in production, consider a small backend proxy for the price request.

### 3.7 Mobile and accessibility

- **Optional:** On mobile, ensure CONNECT WALLET and “I approved” buttons are large enough (e.g. min touch target 44px).
- **Optional:** Announce balance or connection changes to screen readers (e.g. `aria-live` on balance or status text).

---

## 4. Out of Scope (for this PRD)

- Changing the Swap rate (1 $CARD = 10 tokens) or Withdraw logic.
- Adding new chains or assets.
- Implementing actual on-chain $CARD transfer for Swap (current design: backend verifies balance, frontend credits tokens).

---

## 5. Acceptance Criteria (Summary)

- [x] Wallet tab shows only CONNECT WALLET and short “Need help? Open SETTINGS…” (no long instructions on the tab).
- [x] Settings modal contains Wallet help and “I approved – check connection”.
- [x] Swap section shows realtime TON price (e.g. “TON: $X.XXXX”).
- [ ] (Optional) Swap preview: “You get ~X tokens” when amount is entered.
- [ ] (Optional) Withdraw “Max” button.
- [ ] (Optional) Connection status visible inside Settings.

---

## 6. Testing Checklist

- Open Wallet tab → only balance card, CONNECT WALLET, one short help line, Swap (with TON price), Withdraw.
- Open SETTINGS → Wallet help and “I approved – check connection” visible and functional.
- Connect wallet (or use “I approved” from Settings) → balance and $CARD update as expected.
- Swap: enter amount, SWAP → success adds tokens; TON price loads when Wallet is shown.
- Withdraw: enter amount, WITHDRAW → success reduces tokens and shows feedback.
- On slow or failed network, TON price and $CARD show “—” or last value without breaking the page.
