"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { detectWallets, signLoginMessage } from "../../lib/wallets";

// Classic connect-wallet button + picker modal. Every listed wallet is
// shown whether or not it is installed; installed ones connect and sign
// in, missing ones link to their install page.
const KNOWN = [
  ["Phantom", "https://phantom.app/download"],
  ["Solflare", "https://solflare.com/download"],
  ["Backpack", "https://backpack.app/download"],
  ["Glow", "https://glow.app"],
  ["Trust", "https://trustwallet.com/download"],
  ["Coinbase", "https://www.coinbase.com/wallet/downloads"],
  ["OKX", "https://www.okx.com/web3"],
  ["Bitget", "https://web3.bitget.com"],
  ["Exodus", "https://www.exodus.com/download"],
  ["Brave", "https://brave.com/wallet"]
];

export default function WalletConnect({ className = "" }) {
  const [open, setOpen] = useState(false);
  const [detected, setDetected] = useState([]);
  const [busy, setBusy] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!open) return;
    setDetected(detectWallets());
    const t = setTimeout(() => setDetected(detectWallets()), 600);
    return () => clearTimeout(t);
  }, [open]);

  const byName = new Map(detected.map((w) => [w.name, w]));
  const extras = detected.filter((w) => !KNOWN.some(([n]) => n === w.name));

  async function connect(w) {
    setBusy(w.name);
    setErr("");
    try {
      const payload = await signLoginMessage(w.provider);
      const res = await fetch("/api/auth/wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.user) window.location.href = "/chat";
      else setErr(data.error || "Sign-in failed.");
    } catch (e) {
      setErr(`${w.name}: ` + (e.message || e));
    } finally {
      setBusy("");
    }
  }

  return (
    <>
      <button onClick={() => setOpen(true)}
        className={className || "px-4 py-1.5 rounded-full border border-moss/60 text-moss font-semibold hover:bg-moss/10 text-sm"}>
        Connect wallet
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6"
            onClick={() => setOpen(false)}>
            <motion.div initial={{ scale: 0.94, y: 12 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.94, y: 12 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-2xl border border-white/10 bg-ink p-6">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-serif text-xl">Connect a wallet</h3>
                <button onClick={() => setOpen(false)} className="text-haze hover:text-parchment text-xl leading-none">×</button>
              </div>
              <p className="text-xs text-haze mb-4">
                Any Solana wallet that can sign a message gets you in. Signing costs nothing and moves no funds.
              </p>
              <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                {KNOWN.map(([name, url]) => {
                  const w = byName.get(name);
                  return w ? (
                    <button key={name} onClick={() => connect(w)} disabled={!!busy}
                      className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl border border-moss/40 hover:bg-moss/10 disabled:opacity-50">
                      <span className="text-sm font-semibold">{name}</span>
                      <span className="text-[10px] text-moss">{busy === name ? "check your wallet…" : "detected"}</span>
                    </button>
                  ) : (
                    <a key={name} href={url} target="_blank" rel="noreferrer"
                      className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl border border-white/10 hover:border-white/25">
                      <span className="text-sm text-parchment/60">{name}</span>
                      <span className="text-[10px] text-haze">not installed — get it</span>
                    </a>
                  );
                })}
                {extras.map((w) => (
                  <button key={w.name} onClick={() => connect(w)} disabled={!!busy}
                    className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl border border-moss/40 hover:bg-moss/10 disabled:opacity-50">
                    <span className="text-sm font-semibold">{w.name}</span>
                    <span className="text-[10px] text-moss">{busy === w.name ? "check your wallet…" : "detected"}</span>
                  </button>
                ))}
              </div>
              {err && <p className="text-xs text-ember mt-3">{err}</p>}
              <p className="text-[11px] text-haze mt-4">
                No extension on this device? <a href="/login" className="underline">Use the built-in key or a password instead.</a>
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
