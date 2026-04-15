# Build X — Kairos demo script & prompt templates

Use this for a **1–3 minute** screen recording and for **live judge walkthroughs**. Replace `BACKEND` with your API base (e.g. `https://kairosx-production.up.railway.app`).

---

## A) 2-minute video script (talk track + clicks)

**0:00–0:20 — Hook**  
“Kairos is a multi-agent AI marketplace on **X Layer testnet**. Each specialist agent can settle in **native OKB** — treasury pays agents, and agents can pay each other. Contracts are on-chain: **AgentRegistry** + **SpendingPolicy**, chainId **1952**.”

**0:20–0:50 — Product**  
- Open the app → show **X Layer Testnet** badge + wallet connect.  
- New chat → paste **Prompt 1** (below).  
- Point at agent badges (e.g. Price Oracle, Chain Scout) and **explorer / tx** if visible.

**0:50–1:30 — On-chain proof**  
- Open **Fund Wallet** or show treasury-funded flow if you use it.  
- In a terminal (or cut to screen): run **Demo loop (safe)** — see section B.  
- Open **one tx link** from the JSON on **OKX X Layer testnet explorer**.

**1:30–2:00 — Mandatory module (Uniswap)**  
- Run **Uniswap quote** curl (section C) or show the route in README. Say: “We integrated **Uniswap V3 Quoter** as the required Uniswap / Onchain OS skill surface.”

**2:00–2:15 — Close**  
- Show **GitHub** + **live URL**.  
- One line: “Agentic wallet identity + repeated legitimate txs for judge scoring.”

---

## B) Demo loop (API) — judge-friendly txs

**Prerequisites:** `KAIROS_CHAIN_TARGET=xlayer`, treasury + agent private keys on the **backend**, funded treasury (OKB), and RPC that responds.

**Safe starter** (avoids draining treasury; tune `fundAmount` / `cycles`):

```bash
export BACKEND="https://YOUR-RAILWAY-URL.up.railway.app"

curl -s -X POST "$BACKEND/api/demo/run-cycles" \
  -H "Content-Type: application/json" \
  -d '{
    "cycles": 15,
    "fundAgents": true,
    "fundAmount": "0.00005",
    "amount": "0.00001"
  }' | jq .
```

- **`cycles`**: number of agent→agent transfers (max 500).  
- **`fundAgents`**: treasury sends `fundAmount` OKB to each agent before A2A (needs enough treasury balance).  
- **`amount`**: each A2A transfer size.  
- If you get **insufficient funds**, lower `fundAmount`, set `fundAgents: false`, or fund the treasury from the faucet first.

**Fund-only** (no A2A; useful if you just want treasury→agent funding txs):

```bash
curl -s -X POST "$BACKEND/api/demo/run-cycles" \
  -H "Content-Type: application/json" \
  -d '{"cycles":0,"fundAgents":true,"fundAmount":"0.00002"}' | jq .
```

Response includes `fundTxs[]` and `txs[]` with **`url`** fields when `XLAYER_EXPLORER_BASE` is set.

---

## C) Uniswap V3 quote (mandatory module)

Default config often targets **Ethereum mainnet** quoter — set `UNISWAP_RPC_URL`, `UNISWAP_CHAIN_ID`, and `UNISWAP_V3_QUOTER_ADDRESS` in backend env for the chain you quote on.

Example (adjust token addresses for that chain):

```bash
curl -s "$BACKEND/api/uniswap/v3/quote?tokenIn=0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2&tokenOut=0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48&fee=3000&amountIn=1000000000000000000"
```

---

## D) Live chat — prompt templates (copy/paste)

Use these **in order** for a clean narrative. They route to **tools + on-chain settlement** when the backend is configured.

### 1) Product (short)

```
What is Kairos and what can I do on X Layer testnet in one paragraph?
```

### 2) Chain Scout — RPC pulse (must show X Layer, not web search)

```
What is the live chain pulse on X Layer testnet? Show the last 5 blocks: tx counts per block, EIP-1559 base fee if available, and approximate native OKB moved as sum of tx.value in those blocks.
```

### 3) Price Oracle

```
What is the current price and 24h change for OKB? Give symbol and approximate USD.
```

### 4) Multi-agent (A2A + multiple badges)

```
Give me a quick market headline for BTC today, then suggest one DeFi yield opportunity on Ethereum from major protocols, each in one bullet.
```

### 5) Wallet / Chain Scout (paste a testnet 0x)

```
Explain this address on X Layer testnet: 0xYOUR_ADDRESS — native balance, nonce, EOA vs contract.
```

### 6) Ratings / persistence (after Supabase is on)

After a good reply: **thumbs up** → refresh **Agents** → star count should move (may need one more rating for visible average).

---

## E) Health checks before recording

```bash
curl -s "$BACKEND/health" | jq .
```

- Prefer `"status":"ok"` and chain fields populated; `"degraded"` means fix `XLAYER_*` / treasury env on Railway.

---

## F) One-liner for judges (elevator)

“Kairos routes each user question to specialist agents, settles in **OKB** on **X Layer 1952**, registers agents on-chain, and includes a **Uniswap V3 quote** integration plus a **demo loop** that generates explorer-verifiable **treasury and A2A** transactions.”
