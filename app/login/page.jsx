"use client";

import { useState } from "react";
import { motion } from "framer-motion";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [walletBusy, setWalletBusy] = useState(false);

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

  async function walletLogin() {
    setWalletBusy(true);
    setErr("");
    try {
      const message = `everanima-login:${Date.now()}`;
      let pubkey, signature;
      const provider = window.phantom?.solana || window.solflare || window.solana;
      if (provider?.signMessage) {
        // Any injected wallet: Phantom, Solflare, Backpack…
        await provider.connect();
        const encoded = new TextEncoder().encode(message);
        const signed = await provider.signMessage(encoded, "utf8");
        const bs58 = (await import("bs58")).default;
        pubkey = provider.publicKey.toBase58();
        signature = bs58.encode(signed.signature || signed);
      } else {
        // No extension: fall back to the in-browser burner keypair.
        const [{ loadBurner }, nacl, bs58mod] = await Promise.all([
          import("../../lib/solana"),
          import("tweetnacl"),
          import("bs58")
        ]);
        const kp = loadBurner();
        const sig = (nacl.default || nacl).sign.detached(
          new TextEncoder().encode(message),
          kp.secretKey
        );
        pubkey = kp.publicKey.toBase58();
        signature = (bs58mod.default || bs58mod).encode(sig);
      }
      const res = await fetch("/api/auth/wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pubkey, message, signature })
      });
      const data = await res.json();
      if (data.user) window.location.href = "/chat";
      else setErr(data.error || "Wallet sign-in failed.");
    } catch (e) {
      setErr("Wallet sign-in failed: " + (e.message || e));
    } finally {
      setWalletBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-ink text-parchment flex items-center justify-center px-6">
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
          <button onClick={walletLogin} disabled={walletBusy}
            className="w-full py-3 rounded-xl border border-moss/50 text-moss font-semibold hover:bg-moss/10 disabled:opacity-50">
            {walletBusy ? "Waiting for signature…" : "Sign in with any Solana wallet"}
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
