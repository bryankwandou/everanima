import { cookies } from "next/headers";
import { sql } from "../../../../lib/server";

export async function POST() {
  const token = cookies().get("everanima_session")?.value;
  if (token) await sql`DELETE FROM sessions WHERE token = ${token}`;
  cookies().delete("everanima_session");
  return Response.json({ ok: true });
}
