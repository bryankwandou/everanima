import { sql, currentUser } from "../../../lib/server";

// Records a client-signed memory anchor after it lands on devnet.
export async function POST(req) {
  const user = await currentUser();
  if (!user) return Response.json({ error: "Sign in first." }, { status: 401 });
  const { sig, hash } = await req.json();
  if (!sig || !hash) return Response.json({ error: "sig and hash required." }, { status: 400 });
  await sql`
    INSERT INTO anchors (user_id, sig, hash, kind) VALUES (${user.id}, ${sig}, ${hash}, 'memory')
    ON CONFLICT (sig) DO NOTHING`;
  return Response.json({ ok: true });
}
