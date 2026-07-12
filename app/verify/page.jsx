"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Logo from "../components/Logo";

const TREASURY = "5JTDJdfDHqu3TEHuBTATJF49G8i8YKy42riJG9KWFfSk";

export default function Verify() {
  const [wallet, setWallet] = useState("");
  const [anchors, setAnchors] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    const w = new URLSearchParams(window.location.search).get("w");
    if (w) { setWallet(w); check(w); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function check(addr) {
    const target = (addr || wallet).trim();
    if (!target) return;
    setBusy(true);
    setErr("");
    setAnchors(null);
    try {
      const res = await fetch(`/api/anchors/${target}`);
      const data = await res.json();
      if (data.error) setErr(data.error);
      else setAnchors(data.anchors);
    } catch (e) {
      setErr("Lookup failed: " + e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-ink text-parchment">
      <nav className="border-b border-white/10">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
          <a href="/"><Logo size={24} /></a>
          <a href="/signup" className="px-4 py-1.5 rounded-full bg-ember text-ink text-sm font-semibold">Start your file</a>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-16">
        <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          className="font-serif text-4xl mb-3">Check the memory trail yourself.</motion.h1>
        <p className="text-haze mb-8 max-w-xl leading-relaxed">
          Paste any Solana wallet. This page reads its Everanima anchors straight from devnet — no account, no trust in us required. Every persona version leaves a hash on-chain, and you can confirm it here.
        </p>

        <div className="flex flex-col sm:flex-row gap-2 mb-4">
          <input value={wallet} onChange={(e) => setWallet(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && check()}
            placeholder="Solana wallet address"
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-mono outline-none focus:border-ember" />
          <button onClick={() => check()} disabled={busy}
            className="px-6 py-3 rounded-xl bg-parchment text-ink text-sm font-semibold disabled:opacity-50">
            {busy ? "Reading devnet…" : "Verify"}
          </button>
        </div>
        <button onClick={() => { setWallet(TREASURY); check(TREASURY); }}
          className="text-xs text-moss hover:underline mb-8">
          Try it with the Everanima treasury wallet
        </button>

        {err && <p className="text-sm text-ember mb-6">{err}</p>}

        <AnimatePresence>
          {anchors && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="text-xs uppercase tracking-widest text-haze mb-3">
                {anchors.length} anchor{anchors.length === 1 ? "" : "s"} found on devnet
              </div>
              {anchors.length === 0 && (
                <p className="text-sm text-haze">No Everanima anchors on this wallet yet. Its persona may live under a different key, or it has not written a version on-chain.</p>
              )}
              <div className="space-y-3">
                {anchors.map((a, i) => (
                  <motion.a key={a.sig} href={`https://explorer.solana.com/tx/${a.sig}?cluster=devnet`}
                    target="_blank" rel="noreferrer"
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    className="block rounded-2xl border border-white/10 p-4 hover:border-moss/50 transition-colors">
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${a.kind === "payment" ? "bg-ember/20 text-ember" : "bg-moss/20 text-moss"}`}>
                        {a.kind === "payment" ? "ETERNAL PAYMENT" : "MEMORY VERSION"}
                      </span>
                      {a.blockTime && (
                        <span className="text-[10px] text-haze">
                          {new Date(a.blockTime * 1000).toLocaleString()}
                        </span>
                      )}
                    </div>
                    {a.hash && (
                      <div className="font-mono text-[11px] text-parchment/70 break-all">
                        persona hash: {a.hash}
                      </div>
                    )}
                    <div className="font-mono text-[11px] text-moss break-all mt-1">{a.sig}</div>
                  </motion.a>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
