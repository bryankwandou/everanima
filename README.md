# Everanima

The AI memory you actually own.

Every assistant forgets you once a chat gets long — and whatever it did learn sits in someone else's database. Everanima keeps a `persona.md` file the AI rewrites itself (identity, preferences, ongoing threads), injects it into every reply, fingerprints each version on Solana devnet, and ties it to your wallet. Ten messages or ten thousand, the thread never frays — and the memory is a portable asset you can hand to any agent you trust.

Live: **https://everanima.vercel.app** · Runs on Solana devnet.

## How it works

1. **You talk.** Replies run on Groq (`llama-3.3-70b-versatile`) with your persona injected as system context.
2. **It writes.** Every 4 messages, one batched extraction call rewrites `persona.md`, stored server-side in Postgres and tied to your account. You can read every word it keeps.
3. **It anchors.** Each persona version is hashed (SHA-256) and committed to Solana devnet through the Memo program, signed by your wallet — a verifiable, checkable trail.
4. **It travels.** Issue a grant key and any outside agent can read your persona over the API; revoke it and the door shuts. That portability is the point.
5. **It scales flat.** The persona replaces raw history; only the last 8 messages travel with it, so token cost stays constant however long the relationship gets.

## Accounts and sign-in

- Username + password (email + full name on signup), server-hashed with scrypt.
- **Sign in with any Solana wallet** — Phantom, Solflare, Backpack, Glow, Trust, Coinbase, OKX, Bitget, Exodus, Brave, or any injected provider. The server verifies an ed25519 signature; a tampered signature is rejected. No extension? A built-in device key still signs you in.
- Google sign-in: marked coming soon.

## Free vs Eternal (enforced server-side)

- **Free** — 20 messages, short answers, self-writing persona, on-chain anchors.
- **Eternal** — 0.05 devnet SOL to the treasury. The server fetches the transaction from devnet and confirms the treasury received the amount before flipping the tier; the same signature cannot be replayed. Mainnet path: USDC, same flow.

## Prove it yourself

- **`/verify`** — paste any wallet; the page reads its Everanima anchors straight from devnet RPC (hash + explorer links). No account, no trust in us required.
- **`/portability`** — the full exit-door tutorial: how an ordinary chat fills the file, how to download persona.md, and how to import it into ChatGPT, Claude, or any agent.
- **`/pitch`** — the submission deck, live inside the product (keyboard navigation, print to PDF).
- **Export** — `GET /api/persona/export` (signed in) downloads persona.md as a real markdown file.
- **Agent access API** — `GET /api/persona/:wallet` with header `x-everanima-grant: <key>` returns the persona; without a valid key it returns 401/403.

## Demo vs real, separated

- **`/demo`** — a stateless sandbox: no account, no database, no wallet, nothing saved.
- **`/chat`** — the real app: sign-in required, everything persisted to Postgres.

## Run locally

```bash
npm install
cp .env.local.example .env.local   # set GROQ_API_KEY and DATABASE_URL
node scripts/initdb.mjs             # create tables (needs DATABASE_URL)
npm run dev
```

## Stack

Next.js 14 · Tailwind · framer-motion · @solana/web3.js · Groq API · Neon Postgres

## Structure

- `app/page.jsx` — interactive landing (logo, ChatGPT comparison, wallet connect modal)
- `app/chat/page.jsx` — the app: chat, live persona panel, wallet, anchors, agent-access grants
- `app/demo/page.jsx` — stateless sandbox
- `app/login`, `app/signup` — auth with multi-wallet sign-in
- `app/verify/page.jsx` — public devnet anchor reader
- `app/api/auth/*` — signup, login, wallet, session, me, logout
- `app/api/chat`, `app/api/memory` — Groq chat + persona extraction
- `app/api/eternal` — on-chain payment verification
- `app/api/grant`, `app/api/persona/[wallet]` — agent access
- `app/api/anchors/[wallet]` — public devnet anchor reader
- `lib/server.js` — DB, auth, sessions · `lib/solana.js` — wallet, memo, payments · `lib/wallets.js` — multi-wallet detection
- `video/` — Remotion source for the 60s demo video
- `docs/MEGA-PROMPT-PLAN.md` — full product plan
