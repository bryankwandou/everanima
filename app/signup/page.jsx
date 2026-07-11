"use client";

import { useState } from "react";
import { motion } from "framer-motion";

export default function Signup() {
  const [form, setForm] = useState({ fullName: "", email: "", username: "", password: "" });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  function set(k) {
    return (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  }

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setErr("");
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    const data = await res.json();
    setBusy(false);
    if (data.user) window.location.href = "/chat";
    else setErr(data.error || "Something went wrong.");
  }

  return (
    <main className="min-h-screen bg-ink text-parchment flex items-center justify-center px-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md">
        <a href="/" className="font-serif text-2xl">Everanima</a>
        <h1 className="font-serif text-3xl mt-8 mb-2">Create your account</h1>
        <p className="text-haze text-sm mb-8">Your persona file starts here. Everything you tell Anima stays with this account.</p>
        <form onSubmit={submit} className="space-y-4">
          {[
            ["Full name", "fullName", "text", "Vincentius Bryan Kwandou"],
            ["Email", "email", "email", "you@example.com"],
            ["Username", "username", "text", "lowercase, 3-24 chars"],
            ["Password", "password", "password", "at least 8 characters"]
          ].map(([label, key, type, ph]) => (
            <label key={key} className="block">
              <span className="text-xs uppercase tracking-widest text-haze">{label}</span>
              <input type={type} required value={form[key]} onChange={set(key)} placeholder={ph}
                className="mt-1 w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-ember" />
            </label>
          ))}
          {err && <p className="text-sm text-ember">{err}</p>}
          <button disabled={busy}
            className="w-full py-3 rounded-xl bg-ember text-ink font-semibold disabled:opacity-50">
            {busy ? "Creating…" : "Create account"}
          </button>
        </form>
        <div className="mt-6 space-y-3">
          <button disabled
            className="w-full py-3 rounded-xl border border-white/10 text-haze text-sm cursor-not-allowed">
            Continue with Google — coming soon
          </button>
          <p className="text-sm text-haze text-center">
            Already have an account? <a href="/login" className="text-parchment underline">Sign in</a>
            {" · "}or <a href="/login#wallet" className="text-parchment underline">use a wallet</a>
          </p>
        </div>
      </motion.div>
    </main>
  );
}
