"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Logo from "../components/Logo";

const EXAMPLE_CHAT = [
  ["you", "Morning. I'm Sari, second-year informatics student in Bandung. Coffee first, then two lectures today."],
  ["anima", "Morning, Sari. Coffee before algorithms sounds right. Which lectures are on today?"],
  ["you", "Databases and statistics. Honestly statistics is the one I keep putting off — I learn better from examples than formulas."],
  ["anima", "Noted: examples over formulas. If you want, bring me a statistics problem after class and I'll walk it through with a concrete case."],
  ["you", "Deal. Also remind me sometime — my sister's birthday is the 24th, I still need a gift under 200k."],
  ["anima", "I'll keep that. Gift for your sister by the 24th, budget 200k. You mentioned she liked your sketchbook — something art-related could fit."]
];

const EXAMPLE_PERSONA = `# Persona
## Identity
- Sari, second-year informatics student in Bandung
## Preferences
- Learns from worked examples rather than formulas
- Coffee before morning lectures
## Ongoing
- Statistics course needs extra attention
- Gift for her sister before the 24th, budget 200k rupiah
## Notes
- Sister may like art supplies (sketchbook mention)`;

function Code({ children }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="relative group">
      <pre className="bg-white/[0.03] border border-white/10 rounded-xl p-4 text-[12px] font-mono text-parchment/85 overflow-x-auto whitespace-pre-wrap">{children}</pre>
      <button
        onClick={() => { navigator.clipboard.writeText(children); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
        className="absolute top-2 right-2 text-[10px] font-mono px-2 py-1 rounded border border-white/15 text-haze opacity-0 group-hover:opacity-100 hover:text-parchment">
        {copied ? "copied" : "copy"}
      </button>
    </div>
  );
}

function Step({ n, title, children }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
      className="flex gap-5">
      <div className="font-mono text-ember text-sm pt-1 shrink-0 w-8">{n}</div>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold mb-2">{title}</h3>
        <div className="text-sm text-haze leading-relaxed space-y-3">{children}</div>
      </div>
    </motion.div>
  );
}

export default function Portability() {
  return (
    <main className="min-h-screen bg-ink text-parchment">
      <nav className="border-b border-white/10">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
          <a href="/"><Logo size={24} /></a>
          <div className="flex items-center gap-4 text-sm">
            <a href="/verify" className="text-haze hover:text-parchment">Verify</a>
            <a href="/chat" className="px-4 py-1.5 rounded-full bg-ember text-ink font-semibold">Open the app</a>
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-16">
        <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          className="font-serif text-4xl lg:text-5xl mb-4">Your memory, out the door with you.</motion.h1>
        <p className="text-haze mb-14 max-w-xl leading-relaxed">
          This page shows the whole loop: an ordinary conversation fills the file, the file leaves as plain
          markdown, and any other AI can pick it up in under a minute. No lock-in at any step.
        </p>

        {/* 1 — how a normal day fills the file */}
        <section className="mb-16">
          <div className="font-mono text-ember text-xs tracking-[0.3em] uppercase mb-6">1 · An ordinary chat fills it</div>
          <p className="text-sm text-haze mb-6 max-w-xl leading-relaxed">
            No forms, no profile setup. You just talk about your day, and every few messages the AI rewrites
            its file about you. Here is a real-shaped example — six messages of small talk:
          </p>
          <div className="space-y-3 mb-8">
            {EXAMPLE_CHAT.map(([role, text], i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                className={`max-w-[85%] ${role === "you" ? "ml-auto" : ""}`}>
                <div className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  role === "you" ? "bg-ember/90 text-ink" : "bg-white/5 border border-white/10"
                }`}>{text}</div>
              </motion.div>
            ))}
          </div>
          <p className="text-sm text-haze mb-4">And this is what the file looks like after those six messages:</p>
          <Code>{EXAMPLE_PERSONA}</Code>
          <p className="text-xs text-haze mt-4">
            Try it yourself in the <a href="/demo" className="text-moss hover:underline">sandbox</a> (nothing saved)
            or for real in <a href="/chat" className="text-moss hover:underline">the app</a> — the persona panel
            sits beside the chat and rewrites in front of you.
          </p>
        </section>

        {/* 2 — export */}
        <section className="mb-16">
          <div className="font-mono text-ember text-xs tracking-[0.3em] uppercase mb-6">2 · Take the file</div>
          <div className="space-y-8">
            <Step n="a" title="One click in the app">
              <p>
                Open <a href="/chat" className="text-moss hover:underline">/chat</a> and press
                <span className="text-parchment font-semibold"> Download persona.md</span> in the sidebar.
                You get a plain markdown file — the entire memory, nothing held back.
              </p>
            </Step>
            <Step n="b" title="Or over the API">
              <p>Signed-in sessions can pull the same file directly:</p>
              <Code>{`curl https://everanima.vercel.app/api/persona/export \\\n  -H "Cookie: session=YOUR_SESSION" -o persona.md`}</Code>
            </Step>
          </div>
        </section>

        {/* 3 — import elsewhere */}
        <section className="mb-16">
          <div className="font-mono text-ember text-xs tracking-[0.3em] uppercase mb-6">3 · Import it anywhere</div>
          <div className="space-y-8">
            <Step n="a" title="ChatGPT">
              <p>
                Settings → Personalization → Custom Instructions → paste the file into
                “What would you like ChatGPT to know about you?”. Or simpler: start any chat with —
              </p>
              <Code>{`Here is my persona file. Use it as context for everything below.\n\n<paste persona.md>`}</Code>
            </Step>
            <Step n="b" title="Claude">
              <p>
                Same move: paste the file at the top of a conversation, or drop persona.md into a Project's
                knowledge so every chat in that project starts already knowing you.
              </p>
            </Step>
            <Step n="c" title="Any agent, hands-free — grant keys">
              <p>
                Skip copy-paste entirely. Mint a grant key in the app (Agent access panel), hand it to any agent,
                and it reads your live persona over the API. Revoke the key and access stops that second.
              </p>
              <Code>{`curl https://everanima.vercel.app/api/persona/YOUR_WALLET \\\n  -H "x-everanima-grant: evg_your_key"`}</Code>
              <p className="text-xs">
                Every read is counted and listed in your dashboard, so you always know which agent looked and when.
              </p>
            </Step>
          </div>
        </section>

        {/* 4 — verify */}
        <section className="mb-10">
          <div className="font-mono text-ember text-xs tracking-[0.3em] uppercase mb-6">4 · Prove it was yours</div>
          <p className="text-sm text-haze max-w-xl leading-relaxed">
            Each sealed version leaves a SHA-256 fingerprint on Solana devnet, signed by your wallet. Hash your
            exported file and compare it against the anchor on{" "}
            <a href="/verify" className="text-moss hover:underline">/verify</a> — a match proves this exact text
            existed at that moment, owned by that wallet. No screenshot can fake it.
          </p>
          <Code>{`# hash your exported file (any machine, no account needed)\nshasum -a 256 persona.md`}</Code>
        </section>

        <div className="border-t border-white/10 pt-10 flex items-center justify-between flex-wrap gap-4">
          <p className="text-sm text-haze">The exit door is the product. Walk through it any time.</p>
          <a href="/signup" className="px-5 py-2 rounded-full bg-ember text-ink text-sm font-semibold">Start your file</a>
        </div>
      </div>
    </main>
  );
}
