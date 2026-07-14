import { sql, currentUser } from "../../../../lib/server";

// Downloads the signed-in user's persona.md as a real markdown file.
// This is the ownership story made concrete: the memory leaves as a file.
export async function GET() {
  const user = await currentUser();
  if (!user) return Response.json({ error: "Sign in first." }, { status: 401 });

  const rows = await sql`SELECT content, updated_at FROM personas WHERE user_id = ${user.id}`;
  const content = rows[0]?.content || "";
  if (!content.trim()) {
    return Response.json({ error: "Nothing to export yet — talk to Anima first." }, { status: 404 });
  }

  const stamp = rows[0].updated_at ? new Date(rows[0].updated_at).toISOString() : new Date().toISOString();
  const body = `${content.trim()}\n\n---\nExported from Everanima on ${stamp}\nOwner account: @${user.username}\n`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": 'attachment; filename="persona.md"',
      "Cache-Control": "no-store"
    }
  });
}
