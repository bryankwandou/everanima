import nacl from "tweetnacl";
import bs58 from "bs58";
import { sql, createSession, publicUser } from "../../../../lib/server";

// Sign-in with any Solana wallet: the client signs a timestamped message,
// the server verifies the ed25519 signature against the public key.
export async function POST(req) {
  const { pubkey, message, signature } = await req.json();
  if (!pubkey || !message || !signature) {
    return Response.json({ error: "pubkey, message, signature required." }, { status: 400 });
  }
  const m = /^everanima-login:(\d+)$/.exec(message);
  if (!m || Math.abs(Date.now() - Number(m[1])) > 5 * 60 * 1000) {
    return Response.json({ error: "Login message expired or malformed." }, { status: 401 });
  }
  let ok = false;
  try {
    ok = nacl.sign.detached.verify(
      new TextEncoder().encode(message),
      bs58.decode(signature),
      bs58.decode(pubkey)
    );
  } catch {
    ok = false;
  }
  if (!ok) {
    return Response.json({ error: "Signature verification failed." }, { status: 401 });
  }
  let rows = await sql`SELECT * FROM users WHERE wallet_pubkey = ${pubkey} LIMIT 1`;
  if (!rows.length) {
    rows = await sql`
      INSERT INTO users (wallet_pubkey, full_name)
      VALUES (${pubkey}, ${"Wallet " + pubkey.slice(0, 6)})
      RETURNING *`;
  }
  await createSession(rows[0].id);
  return Response.json({ user: publicUser(rows[0]) });
}
