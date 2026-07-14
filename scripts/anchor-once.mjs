// One-shot devnet anchor proof. Generates a FRESH throwaway keypair (no
// existing wallet, no secrets read from anywhere), funds it from the public
// devnet faucet, and seals a persona checkpoint onto Solana through the Memo
// program. Prints the wallet, signature, and hash so anyone can verify the
// transaction on the explorer.
//
// Usage: node scripts/anchor-once.mjs <persona-text-file> [api-base] [session-cookie]
import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  TransactionInstruction,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import { createHash } from "crypto";
import { readFileSync } from "fs";

const [, , personaFile, apiBase, cookie] = process.argv;
if (!personaFile) {
  console.error("usage: node scripts/anchor-once.mjs <persona-file> [api-base] [cookie]");
  process.exit(1);
}

const MEMO_PROGRAM = new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr");
const conn = new Connection("https://api.devnet.solana.com", "confirmed");

const kp = Keypair.generate();
console.log("throwaway wallet:", kp.publicKey.toBase58());

// Fund the throwaway from the devnet faucet (retry — it rate-limits).
let funded = false;
for (let i = 0; i < 5 && !funded; i++) {
  try {
    const sig = await conn.requestAirdrop(kp.publicKey, LAMPORTS_PER_SOL);
    await conn.confirmTransaction(sig, "confirmed");
    funded = true;
    console.log("airdrop confirmed:", sig);
  } catch (e) {
    console.log(`airdrop attempt ${i + 1} failed: ${String(e.message || e).slice(0, 120)}`);
    await new Promise((r) => setTimeout(r, 3000));
  }
}
if (!funded) {
  console.error("faucet exhausted — try again in a few minutes");
  process.exit(2);
}

const persona = readFileSync(personaFile, "utf8");
const hash = createHash("sha256").update(persona).digest("hex");
const memo = `everanima:persona:v1:${hash}`;

const tx = new Transaction().add(
  new TransactionInstruction({
    keys: [{ pubkey: kp.publicKey, isSigner: true, isWritable: false }],
    programId: MEMO_PROGRAM,
    data: Buffer.from(memo),
  })
);
tx.feePayer = kp.publicKey;
tx.recentBlockhash = (await conn.getLatestBlockhash()).blockhash;
tx.sign(kp);
const sig = await conn.sendRawTransaction(tx.serialize());
await conn.confirmTransaction(sig, "confirmed");

console.log(JSON.stringify({ wallet: kp.publicKey.toBase58(), sig, hash }, null, 2));
console.log(`explorer: https://explorer.solana.com/tx/${sig}?cluster=devnet`);

// Optionally record the anchor in the app database too.
if (apiBase && cookie) {
  const res = await fetch(`${apiBase}/api/anchor`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify({ sig, hash }),
  });
  console.log("db record:", res.status, await res.text());
}
