"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { explorerUrl, ETERNAL_PRICE_SOL, buildEternalTransfer, getConnection } from "../../lib/solana";
import { getStandardWallets, standardSendTransaction } from "../../lib/walletStandard";
import GrantsPanel from "../components/GrantsPanel";

const EXTRACT_EVERY = 4;

export default function ChatPage() {
  const [user, setUser] = useState(undefined); // undefined = loading, null = signed out
  const [messages, setMessages] = useState([]);
  const [persona, setPersona] = useState("");
  const [anchors, setAnchors] = useState([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [memWriting, setMemWriting] = useState(false);
  const [status, setStatus] = useState("");
  const [paying, setPaying] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (!data.user) {
          window.location.href = "/login";
          return;
        }
        setUser(data.user);
        setMessages(data.messages || []);
        setPersona(data.persona || "");
        setAnchors(data.anchors || []);
      });
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, busy]);

  const eternal = user?.tier === "eternal";
  const remaining = user ? Math.max(0, user.freeLimit - user.msgCount) : 0;
  const locked = user && !eternal && remaining <= 0;

  async function verifyPayment(sig) {
    const res = await fetch("/api/eternal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sig })
    });
    const data = await res.json();
    if (data.user) {
      setUser(data.user);
      setStatus(`Payment verified on-chain (${data.verified} SOL). Eternal tier active.`);
      setAnchors((a) => [{ sig, kind: "payment" }, ...a]);
    } else {
      setStatus(data.error || "Verification failed.");
    }
  }

  // Pays from the user's own wallet through the Wallet Standard. Their
  // extension pops up and signs. We hold no key.
  async function goEternal() {
    setPaying(true);
    setStatus("");
    try {
      const found = getStandardWallets();
      if (found.length === 0) {
        setStatus("Connect a Solana wallet first — install Phantom, Solflare, Backpack, or any Solana wallet, then reload.");
        return;
      }
      const picked =
        found.find((w) => user?.wallet && w.wallet.accounts?.[0]?.address === user.wallet) || found[0];
      setStatus(`Approve ${ETERNAL_PRICE_SOL} SOL in ${picked.name}…`);
      const sig = await standardSendTransaction(picked.wallet, buildEternalTransfer, getConnection());
      setStatus("Payment sent. Verifying on-chain…");
      await verifyPayment(sig);
    } catch (e) {
      setStatus("Payment could not complete: " + (e.message || e));
    } finally {
      setPaying(false);
    }
  }

  async function rewriteMemory() {
    setMemWriting(true);
    try {
      const res = await fetch("/api/memory", { method: "POST" });
      const data = await res.json();
      if (data.persona) {
        setPersona(data.persona);
        if (data.anchor) {
          setAnchors((a) => [data.anchor, ...a]);
          setStatus("Memory rewritten and notarized on Solana devnet.");
        } else {
          setStatus("Memory rewritten.");
        }
      }
    } finally {
      setMemWriting(false);
    }
  }

  async function send() {
    const text = input.trim();
    if (!text || busy || locked) return;
    setInput("");
    const next = [...messages, { role: "user", content: text }];
    setMessages(next);
    setBusy(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next })
      });
      const data = await res.json();
      if (data.error === "free_limit") {
        setUser((u) => ({ ...u, msgCount: u.freeLimit }));
        setMessages(messages);
        setStatus(data.detail);
        return;
      }
      const reply = data.reply || "Something broke on my side: " + (data.detail || data.error);
      setMessages([...next, { role: "assistant", content: reply }]);
      if (data.msgCount !== undefined) {
        setUser((u) => ({ ...u, msgCount: data.msgCount, tier: data.tier }));
        if (data.msgCount % EXTRACT_EVERY === 0) rewriteMemory();
      }
    } catch (e) {
      setMessages((m) => [...m, { role: "assistant", content: "Network error: " + e.message }]);
    } finally {
      setBusy(false);
    }
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  }

  if (user === undefined) {
    return (
      <main className="min-h-screen bg-ink text-parchment flex items-center justify-center">
        <span className="cursorline text-haze">Loading your memory…</span>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-ink text-parchment flex flex-col lg:flex-row">
      {/* Left: account + memory */}
      <aside className="lg:w-[380px] shrink-0 border-b lg:border-b-0 lg:border-r border-white/10 p-5 flex flex-col gap-5 lg:h-screen lg:overflow-y-auto">
        <div className="flex items-center justify-between">
          <a href="/" className="font-serif text-xl tracking-tight">Everanima</a>
          <button onClick={logout} className="text-xs text-haze hover:text-parchment">Sign out</button>
        </div>

        <section className="rounded-xl border border-white/10 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-xs uppercase tracking-widest text-haze">Account</div>
            <span className={`text-[10px] px-2 py-0.5 rounded-full ${eternal ? "bg-ember/20 text-ember" : "bg-white/10 text-haze"}`}>
              {eternal ? "ETERNAL" : "FREE"}
            </span>
          </div>
          <div className="text-sm">{user?.fullName || user?.username}</div>
          {user?.username && <div className="text-xs text-haze">@{user.username}</div>}
          {!eternal && (
            <div className="text-xs text-haze">{remaining} of {user?.freeLimit} free messages left</div>
          )}
        </section>

        <section className="rounded-xl border border-white/10 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-xs uppercase tracking-widest text-haze">Wallet</div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-moss/15 text-moss">SOLANA DEVNET</span>
          </div>
          {user?.wallet ? (
            <>
              <div className="text-xs text-parchment/80">Signed in with your wallet</div>
              <div className="font-mono text-[11px] break-all text-haze">{user.wallet}</div>
            </>
          ) : (
            <div className="text-xs text-haze">
              You signed in with a password. To pay on-chain, approve from any Solana wallet when you go Eternal.
            </div>
          )}
          {!eternal && (
            <button onClick={goEternal} disabled={paying}
              className="w-full text-sm py-2 rounded bg-ember text-ink font-semibold hover:opacity-90 disabled:opacity-50">
              {paying ? "Waiting for your wallet…" : `Go Eternal — ${ETERNAL_PRICE_SOL} SOL from your wallet`}
            </button>
          )}
          {eternal && <div className="text-xs text-moss">Eternal tier active — verified on devnet.</div>}
        </section>

        <section className="rounded-xl border border-white/10 p-4 flex-1 min-h-[200px]">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs uppercase tracking-widest text-haze">persona.md</div>
            {memWriting && <span className="text-xs text-ember cursorline">writing…</span>}
          </div>
          <motion.pre key={persona.length} initial={{ opacity: 0.4 }} animate={{ opacity: 1 }}
            className="whitespace-pre-wrap font-mono text-[11px] leading-relaxed text-parchment/80">
            {persona || "The file is empty. Talk to Anima — it writes this itself, then anchors each version to Solana devnet. Stored in Postgres, tied to your account."}
          </motion.pre>
        </section>

        <section className="rounded-xl border border-white/10 p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs uppercase tracking-widest text-haze">On-chain anchors</div>
            {user?.wallet && (
              <a href={`/verify?w=${user.wallet}`} className="text-[10px] text-moss hover:underline">verify →</a>
            )}
          </div>
          <div className="space-y-1 max-h-36 overflow-y-auto">
            {anchors.length === 0 && <div className="text-xs text-haze">No anchors yet. They appear as Anima writes your memory.</div>}
            {anchors.map((a) => (
              <a key={a.sig} href={explorerUrl(a.sig)} target="_blank" rel="noreferrer"
                className="block text-xs font-mono text-moss hover:underline truncate">
                {a.kind === "payment" ? "[pay] " : "[mem] "}{a.sig}
              </a>
            ))}
          </div>
        </section>

        <GrantsPanel wallet={user?.wallet || ""} />
        {status && <div className="text-xs text-haze">{status}</div>}
      </aside>

      {/* Right: chat */}
      <section className="flex-1 flex flex-col lg:h-screen">
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 && (
            <div className="max-w-md mx-auto mt-20 text-center text-haze">
              <p className="font-serif text-2xl text-parchment mb-3">Introduce yourself.</p>
              <p className="text-sm">Tell Anima your name, what you do, what you care about. Watch the persona file on the left write itself as you talk. Everything here is saved to your account — sign out, come back, it remembers.</p>
            </div>
          )}
          <AnimatePresence initial={false}>
            {messages.map((m, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                className={`max-w-2xl ${m.role === "user" ? "ml-auto" : ""}`}>
                <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                  m.role === "user" ? "bg-ember/90 text-ink" : "bg-white/5 border border-white/10"
                }`}>{m.content}</div>
              </motion.div>
            ))}
          </AnimatePresence>
          {busy && <div className="text-haze text-sm cursorline">Anima is thinking…</div>}
          <div ref={bottomRef} />
        </div>

        <div className="border-t border-white/10 p-4">
          {locked ? (
            <div className="text-center text-sm text-haze">
              Free tier is used up — the server will refuse further messages. Go Eternal on the left panel: one devnet payment, verified on-chain, unlimited memory.
            </div>
          ) : (
            <div className="flex gap-2 max-w-3xl mx-auto">
              <input value={input} onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder="Say something Anima should remember…"
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-ember" />
              <button onClick={send} disabled={busy}
                className="px-5 rounded-xl bg-parchment text-ink text-sm font-semibold disabled:opacity-40">
                Send
              </button>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
