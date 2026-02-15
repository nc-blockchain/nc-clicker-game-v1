# Two-browser test: token send + recipient notification

Use two different browser contexts so each has its own identity (guest or wallet).

## 1. Start the app

```bash
npm run serve
```

App: **http://localhost:3001**

## 2. Browser A (recipient)

- Open **Chrome** (or your main browser) → `http://localhost:3001`
- Set a display name if prompted (Wallet → Settings).
- Note **Your code** in the Friends section (e.g. `REFG90UVP`) or use **COPY** under “Share this code so others can send you tokens.”
- Keep this tab open and stay on the app (or at least have the tab in the foreground so Realtime can connect).

## 3. Browser B (sender)

- Open **Edge**, **Firefox**, or **Chrome Incognito** (different profile) → `http://localhost:3001`
- Set a different display name so you can tell the two users apart.
- Go to **WALLET** → **➜ Send**.
- In **Recipient**, enter Browser A’s code (e.g. `REFG90UVP`).
- Enter **Amount** (e.g. `5`) → **SEND**.

## 4. Check both balances

**Sender (Browser B)**  
- Header **TOKENS** and Wallet/Send balance should **decrease** by the sent amount immediately after SEND.  
- If you open **➜ Send** again, balance is re-synced from the server and should still show the new (lower) balance.

**Recipient (Browser A)**  
- **Balance** in the header and on Wallet should **increase** by the sent amount (via Realtime notification + sync, or after opening Wallet → Send).  
- You should see a **notification**: “You received 5 tokens from [SenderName].”  
- Open **🔔 Notifications** to confirm the message is in the list.

## 5. If the notification doesn’t appear

- Ensure migration **019** is applied in Supabase (`token_received_notifications` table + Realtime publication).
- In Browser A, refresh the page and leave the tab open when you send from Browser B (Realtime must be connected).
- Check Supabase Dashboard → Database → `token_received_notifications`: there should be a row for the recipient after a send.
