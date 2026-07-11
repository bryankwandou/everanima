import { Connection, PublicKey } from "@solana/web3.js";

// Public proof endpoint: reads a wallet's recent Everanima memo anchors
// straight from Solana devnet. No login, no database — anyone can confirm
// the on-chain trail for themselves.
//
// The memo travels inside the signature listing itself, so a single RPC
// call is enough. That keeps us clear of the public devnet rate limit that
// batched transaction fetches run into.
export async function GET(req, { params }) {
  let pubkey;
  try {
    pubkey = new PublicKey(params.wallet);
  } catch {
    return Response.json({ error: "That is not a valid Solana address." }, { status: 400 });
  }

  const conn = new Connection("https://api.devnet.solana.com", "confirmed");
  let sigs;
  try {
    sigs = await conn.getSignaturesForAddress(pubkey, { limit: 40 });
  } catch (e) {
    return Response.json({ error: "Could not reach devnet: " + e.message }, { status: 502 });
  }

  const anchors = [];
  for (const s of sigs) {
    if (!s.memo) continue;
    // RPC prefixes the note with a length tag, e.g. "[38] everanima:...".
    const match = s.memo.match(/everanima:[^"\\]+/);
    if (!match) continue;
    const memo = match[0].trim();
    anchors.push({
      sig: s.signature,
      kind: memo.startsWith("everanima:eternal") ? "payment" : "memory",
      memo,
      hash: memo.startsWith("everanima:persona:v1:") ? memo.split(":").pop() : null,
      blockTime: s.blockTime || null
    });
  }

  return Response.json({ wallet: params.wallet, anchors });
}
