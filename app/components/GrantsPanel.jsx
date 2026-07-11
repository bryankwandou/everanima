"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Lets the owner hand a persona to outside agents and take it back.
// This is the portability story made real: mint a key, an agent reads
// the file, revoke it, the door closes.
export default function GrantsPanel({ wallet }) {
  const [grants, setGrants] = useState([]);
  const [label, setLabel] = useState("");
  const [fresh, setFresh] = useState("");
  const [busy, setBusy] = useState(false);
  const [tested, setTested] = useState("");

  async function load() {
    const res = await fetch("/api/grant");
    const data = await res.json();
    if (data.grants) setGrants(data.grants);
  }
  useEffect(() => { load(); }, []);

  async function mint() {
    setBusy(true);
    const res = await fetch("/api/grant", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label })
    });
    const data = await res.json();
    setFresh(data.grant_key || "");
    setLabel("");
    await load();
    setBusy(false);
  }

  async function revoke(grant_key) {
    await fetch("/api/grant", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ grant_key })
    });
    if (fresh === grant_key) setFresh("");
    await load();
  }

  async function testRead(grant_key) {
    setTested("reading…");
    const res = await fetch(`/api/persona/${wallet || "any"}`, {
      headers: { "x-everanima-grant": grant_key }
    });
    const data = await res.json();
    setTested(res.ok ? `Agent read ${data.persona.length} chars of your file.` : (data.error || "denied"));
  }

  return (
    <section className="rounded-xl border border-white/10 p-4">
      <div className="text-xs uppercase tracking-widest text-haze mb-1">Agent access</div>
      <p className="text-[11px] text-haze mb-3 leading-relaxed">
        Hand your memory to another AI with a key. Revoke it and the door shuts.
      </p>

      <div className="flex gap-1 mb-3">
        <input value={label} onChange={(e) => setLabel(e.target.value)}
          placeholder="e.g. My coding agent"
          className="flex-1 bg-white/5 border border-white/10 rounded px-2 py-1 text-[11px] outline-none" />
        <button onClick={mint} disabled={busy}
          className="text-xs px-2 rounded bg-moss/80 text-ink font-semibold disabled:opacity-50">
          {busy ? "…" : "Issue key"}
        </button>
      </div>

      <AnimatePresence>
        {fresh && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-3 rounded-lg border border-moss/40 bg-moss/5 p-2">
            <div className="text-[10px] text-moss mb-1">New key — copy it now, it is shown once:</div>
            <code className="block font-mono text-[10px] text-parchment break-all mb-2">{fresh}</code>
            <div className="text-[10px] text-haze mb-1">Any agent reads your file with:</div>
            <code className="block font-mono text-[9px] text-parchment/70 break-all bg-black/30 rounded p-1">
              curl -H &quot;x-everanima-grant: {fresh}&quot; {typeof window !== "undefined" ? window.location.origin : ""}/api/persona/{wallet || "YOUR_WALLET"}
            </code>
            <button onClick={() => testRead(fresh)} className="mt-2 text-[10px] text-moss hover:underline">
              Test this key as an agent →
            </button>
            {tested && <div className="text-[10px] text-parchment/80 mt-1">{tested}</div>}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-1 max-h-32 overflow-y-auto">
        {grants.length === 0 && <div className="text-[11px] text-haze">No agents authorized yet.</div>}
        {grants.map((g) => (
          <div key={g.grant_key} className="flex items-center justify-between text-[11px]">
            <span className={g.revoked ? "text-haze line-through" : "text-parchment/80"}>
              {g.label} · {g.read_count} read{g.read_count === 1 ? "" : "s"}
            </span>
            {!g.revoked && (
              <button onClick={() => revoke(g.grant_key)} className="text-ember hover:underline">revoke</button>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
