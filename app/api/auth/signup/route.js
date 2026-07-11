import { sql, hashPassword, createSession, publicUser } from "../../../../lib/server";

export async function POST(req) {
  const { username, password, email, fullName } = await req.json();
  if (!username || !password || !email || !fullName) {
    return Response.json(
      { error: "Username, password, email, and full name are all required." },
      { status: 400 }
    );
  }
  if (String(password).length < 8) {
    return Response.json({ error: "Password needs at least 8 characters." }, { status: 400 });
  }
  const uname = String(username).trim().toLowerCase();
  if (!/^[a-z0-9_]{3,24}$/.test(uname)) {
    return Response.json(
      { error: "Username: 3-24 characters, letters, numbers, underscores." },
      { status: 400 }
    );
  }
  const existing = await sql`SELECT id FROM users WHERE username = ${uname} LIMIT 1`;
  if (existing.length) {
    return Response.json({ error: "That username is taken." }, { status: 409 });
  }
  const rows = await sql`
    INSERT INTO users (username, email, full_name, pass_hash)
    VALUES (${uname}, ${String(email).trim()}, ${String(fullName).trim()}, ${hashPassword(password)})
    RETURNING *`;
  await createSession(rows[0].id);
  return Response.json({ user: publicUser(rows[0]) });
}
