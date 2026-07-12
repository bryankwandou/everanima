import { sql, currentUser } from "../../../lib/server";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.3-70b-versatile";

// Batched extraction: called once every few messages, not per message,
// to stay well inside the Groq free tier. Persona is stored server-side.
export async function POST(req) {
  const user = await currentUser();
  if (!user) return Response.json({ error: "Sign in first." }, { status: 401 });

  const recent = await sql`
    SELECT role, content FROM messages WHERE user_id = ${user.id}
    ORDER BY id DESC LIMIT 12`;
  if (!recent.length) return Response.json({ error: "nothing to remember" }, { status: 400 });

  const personaRows = await sql`SELECT content FROM personas WHERE user_id = ${user.id}`;
  const persona = personaRows[0]?.content || "";

  const transcript = recent
    .reverse()
    .map((m) => `${m.role === "user" ? "Them" : "Anima"}: ${String(m.content).slice(0, 1500)}`)
    .join("\n");

  const prompt = [
    "You maintain a memory file called persona.md about one specific person.",
    "Rewrite the file so it stays complete, current, and under 350 words.",
    "Keep this structure with markdown headers:",
    "# Persona",
    "## Identity  (name, background, roles — only what they actually said)",
    "## Preferences  (style, likes, dislikes)",
    "## Ongoing  (projects, goals, open threads)",
    "## Notes  (anything else worth keeping)",
    "Merge new facts from the transcript into the current file.",
    "Never invent facts. Drop stale details when contradicted. Output only the file.",
    "",
    "--- current persona.md ---",
    persona || "(empty)",
    "--- recent transcript ---",
    transcript
  ].join("\n");

  const res = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
      max_tokens: 600
    })
  });
  if (!res.ok) {
    return Response.json(
      { error: "groq_error", detail: (await res.text()).slice(0, 300) },
      { status: 502 }
    );
  }
  const data = await res.json();
  const next = data.choices[0].message.content;

  await sql`
    INSERT INTO personas (user_id, content, updated_at) VALUES (${user.id}, ${next}, now())
    ON CONFLICT (user_id) DO UPDATE SET content = ${next}, updated_at = now()`;

  // The persona lives in Postgres. Anchoring to devnet is a deliberate,
  // user-signed action from the browser (see /api/anchor) — the user's own
  // wallet seals the version. The server never holds a signing key.
  return Response.json({ persona: next });
}
