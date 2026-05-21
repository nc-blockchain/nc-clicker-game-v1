# $NCCC Jetton on TON

> Token for 1N Blockchain Token Clicker. As of 2026-05-21 the platform migrated the on-chain token from **$CARD → $NCCC** and the live faucet now pays NCCC on **Base mainnet** (see the 1nc-blockchain repo). This TON-side Jetton guide is kept for historical reference and any future TON-side reintroduction.

Deploy to **testnet** (free) first, then **mainnet** (~$0.01–$1).

## Create $NCCC minter contract address

**→ Step-by-step: [DEPLOY-CARD.md](./DEPLOY-CARD.md)** (filename retained for tooling compatibility)

- **Easiest:** Use the official web deployer [minter.ton.org](https://minter.ton.org) (testnet: [minter.ton.org?testnet=true](https://minter.ton.org?testnet=true)). Connect wallet, fill name **$NCCC**, ticker **NCCC**, deploy, then copy the **minter address** into the backend Setup.
- **From code:** See [DEPLOY-CARD.md](./DEPLOY-CARD.md) for Blueprint option.

## Resources

- **TON docs:** [ton.org/dev](https://ton.org/dev)
- **Jetton standard:** [ton-blockchain/token-contract](https://github.com/ton-blockchain/token-contract)
- **Official Jetton deployer:** [minter.ton.org](https://minter.ton.org)

## $NCCC metadata

- **Name:** $NCCC
- **Symbol:** NCCC
- **Decimals:** 9 (standard for Jettons)
- **Description:** 1N Blockchain Token Clicker – earn by tapping the Cardinal.

Content cell for the minter should follow [TEP-64](https://github.com/ton-blockchain/TEPs/blob/master/text/0064-token-data-standard.md) (metadata in snake format).

## Setup

1. **Wallet:** Use [Tonkeeper](https://tonkeeper.com) or **Telegram Wallet** for testing.
2. **SDK:** `npm install @ton/ton @ton/crypto` (for deploy scripts).
3. **FunC:** Use the official [token-contract](https://github.com/ton-blockchain/token-contract) repo:
   - `ft/jetton-minter-discoverable.fc`
   - `ft/jetton-wallet.fc`
   - Plus `op-codes.fc`, `params.fc`, and jetton wallet state init helpers from the same repo.

## Deploy (testnet)

1. Get testnet TON from [testnet faucet](https://t.me/testgiver_ton_bot).
2. Build the minter + jetton wallet (FunC compiler or Blueprint).
3. Deploy minter with:
   - `admin_address` = your wallet (can mint $NCCC to players).
   - `content` = cell with $NCCC metadata (name, symbol, decimals).
   - `jetton_wallet_code` = compiled jetton-wallet code.
4. Save the **minter address** and set it in the app (Wallet page / config) so the app can read user $NCCC balance and later trigger mint/withdraw.

## Deploy (mainnet)

1. Use the same build; switch RPC to mainnet.
2. Send ~0.05 TON to the minter for initial deployment and first mints.
3. Total cost is usually under $1 for a simple Jetton.

## Game integration

- **Connect wallet:** App uses **TonConnect** (Tonkeeper / Telegram Wallet); see `src/wallet.js` and Wallet page.
- **$NCCC balance:** Once minter is deployed, the app can resolve the user’s Jetton wallet address from the minter and read balance on-chain.
- **Withdraw (mint):** Only the minter **admin** can mint. Use a backend or a secure wallet that sends mint messages to the minter (to the player’s address) when they withdraw in-game tokens. Keep the admin key off the frontend.

## Quick start with Blueprint

```bash
# From nc-clicker-game-v1 repo root
npx create-ton@latest nccc-jetton
# Choose "Jetton" template, set name $NCCC, symbol NCCC
cd nccc-jetton
npm run build
# Deploy to testnet
npx blueprint run
```

Then copy the minter address into the app config and redeploy the app.
