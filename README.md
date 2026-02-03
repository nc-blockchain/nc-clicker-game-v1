# Token Clicker

**1N Blockchain Token Clicker Game**

A black, 8-bit–style clicker game: click the NFT to earn tokens (10 clicks = 1 token), with anti-cheat cooldown, top bar, bottom nav, and placeholder pages for Boosts, Bounties, Friends, Wallet, and Multiplayer.

---

**→ Site 404?** Enable GitHub Pages: repo **Settings → Pages** → Source **Deploy from a branch** → Branch **main** → Folder **/ (root)** → **Save**. Wait 2–5 min, then open **https://biggleem.github.io/nc-clicker-game-v1/**.

---

## Research & inspiration

See **[RESEARCH.md](./RESEARCH.md)** for:

- Clicker / idle game trends (2024–2025)
- Daily rewards, progression, leaderboards
- NFT integration in casual games (simplified for average users)

## GitHub Pages

Deploy: **Settings → Pages** → **Deploy from a branch** → **main** → **/ (root)**. Full deploy (frontend + backend): **[DEPLOYMENT.md](./DEPLOYMENT.md)**.

## Run locally

Open `index.html` in a browser, or serve the folder:

```bash
npx serve . -p 3001
```

Then open **http://localhost:3001**.

## Features

### Phase 1 ✅
- **Home**: Centered NFT (colored square); 3 metric windows (clicks/s, total clicks, token rate); **10 clicks = 1 token**.
- **Anti-cheat**: ~280 ms cooldown (200 ms with Boost); no key-hold or script spam.
- **Top bar**: Token balance; PVP + notification bell.
- **Bottom nav**: Home, Boosts, Bounties, Friends, Wallet, PVP.

### Phase 2 ✅
- **Boosts**: Spend tokens to buy **Tap Power** (2x tokens per 10 clicks, 50 tokens), **Autoclicker** (1 click/s, 100 tokens), **Cooldown** (200 ms, 75 tokens). Owned state persisted.
- **Bounties**: **Daily login** (5 tokens, once per day); **100 clicks today** (10 tokens); **Weekly 500 clicks** (50 tokens). Progress and claims persisted.
- **Friends**: **Leaderboard** (top 10 by tokens; "You" merged in and sorted); **Copy invite link** (referral URL with code); **Your code** shown and persisted.

## Roadmap

| Phase | Scope |
|-------|--------|
| **1** | Basic clicker MVP (Home, NFT square, token accumulation) ✅ |
| **2** | Boosts, Bounties, Friends (leaderboard, invites) |
| **3** | Wallet, Exchange, Supabase (users, game data) |
| **4** | Multiplayer (lobby, rooms, duels, NFT stakes) |
| **5** | Marketplace, improved NFT art, social |

## TON wallet & $CARD token

- **Wallet:** [TonConnect](https://ton.org/ecosystem/ton-connect) – connect **Tonkeeper** or **Telegram Wallet** from the Wallet page.
- **Token:** **$CARD** Jetton on TON. Contract and deploy: see [contracts/README.md](./contracts/README.md).
- **Minter address:** Add your deployed minter address only in the **backend** [backend/.env](backend/.env) (`TON_CARD_MINTER_ADDRESS`). The app loads it from `GET /api/config`; no need to edit the frontend.
- **Backend & admin:** [backend/README.md](backend/README.md) – admin wallet (mnemonic in `.env`), `POST /api/withdraw` (mint $CARD to user), `POST /api/admin/mint` (admin-only). Set `backendUrl` in [ton-config.js](ton-config.js) so the app can call the API.
- **Setup:** `npm install` and `npm run build:wallet` for the frontend; in `backend/` run `npm install` and `npm start`. Serve the app so `tonconnect-manifest.json` is at the app root.
- **Mobile / other device:** You can approve in Tonkeeper on your phone while the game is open on desktop. You don’t need the game on the phone; return to the game tab after approving. If Tonkeeper says “application is not on this device”, the connection still completes on the device where the game is open. For Tonkeeper to open the game on your phone after connecting, deploy the app and set the `url` in [tonconnect-manifest.json](tonconnect-manifest.json) to your deployed URL (e.g. `https://yourusername.github.io/nc-clicker-game-v1` for GitHub Pages).

## Stack (planned)

- **Frontend**: Tailwind CSS (CDN), vanilla JS, hash routing, TonConnect SDK.
- **Backend**: Supabase (Phase 3) for users, clicks, tokens, leaderboards, rooms.
- **Token**: $CARD Jetton (FunC) on TON; minting via admin wallet or backend.

## License

MIT.
