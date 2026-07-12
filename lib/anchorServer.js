import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import bs58 from "bs58";
import { createHash } from "crypto";

const MEMO_PROGRAM = new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr");
const DEVNET = "https://api.devnet.solana.com";

// Notarizes a persona version on Solana devnet. Everanima's own service
// wallet pays the fee and signs, so the user never has to hold a key in the
// browser. The owner's wallet (when they have one) is attached as a
// read-only account, which keeps each anchor discoverable by that wallet on
// the public /verify page.
export async function anchorPersonaOnChain(ownerWallet, personaText) {
  if (!process.env.ANCHOR_SECRET) return null;
  const conn = new Connection(DEVNET, "confirmed");
  const kp = Keypair.fromSecretKey(bs58.decode(process.env.ANCHOR_SECRET));
  const hash = createHash("sha256").update(personaText).digest("hex");
  const memo = `everanima:persona:v1:${hash}`;

  const keys = [{ pubkey: kp.publicKey, isSigner: true, isWritable: false }];
  try {
    if (ownerWallet) keys.push({ pubkey: new PublicKey(ownerWallet), isSigner: false, isWritable: false });
  } catch {
    /* password-only account, no wallet to attach */
  }

  const ix = new TransactionInstruction({
    keys,
    programId: MEMO_PROGRAM,
    data: Buffer.from(memo),
  });
  const tx = new Transaction().add(ix);
  tx.feePayer = kp.publicKey;
  tx.recentBlockhash = (await conn.getLatestBlockhash()).blockhash;
  tx.sign(kp);
  const sig = await conn.sendRawTransaction(tx.serialize());
  await conn.confirmTransaction(sig, "confirmed");
  return { sig, hash };
}
