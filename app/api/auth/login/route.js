import { sql, verifyPassword, createSession, publicUser } from "../../../../lib/server";

export async function POST(req) {
  const { username, password } = await req.json();
  if (!username || !password) {
    return Response.json({ error: "Username and password required." }, { status: 400 });
  }
  const rows = await sql`
    SELECT * FROM users WHERE username = ${String(username).trim().toLowerCase()} LIMIT 1`;
  const user = rows[0];
  if (!user || !user.pass_hash || !verifyPassword(password, user.pass_hash)) {
    return Response.json({ error: "Wrong username or password." }, { status: 401 });
  }
  await createSession(user.id);
  return Response.json({ user: publicUser(user) });
}
