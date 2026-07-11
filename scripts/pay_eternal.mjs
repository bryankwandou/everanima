import { Connection, Keypair, PublicKey, SystemProgram, Transaction, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { readFileSync } from "fs";
import bs58pkg from "bs58";
const bs58 = bs58pkg.default || bs58pkg;

// Reads the funded devnet key from the local resource file; never printed.
const lines = readFileSync("E:/Download/wallet hackaton darurat.txt", "utf8").split(/\r?\n/);
const secret = lines[lines.findIndex((l) => l.trim() === "Priv:") + 1].trim();
const kp = Keypair.fromSecretKey(bs58.decode(secret));

const conn = new Connection("https://api.devnet.solana.com", "confirmed");
const tx = new Transaction().add(
  SystemProgram.transfer({
    fromPubkey: kp.publicKey,
    toPubkey: new PublicKey("5JTDJdfDHqu3TEHuBTATJF49G8i8YKy42riJG9KWFfSk"),
    lamports: Math.round(0.05 * LAMPORTS_PER_SOL)
  })
);
tx.feePayer = kp.publicKey;
tx.recentBlockhash = (await conn.getLatestBlockhash()).blockhash;
tx.sign(kp);
const sig = await conn.sendRawTransaction(tx.serialize());
await conn.confirmTransaction(sig, "confirmed");
console.log(sig);
