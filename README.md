# Everanima

An AI that writes its own memory of you.

Every assistant forgets you once a chat gets long. Everanima maintains a living `persona.md` file it rewrites itself — identity, preferences, ongoing threads — injects it into every reply, and anchors each version to your Solana wallet on devnet. Ten messages or ten thousand, it never loses the thread of who you are.

## How it works

1. **You talk.** Replies run on Groq (`llama-3.3-70b-versatile`) with your persona injected as system context.
2. **It writes.** Every 4 messages, one batched extraction call rewrites `persona.md`. You can read every word it keeps about you.
3. **It anchors.** Each persona version is hashed (SHA-256) and committed to Solana devnet through the Memo program, signed by your wallet — your memory becomes a verifiable, portable asset.
4. **It scales flat.** The persona replaces raw history; only the last 8 messages travel with it, so token cost stays constant however long the relationship gets.

## Web3 integration (all live on devnet)

- In-browser burner wallet, faucet funding from the app
- Memory checkpoints as Memo transactions with explorer links
- Eternal tier: 0.05 devnet SOL payment to the treasury unlocks unlimited messages (mainnet path: USDC subscriptions, persona-as-NFT export, memory API for other agents)

## Run locally

```bash
npm install
echo GROQ_API_KEY=your_key > .env.local
npm run dev
```

## Stack

Next.js 14 · Tailwind · framer-motion · @solana/web3.js · Groq API

## Structure

- `app/page.jsx` — landing
- `app/chat/page.jsx` — the app: chat, live persona panel, wallet, anchors
- `app/api/chat/route.js` — Groq chat with persona injection
- `app/api/memory/route.js` — batched persona extraction
- `lib/solana.js` — burner wallet, memo anchoring, payments
- `docs/MEGA-PROMPT-PLAN.md` — full product plan
