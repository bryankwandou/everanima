// Detects every injected Solana wallet we can find, without favoring one
// brand. Anything that exposes connect + signMessage qualifies; the generic
// window.solana entry catches wallets not on the named list.
export function detectWallets() {
  if (typeof window === "undefined") return [];
  const found = [];
  const seen = new Set();
  const add = (name, provider) => {
    if (!provider || typeof provider.signMessage !== "function" || seen.has(provider)) return;
    seen.add(provider);
    found.push({ name, provider });
  };

  add("Phantom", window.phantom?.solana);
  add("Solflare", window.solflare);
  add("Backpack", window.backpack);
  add("Glow", window.glow?.solana || window.glowSolana);
  add("Trust", window.trustwallet?.solana);
  add("Coinbase", window.coinbaseSolana);
  add("Exodus", window.exodus?.solana);
  add("Brave", window.braveSolana);
  add("Slope", window.Slope && new window.Slope());
  add("OKX", window.okxwallet?.solana);
  add("Bitget", window.bitkeep?.solana);
  add("Coin98", window.coin98?.sol);
  // Generic injection: whatever wallet claimed window.solana.
  add("Injected wallet", window.solana);

  return found;
}

export async function signLoginMessage(provider) {
  const message = `everanima-login:${Date.now()}`;
  await provider.connect();
  const encoded = new TextEncoder().encode(message);
  const signed = await provider.signMessage(encoded, "utf8");
  const bs58 = (await import("bs58")).default;
  const rawSig = signed.signature || signed;
  const pubkey = (provider.publicKey || signed.publicKey).toBase58();
  return { pubkey, message, signature: bs58.encode(rawSig) };
}
