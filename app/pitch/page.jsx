"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Logo from "../components/Logo";

const ANCHOR_SIG =
  "NiMDDjuytovXggWMH9QbAnbZUK8VDcrh71788Tu2GF1xjE64S8bbFYRQbybVJGU7MCbfoeLtcV39qEZCWvggE4Y";
const ANCHOR_HASH =
  "73c048f549cd157b43f6073e7bf3973e0df334dc79f19feabde54231338f6cc7";
const PROOF_WALLET = "35z7X59rtyts557Up1RAwpyYN7x2cFqcDc7RjPuNxFzr";

function Kicker({ children }) {
  return (
    <div className="font-mono text-ember text-xs tracking-[0.3em] uppercase mb-6">{children}</div>
  );
}

function Foot({ n }) {
  return (
    <div className="absolute bottom-6 left-8 right-8 flex items-center justify-between text-[11px] text-haze font-mono">
      <span>Everanima — everanima.vercel.app</span>
      <span>{String(n).padStart(2, "0")} / 12</span>
    </div>
  );
}

/* ---------------- slides ---------------- */

const slides = [
  function Title() {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center px-10">
        <Logo size={64} withWordmark={false} />
        <h1 className="font-serif text-5xl lg:text-7xl mt-8 tracking-tight">
          The AI memory<br />you actually own.
        </h1>
        <p className="text-haze mt-6 max-w-md">
          A personal AI that writes its own file about you, sealed to Solana with your wallet.
        </p>
        <div className="flex items-center gap-3 mt-8 font-mono text-xs">
          <span className="px-3 py-1 rounded-full border border-moss/50 text-moss">LIVE ON SOLANA DEVNET</span>
          <span className="px-3 py-1 rounded-full border border-white/15 text-haze">everanima.vercel.app</span>
        </div>
      </div>
    );
  },

  function Problem() {
    return (
      <div className="h-full flex flex-col justify-center px-14 lg:px-24">
        <Kicker>The problem</Kicker>
        <h2 className="font-serif text-4xl lg:text-5xl leading-tight max-w-3xl">
          Every assistant forgets you. And what it does learn, you never owned.
        </h2>
        <div className="grid md:grid-cols-3 gap-6 mt-12 max-w-4xl">
          {[
            ["The thread frays", "Past a certain chat length, models shed your earliest context. Your name and goals go first."],
            ["The notes are hidden", "Closed products keep private records about you. You cannot read, correct, or export them."],
            ["Switching costs everything", "Move to a new assistant and years of context stay behind, locked in a company you just left."]
          ].map(([t, b]) => (
            <div key={t} className="rounded-xl border border-white/10 p-5">
              <div className="font-semibold mb-2">{t}</div>
              <p className="text-sm text-haze leading-relaxed">{b}</p>
            </div>
          ))}
        </div>
      </div>
    );
  },

  function Insight() {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center px-10">
        <Kicker>The insight</Kicker>
        <h2 className="font-serif text-4xl lg:text-6xl leading-tight max-w-4xl">
          Memory should be an <span className="text-ember">asset you hold</span>,<br />
          not a byproduct a vendor keeps.
        </h2>
        <p className="text-haze mt-8 max-w-lg leading-relaxed">
          A wallet already proves who you are and what you own. Everanima extends that to the one thing
          no platform lets you take with you: what your AI knows about you.
        </p>
      </div>
    );
  },

  function Product() {
    return (
      <div className="h-full flex flex-col justify-center px-14 lg:px-24">
        <Kicker>The product</Kicker>
        <h2 className="font-serif text-4xl lg:text-5xl max-w-3xl leading-tight mb-10">
          persona.md — a file the AI writes about you, in the open.
        </h2>
        <div className="grid lg:grid-cols-2 gap-8 items-start max-w-5xl">
          <div className="rounded-xl border border-white/10 p-5 font-mono text-[13px] leading-relaxed text-parchment/85 bg-white/[0.02]">
            <div className="text-haze text-[10px] tracking-[0.25em] mb-3">PERSONA.MD — WRITTEN BY THE AI</div>
            <pre className="whitespace-pre-wrap"># Persona{"\n"}## Identity{"\n"}- Bryan, IT student, ships Solana apps{"\n"}## Preferences{"\n"}- Straight answers, dark interfaces{"\n"}## Ongoing{"\n"}- Hackathon build due this week</pre>
          </div>
          <ul className="space-y-4 text-sm leading-relaxed">
            {[
              ["Self-writing", "Every few messages, one extraction call rewrites the file. No manual note-taking."],
              ["Fully readable", "Plain markdown. Every word the AI keeps about you is on screen."],
              ["Exportable", "Download persona.md any time, or let another agent read it over the API."],
              ["Injected everywhere", "Each reply runs with the persona in context, so quality never depends on chat length."]
            ].map(([t, b]) => (
              <li key={t} className="flex gap-3">
                <span className="text-ember font-mono">—</span>
                <span><span className="font-semibold">{t}.</span> <span className="text-haze">{b}</span></span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  },

  function How() {
    return (
      <div className="h-full flex flex-col justify-center px-14 lg:px-24">
        <Kicker>How it works</Kicker>
        <h2 className="font-serif text-4xl lg:text-5xl mb-12">Four steps, each one checkable.</h2>
        <div className="grid md:grid-cols-4 gap-4 max-w-5xl">
          {[
            ["01", "You talk", "Groq llama-3.3-70b answers with your persona in view."],
            ["02", "It writes", "The AI rewrites persona.md on its own. Stored in Postgres, tied to your account."],
            ["03", "You seal it", "Your wallet signs the version's SHA-256 onto Solana through the Memo program."],
            ["04", "It travels", "Grant keys let any agent you authorize read the file. Revoke and the door shuts."]
          ].map(([n, t, b]) => (
            <div key={n} className="rounded-xl border border-white/10 p-5">
              <div className="font-mono text-ember text-xs mb-3">{n}</div>
              <div className="font-semibold mb-2">{t}</div>
              <p className="text-xs text-haze leading-relaxed">{b}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-haze font-mono mt-8">No custodial keys. No burner wallets. The server never signs anything.</p>
      </div>
    );
  },

  function Proof() {
    return (
      <div className="h-full flex flex-col justify-center px-14 lg:px-24">
        <Kicker>Proof, not promises</Kicker>
        <h2 className="font-serif text-4xl lg:text-5xl max-w-3xl leading-tight mb-10">
          The anchors are on devnet right now. Check without trusting us.
        </h2>
        <div className="rounded-xl border border-moss/40 p-6 max-w-4xl bg-moss/[0.04] font-mono text-xs space-y-3">
          <div className="flex gap-3"><span className="text-haze w-24 shrink-0">wallet</span><span className="break-all">{PROOF_WALLET}</span></div>
          <div className="flex gap-3"><span className="text-haze w-24 shrink-0">memo</span><span className="break-all text-moss">everanima:persona:v1:{ANCHOR_HASH.slice(0, 24)}…</span></div>
          <div className="flex gap-3"><span className="text-haze w-24 shrink-0">signature</span><span className="break-all">{ANCHOR_SIG.slice(0, 44)}…</span></div>
          <div className="flex gap-3"><span className="text-haze w-24 shrink-0">status</span><span className="text-moss">finalized on Solana devnet</span></div>
        </div>
        <div className="mt-8 space-y-2 text-sm">
          <p className="text-haze">Two independent ways to verify:</p>
          <p className="font-mono text-xs text-parchment/80">everanima.vercel.app/verify — reads anchors straight from devnet RPC, no account needed</p>
          <p className="font-mono text-xs text-parchment/80">explorer.solana.com — the official explorer shows the same memo, outside our site entirely</p>
        </div>
      </div>
    );
  },

  function WhyNot() {
    const rows = [
      ["Where memory lives", "Their database", "Your file, your wallet"],
      ["Read every word", "No", "Yes — plain markdown"],
      ["Take it elsewhere", "No export", "Download or grant keys"],
      ["Prove a version existed", "Impossible", "Hash sealed on Solana"],
      ["Company shuts down", "Memory dies with it", "Anchors outlive us"],
      ["Cut off an agent", "Not applicable", "Revoke, door shuts"]
    ];
    return (
      <div className="h-full flex flex-col justify-center px-14 lg:px-24">
        <Kicker>The obvious question</Kicker>
        <h2 className="font-serif text-4xl lg:text-5xl mb-10">ChatGPT has memory. Why this?</h2>
        <div className="max-w-4xl rounded-xl border border-white/10 overflow-hidden text-sm">
          <div className="grid grid-cols-3 bg-white/[0.04] font-semibold px-5 py-3">
            <span></span><span>Rented memory</span><span className="text-ember">Owned memory</span>
          </div>
          {rows.map(([k, a, b], i) => (
            <div key={k} className={`grid grid-cols-3 px-5 py-2.5 ${i % 2 ? "bg-white/[0.02]" : ""}`}>
              <span className="text-haze">{k}</span><span>{a}</span><span className="text-moss">{b}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-haze mt-6 max-w-xl">Renting works until you want to leave. Owning is the difference between a service remembering you and you holding the memory.</p>
      </div>
    );
  },

  function AnyWallet() {
    return (
      <div className="h-full flex flex-col justify-center px-14 lg:px-24">
        <Kicker>No lock-in, all the way down</Kicker>
        <h2 className="font-serif text-4xl lg:text-5xl max-w-3xl leading-tight mb-10">
          Works with whatever wallet you already have.
        </h2>
        <div className="max-w-3xl space-y-5 text-sm leading-relaxed">
          <p>
            Sign-in runs on the <span className="font-semibold">Wallet Standard</span> — the protocol every Solana wallet
            registers itself through. The app lists what is installed in your browser, with the icon each wallet
            provides about itself. Nothing is hand-picked, no brand is favored.
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              ["100+ wallets", "Phantom, Solflare, Backpack, OKX, Binance, and anything else that speaks the standard."],
              ["One signature", "Login is an ed25519 signature the server verifies. No funds move, no key is shared."],
              ["EVM guarded", "Multichain wallets that hand back a non-Solana account get a clear message, not a silent failure."]
            ].map(([t, b]) => (
              <div key={t} className="rounded-xl border border-white/10 p-5">
                <div className="font-semibold mb-2">{t}</div>
                <p className="text-xs text-haze leading-relaxed">{b}</p>
              </div>
            ))}
          </div>
          <p className="text-haze text-xs">Prefer no wallet at all? Password accounts work too — connect one later when you want to seal on-chain.</p>
        </div>
      </div>
    );
  },

  function Model() {
    return (
      <div className="h-full flex flex-col justify-center px-14 lg:px-24">
        <Kicker>Business model</Kicker>
        <h2 className="font-serif text-4xl lg:text-5xl mb-12">The chain does the bookkeeping.</h2>
        <div className="grid md:grid-cols-2 gap-6 max-w-3xl">
          <div className="rounded-xl border border-white/10 p-6">
            <div className="font-semibold">Free</div>
            <div className="font-serif text-3xl my-3">0 SOL</div>
            <ul className="text-xs text-haze space-y-1.5 leading-relaxed">
              <li>20 messages, enforced by the server</li>
              <li>Self-writing persona file</li>
              <li>Seal versions with your wallet</li>
            </ul>
          </div>
          <div className="rounded-xl border border-ember/50 p-6">
            <div className="font-semibold text-ember">Eternal</div>
            <div className="font-serif text-3xl my-3">0.05 SOL <span className="text-sm text-haze">devnet</span></div>
            <ul className="text-xs text-haze space-y-1.5 leading-relaxed">
              <li>Payment verified on-chain, replay-proof</li>
              <li>Unlimited messages, longer answers</li>
              <li>Agent-access grant keys</li>
            </ul>
          </div>
        </div>
        <p className="text-xs text-haze mt-8 max-w-2xl">
          Mainnet path: USDC for the tier, persona export as a wallet-bound asset, and metered API pricing when
          third-party agents read personas at scale — the platform play.
        </p>
      </div>
    );
  },

  function WhyNow() {
    return (
      <div className="h-full flex flex-col justify-center px-14 lg:px-24">
        <Kicker>Why now</Kicker>
        <h2 className="font-serif text-4xl lg:text-5xl max-w-3xl leading-tight mb-10">
          The agent era has a portability problem, and it is getting worse.
        </h2>
        <div className="max-w-3xl space-y-6 text-sm leading-relaxed">
          <p>
            People now talk to three, five, ten different AI tools a week. Each one starts cold or keeps its own
            private notes. Context is becoming the most valuable thing a user has — and the least portable.
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              ["Agents multiply", "Coding agents, research agents, personal agents — each needs to know you."],
              ["Context is the moat", "Vendors know it. That is exactly why none of them let you leave with it."],
              ["Wallets are ready", "Solana sign-in is one click now. Ownership rails already sit in the browser."]
            ].map(([t, b]) => (
              <div key={t} className="rounded-xl border border-white/10 p-5">
                <div className="font-semibold mb-2">{t}</div>
                <p className="text-xs text-haze leading-relaxed">{b}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  },

  function Live() {
    return (
      <div className="h-full flex flex-col justify-center px-14 lg:px-24">
        <Kicker>Built and running</Kicker>
        <h2 className="font-serif text-4xl lg:text-5xl mb-10">Not a mockup. Every flow is live.</h2>
        <div className="grid md:grid-cols-2 gap-x-12 gap-y-3 max-w-4xl text-sm">
          {[
            ["Wallet sign-in", "ed25519 verified server-side, any standard wallet"],
            ["Self-writing memory", "batched extraction, stored per account in Postgres"],
            ["On-chain sealing", "user-signed Memo anchors, finalized on devnet"],
            ["Tier enforcement", "server counts messages; payment checked on-chain"],
            ["Agent access", "grant keys with read counts and instant revocation"],
            ["Public verification", "/verify reads devnet RPC directly, no account"],
            ["Export and import", "download persona.md, tutorials at /portability"],
            ["Zero server keys", "no custodial signing anywhere in the stack"]
          ].map(([t, b]) => (
            <div key={t} className="flex gap-3 py-2 border-b border-white/5">
              <span className="text-moss font-mono text-xs mt-0.5">ok</span>
              <span><span className="font-semibold">{t}</span> <span className="text-haze">— {b}</span></span>
            </div>
          ))}
        </div>
        <p className="font-mono text-xs text-haze mt-8">Next.js 14 · Groq llama-3.3-70b · Neon Postgres · @solana/web3.js · Wallet Standard</p>
      </div>
    );
  },

  function Close() {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center px-10">
        <Logo size={56} withWordmark={false} />
        <h2 className="font-serif text-4xl lg:text-6xl mt-8 max-w-3xl leading-tight">
          Start the file that follows you.
        </h2>
        <div className="mt-10 space-y-2 font-mono text-sm">
          <p className="text-ember text-lg">everanima.vercel.app</p>
          <p className="text-haze text-xs">try it: /chat · sandbox: /demo · check the chain: /verify</p>
        </div>
        <p className="text-haze text-xs mt-10 max-w-md leading-relaxed">
          Everything in this deck can be verified live — the product, the payments, the anchors.
          That is the point of building it this way.
        </p>
      </div>
    );
  }
];

/* ---------------- shell ---------------- */

export default function Pitch() {
  const [i, setI] = useState(0);
  const last = slides.length - 1;

  const go = useCallback(
    (d) => setI((v) => Math.min(last, Math.max(0, v + d))),
    [last]
  );

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowRight" || e.key === " " || e.key === "PageDown") go(1);
      if (e.key === "ArrowLeft" || e.key === "PageUp") go(-1);
      if (e.key === "Home") setI(0);
      if (e.key === "End") setI(last);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, last]);

  const Slide = slides[i];

  return (
    <main className="bg-ink text-parchment">
      {/* interactive view */}
      <div className="print:hidden h-screen relative overflow-hidden select-none">
        <AnimatePresence mode="wait">
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="h-full"
          >
            <Slide />
          </motion.div>
        </AnimatePresence>

        <Foot n={i + 1} />

        {/* click zones */}
        <button aria-label="Previous slide" onClick={() => go(-1)}
          className="absolute left-0 top-0 h-full w-1/5 cursor-w-resize opacity-0" />
        <button aria-label="Next slide" onClick={() => go(1)}
          className="absolute right-0 top-0 h-full w-1/5 cursor-e-resize opacity-0" />

        {/* controls */}
        <div className="absolute top-5 left-8 right-8 flex items-center justify-between">
          <a href="/" className="opacity-70 hover:opacity-100"><Logo size={22} /></a>
          <div className="flex items-center gap-4">
            <div className="flex gap-1.5">
              {slides.map((_, d) => (
                <button key={d} onClick={() => setI(d)} aria-label={`Slide ${d + 1}`}
                  className={`h-1.5 rounded-full transition-all ${d === i ? "w-6 bg-ember" : "w-1.5 bg-white/20 hover:bg-white/40"}`} />
              ))}
            </div>
            <button onClick={() => window.print()}
              className="text-[11px] font-mono text-haze hover:text-parchment border border-white/15 rounded-full px-3 py-1">
              Save as PDF
            </button>
          </div>
        </div>
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-haze/60 font-mono">
          arrow keys or click the edges
        </div>
      </div>

      {/* print view: every slide on its own page */}
      <div className="hidden print:block">
        {slides.map((S, d) => (
          <div key={d} style={{ pageBreakAfter: d === last ? "auto" : "always", height: "100vh", position: "relative" }}>
            <S />
            <Foot n={d + 1} />
          </div>
        ))}
      </div>
    </main>
  );
}
