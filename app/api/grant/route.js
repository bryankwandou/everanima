import { randomBytes } from "crypto";
import { sql, currentUser } from "../../../lib/server";

// Owner-only: list, mint, or revoke the keys that let outside agents read
// this person's persona file. Each key is a bearer token the owner hands to
// an agent; only the owner (a live session) can create or kill one.
export async function GET() {
  const user = await currentUser();
  if (!user) return Response.json({ error: "Sign in first." }, { status: 401 });
  const grants = await sql`
    SELECT grant_key, label, revoked, read_count, last_read_at, created_at
    FROM grants WHERE user_id = ${user.id} ORDER BY id DESC`;
  return Response.json({ grants, wallet: user.wallet_pubkey });
}

export async function POST(req) {
  const user = await currentUser();
  if (!user) return Response.json({ error: "Sign in first." }, { status: 401 });
  const { label } = await req.json().catch(() => ({}));
  const key = "evg_" + randomBytes(24).toString("hex");
  await sql`INSERT INTO grants (user_id, grant_key, label)
    VALUES (${user.id}, ${key}, ${String(label || "Untitled agent").slice(0, 80)})`;
  return Response.json({ grant_key: key });
}

export async function DELETE(req) {
  const user = await currentUser();
  if (!user) return Response.json({ error: "Sign in first." }, { status: 401 });
  const { grant_key } = await req.json().catch(() => ({}));
  if (!grant_key) return Response.json({ error: "grant_key required" }, { status: 400 });
  await sql`UPDATE grants SET revoked = true
    WHERE user_id = ${user.id} AND grant_key = ${grant_key}`;
  return Response.json({ ok: true });
}
