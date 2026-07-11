// Compact, self-contained brand marks for the wallet picker. Simplified
// glyphs on each wallet's signature color — no external image requests, so
// nothing is blocked by CSP and the modal renders instantly offline.
const B = ({ bg, children }) => (
  <span className="inline-flex items-center justify-center rounded-lg shrink-0"
    style={{ width: 26, height: 26, background: bg }}>
    {children}
  </span>
);

const marks = {
  Phantom: (
    <B bg="#ab9ff2">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M21 12a9 9 0 0 0-18 0c0 .8 1 1 1.6 1H8a2 2 0 1 1 4 0 2 2 0 1 1 4 0h2.4c.6 0 1.6-.2 1.6-1Z" fill="#fff"/>
      </svg>
    </B>
  ),
  Solflare: (
    <B bg="#fc7227">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="#fff"><path d="M12 2l2.5 7H22l-6 4.5L18 21l-6-4-6 4 2-7.5L2 9h7.5L12 2z"/></svg>
    </B>
  ),
  Backpack: (
    <B bg="#e33e3f">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><rect x="5" y="7" width="14" height="13" rx="3" fill="#fff"/><path d="M9 7a3 3 0 0 1 6 0" stroke="#fff" strokeWidth="2"/></svg>
    </B>
  ),
  Glow: (
    <B bg="#ffffff"><svg width="16" height="16" viewBox="0 0 24 24"><circle cx="12" cy="12" r="7" fill="#e89b3b"/></svg></B>
  ),
  Trust: (
    <B bg="#0500ff"><svg width="14" height="14" viewBox="0 0 24 24" fill="#fff"><path d="M12 3l7 2v6c0 5-3 7.5-7 10-4-2.5-7-5-7-10V5l7-2z"/></svg></B>
  ),
  Coinbase: (
    <B bg="#0052ff"><svg width="16" height="16" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="none" stroke="#fff" strokeWidth="2.5"/><rect x="9" y="9" width="6" height="6" rx="1" fill="#fff"/></svg></B>
  ),
  OKX: (
    <B bg="#000000"><svg width="15" height="15" viewBox="0 0 24 24" fill="#fff"><rect x="3" y="3" width="6" height="6"/><rect x="15" y="3" width="6" height="6"/><rect x="9" y="9" width="6" height="6"/><rect x="3" y="15" width="6" height="6"/><rect x="15" y="15" width="6" height="6"/></svg></B>
  ),
  Bitget: (
    <B bg="#00f0ff"><svg width="15" height="15" viewBox="0 0 24 24" fill="#000"><path d="M11 3L4 12h5l-3 9 11-12h-5l3-6z"/></svg></B>
  ),
  Exodus: (
    <B bg="#1a1a3c"><svg width="15" height="15" viewBox="0 0 24 24"><path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z" fill="none" stroke="#8b5cf6" strokeWidth="2"/></svg></B>
  ),
  Brave: (
    <B bg="#fb542b"><svg width="15" height="15" viewBox="0 0 24 24" fill="#fff"><path d="M12 3l6 2 1 3-2 2 1 5-6 5-6-5 1-5-2-2 1-3 6-2z"/></svg></B>
  )
};

export default function WalletIcon({ name }) {
  return marks[name] || (
    <B bg="#3ca877">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><rect x="4" y="6" width="16" height="12" rx="2" stroke="#fff" strokeWidth="2"/><circle cx="16" cy="12" r="1.5" fill="#fff"/></svg>
    </B>
  );
}
