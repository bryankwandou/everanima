"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { detectWallets, signLoginMessage } from "../../lib/wallets";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [walletBusy, setWalletBusy] = useState("");
  const [wallets, setWallets] = useState([]);

  useEffect(() => {
    // Some wallets inject late; check twice.
    setWallets(detectWallets());
    const t = setTimeout(() => setWallets(detectWallets()), 800);
    return () => clearTimeout(t);
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

  async function finishWalletLogin(payload) {
    const res = await fetch("/api/auth/wallet", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (data.user) window.location.href = "/chat";
    else setErr(data.error || "Wallet sign-in failed.");
  }

  async function loginWith(w) {
    setWalletBusy(w.name);
    setErr("");
    try {
      await finishWalletLogin(await signLoginMessage(w.provider));
    } catch (e) {
      setErr(`${w.name} sign-in failed: ` + (e.message || e));
    } finally {
      setWalletBusy("");
    }
  }

  async function loginWithBurner() {
    setWalletBusy("burner");
    setErr("");
    try {
      const [{ loadBurner }, nacl, bs58mod] = await Promise.all([
        import("../../lib/solana"),
        import("tweetnacl"),
        import("bs58")
      ]);
      const kp = loadBurner();
      const message = `everanima-login:${Date.now()}`;
      const sig = (nacl.default || nacl).sign.detached(
        new TextEncoder().encode(message),
        kp.secretKey
      );
      await finishWalletLogin({
        pubkey: kp.publicKey.toBase58(),
        message,
        signature: (bs58mod.default || bs58mod).encode(sig)
      });
    } catch (e) {
      setErr("Built-in key sign-in failed: " + (e.message || e));
    } finally {
      setWalletBusy("");
    }
  }

  return (
    <main className="min-h-screen bg-ink text-parchment flex items-center justify-center px-6 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md">
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
          <div className="text-xs uppercase tracking-widest text-haze text-center">
            or sign in with a wallet
          </div>
          {wallets.length > 0 ? (
            <div className="grid grid-cols-2 gap-2">
              {wallets.map((w) => (
                <button key={w.name} onClick={() => loginWith(w)} disabled={!!walletBusy}
                  className="py-2.5 rounded-xl border border-moss/50 text-moss text-sm font-semibold hover:bg-moss/10 disabled:opacity-50">
                  {walletBusy === w.name ? "Check your wallet…" : w.name}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-xs text-haze text-center">
              No wallet extension found in this browser. Any Solana wallet that can sign a message works here — or use the built-in key below.
            </p>
          )}
          <button onClick={loginWithBurner} disabled={!!walletBusy}
            className="w-full py-3 rounded-xl border border-white/15 text-parchment/80 text-sm hover:border-white/40 disabled:opacity-50">
            {walletBusy === "burner" ? "Signing…" : "Use this device's built-in key (no extension needed)"}
          </button>
          <button disabled
            className="w-full py-3 rounded-xl border border-white/10 text-haze text-sm cursor-not-allowed">
            Continue with Google — coming soon
          </button>
          <p className="text-sm text-haze text-center">
            New here? <a href="/signup" className="text-parchment underline">Create an account</a>
          </p>
        </div>
      </motion.div>
    </main>
  );
}
