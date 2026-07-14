"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getStandardWallets, onWalletsChange, standardSignIn } from "../../lib/walletStandard";

// Classic connect-wallet button + picker. The list is built from the Wallet
// Standard, so it shows the wallets actually installed in this browser, each
// with the icon the wallet itself provides. No hard-coded brands, no invented
// logos — if it is in the list, it is really on your machine.
export default function WalletConnect({ className = "" }) {
  const [open, setOpen] = useState(false);
  const [wallets, setWallets] = useState([]);
  const [busy, setBusy] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!open) return;
    const refresh = () => setWallets(getStandardWallets());
    refresh();
    const off = onWalletsChange(refresh);
    const t = setTimeout(refresh, 600);
    return () => { off(); clearTimeout(t); };
  }, [open]);

  async function connect(w) {
    setBusy(w.name);
    setErr("");
    try {
      const payload = await standardSignIn(w.wallet, `everanima-login:${Date.now()}`);
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
                These are the wallets installed in <span className="text-parchment">this browser</span>, detected live through the Wallet Standard — the same protocol every Solana app relies on. Install any of the 100+ Solana wallets and it appears here by itself. Signing costs nothing and moves no funds.
              </p>
              <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                {wallets.length === 0 && (
                  <div className="text-xs text-haze text-center py-6 leading-relaxed">
                    No Solana wallet found in this browser. Install any Solana wallet — Phantom, Solflare, Backpack, OKX, Coinbase, Glow, and others all work — then reopen this.
                  </div>
                )}
                {wallets.map((w) => (
                  <button key={w.name} onClick={() => connect(w)} disabled={!!busy}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-moss/40 hover:bg-moss/10 disabled:opacity-50">
                    {w.icon ? (
                      <img src={w.icon} alt="" width={24} height={24} className="rounded" />
                    ) : (
                      <span className="w-6 h-6 rounded bg-moss/40" />
                    )}
                    <span className="text-sm font-semibold flex-1 text-left">{w.name}</span>
                    <span className="text-[10px] text-moss">{busy === w.name ? "check your wallet…" : "detected"}</span>
                  </button>
                ))}
              </div>
              {err && <p className="text-xs text-ember mt-3">{err}</p>}
              <p className="text-[11px] text-haze mt-4">
                Prefer a password? <a href="/login" className="underline">Sign in without a wallet.</a>
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
