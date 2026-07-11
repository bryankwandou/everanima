import { sql } from "../../../../lib/server";

// The portability endpoint: any outside agent can read a person's persona
// file here, but ONLY with a grant key the owner issued. No key, or a
// revoked key, gets a 403. This is what makes the memory portable without
// making it public — the wallet owner decides who reads it.
export async function GET(req, { params }) {
  const wallet = params.wallet;
  const auth = req.headers.get("authorization") || "";
  const headerKey = req.headers.get("x-everanima-grant") || "";
  const bearer = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  const key = headerKey || bearer;

  if (!key) {
    return Response.json(
      { error: "This memory is private. Present a grant key the owner issued (header: x-everanima-grant)." },
      { status: 401 }
    );
  }

  const rows = await sql`
    SELECT u.id, u.wallet_pubkey, g.revoked, g.grant_key
    FROM grants g JOIN users u ON u.id = g.user_id
    WHERE g.grant_key = ${key} LIMIT 1`;
  const row = rows[0];

  if (!row || row.revoked) {
    return Response.json({ error: "Grant key is invalid or has been revoked." }, { status: 403 });
  }
  if (row.wallet_pubkey && wallet && row.wallet_pubkey !== wallet) {
    return Response.json({ error: "This grant does not cover that wallet." }, { status: 403 });
  }

  const personaRows = await sql`SELECT content, updated_at FROM personas WHERE user_id = ${row.id}`;
  await sql`UPDATE grants SET read_count = read_count + 1, last_read_at = now()
    WHERE grant_key = ${key}`;

  return Response.json({
    wallet: row.wallet_pubkey || wallet,
    persona: personaRows[0]?.content || "",
    updated_at: personaRows[0]?.updated_at || null
  });
}
