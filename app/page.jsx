"use client";

import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionValue,
  useInView,
  AnimatePresence
} from "framer-motion";
import { useRef, useState, useEffect } from "react";
import Logo from "./components/Logo";

const easeOut = [0.22, 1, 0.36, 1];
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.6, ease: easeOut }
  })
};

const DEMO_LINES = [
  "# Persona",
  "## Identity",
  "- Bryan, information technology student, class of 2023",
  "- Ships Solana projects, runs a small trading bot",
  "## Preferences",
  "- Straight answers, dark interfaces, no small talk",
  "## Ongoing",
  "- Hackathon entry due this week",
  "- Working through Rust on weekends",
  "## Notes",
  "- Wants to be asked before big decisions"
];

function TypingPersona() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const id = setInterval(
      () => setCount((c) => (c >= DEMO_LINES.length ? 0 : c + 1)),
      650
    );
    return () => clearInterval(id);
  }, []);
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 font-mono text-[12px] leading-relaxed min-h-[290px]">
      <div className="flex items-center justify-between mb-3">
        <span className="text-haze text-[10px] uppercase tracking-widest">
          persona.md — the AI keeps this file itself
        </span>
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

// 3D tilt wrapper that follows the pointer.
function TiltCard({ children }) {
  const ref = useRef(null);
  const rx = useSpring(useMotionValue(0), { stiffness: 150, damping: 20 });
  const ry = useSpring(useMotionValue(0), { stiffness: 150, damping: 20 });
  function onMove(e) {
    const r = ref.current.getBoundingClientRect();
    ry.set(((e.clientX - r.left) / r.width - 0.5) * 14);
    rx.set(-((e.clientY - r.top) / r.height - 0.5) * 14);
  }
  function onLeave() { rx.set(0); ry.set(0); }
  return (
    <motion.div ref={ref} onMouseMove={onMove} onMouseLeave={onLeave}
      style={{ rotateX: rx, rotateY: ry, transformStyle: "preserve-3d", perspective: 900 }}>
      {children}
    </motion.div>
  );
}

// Button that leans toward the cursor.
function MagneticLink({ href, className, children }) {
  const ref = useRef(null);
  const x = useSpring(useMotionValue(0), { stiffness: 200, damping: 15 });
  const y = useSpring(useMotionValue(0), { stiffness: 200, damping: 15 });
  function onMove(e) {
    const r = ref.current.getBoundingClientRect();
    x.set((e.clientX - r.left - r.width / 2) * 0.3);
    y.set((e.clientY - r.top - r.height / 2) * 0.3);
  }
  return (
    <motion.a ref={ref} href={href} className={className} style={{ x, y }}
      onMouseMove={onMove} onMouseLeave={() => { x.set(0); y.set(0); }}
      whileTap={{ scale: 0.96 }}>
      {children}
    </motion.a>
  );
}

function CountUp({ to, suffix = "" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const start = performance.now();
    const tick = (t) => {
      const p = Math.min(1, (t - start) / 1200);
      setVal(Math.round(to * (1 - Math.pow(1 - p, 3))));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, to]);
  return <span ref={ref}>{val}{suffix}</span>;
}

function CursorGlow() {
  const x = useSpring(useMotionValue(-300), { stiffness: 60, damping: 20 });
  const y = useSpring(useMotionValue(-300), { stiffness: 60, damping: 20 });
  useEffect(() => {
    const move = (e) => { x.set(e.clientX - 200); y.set(e.clientY - 200); };
    window.addEventListener("pointermove", move);
    return () => window.removeEventListener("pointermove", move);
  }, [x, y]);
  return (
    <motion.div aria-hidden style={{ x, y }}
      className="fixed top-0 left-0 w-[400px] h-[400px] rounded-full pointer-events-none z-0 hidden lg:block">
      <div className="w-full h-full rounded-full bg-ember/[0.06] blur-3xl" />
    </motion.div>
  );
}

const COMPARISON = [
  ["Where the memory lives", "Their servers, tied to their app", "A markdown file bound to your wallet"],
  ["Can you read all of it?", "Partially — surface notes only", "Every word, every version"],
  ["Take it to another AI?", "No export, no API for rivals", "Any agent you authorize can read it"],
  ["Proof it hasn't changed?", "None", "Hash of each version sits on Solana"],
  ["If the company shuts down", "Memory gone", "File and its trail survive on-chain"],
  ["Who can revoke access?", "They can — it's their database", "Only your key signs the grants"]
];

const FAQS = [
  ["ChatGPT gives me free memory. Why would I pay for this?", "ChatGPT's memory is a feature of their product, and that's exactly the problem: it lives in their building, works only inside their app, and disappears the day you leave. What you pay for here is not a smarter chat — it's the deed. Your persona is a plain file bound to your wallet, checkable on Solana, and readable by any agent you point at it. Renting memory and owning it are different products."],
  ["Do I need Phantom?", "No. Sign-in works with any Solana wallet that can sign a message — Phantom, Solflare, Backpack, Glow, Trust, and the rest. If you have several installed, you pick which one. If you have none, the app carries its own throwaway key so you can still try everything."],
  ["Why does this need a blockchain?", "Because the file has to outlive any single company. Each version is fingerprinted on Solana and tied to your wallet, so you can hand another agent provable access without asking us for permission. A private database cannot make that promise."],
  ["What does the AI actually store?", "Only what you say. The file is plain markdown you can read, edit, or wipe. No hidden notes, no shadow profile."],
  ["What happens when chats get long?", "Nothing. The persona replaces raw history, so the model reads the same compact file at message ten or message ten thousand. Cost stays flat and the thread never frays."]
];

function FAQ() {
  const [open, setOpen] = useState(null);
  return (
    <div className="space-y-3">
      {FAQS.map(([q, a], i) => (
        <div key={q} className="rounded-2xl border border-white/10 overflow-hidden">
          <button onClick={() => setOpen(open === i ? null : i)}
            className="w-full flex items-center justify-between text-left px-6 py-4 hover:bg-white/[0.03]">
            <span className="font-medium">{q}</span>
            <motion.span animate={{ rotate: open === i ? 45 : 0 }} className="text-ember text-xl leading-none">+</motion.span>
          </button>
          <AnimatePresence initial={false}>
            {open === i && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: easeOut }}>
                <p className="px-6 pb-5 text-sm text-haze leading-relaxed">{a}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}

export default function Landing() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll();
  const barWidth = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  const { scrollYProgress: heroP } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const y = useTransform(heroP, [0, 1], [0, 120]);
  const opacity = useTransform(heroP, [0, 0.8], [1, 0]);

  return (
    <main className="bg-ink text-parchment relative">
      <CursorGlow />
      <motion.div style={{ scaleX: barWidth }}
        className="fixed top-0 inset-x-0 h-[2px] bg-gradient-to-r from-ember to-moss origin-left z-50" />

      <nav className="fixed top-0 inset-x-0 z-40 backdrop-blur border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <a href="/"><Logo size={26} /></a>
          <div className="flex items-center gap-6 text-sm">
            <a href="#why" className="text-haze hover:text-parchment hidden sm:block">Why not ChatGPT</a>
            <a href="#how" className="text-haze hover:text-parchment hidden sm:block">How it works</a>
            <a href="#pricing" className="text-haze hover:text-parchment hidden sm:block">Pricing</a>
            <a href="/demo" className="text-haze hover:text-parchment">Demo</a>
            <a href="/login" className="text-haze hover:text-parchment">Sign in</a>
            <MagneticLink href="/signup"
              className="px-4 py-1.5 rounded-full bg-parchment text-ink font-semibold hover:opacity-90">
              Create account
            </MagneticLink>
          </div>
        </div>
      </nav>

      <section ref={heroRef} className="min-h-screen flex items-center pt-14 relative overflow-hidden">
        <motion.div style={{ y, opacity }} className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-ember/10 blur-3xl" />
          <div className="absolute bottom-0 -left-40 w-[400px] h-[400px] rounded-full bg-moss/10 blur-3xl" />
        </motion.div>
        <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center relative z-10">
          <div>
            <motion.p variants={fadeUp} initial="hidden" animate="show" custom={0}
              className="text-xs uppercase tracking-[0.3em] text-ember mb-5">
              Your memory, your wallet · Solana devnet
            </motion.p>
            <motion.h1 variants={fadeUp} initial="hidden" animate="show" custom={1}
              className="font-serif text-5xl lg:text-6xl leading-[1.05] tracking-tight">
              The AI memory you actually own.
            </motion.h1>
            <motion.p variants={fadeUp} initial="hidden" animate="show" custom={2}
              className="mt-6 text-lg text-haze max-w-md leading-relaxed">
              Every assistant loses you once the chat runs long — and whatever it did learn sits in someone else&apos;s database. Everanima keeps a persona file the AI writes itself, fingerprints every version on Solana, and ties it to your wallet. One memory, carried across every agent you choose to trust.
            </motion.p>
            <motion.div variants={fadeUp} initial="hidden" animate="show" custom={3} className="mt-8 flex gap-3">
              <MagneticLink href="/signup"
                className="px-6 py-3 rounded-full bg-ember text-ink font-semibold">
                Start your file
              </MagneticLink>
              <MagneticLink href="/demo"
                className="px-6 py-3 rounded-full border border-white/15 hover:border-white/40 transition-colors">
                Try the sandbox first
              </MagneticLink>
            </motion.div>
          </div>
          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.7 }}>
            <TiltCard><TypingPersona /></TiltCard>
          </motion.div>
        </div>
      </section>

      <section className="py-16 border-t border-white/5">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-3 gap-6 text-center">
          {[[350, " words", "is all the model ever needs to know you"],
            [4, " messages", "between each rewrite of your file"],
            [1, " owner", "of the memory: the wallet in your pocket"]].map(([n, s, label]) => (
            <div key={label}>
              <div className="font-serif text-4xl text-ember"><CountUp to={n} suffix={s} /></div>
              <p className="text-xs text-haze mt-2 leading-relaxed">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-28 border-t border-white/5">
        <div className="max-w-4xl mx-auto px-6">
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="font-serif text-3xl lg:text-4xl mb-10">
            Three quiet failures, one root cause: you never owned the memory.
          </motion.h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              ["The thread frays", "Past a certain length, models shed the earliest messages. Your name and your goals go first, and the assistant starts guessing."],
              ["The notes are hidden", "Closed products keep private records about you. You cannot read them, fix them, or take them when you go."],
              ["Switching costs everything", "Move to a new assistant and years of context stay behind, locked in a company you just left."]
            ].map(([title, body], i) => (
              <motion.div key={title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                whileHover={{ y: -6 }}
                className="rounded-2xl border border-white/10 p-6 hover:border-ember/40 transition-colors">
                <h3 className="font-semibold mb-2">{title}</h3>
                <p className="text-sm text-haze leading-relaxed">{body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why not ChatGPT */}
      <section id="why" className="py-28 border-t border-white/5">
        <div className="max-w-4xl mx-auto px-6">
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="font-serif text-3xl lg:text-4xl mb-4">
            ChatGPT remembers you too. For as long as you stay.
          </motion.h2>
          <p className="text-haze mb-10 max-w-xl leading-relaxed">
            Their memory is a retention feature: useful, free, and built to keep you inside one app.
            Ours is property. The distinction shows up the day you want to leave.
          </p>
          <div className="rounded-2xl border border-white/10 overflow-x-auto">
            <table className="w-full text-sm min-w-[560px]">
              <thead>
                <tr className="border-b border-white/10 text-left">
                  <th className="px-5 py-4 font-medium text-haze"></th>
                  <th className="px-5 py-4 font-medium text-haze">Hosted memory (ChatGPT and friends)</th>
                  <th className="px-5 py-4 font-medium text-ember">Everanima</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map(([row, them, us], i) => (
                  <motion.tr key={row} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
                    viewport={{ once: true }} transition={{ delay: i * 0.06 }}
                    className="border-b border-white/5 last:border-0">
                    <td className="px-5 py-3.5 text-parchment/90 font-medium">{row}</td>
                    <td className="px-5 py-3.5 text-haze">{them}</td>
                    <td className="px-5 py-3.5 text-parchment">{us}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section id="how" className="py-28 border-t border-white/5">
        <div className="max-w-4xl mx-auto px-6">
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="font-serif text-3xl lg:text-4xl mb-4">The memory loop</motion.h2>
          <p className="text-haze mb-12 max-w-lg">Four steps, each one checkable, all running on Solana devnet right now.</p>
          <div className="space-y-6">
            {[
              ["01", "You talk", "Anima answers with your full persona in view, so quality never hangs on how long the chat has run."],
              ["02", "It writes", "Every few messages the AI rewrites persona.md on its own: identity, preferences, open threads. Plain markdown, every word readable."],
              ["03", "It anchors", "Each version is hashed and committed to Solana through the Memo program, signed by your key. The file becomes an asset with a paper trail."],
              ["04", "It travels", "Because the file belongs to your wallet, any agent you authorize can read it. Leave us, keep the memory. That part is the point."]
            ].map(([num, step, body], i) => (
              <motion.div key={num} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                whileHover={{ x: 8 }}
                className="flex gap-6 items-start rounded-2xl border border-white/10 p-6">
                <span className="font-mono text-ember text-sm">{num}</span>
                <div>
                  <h3 className="font-semibold mb-1">{step}</h3>
                  <p className="text-sm text-haze leading-relaxed">{body}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="py-28 border-t border-white/5">
        <div className="max-w-4xl mx-auto px-6">
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="font-serif text-3xl lg:text-4xl mb-12">Two tiers. The chain does the bookkeeping.</motion.h2>
          <div className="grid md:grid-cols-2 gap-6">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              whileHover={{ y: -6 }} className="rounded-2xl border border-white/10 p-8">
              <h3 className="font-semibold text-lg">Free</h3>
              <p className="font-serif text-4xl my-4">0 SOL</p>
              <ul className="text-sm text-haze space-y-2">
                <li>20 messages, counted by the server</li>
                <li>A persona file the AI keeps for you</li>
                <li>Every version anchored on-chain</li>
                <li>Short, focused answers</li>
              </ul>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ delay: 0.1 }} whileHover={{ y: -6 }}
              className="rounded-2xl border border-ember/50 bg-ember/5 p-8">
              <h3 className="font-semibold text-lg text-ember">Eternal</h3>
              <p className="font-serif text-4xl my-4">0.05 SOL <span className="text-sm text-haze">devnet</span></p>
              <ul className="text-sm text-haze space-y-2">
                <li>No message ceiling</li>
                <li>Longer answers that lean on your file</li>
                <li>The server checks your payment on-chain before it flips the switch</li>
                <li>Same flow carries to mainnet with USDC</li>
              </ul>
              <MagneticLink href="/signup"
                className="mt-6 inline-block px-6 py-2.5 rounded-full bg-ember text-ink font-semibold">
                Go Eternal
              </MagneticLink>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-28 border-t border-white/5">
        <div className="max-w-3xl mx-auto px-6">
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="font-serif text-3xl lg:text-4xl mb-10">Fair questions</motion.h2>
          <FAQ />
        </div>
      </section>

      <section className="py-28 border-t border-white/5 text-center relative overflow-hidden">
        <div aria-hidden className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full bg-ember/10 blur-3xl pointer-events-none" />
        <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="font-serif text-4xl mb-6 relative">Start the file that follows you everywhere.</motion.h2>
        <MagneticLink href="/signup"
          className="relative inline-block px-8 py-4 rounded-full bg-parchment text-ink font-semibold text-lg">
          Open Everanima
        </MagneticLink>
        <p className="mt-16 text-xs text-haze relative">
          Built for the Solana AI agent hackathon. Everything above runs on devnet today.
        </p>
      </section>
    </main>
  );
}
