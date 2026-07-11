import { Connection, PublicKey } from "@solana/web3.js";

// Public proof endpoint: reads a wallet's recent Everanima memo anchors
// straight from Solana devnet. No login, no database — anyone can confirm
// the on-chain trail for themselves.
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
    sigs = await conn.getSignaturesForAddress(pubkey, { limit: 25 });
  } catch (e) {
    return Response.json({ error: "Could not reach devnet: " + e.message }, { status: 502 });
  }
  if (!sigs.length) return Response.json({ wallet: params.wallet, anchors: [] });

  const txs = await conn.getParsedTransactions(
    sigs.map((s) => s.signature),
    { commitment: "confirmed", maxSupportedTransactionVersion: 0 }
  );

  const anchors = [];
  txs.forEach((tx, i) => {
    if (!tx) return;
    const logs = tx.meta?.logMessages || [];
    // Memo program echoes the note into the logs as: Program log: Memo (len N): "…"
    const memoLine = logs.find((l) => l.includes("everanima:"));
    const inLog = memoLine && memoLine.match(/everanima:[^"\\]+/)?.[0];
    // Also scan parsed instructions for spl-memo.
    const memoIx = tx.transaction.message.instructions.find(
      (ix) => typeof ix.parsed === "string" && ix.parsed.includes("everanima:")
    );
    const memo = inLog || (memoIx && memoIx.parsed);
    if (!memo) return;
    const [, kind] = memo.split(":"); // everanima:persona:... or everanima:eternal
    anchors.push({
      sig: sigs[i].signature,
      kind: memo.startsWith("everanima:eternal") ? "payment" : "memory",
      memo,
      hash: memo.startsWith("everanima:persona:v1:") ? memo.split(":").pop() : null,
      blockTime: sigs[i].blockTime || null
    });
  });

  return Response.json({ wallet: params.wallet, anchors });
}
