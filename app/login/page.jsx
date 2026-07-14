"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getStandardWallets, onWalletsChange, standardSignIn } from "../../lib/walletStandard";

function GoogleLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 4.1 29.6 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22 22-9.8 22-22c0-1.5-.2-2.6-.4-3.5z"/>
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 4.1 29.6 2 24 2 15.6 2 8.3 6.8 6.3 14.7z"/>
      <path fill="#4CAF50" d="M24 46c5.5 0 10.5-2.1 14.3-5.6l-6.6-5.6C29.6 36.5 26.9 37.5 24 37.5c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C8.2 41.2 15.5 46 24 46z"/>
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.2-4.1 5.6l6.6 5.6C41.9 36 44 30.5 44 24c0-1.5-.2-2.6-.4-3.5z"/>
    </svg>
  );
}

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [walletBusy, setWalletBusy] = useState("");
  const [wallets, setWallets] = useState([]);

  useEffect(() => {
    const refresh = () => setWallets(getStandardWallets());
    refresh();
    const off = onWalletsChange(refresh);
    const t = setTimeout(refresh, 700);
    return () => { off(); clearTimeout(t); };
  }, []);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setErr("");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    setBusy(false);
    if (data.user) window.location.href = "/chat";
    else setErr(data.error || "Something went wrong.");
  }

  async function loginWith(w) {
    setWalletBusy(w.name);
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
      else setErr(data.error || "Wallet sign-in failed.");
    } catch (e) {
      setErr(`${w.name} sign-in failed: ` + (e.message || e));
    } finally {
      setWalletBusy("");
    }
  }

  return (
    <main className="min-h-screen bg-ink text-parchment flex items-center justify-center px-6 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <a href="/" className="font-serif text-2xl">Everanima</a>
        <h1 className="font-serif text-3xl mt-8 mb-2">Welcome back</h1>
        <p className="text-haze text-sm mb-8">Anima remembers. Pick up where you left off.</p>

        <form onSubmit={submit} className="space-y-4">
          <label className="block">
            <span className="text-xs uppercase tracking-widest text-haze">Username</span>
            <input required value={username} onChange={(e) => setUsername(e.target.value)}
              className="mt-1 w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-ember" />
          </label>
          <label className="block">
            <span className="text-xs uppercase tracking-widest text-haze">Password</span>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-ember" />
          </label>
          {err && <p className="text-sm text-ember">{err}</p>}
          <button disabled={busy}
            className="w-full py-3 rounded-xl bg-parchment text-ink font-semibold disabled:opacity-50">
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <div id="wallet" className="mt-6 space-y-3">
          <div className="text-xs uppercase tracking-widest text-haze text-center">or sign in with your wallet</div>
          {wallets.length > 0 && (
            <p className="text-[11px] text-haze text-center leading-relaxed">
              Found {wallets.length} wallet{wallets.length === 1 ? "" : "s"} installed in this browser, detected live through the Wallet Standard. Any of the 100+ Solana wallets appears here on its own — nothing is hand-picked.
            </p>
          )}
          {wallets.length > 0 ? (
            <div className="space-y-2">
              {wallets.map((w) => (
                <button key={w.name} onClick={() => loginWith(w)} disabled={!!walletBusy}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-moss/40 hover:bg-moss/10 disabled:opacity-50">
                  {w.icon ? (
                    <img src={w.icon} alt="" width={22} height={22} className="rounded" />
                  ) : (
                    <span className="w-[22px] h-[22px] rounded bg-moss/40" />
                  )}
                  <span className="text-sm font-semibold flex-1 text-left">{w.name}</span>
                  <span className="text-[10px] text-moss">{walletBusy === w.name ? "check your wallet…" : "detected"}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-white/10 p-4 text-xs text-haze text-center leading-relaxed">
              No Solana wallet detected in this browser. Install any Solana wallet — Phantom, Solflare, Backpack, OKX, Coinbase, and others all work — then reload. Everanima reads whatever you have; it favors no single brand.
            </div>
          )}
          <button disabled
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-white/10 text-haze text-sm cursor-not-allowed">
            <GoogleLogo /> Continue with Google — coming soon
          </button>
          <p className="text-sm text-haze text-center">
            New here? <a href="/signup" className="text-parchment underline">Create an account</a>
          </p>
        </div>
      </motion.div>
    </main>
  );
}
