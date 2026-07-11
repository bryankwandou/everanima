import { sql, currentUser, FREE_LIMIT } from "../../../lib/server";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.3-70b-versatile";

async function callGroq(system, window, temperature, maxTokens) {
  const res = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: "system", content: system }, ...window],
      temperature,
      max_tokens: maxTokens
    })
  });
  if (!res.ok) throw new Error((await res.text()).slice(0, 300));
  return (await res.json()).choices[0].message.content;
}

function systemPrompt(persona, eternal) {
  return [
    "You are Anima, a personal companion who genuinely knows the person you talk to.",
    "You keep replies warm, direct, and free of filler. Never use emoji.",
    eternal
      ? "This person is an Eternal member: give your fullest, most thoughtful answers, reference their memory file often, and proactively connect new topics to what you know about them."
      : "This person is on the free tier: keep answers helpful but brief (a few sentences).",
    "Below is the living memory file you previously wrote about this person.",
    "Treat every detail in it as established fact about them and weave it in naturally.",
    "",
    "--- persona.md ---",
    persona || "(empty — this is a new person. Get to know them.)",
    "--- end persona.md ---"
  ].join("\n");
}

// Demo sandbox mode: stateless, clearly separated from real accounts.
async function demoReply(messages) {
  const window = messages.slice(-6).map((m) => ({
    role: m.role === "user" ? "user" : "assistant",
    content: String(m.content).slice(0, 2000)
  }));
  const system =
    "You are Anima running in a public demo sandbox. Nothing is saved. " +
    "Answer briefly and remind the person once, naturally, that the demo forgets everything — the real app at /signup is the one that remembers.";
  const reply = await callGroq(system, window, 0.8, 400);
  return Response.json({ reply, demo: true });
}

export async function POST(req) {
  const { messages, demo } = await req.json();
  if (!Array.isArray(messages) || messages.length === 0) {
    return Response.json({ error: "messages required" }, { status: 400 });
  }

  try {
    if (demo) return await demoReply(messages);

    const user = await currentUser();
    if (!user) {
      return Response.json({ error: "Sign in to use the real app." }, { status: 401 });
    }

    const eternal = user.tier === "eternal";
    if (!eternal && user.msg_count >= FREE_LIMIT) {
      return Response.json(
        { error: "free_limit", detail: `Free tier ends at ${FREE_LIMIT} messages. Go Eternal to continue.` },
        { status: 402 }
      );
    }

    const personaRows = await sql`SELECT content FROM personas WHERE user_id = ${user.id}`;
    const persona = personaRows[0]?.content || "";

    const userText = String(messages[messages.length - 1].content).slice(0, 4000);
    const window = messages.slice(-8).map((m) => ({
      role: m.role === "user" ? "user" : "assistant",
      content: String(m.content).slice(0, 4000)
    }));

    const reply = await callGroq(
      systemPrompt(persona, eternal),
      window,
      0.8,
      eternal ? 900 : 350
    );

    await sql`INSERT INTO messages (user_id, role, content) VALUES
      (${user.id}, 'user', ${userText}), (${user.id}, 'assistant', ${reply})`;
    const updated = await sql`
      UPDATE users SET msg_count = msg_count + 1 WHERE id = ${user.id}
      RETURNING msg_count, tier`;

    return Response.json({
      reply,
      msgCount: updated[0].msg_count,
      tier: updated[0].tier,
      freeLimit: FREE_LIMIT
    });
  } catch (e) {
    return Response.json({ error: "groq_error", detail: e.message }, { status: 502 });
  }
}
