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
            ["Full name", "fullName", "text", "Your full name"],
            ["Email", "email", "email", "name@email.com"],
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
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-white/10 text-haze text-sm cursor-not-allowed">
            <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
              <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 4.1 29.6 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22 22-9.8 22-22c0-1.5-.2-2.6-.4-3.5z"/>
              <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 4.1 29.6 2 24 2 15.6 2 8.3 6.8 6.3 14.7z"/>
              <path fill="#4CAF50" d="M24 46c5.5 0 10.5-2.1 14.3-5.6l-6.6-5.6C29.6 36.5 26.9 37.5 24 37.5c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C8.2 41.2 15.5 46 24 46z"/>
              <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.2-4.1 5.6l6.6 5.6C41.9 36 44 30.5 44 24c0-1.5-.2-2.6-.4-3.5z"/>
            </svg>
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
