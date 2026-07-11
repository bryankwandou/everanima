import { Keypair } from "@solana/web3.js";
import { readFileSync } from "fs";
import nacl from "tweetnacl";
import bs58pkg from "bs58";
const bs58 = bs58pkg.default || bs58pkg;

const lines = readFileSync("E:/Download/wallet hackaton darurat.txt", "utf8").split(/\r?\n/);
const secret = lines[lines.findIndex((l) => l.trim() === "Priv:") + 1].trim();
const kp = Keypair.fromSecretKey(bs58.decode(secret));

const message = `everanima-login:${Date.now()}`;
const signature = bs58.encode(nacl.sign.detached(new TextEncoder().encode(message), kp.secretKey));

const res = await fetch("https://everanima.vercel.app/api/auth/wallet", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ pubkey: kp.publicKey.toBase58(), message, signature })
});
console.log("valid signature ->", res.status, JSON.stringify(await res.json()));

// Tampered signature must be rejected.
const bad = await fetch("https://everanima.vercel.app/api/auth/wallet", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    pubkey: kp.publicKey.toBase58(),
    message: `everanima-login:${Date.now()}`,
    signature
  })
});
console.log("tampered signature ->", bad.status, JSON.stringify(await bad.json()));
