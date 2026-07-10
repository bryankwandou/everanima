const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.3-70b-versatile";

// Batched extraction: called once every few messages, not per message,
// to stay well inside the Groq free tier.
export async function POST(req) {
  const { recent, persona } = await req.json();
  if (!Array.isArray(recent) || recent.length === 0) {
    return Response.json({ error: "recent required" }, { status: 400 });
  }

  const transcript = recent
    .slice(-12)
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
    const detail = await res.text();
    return Response.json(
      { error: "groq_error", detail: detail.slice(0, 300) },
      { status: 502 }
    );
  }
  const data = await res.json();
  return Response.json({ persona: data.choices[0].message.content });
}
