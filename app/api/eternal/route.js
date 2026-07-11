import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { sql, currentUser, publicUser } from "../../../lib/server";

const TREASURY = "5JTDJdfDHqu3TEHuBTATJF49G8i8YKy42riJG9KWFfSk";
const PRICE_SOL = 0.05;

// Real payment verification: the client sends a transaction signature,
// the server fetches it from devnet and confirms the treasury actually
// received the price. No client-side trust, no dummy unlocks.
export async function POST(req) {
  const user = await currentUser();
  if (!user) return Response.json({ error: "Sign in first." }, { status: 401 });

  const { sig } = await req.json();
  if (!sig) return Response.json({ error: "Transaction signature required." }, { status: 400 });

  const used = await sql`SELECT id FROM anchors WHERE sig = ${sig}`;
  if (used.length) {
    return Response.json({ error: "That transaction was already used." }, { status: 409 });
  }

  const conn = new Connection("https://api.devnet.solana.com", "confirmed");
  const tx = await conn.getParsedTransaction(sig, {
    commitment: "confirmed",
    maxSupportedTransactionVersion: 0
  });
  if (!tx || tx.meta?.err) {
    return Response.json({ error: "Transaction not found or failed on devnet." }, { status: 404 });
  }

  const keys = tx.transaction.message.accountKeys.map((k) =>
    (k.pubkey instanceof PublicKey ? k.pubkey : new PublicKey(k.pubkey)).toBase58()
  );
  const idx = keys.indexOf(TREASURY);
  if (idx === -1) {
    return Response.json({ error: "That transaction does not pay the treasury." }, { status: 400 });
  }
  const received = (tx.meta.postBalances[idx] - tx.meta.preBalances[idx]) / LAMPORTS_PER_SOL;
  if (received < PRICE_SOL) {
    return Response.json(
      { error: `Treasury received ${received} SOL — the Eternal tier costs ${PRICE_SOL}.` },
      { status: 400 }
    );
  }

  await sql`INSERT INTO anchors (user_id, sig, kind) VALUES (${user.id}, ${sig}, 'payment')`;
  const rows = await sql`UPDATE users SET tier = 'eternal' WHERE id = ${user.id} RETURNING *`;
  return Response.json({ user: publicUser(rows[0]), verified: received });
}
