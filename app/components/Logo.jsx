// Everanima mark: an open ring that never closes — memory that keeps
// its thread — with an ember spark where the next word lands.
export default function Logo({ size = 28, withWordmark = true }) {
  return (
    <span className="inline-flex items-center gap-2 select-none">
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
        <defs>
          <linearGradient id="ev-ring" x1="6" y1="42" x2="42" y2="6" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#e8613c" />
            <stop offset="0.55" stopColor="#f0a37a" />
            <stop offset="1" stopColor="#3ca877" />
          </linearGradient>
        </defs>
        {/* outer ring, deliberately open at the top right */}
        <path
          d="M39.6 15.8 A18 18 0 1 0 42 24"
          stroke="url(#ev-ring)"
          strokeWidth="4.5"
          strokeLinecap="round"
        />
        {/* inner spiral: the persona being rewritten inward */}
        <path
          d="M24 33 a9 9 0 1 1 9 -9 a6.5 6.5 0 1 1 -6.5 -6.5"
          stroke="#f5f1e8"
          strokeOpacity="0.85"
          strokeWidth="2.6"
          strokeLinecap="round"
        />
        {/* the spark: where the next memory lands */}
        <circle cx="41" cy="11" r="3.4" fill="#e8613c" />
      </svg>
      {withWordmark && (
        <span className="font-serif tracking-tight" style={{ fontSize: size * 0.72 }}>
          Everanima
        </span>
      )}
    </span>
  );
}
