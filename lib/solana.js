import {
  Connection,
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

export async function sha256hex(text) {
  const data = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Builds a persona anchor: a Memo transaction carrying the version's
// SHA-256, signed by the user's own wallet. Their wallet is the fee payer
// and the only signer, so the checkpoint is provably theirs — and it shows
// up under their address on the public /verify page.
export function buildAnchorMemo(hash) {
  return (feePayer) =>
    new Transaction().add(
      new TransactionInstruction({
        keys: [{ pubkey: feePayer, isSigner: true, isWritable: false }],
        programId: MEMO_PROGRAM,
        data: new TextEncoder().encode(`everanima:persona:v1:${hash}`)
      })
    );
}

// Builds the 0.05 SOL Eternal payment (transfer + memo) for a given fee payer.
// Used with the user's own wallet through the Wallet Standard.
export function buildEternalTransfer(feePayer) {
  return new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: feePayer,
      toPubkey: TREASURY,
      lamports: Math.round(ETERNAL_PRICE_SOL * LAMPORTS_PER_SOL)
    }),
    new TransactionInstruction({
      keys: [{ pubkey: feePayer, isSigner: true, isWritable: false }],
      programId: MEMO_PROGRAM,
      data: new TextEncoder().encode("everanima:eternal:v1")
    })
  );
}

export async function getBalance(address) {
  const conn = getConnection();
  const lamports = await conn.getBalance(new PublicKey(address));
  return lamports / LAMPORTS_PER_SOL;
}

export function faucetUrl(address) {
  return `https://faucet.solana.com/?address=${address || ""}`;
}

export function explorerUrl(sig) {
  return `https://explorer.solana.com/tx/${sig}?cluster=devnet`;
}
