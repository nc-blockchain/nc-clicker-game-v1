/**
 * Token Clicker backend: config, withdraw (mint $CARD), admin mint.
 * Set TON_CARD_MINTER_ADDRESS and ADMIN_MNEMONIC in .env or via /setup UI.
 */
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
import { Address, beginCell, Cell, internal, toNano } from '@ton/core';
import { TonClient, WalletContractV4 } from '@ton/ton';
import { mnemonicToPrivateKey } from '@ton/crypto';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3002;
const TON_NETWORK = process.env.TON_NETWORK || 'testnet';
const MINTER_ADDRESS = process.env.TON_CARD_MINTER_ADDRESS || '';
const ADMIN_MNEMONIC = process.env.ADMIN_MNEMONIC || '';
const ADMIN_API_KEY = process.env.ADMIN_API_KEY || '';

const endpoint = TON_NETWORK === 'mainnet'
  ? 'https://toncenter.com/api/v2/jsonRPC'
  : 'https://testnet.toncenter.com/api/v2/jsonRPC';

// TonConnect manifest for localhost: return app URL matching frontend origin so wallet accepts connection
app.get('/tonconnect-manifest.json', (req, res) => {
  const origin = req.query.origin || (req.headers.referer && new URL(req.headers.referer).origin) || 'https://biggleem.github.io/nc-clicker-game-v1';
  res.setHeader('Content-Type', 'application/json');
  res.json({
    url: origin.replace(/\/$/, ''),
    name: '1N Blockchain Token Clicker',
    iconUrl: origin.replace(/\/$/, '') + '/assets/cardinal.png',
    description: 'Tap the Cardinal to earn $CARD tokens. Connect TON wallet to withdraw.',
    socialUrls: ['https://github.com/biggleem/nc-clicker-game-v1'],
  });
});

// Op codes (Jetton standard, ton-blockchain/token-contract)
const OP_MINT = 21;
const OP_INTERNAL_TRANSFER = 0x178d4519;

// Root: JSON for API clients; simple HTML with link to setup for browsers
app.get('/', (req, res) => {
  const accept = (req.headers.accept || '').toLowerCase();
  if (accept.includes('text/html')) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Token Clicker Backend</title></head><body style="font-family:system-ui;background:#0a0a0a;color:#eee;padding:24px;max-width:480px;margin:0 auto;">
  <h1 style="color:#00fff7;">Token Clicker Backend</h1>
  <p>API is running. Configure admin &amp; minter:</p>
  <p><a href="/setup" style="color:#00fff7;">Open Setup →</a></p>
  <p style="color:#888;font-size:14px;">Endpoints: GET /api/config, POST /api/swap, POST /api/withdraw, POST /api/admin/mint, GET /api/admin/status</p>
</body></html>`);
    return;
  }
  res.json({
    name: 'Token Clicker Backend',
    endpoints: {
      'GET /setup': 'Admin setup UI (mnemonic, minter, etc.)',
      'GET /api/config': 'minter address & network',
      'GET /api/wallet/card-balance': 'query: address – $CARD balance from chain',
      'POST /api/swap': 'body: { address, amount } — verify $CARD balance, return tokensToCredit (1 $CARD = 10 tokens)',
      'POST /api/withdraw': 'body: { address, amount }',
      'POST /api/admin/mint': 'body: { address, amount }, header: x-api-key',
      'GET /api/admin/status': 'header: x-api-key',
    },
  });
});

// --- Setup UI: enter admin details ---
app.get('/setup', (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  try {
    res.send(getSetupHtml());
  } catch (e) {
    console.error('Setup HTML error:', e);
    res.status(500).send('<h1>Error</h1><p>Setup page failed to load.</p>');
  }
});

app.post('/api/setup', (req, res) => {
  const { adminMnemonic, cardMinterAddress, network, adminApiKey, port } = req.body || {};
  const mnemonic = (adminMnemonic || '').trim();
  const minter = (cardMinterAddress || '').trim();
  const net = (network === 'mainnet' ? 'mainnet' : 'testnet').trim();
  const apiKey = (adminApiKey || '').trim();
  const portNum = (port && /^\d+$/.test(String(port).trim())) ? String(port).trim() : '3002';
  if (!mnemonic || mnemonic.split(/\s+/).length < 12) {
    return res.status(400).json({ error: 'Admin mnemonic required (12–24 words)' });
  }
  if (!minter) {
    return res.status(400).json({ error: '$CARD minter address required' });
  }
  const envPath = path.join(__dirname, '.env');
  const lines = [
    `# Token Clicker backend - written by /setup`,
    `PORT=${portNum}`,
    `TON_NETWORK=${net}`,
    `TON_CARD_MINTER_ADDRESS=${minter}`,
    `ADMIN_MNEMONIC=${mnemonic.replace(/\n/g, ' ')}`,
  ];
  if (apiKey) lines.push(`ADMIN_API_KEY=${apiKey}`);
  try {
    fs.writeFileSync(envPath, lines.join('\n') + '\n', 'utf8');
    res.json({ success: true, message: 'Saved. Restart the backend server for changes to take effect.' });
  } catch (e) {
    console.error('Setup write error:', e);
    res.status(500).json({ success: false, error: e.message || 'Failed to write .env' });
  }
});

// --- Config (public) ---
app.get('/api/config', (req, res) => {
  res.json({
    cardMinterAddress: MINTER_ADDRESS || null,
    network: TON_NETWORK,
  });
});

// --- $CARD balance for a wallet address (read from chain) ---
const JETTON_DECIMALS = 9;
app.get('/api/wallet/card-balance', async (req, res) => {
  const address = (req.query.address || '').toString().trim();
  if (!address) {
    return res.status(400).json({ error: 'address query required' });
  }
  if (!MINTER_ADDRESS) {
    return res.json({ balance: '0', balanceRaw: '0' });
  }
  try {
    const client = new TonClient({ endpoint });
    const minterAddress = Address.parse(MINTER_ADDRESS);
    const ownerAddress = Address.parse(address);
    const ownerSlice = beginCell().storeAddress(ownerAddress).endCell();
    const getWalletRes = await client.runMethod(minterAddress, 'get_wallet_address', [
      { type: 'slice', cell: ownerSlice },
    ]);
    if (getWalletRes.exit_code !== 0) {
      return res.json({ balance: '0', balanceRaw: '0' });
    }
    const jettonWalletAddress = getWalletRes.stack.readAddress();
    const dataRes = await client.runMethod(jettonWalletAddress, 'get_wallet_data');
    if (dataRes.exit_code !== 0) {
      return res.json({ balance: '0', balanceRaw: '0' });
    }
    const balanceRaw = dataRes.stack.readBigNumber();
    const balance = Number(balanceRaw) / Math.pow(10, JETTON_DECIMALS);
    res.json({ balance: String(balance), balanceRaw: balanceRaw.toString() });
  } catch (e) {
    console.error('Card balance error:', e);
    res.json({ balance: '0', balanceRaw: '0' });
  }
});

function authAdmin(req) {
  if (!ADMIN_API_KEY) return true;
  const key = req.headers['x-api-key'] || req.query.api_key;
  return key === ADMIN_API_KEY;
}

// --- Swap: verify user has $CARD, return tokens to credit (1 $CARD = 10 tokens) ---
const SWAP_RATE = 10; // 1 $CARD = 10 in-game tokens
app.post('/api/swap', async (req, res) => {
  const { address, amount } = req.body || {};
  const cardAmount = typeof amount === 'number' ? amount : parseInt(amount, 10);
  if (!address || !cardAmount || cardAmount < 1) {
    return res.status(400).json({ error: 'Invalid address or amount' });
  }
  if (!MINTER_ADDRESS) {
    return res.status(503).json({ error: 'Backend not configured: set TON_CARD_MINTER_ADDRESS' });
  }
  try {
    const client = new TonClient({ endpoint });
    const minterAddress = Address.parse(MINTER_ADDRESS);
    const ownerAddress = Address.parse(address.trim());
    const ownerSlice = beginCell().storeAddress(ownerAddress).endCell();
    const getWalletRes = await client.runMethod(minterAddress, 'get_wallet_address', [
      { type: 'slice', cell: ownerSlice },
    ]);
    if (getWalletRes.exit_code !== 0) {
      return res.json({ success: false, error: 'Could not get $CARD wallet' });
    }
    const jettonWalletAddress = getWalletRes.stack.readAddress();
    const dataRes = await client.runMethod(jettonWalletAddress, 'get_wallet_data');
    if (dataRes.exit_code !== 0) {
      return res.json({ success: false, error: 'Could not read balance' });
    }
    const balanceRaw = dataRes.stack.readBigNumber();
    const balance = Number(balanceRaw) / Math.pow(10, JETTON_DECIMALS);
    if (balance < cardAmount) {
      return res.json({ success: false, error: 'Not enough $CARD. You have ' + balance + ', need ' + cardAmount });
    }
    const tokensToCredit = cardAmount * SWAP_RATE;
    res.json({ success: true, tokensToCredit, cardAmount });
  } catch (e) {
    console.error('Swap error:', e);
    res.status(500).json({ success: false, error: e.message || 'Swap failed' });
  }
});

// --- Withdraw: mint $CARD to user (admin sends tx) ---
app.post('/api/withdraw', async (req, res) => {
  const { address, amount } = req.body || {};
  if (!address || typeof amount !== 'number' || amount < 1) {
    return res.status(400).json({ error: 'Invalid address or amount' });
  }
  if (!MINTER_ADDRESS || !ADMIN_MNEMONIC) {
    return res.status(503).json({ error: 'Backend not configured: set TON_CARD_MINTER_ADDRESS and ADMIN_MNEMONIC' });
  }
  try {
    const result = await sendMint(address.trim(), amount);
    res.json({ success: true, ...result });
  } catch (e) {
    console.error('Withdraw error:', e);
    res.status(500).json({ success: false, error: e.message || 'Mint failed' });
  }
});

// --- Admin: mint $CARD to any address ---
app.post('/api/admin/mint', async (req, res) => {
  if (!authAdmin(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const { address, amount } = req.body || {};
  if (!address || typeof amount !== 'number' || amount < 1) {
    return res.status(400).json({ error: 'Invalid address or amount' });
  }
  if (!MINTER_ADDRESS || !ADMIN_MNEMONIC) {
    return res.status(503).json({ error: 'Backend not configured' });
  }
  try {
    const result = await sendMint(address.trim(), amount);
    res.json({ success: true, ...result });
  } catch (e) {
    console.error('Admin mint error:', e);
    res.status(500).json({ success: false, error: e.message || 'Mint failed' });
  }
});

// --- Admin: status ---
app.get('/api/admin/status', (req, res) => {
  if (!authAdmin(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  res.json({
    configured: !!(MINTER_ADDRESS && ADMIN_MNEMONIC),
    minterAddress: MINTER_ADDRESS || null,
    network: TON_NETWORK,
  });
});

async function sendMint(toAddress, jettonAmount) {
  const jettonMasterAddress = Address.parse(MINTER_ADDRESS);
  const receiverAddress = Address.parse(toAddress);

  // Jetton amount in base units (9 decimals)
  const amountCoins = BigInt(Math.floor(jettonAmount * 1e9));

  // Master message (internal transfer format); minter only reads op, query_id, jetton_amount
  const masterMessage = beginCell()
    .storeUint(OP_INTERNAL_TRANSFER, 32)
    .storeUint(0, 64)
    .storeCoins(amountCoins)
    .endCell();

  const mintMessageBody = beginCell()
    .storeUint(OP_MINT, 32)
    .storeUint(0, 64)
    .storeAddress(receiverAddress)
    .storeCoins(amountCoins)
    .storeRef(masterMessage)
    .endCell();

  const mintMessage = internal({
    to: jettonMasterAddress,
    value: toNano('0.05'),
    bounce: true,
    body: mintMessageBody,
  });

  const client = new TonClient({ endpoint });
  const keyPair = await mnemonicToPrivateKey(ADMIN_MNEMONIC.trim().split(/\s+/));
  const walletContract = WalletContractV4.create({
    workchain: 0,
    publicKey: keyPair.publicKey,
  });
  const walletAddress = walletContract.address;
  const provider = client.provider(walletAddress);
  const seqno = await walletContract.getSeqno(provider);

  await walletContract.sendTransfer(provider, {
    seqno,
    secretKey: keyPair.secretKey,
    messages: [mintMessage],
  });

  return { message: 'Mint sent', to: toAddress, amount: jettonAmount };
}

function getSetupHtml() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Token Clicker – Admin Setup</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: system-ui, sans-serif; background: #0a0a0a; color: #e0e0e0; margin: 0; padding: 24px; max-width: 560px; margin-left: auto; margin-right: auto; }
    h1 { font-size: 1.25rem; margin-bottom: 8px; color: #00fff7; }
    p { color: #888; font-size: 0.875rem; margin-bottom: 16px; }
    label { display: block; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; color: #888; margin-bottom: 6px; }
    input, textarea, select { width: 100%; padding: 10px 12px; background: #1a1a1a; border: 1px solid #333; border-radius: 8px; color: #fff; font-size: 0.875rem; margin-bottom: 16px; }
    textarea { min-height: 100px; resize: vertical; }
    button { background: #00fff7; color: #000; border: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 0.875rem; }
    button:hover { background: #00ddd6; }
    .msg { margin-top: 16px; padding: 12px; border-radius: 8px; font-size: 0.875rem; }
    .msg.success { background: rgba(0,255,136,0.15); color: #00ff88; }
    .msg.error { background: rgba(255,0,106,0.15); color: #ff6b9d; }
    a { color: #00fff7; }
  </style>
</head>
<body>
  <h1>Admin Setup</h1>
  <p>Saved to <code>.env</code> in the backend folder. <strong>You must restart the backend server</strong> (stop and run <code>node index.js</code> again) after saving for changes to apply.</p>
  <form id="setup-form">
    <label>Admin mnemonic (12–24 words)</label>
    <p style="color:#666;font-size:0.75rem;margin:-8px 0 8px 0;">Wallet that pays for minting. Use a separate dev wallet, not your main one.</p>
    <textarea name="adminMnemonic" placeholder="word1 word2 word3 ..." required></textarea>
    <label>$CARD minter contract address</label>
    <p style="color:#666;font-size:0.75rem;margin:-8px 0 8px 0;">The Jetton <strong>contract</strong> address (EQ... or UQ...) from deploying $CARD — <em>not</em> your personal wallet address. See contracts/README.md.</p>
    <input type="text" name="cardMinterAddress" placeholder="EQ... or UQ..." required />
    <label>Network</label>
    <select name="network">
      <option value="testnet">Testnet</option>
      <option value="mainnet">Mainnet</option>
    </select>
    <label>Admin API key (optional)</label>
    <input type="text" name="adminApiKey" placeholder="Leave empty or set a secret for /api/admin/*" />
    <label>Port</label>
    <input type="number" name="port" value="3002" min="1" max="65535" />
    <button type="submit" id="setup-btn">Save to .env</button>
  </form>
  <div id="msg" role="alert" style="margin-top:20px;padding:16px;border-radius:8px;min-height:24px;border:2px solid transparent;"></div>
  <p style="margin-top: 24px;"><a href="/">Back to API</a></p>
  <script>
    document.getElementById('setup-form').onsubmit = async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const msg = document.getElementById('msg');
      const btn = document.getElementById('setup-btn');
      msg.className = 'msg';
      msg.style.borderColor = 'transparent';
      msg.textContent = 'Saving…';
      msg.style.display = 'block';
      if (btn) { btn.disabled = true; btn.textContent = 'Saving…'; }
      try {
        const res = await fetch('/api/setup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            adminMnemonic: fd.get('adminMnemonic'),
            cardMinterAddress: fd.get('cardMinterAddress'),
            network: fd.get('network'),
            adminApiKey: fd.get('adminApiKey') || '',
            port: fd.get('port') || '3002',
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok && data.success) {
          msg.className = 'msg success';
          msg.style.borderColor = '#00ff88';
          msg.textContent = 'Saved to .env. Restart the backend server (stop and run node index.js again) for changes to take effect.';
        } else {
          msg.className = 'msg error';
          msg.style.borderColor = '#ff6b9d';
          msg.textContent = (data && data.error) || 'Save failed';
        }
        msg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      } catch (err) {
        msg.className = 'msg error';
        msg.style.borderColor = '#ff6b9d';
        msg.textContent = err.message || 'Request failed (check backend is running on this port).';
        msg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
      if (btn) { btn.disabled = false; btn.textContent = 'Save to .env'; }
    };
  </script>
</body>
</html>`;
}

app.listen(PORT, () => {
  console.log(`Token Clicker backend on http://localhost:${PORT}`);
  console.log('  GET  /setup            - Admin setup UI (enter mnemonic, minter, etc.)');
  console.log('  GET  /api/config       - minter address & network');
  console.log('  POST /api/swap        - body: { address, amount } ($CARD → tokens)');
  console.log('  POST /api/withdraw     - body: { address, amount }');
  console.log('  POST /api/admin/mint   - body: { address, amount }, header: x-api-key');
  console.log('  GET  /api/admin/status - header: x-api-key');
});
