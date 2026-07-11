import { sql, currentUser, publicUser } from "../../../../lib/server";

export async function GET() {
  const user = await currentUser();
  if (!user) return Response.json({ user: null });
  const [persona, msgs, anchors] = await Promise.all([
    sql`SELECT content FROM personas WHERE user_id = ${user.id}`,
    sql`SELECT role, content FROM messages WHERE user_id = ${user.id} ORDER BY id ASC`,
    sql`SELECT sig, hash, kind FROM anchors WHERE user_id = ${user.id} ORDER BY id DESC LIMIT 20`
  ]);
  return Response.json({
    user: publicUser(user),
    persona: persona[0]?.content || "",
    messages: msgs,
    anchors
  });
}
