"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState, useEffect } from "react";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.12, duration: 0.6, ease: [0.22, 1, 0.36, 1] }
  })
};

const DEMO_LINES = [
  "# Persona",
  "## Identity",
  "- Bryan, information technology student, class of 2023",
  "- Builds Solana projects, runs a small trading bot",
  "## Preferences",
  "- Direct answers, no filler, dark interfaces",
  "## Ongoing",
  "- Preparing a hackathon submission this week",
  "- Learning Rust on weekends",
  "## Notes",
  "- Prefers being asked before big decisions"
];

function TypingPersona() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setCount((c) => (c >= DEMO_LINES.length ? 0 : c + 1)), 700);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 font-mono text-[12px] leading-relaxed min-h-[280px]">
      <div className="flex items-center justify-between mb-3">
        <span className="text-haze text-[10px] uppercase tracking-widest">persona.md — written by the AI itself</span>
        <span className="text-ember text-[10px] cursorline">rewriting</span>
      </div>
      {DEMO_LINES.slice(0, count).map((l, i) => (
        <motion.div key={i} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
          className={l.startsWith("#") ? "text-ember mt-1" : "text-parchment/75"}>
          {l}
        </motion.div>
      ))}
      <span className="cursorline text-parchment">▍</span>
    </div>
  );
}

export default function Landing() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <main className="bg-ink text-parchment">
      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-40 backdrop-blur border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <span className="font-serif text-lg tracking-tight">Everanima</span>
          <div className="flex items-center gap-6 text-sm">
            <a href="#how" className="text-haze hover:text-parchment">How it works</a>
            <a href="#pricing" className="text-haze hover:text-parchment">Pricing</a>
            <a href="/demo" className="text-haze hover:text-parchment">Demo</a>
            <a href="/login" className="text-haze hover:text-parchment">Sign in</a>
            <a href="/signup" className="px-4 py-1.5 rounded-full bg-parchment text-ink font-semibold hover:opacity-90">Create account</a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section ref={heroRef} className="min-h-screen flex items-center pt-14 relative overflow-hidden">
        <motion.div style={{ y, opacity }} className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-ember/10 blur-3xl" />
          <div className="absolute bottom-0 -left-40 w-[400px] h-[400px] rounded-full bg-moss/10 blur-3xl" />
        </motion.div>
        <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center relative">
          <div>
            <motion.p variants={fadeUp} initial="hidden" animate="show" custom={0}
              className="text-xs uppercase tracking-[0.3em] text-ember mb-5">
              Personal AI · Solana devnet
            </motion.p>
            <motion.h1 variants={fadeUp} initial="hidden" animate="show" custom={1}
              className="font-serif text-5xl lg:text-6xl leading-[1.05] tracking-tight">
              An AI that writes its own memory of you.
            </motion.h1>
            <motion.p variants={fadeUp} initial="hidden" animate="show" custom={2}
              className="mt-6 text-lg text-haze max-w-md leading-relaxed">
              Every assistant forgets you once the chat gets long. Everanima keeps a living persona file it maintains itself, anchors each version to your Solana wallet, and never loses the thread of who you are.
            </motion.p>
            <motion.div variants={fadeUp} initial="hidden" animate="show" custom={3} className="mt-8 flex gap-3">
              <a href="/signup" className="px-6 py-3 rounded-full bg-ember text-ink font-semibold hover:scale-[1.03] transition-transform">
                Start talking
              </a>
              <a href="/demo" className="px-6 py-3 rounded-full border border-white/15 hover:border-white/40 transition-colors">
                Try the demo first
              </a>
            </motion.div>
          </div>
          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4, duration: 0.7 }}>
            <TypingPersona />
          </motion.div>
        </div>
      </section>

      {/* Problem */}
      <section className="py-28 border-t border-white/5">
        <div className="max-w-4xl mx-auto px-6">
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="font-serif text-3xl lg:text-4xl mb-10">
            Long chats erode every assistant. That is the whole problem.
          </motion.h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              ["Context overflow", "Past a certain length, models drop the earliest messages. Your name, your goals, your history — gone first."],
              ["Memory you cannot see", "Closed products keep hidden notes about you. You cannot read, correct, export, or own them."],
              ["Nothing is portable", "Switch apps and you start from zero. Years of context locked inside someone else's database."]
            ].map(([title, body], i) => (
              <motion.div key={title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="rounded-2xl border border-white/10 p-6">
                <h3 className="font-semibold mb-2">{title}</h3>
                <p className="text-sm text-haze leading-relaxed">{body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="py-28 border-t border-white/5">
        <div className="max-w-4xl mx-auto px-6">
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="font-serif text-3xl lg:text-4xl mb-4">The memory loop</motion.h2>
          <p className="text-haze mb-12 max-w-lg">Four steps, all verifiable, all running on Solana devnet today.</p>
          <div className="space-y-6">
            {[
              ["01 — You talk", "Anima answers with your full persona injected, so context never depends on chat length."],
              ["02 — It writes", "Every few messages, the AI rewrites persona.md itself: identity, preferences, ongoing threads. You can read every word."],
              ["03 — It anchors", "Each version is hashed and committed to Solana devnet through the Memo program, signed by your wallet. Your memory becomes a verifiable asset you own."],
              ["04 — It scales flat", "The persona replaces raw history. Ten messages or ten thousand — the AI receives the same compact file, so cost and quality stay constant."]
            ].map(([step, body], i) => (
              <motion.div key={step} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="flex gap-6 items-start rounded-2xl border border-white/10 p-6">
                <span className="font-mono text-ember text-sm whitespace-nowrap">{step.split(" — ")[0]}</span>
                <div>
                  <h3 className="font-semibold mb-1">{step.split(" — ")[1]}</h3>
                  <p className="text-sm text-haze leading-relaxed">{body}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-28 border-t border-white/5">
        <div className="max-w-4xl mx-auto px-6">
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="font-serif text-3xl lg:text-4xl mb-12">Two tiers, paid on-chain.</motion.h2>
          <div className="grid md:grid-cols-2 gap-6">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="rounded-2xl border border-white/10 p-8">
              <h3 className="font-semibold text-lg">Free</h3>
              <p className="font-serif text-4xl my-4">0 SOL</p>
              <ul className="text-sm text-haze space-y-2">
                <li>20 messages, enforced server-side</li>
                <li>Self-writing persona file, stored in Postgres</li>
                <li>On-chain memory anchors</li>
                <li>Concise answers</li>
              </ul>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="rounded-2xl border border-ember/50 bg-ember/5 p-8">
              <h3 className="font-semibold text-lg text-ember">Eternal</h3>
              <p className="font-serif text-4xl my-4">0.05 SOL <span className="text-sm text-haze">devnet</span></p>
              <ul className="text-sm text-haze space-y-2">
                <li>Unlimited messages</li>
                <li>Longer, deeper answers that lean on your memory file</li>
                <li>Payment verified on-chain by the server before unlock</li>
                <li>Mainnet path: USDC, same flow</li>
              </ul>
              <a href="/signup" className="mt-6 inline-block px-6 py-2.5 rounded-full bg-ember text-ink font-semibold">Go Eternal</a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-28 border-t border-white/5 text-center">
        <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="font-serif text-4xl mb-6">Meet the version of AI that keeps you.</motion.h2>
        <a href="/chat" className="inline-block px-8 py-4 rounded-full bg-parchment text-ink font-semibold text-lg hover:scale-[1.03] transition-transform">
          Open Everanima
        </a>
        <p className="mt-16 text-xs text-haze">Everanima — built for the Solana AI agent hackathon. Runs on devnet.</p>
      </section>
    </main>
  );
}
