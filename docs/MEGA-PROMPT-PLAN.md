# Everanima — Mega Prompt Plan

## One-liner
A personal AI that writes its own memory of you. Every conversation updates a living persona file, anchored to your Solana wallet on-chain, so it never loses track of who you are — no matter how long the chat gets.

## Why this wins
ChatGPT and Claude drift when context overflows. Everanima flips the model: the AI maintains a compact, self-written `persona.md` for each user — biodata, preferences, ongoing threads — and injects it into every request. The persona is hashed and anchored to Solana devnet via the Memo program, making your memory a verifiable asset owned by your wallet, portable across any client.

## Core loop
1. User connects a wallet (in-browser burner or Phantom/Solflare, devnet).
2. Chat runs on Groq `llama-3.3-70b-versatile` with the persona injected as system context.
3. Every 4 user messages, a single batched extraction call rewrites `persona.md`.
4. The new persona's SHA-256 is written on-chain as a Memo transaction signed by the user's wallet.
5. Free tier: 20 messages. Eternal tier: one devnet SOL payment to the treasury unlocks unlimited messages and memory writes.

## Groq free-tier strategy
- One chat call per message; extraction batched 4:1, capped persona size (~1,500 tokens) keeps input small.
- Persona replaces raw history: only the last 8 messages plus persona are sent, so token use stays flat as chats grow.

## Monetization (devnet proof, mainnet path)
- Eternal tier: 0.05 SOL (devnet) to treasury `5JTDJdfDHqu3TEHuBTATJF49G8i8YKy42riJG9KWFfSk`.
- Mainnet path: USDC subscriptions, persona-as-NFT export, B2B memory API for other agents.

## Stack
Next.js 14 (app router) · Tailwind · framer-motion · @solana/web3.js · Groq API (server route, key never exposed).

## Pages
- `/` landing: animated hero, live memory demo, pricing, how-it-works.
- `/chat` app: wallet panel, chat, live persona.md panel that visibly rewrites itself, on-chain anchor log with explorer links.
