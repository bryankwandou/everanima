import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
  LAMPORTS_PER_SOL
} from "@solana/web3.js";

export const DEVNET = "https://api.devnet.solana.com";
export const TREASURY = new PublicKey(
  "5JTDJdfDHqu3TEHuBTATJF49G8i8YKy42riJG9KWFfSk"
);
export const MEMO_PROGRAM = new PublicKey(
  "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"
);
export const ETERNAL_PRICE_SOL = 0.05;

export function getConnection() {
  return new Connection(DEVNET, "confirmed");
}

const KEY_STORAGE = "everanima_burner_secret";

export function loadBurner() {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(KEY_STORAGE);
  if (raw) {
    try {
      return Keypair.fromSecretKey(Uint8Array.from(JSON.parse(raw)));
    } catch (e) {
      /* corrupted, regenerate */
    }
  }
  const kp = Keypair.generate();
  localStorage.setItem(KEY_STORAGE, JSON.stringify(Array.from(kp.secretKey)));
  return kp;
}

export async function getBalance(pubkey) {
  const conn = getConnection();
  const lamports = await conn.getBalance(pubkey);
  return lamports / LAMPORTS_PER_SOL;
}

export async function requestAirdrop(pubkey) {
  const conn = getConnection();
  const sig = await conn.requestAirdrop(pubkey, LAMPORTS_PER_SOL);
  await conn.confirmTransaction(sig, "confirmed");
  return sig;
}

async function sha256hex(text) {
  const data = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Anchors the persona's SHA-256 on devnet via the Memo program,
// signed by the burner wallet, so the memory checkpoint is provably
// owned by the user's key.
export async function anchorPersona(keypair, personaText) {
  const conn = getConnection();
  const hash = await sha256hex(personaText);
  const memo = `everanima:persona:v1:${hash}`;
  const ix = new TransactionInstruction({
    keys: [{ pubkey: keypair.publicKey, isSigner: true, isWritable: false }],
    programId: MEMO_PROGRAM,
    data: new TextEncoder().encode(memo)
  });
  const tx = new Transaction().add(ix);
  tx.feePayer = keypair.publicKey;
  const { blockhash } = await conn.getLatestBlockhash();
  tx.recentBlockhash = blockhash;
  tx.sign(keypair);
  const sig = await conn.sendRawTransaction(tx.serialize());
  await conn.confirmTransaction(sig, "confirmed");
  return { sig, hash };
}

export async function payEternal(keypair) {
  const conn = getConnection();
  const tx = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: keypair.publicKey,
      toPubkey: TREASURY,
      lamports: Math.round(ETERNAL_PRICE_SOL * LAMPORTS_PER_SOL)
    }),
    new TransactionInstruction({
      keys: [{ pubkey: keypair.publicKey, isSigner: true, isWritable: false }],
      programId: MEMO_PROGRAM,
      data: new TextEncoder().encode("everanima:eternal:v1")
    })
  );
  tx.feePayer = keypair.publicKey;
  const { blockhash } = await conn.getLatestBlockhash();
  tx.recentBlockhash = blockhash;
  tx.sign(keypair);
  const sig = await conn.sendRawTransaction(tx.serialize());
  await conn.confirmTransaction(sig, "confirmed");
  return sig;
}

export function explorerUrl(sig) {
  return `https://explorer.solana.com/tx/${sig}?cluster=devnet`;
}
