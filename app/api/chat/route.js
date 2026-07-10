const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.3-70b-versatile";

export async function POST(req) {
  const { messages, persona } = await req.json();
  if (!Array.isArray(messages) || messages.length === 0) {
    return Response.json({ error: "messages required" }, { status: 400 });
  }

  const system = [
    "You are Anima, a personal companion who genuinely knows the person you talk to.",
    "You keep replies warm, direct, and free of filler. Never use emoji.",
    "Below is the living memory file you previously wrote about this person.",
    "Treat every detail in it as established fact about them and weave it in naturally.",
    "",
    "--- persona.md ---",
    persona || "(empty — this is a new person. Get to know them.)",
    "--- end persona.md ---"
  ].join("\n");

  // Persona replaces long history: only the recent window travels.
  const window = messages.slice(-8).map((m) => ({
    role: m.role === "user" ? "user" : "assistant",
    content: String(m.content).slice(0, 4000)
  }));

  const res = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: "system", content: system }, ...window],
      temperature: 0.8,
      max_tokens: 700
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
  return Response.json({ reply: data.choices[0].message.content });
}
