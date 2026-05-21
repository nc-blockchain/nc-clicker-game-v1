/**
 * TON wallet connection via TonConnect (Tonkeeper / Telegram Wallet).
 * Exposes window.TonWallet for the game UI.
 * Uses only remote wallets (Tonkeeper, Telegram) or currently-injected wallets to avoid WalletNotInjectedError.
 */
import TonConnect, { isWalletInfoRemote, isWalletInfoCurrentlyInjected } from '@tonconnect/sdk';

const PRODUCTION_MANIFEST = 'https://biggleem.github.io/nc-clicker-game-v1/tonconnect-manifest.json';

let connector;
// Note: var names use legacy `card*` for backward-compat with backend route
// `/api/wallet/card-balance` and HTML id `card-balance`. UI labels say $NCCC.
let cardBalance = null;
let cardMinterAddress = null; // Set after deploying token Jetton (legacy $CARD; UI now shows $NCCC)

function getManifestUrl() {
  if (typeof window === 'undefined' || !window.location) return PRODUCTION_MANIFEST;
  const host = window.location.hostname || '';
  const isLocal = host === 'localhost' || host === '127.0.0.1';
  if (!isLocal) return PRODUCTION_MANIFEST;
  const backend = (window.TON_CONFIG && window.TON_CONFIG.backendUrl) || '';
  const base = backend.replace(/\/$/, '');
  if (base) return base + '/tonconnect-manifest.json?origin=' + encodeURIComponent(window.location.origin);
  return window.location.origin + '/tonconnect-manifest.json';
}

function getConnector() {
  if (!connector) {
    connector = new TonConnect({ manifestUrl: getManifestUrl() });
  }
  return connector;
}

/**
 * Pick a wallet we can connect to: prefer remote (Tonkeeper, Telegram) so no browser extension is required.
 * Skip injectable wallets that are not currently injected to avoid WalletNotInjectedError.
 */
function getConnectableWallets(wallets) {
  return wallets.filter((w) => {
    if (isWalletInfoRemote(w)) return true;
    if (isWalletInfoCurrentlyInjected(w)) return true;
    return false;
  });
}

/**
 * Prefer wallets that have bridgeUrl (remote) so we can force bridge connection and avoid injected path.
 * Put remote-only or remote-first so connect() can use { bridgeUrl } and never hit WalletNotInjectedError.
 */
function sortPreferRemote(wallets) {
  return [...wallets].sort((a, b) => {
    const aRemote = isWalletInfoRemote(a);
    const bRemote = isWalletInfoRemote(b);
    const aInject = isWalletInfoCurrentlyInjected(a);
    const bInject = isWalletInfoCurrentlyInjected(b);
    if (aRemote && !aInject && (!bRemote || bInject)) return -1;
    if (bRemote && !bInject && (!aRemote || aInject)) return 1;
    return 0;
  });
}

async function connect() {
  const c = getConnector();
  const wallets = await c.getWallets();
  const connectable = getConnectableWallets(wallets);
  if (connectable.length === 0) {
    throw new Error('No TON wallet available. Use Tonkeeper app or Telegram to connect (no browser extension required).');
  }
  const sorted = sortPreferRemote(connectable);
  const wallet = sorted[0];
  // Force bridge (HTTP) when available: pass bridgeUrl + universalLink so SDK uses wallet's HTTPS link, not tc:// (blank tab)
  let universalLink;
  if (isWalletInfoRemote(wallet) && wallet.bridgeUrl && wallet.universalLink) {
    universalLink = await c.connect({
      bridgeUrl: wallet.bridgeUrl,
      universalLink: wallet.universalLink,
    });
  } else {
    universalLink = await c.connect(wallet);
  }
  // SDK returns universal link – open in NEW tab. Try anchor click if popup blocked (often allowed as user gesture).
  if (typeof universalLink === 'string' && universalLink && typeof window !== 'undefined') {
    const opened = window.open(universalLink, '_blank', 'noopener,noreferrer');
    if (!opened) {
      try {
        const a = document.createElement('a');
        a.href = universalLink;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } catch (_) {
        throw new Error('POPUP_BLOCKED:' + universalLink);
      }
    }
  }
  return c.wallet;
}

function disconnect() {
  const c = getConnector();
  c.disconnect();
  cardBalance = null;
}

function getAddress() {
  const c = getConnector();
  const acc = c.account;
  return acc?.address ?? null;
}

function getAccount() {
  const c = getConnector();
  return c.account ?? null;
}

async function fetchCardBalance() {
  if (!cardMinterAddress) return null;
  try {
    // When the token Jetton is deployed: get user's Jetton wallet address from minter,
    // then read balance from Jetton wallet contract. For now return stored value.
    return cardBalance;
  } catch (_) {
    return cardBalance;
  }
}

function onStatusChange(callback, errorsHandler) {
  const c = getConnector();
  // errorsHandler swallows WalletNotInjectedError etc. so they don't break the app
  const safeErrorsHandler = errorsHandler || (() => {});
  c.onStatusChange(callback, safeErrorsHandler);
}

async function restoreConnection() {
  const c = getConnector();
  try {
    await c.restoreConnection();
  } catch (e) {
    // Restore can throw WalletNotInjectedError if previous session was injected wallet that's no longer present
    const isInjectedError = e && e.constructor && e.constructor.name === 'WalletNotInjectedError';
    if (isInjectedError) {
      c.disconnect();
      return; // treat as "not connected", don't throw
    }
    throw e;
  }
}

/** Resume bridge SSE so we can receive the approval (SDK pauses when tab loses focus). */
function unPauseConnection() {
  const c = getConnector();
  if (typeof c.unPauseConnection === 'function') {
    return c.unPauseConnection();
  }
}

const TonWallet = {
  getConnector,
  connect,
  disconnect,
  getAddress,
  getAccount,
  get cardBalance() { return cardBalance; },
  setCardMinterAddress(addr) { cardMinterAddress = addr; },
  setCardBalance(b) { cardBalance = b; },
  fetchCardBalance,
  onStatusChange,
  restoreConnection,
  unPauseConnection,
};

if (typeof window !== 'undefined') {
  window.TonWallet = TonWallet;
}

export default TonWallet;
