"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Demo sandbox: fully separated from the real app.
// Nothing is saved — no account, no database, no wallet, no memory file.
export default function DemoPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, busy]);

  async function send() {
    const text = input.trim();
    if (!text || busy) return;
    setInput("");
    const next = [...messages, { role: "user", content: text }];
    setMessages(next);
    setBusy(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next, demo: true })
      });
      const data = await res.json();
      setMessages([...next, {
        role: "assistant",
        content: data.reply || "Demo error: " + (data.detail || data.error)
      }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-ink text-parchment flex flex-col">
      <div className="bg-moss/15 border-b border-moss/30 text-center text-xs py-2 px-4 text-moss">
        Demo sandbox — nothing is saved here. No account, no memory, no blockchain.
        The real app lives at <a href="/signup" className="underline">/signup</a>.
      </div>
      <nav className="border-b border-white/10">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
          <a href="/" className="font-serif text-lg">Everanima <span className="text-xs text-haze font-sans">demo</span></a>
          <a href="/signup" className="px-4 py-1.5 rounded-full bg-ember text-ink text-sm font-semibold">Get the real thing</a>
        </div>
      </nav>
      <div className="flex-1 overflow-y-auto p-6 space-y-4 max-w-4xl mx-auto w-full">
        {messages.length === 0 && (
          <div className="mt-20 text-center text-haze">
            <p className="font-serif text-2xl text-parchment mb-3">Try Anima with zero commitment.</p>
            <p className="text-sm max-w-sm mx-auto">This sandbox forgets everything when you leave. The real app writes a persona file about you and anchors it to Solana devnet.</p>
          </div>
        )}
        <AnimatePresence initial={false}>
          {messages.map((m, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className={`max-w-2xl ${m.role === "user" ? "ml-auto" : ""}`}>
              <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                m.role === "user" ? "bg-moss/80 text-ink" : "bg-white/5 border border-white/10"
              }`}>{m.content}</div>
            </motion.div>
          ))}
        </AnimatePresence>
        {busy && <div className="text-haze text-sm cursorline">Anima is thinking…</div>}
        <div ref={bottomRef} />
      </div>
      <div className="border-t border-white/10 p-4">
        <div className="flex gap-2 max-w-3xl mx-auto">
          <input value={input} onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Say anything — it will be forgotten…"
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-moss" />
          <button onClick={send} disabled={busy}
            className="px-5 rounded-xl bg-parchment text-ink text-sm font-semibold disabled:opacity-40">
            Send
          </button>
        </div>
      </div>
    </main>
  );
}
