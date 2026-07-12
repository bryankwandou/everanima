import React from "react";
import {
  AbsoluteFill,
  Sequence,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const INK = "#0a0a0f";
const PARCHMENT = "#f5f1e8";
const EMBER = "#e8613c";
const MOSS = "#3ca877";
const HAZE = "#8b87a3";
const SERIF = "Georgia, 'Times New Roman', serif";
const MONO = "'Courier New', ui-monospace, monospace";

// ---- shared helpers ---------------------------------------------------------

const useEnter = (delay = 0, damping = 200) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping } });
  return { opacity: s, y: interpolate(s, [0, 1], [26, 0]) };
};

const Grain: React.FC = () => (
  <AbsoluteFill style={{ opacity: 0.05, mixBlendMode: "overlay" }}>
    <svg width="100%" height="100%">
      <filter id="n">
        <feTurbulence baseFrequency="0.9" numOctaves="2" />
      </filter>
      <rect width="100%" height="100%" filter="url(#n)" />
    </svg>
  </AbsoluteFill>
);

const Glow: React.FC<{ color: string; x: string; y: string; size?: number; o?: number }> = ({
  color,
  x,
  y,
  size = 700,
  o = 0.18,
}) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      width: size,
      height: size,
      borderRadius: "50%",
      background: color,
      filter: "blur(140px)",
      opacity: o,
    }}
  />
);

const Logo: React.FC<{ size?: number }> = ({ size = 64 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <defs>
      <linearGradient id="ev" x1="6" y1="42" x2="42" y2="6" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor={EMBER} />
        <stop offset="0.55" stopColor="#f0a37a" />
        <stop offset="1" stopColor={MOSS} />
      </linearGradient>
    </defs>
    <path d="M39.6 15.8 A18 18 0 1 0 42 24" stroke="url(#ev)" strokeWidth="4.5" strokeLinecap="round" />
    <path
      d="M24 33 a9 9 0 1 1 9 -9 a6.5 6.5 0 1 1 -6.5 -6.5"
      stroke={PARCHMENT}
      strokeOpacity="0.85"
      strokeWidth="2.6"
      strokeLinecap="round"
    />
    <circle cx="41" cy="11" r="3.4" fill={EMBER} />
  </svg>
);

const Kicker: React.FC<{ children: React.ReactNode; delay?: number }> = ({ children, delay = 0 }) => {
  const e = useEnter(delay);
  return (
    <div
      style={{
        opacity: e.opacity,
        transform: `translateY(${e.y}px)`,
        color: EMBER,
        fontFamily: MONO,
        fontSize: 26,
        letterSpacing: 8,
        textTransform: "uppercase",
        marginBottom: 26,
      }}
    >
      {children}
    </div>
  );
};

// Typewriter over a fixed string, revealed by frame.
const Typed: React.FC<{ text: string; start: number; cps?: number; style?: React.CSSProperties }> = ({
  text,
  start,
  cps = 32,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const chars = Math.max(0, Math.floor(((frame - start) / fps) * cps));
  const shown = text.slice(0, chars);
  const done = chars >= text.length;
  return (
    <span style={style}>
      {shown}
      {!done && <span style={{ opacity: frame % 20 < 10 ? 1 : 0.2 }}>▍</span>}
    </span>
  );
};

// ---- scenes -----------------------------------------------------------------

const SceneHook: React.FC = () => {
  const logo = useEnter(4, 14);
  const h = useEnter(16);
  const sub = useEnter(40);
  return (
    <AbsoluteFill style={{ background: INK, justifyContent: "center", alignItems: "center" }}>
      <Glow color={EMBER} x="55%" y="-10%" />
      <Glow color={MOSS} x="-10%" y="60%" />
      <div style={{ opacity: logo.opacity, transform: `scale(${interpolate(logo.opacity, [0, 1], [0.7, 1])})` }}>
        <Logo size={96} />
      </div>
      <div
        style={{
          opacity: h.opacity,
          transform: `translateY(${h.y}px)`,
          fontFamily: SERIF,
          fontSize: 96,
          color: PARCHMENT,
          marginTop: 34,
          textAlign: "center",
          letterSpacing: -2,
        }}
      >
        The AI memory you own.
      </div>
      <div
        style={{
          opacity: sub.opacity,
          transform: `translateY(${sub.y}px)`,
          fontFamily: MONO,
          fontSize: 30,
          color: HAZE,
          marginTop: 24,
          letterSpacing: 2,
        }}
      >
        Everanima · Solana devnet
      </div>
    </AbsoluteFill>
  );
};

const SceneProblem: React.FC = () => {
  const lines = [
    "Every assistant forgets you once the chat runs long.",
    "And whatever it learned sits in someone else's database.",
    "You could never read it, move it, or truly own it.",
  ];
  return (
    <AbsoluteFill style={{ background: INK, justifyContent: "center", paddingLeft: 180, paddingRight: 180 }}>
      <Glow color="#7a2a2a" x="60%" y="20%" o={0.14} />
      <Kicker>The problem</Kicker>
      {lines.map((l, i) => {
        const e = useEnter(20 + i * 34);
        return (
          <div
            key={i}
            style={{
              opacity: e.opacity,
              transform: `translateY(${e.y}px)`,
              fontFamily: SERIF,
              fontSize: 58,
              lineHeight: 1.35,
              color: i === 2 ? PARCHMENT : HAZE,
              marginBottom: 14,
            }}
          >
            {l}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// Simplified but recognizable wallet glyphs, drawn as SVG on the brand's
// own signature color — no plain squares.
const WalletGlyph: React.FC<{ name: string }> = ({ name }) => {
  const box = (bg: string, child: React.ReactNode) => (
    <div style={{ width: 46, height: 46, borderRadius: 13, background: bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
      {child}
    </div>
  );
  switch (name) {
    case "Phantom":
      return box("#ab9ff2", <svg width="28" height="28" viewBox="0 0 24 24"><path d="M21 12a9 9 0 0 0-18 0c0 .8 1 1 1.6 1H8a2 2 0 1 1 4 0 2 2 0 1 1 4 0h2.4c.6 0 1.6-.2 1.6-1Z" fill="#fff" /></svg>);
    case "Solflare":
      return box("#fc7227", <svg width="26" height="26" viewBox="0 0 24 24" fill="#fff"><path d="M12 2l2.5 7H22l-6 4.5L18 21l-6-4-6 4 2-7.5L2 9h7.5L12 2z" /></svg>);
    case "Backpack":
      return box("#e33e3f", <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="5" y="7" width="14" height="13" rx="3" fill="#fff" /><path d="M9 7a3 3 0 0 1 6 0" stroke="#fff" strokeWidth="2" /></svg>);
    case "Coinbase":
      return box("#0052ff", <svg width="26" height="26" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="none" stroke="#fff" strokeWidth="2.5" /><rect x="9" y="9" width="6" height="6" rx="1" fill="#fff" /></svg>);
    case "OKX":
      return box("#111", <svg width="24" height="24" viewBox="0 0 24 24" fill="#fff"><rect x="3" y="3" width="6" height="6" /><rect x="15" y="3" width="6" height="6" /><rect x="9" y="9" width="6" height="6" /><rect x="3" y="15" width="6" height="6" /><rect x="15" y="15" width="6" height="6" /></svg>);
    default:
      return box("#0500ff", <svg width="24" height="24" viewBox="0 0 24 24" fill="#fff"><path d="M12 3l7 2v6c0 5-3 7.5-7 10-4-2.5-7-5-7-10V5l7-2z" /></svg>);
  }
};

const WalletChip: React.FC<{ name: string; delay: number }> = ({ name, delay }) => {
  const e = useEnter(delay, 18);
  return (
    <div
      style={{
        opacity: e.opacity,
        transform: `translateY(${e.y}px)`,
        display: "flex",
        alignItems: "center",
        gap: 16,
        border: "1px solid rgba(255,255,255,0.12)",
        borderRadius: 16,
        padding: "16px 24px",
        background: "rgba(255,255,255,0.03)",
      }}
    >
      <WalletGlyph name={name} />
      <span style={{ fontFamily: SERIF, fontSize: 32, color: PARCHMENT }}>{name}</span>
    </div>
  );
};

const SceneWallet: React.FC = () => {
  const wallets = ["Phantom", "Solflare", "Backpack", "Trust", "Coinbase", "OKX"];
  return (
    <AbsoluteFill style={{ background: INK, justifyContent: "center", paddingLeft: 180 }}>
      <Glow color={MOSS} x="55%" y="10%" />
      <Kicker>Sign in with your own Solana wallet</Kicker>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 22, width: 1180 }}>
        {wallets.map((n, i) => (
          <WalletChip key={n} name={n} delay={18 + i * 12} />
        ))}
      </div>
      <div style={{ ...useEnter(120), fontFamily: MONO, fontSize: 26, color: HAZE, marginTop: 44 }}>
        Detected through the Wallet Standard. One signature, no funds moved.
      </div>
    </AbsoluteFill>
  );
};

const SceneChat: React.FC = () => {
  const panel = useEnter(10, 20);
  const persona = [
    "# Persona",
    "## Identity",
    "- Bryan, IT student, ships Solana apps",
    "## Preferences",
    "- Straight answers, dark interfaces",
    "## Ongoing",
    "- Hackathon entry due this week",
  ].join("\n");
  return (
    <AbsoluteFill style={{ background: INK, justifyContent: "center", alignItems: "center" }}>
      <Glow color={EMBER} x="10%" y="55%" />
      <div style={{ position: "absolute", top: 90 }}>
        <Kicker delay={4}>The AI keeps its own memory file</Kicker>
      </div>
      <div style={{ display: "flex", gap: 40, alignItems: "stretch" }}>
        {/* chat side */}
        <div style={{ width: 720, display: "flex", flexDirection: "column", gap: 20, justifyContent: "center" }}>
          {[
            ["user", "Hi, I'm Bryan. IT student, I build Solana apps."],
            ["anima", "Good to meet you, Bryan. I'll remember that."],
          ].map(([role, text], i) => {
            const e = useEnter(24 + i * 40, 20);
            const isUser = role === "user";
            return (
              <div
                key={i}
                style={{
                  opacity: e.opacity,
                  transform: `translateY(${e.y}px)`,
                  alignSelf: isUser ? "flex-end" : "flex-start",
                  maxWidth: 560,
                  background: isUser ? EMBER : "rgba(255,255,255,0.05)",
                  border: isUser ? "none" : "1px solid rgba(255,255,255,0.1)",
                  color: isUser ? INK : PARCHMENT,
                  borderRadius: 22,
                  padding: "22px 28px",
                  fontFamily: SERIF,
                  fontSize: 32,
                  lineHeight: 1.4,
                }}
              >
                {text}
              </div>
            );
          })}
        </div>
        {/* persona side */}
        <div
          style={{
            opacity: panel.opacity,
            transform: `translateY(${panel.y}px)`,
            width: 620,
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 22,
            padding: 34,
            background: "rgba(255,255,255,0.03)",
          }}
        >
          <div style={{ fontFamily: MONO, fontSize: 22, color: HAZE, letterSpacing: 3, marginBottom: 20 }}>
            PERSONA.MD — WRITTEN BY THE AI
          </div>
          <div style={{ fontFamily: MONO, fontSize: 28, color: PARCHMENT, whiteSpace: "pre-wrap", lineHeight: 1.55 }}>
            <Typed text={persona} start={70} cps={26} />
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const SceneAnchor: React.FC = () => {
  const frame = useCurrentFrame();
  const card = useEnter(10, 20);
  const stampProg = spring({ frame: frame - 90, fps: 30, config: { damping: 12 } });
  return (
    <AbsoluteFill style={{ background: INK, justifyContent: "center", alignItems: "center" }}>
      <Glow color={MOSS} x="60%" y="10%" />
      <Kicker>Every version anchored on Solana</Kicker>
      <div
        style={{
          opacity: card.opacity,
          transform: `translateY(${card.y}px)`,
          width: 1180,
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: 24,
          padding: 44,
          background: "rgba(255,255,255,0.03)",
        }}
      >
        <div style={{ fontFamily: MONO, fontSize: 26, color: HAZE, marginBottom: 18 }}>persona.md → SHA-256</div>
        <div style={{ fontFamily: MONO, fontSize: 30, color: MOSS, wordBreak: "break-all", marginBottom: 30 }}>
          <Typed text="73c048f549cd157b43f6073e7bf3973e0d9a1c4e..." start={30} cps={40} />
        </div>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 16,
            opacity: stampProg,
            transform: `scale(${interpolate(stampProg, [0, 1], [0.8, 1])})`,
            border: `2px solid ${MOSS}`,
            borderRadius: 14,
            padding: "16px 28px",
          }}
        >
          <div style={{ width: 18, height: 18, borderRadius: 9, background: MOSS }} />
          <span style={{ fontFamily: SERIF, fontSize: 34, color: PARCHMENT }}>
            Confirmed on devnet · signed by your wallet
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const SceneAgents: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: INK, justifyContent: "center", alignItems: "center" }}>
      <Glow color={EMBER} x="15%" y="15%" />
      <Glow color={MOSS} x="65%" y="55%" />
      <Kicker>Carry it to any agent you trust</Kicker>
      <div style={{ display: "flex", alignItems: "center", gap: 60, marginTop: 20 }}>
        {["Coding agent", "Research agent", "Personal agent"].map((label, i) => {
          const e = useEnter(24 + i * 26, 16);
          return (
            <div
              key={label}
              style={{
                opacity: e.opacity,
                transform: `translateY(${e.y}px)`,
                width: 300,
                height: 200,
                borderRadius: 22,
                border: "1px solid rgba(255,255,255,0.14)",
                background: "rgba(255,255,255,0.03)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                gap: 16,
              }}
            >
              <Logo size={54} />
              <span style={{ fontFamily: SERIF, fontSize: 30, color: PARCHMENT }}>{label}</span>
              <span style={{ fontFamily: MONO, fontSize: 20, color: MOSS }}>reads your persona</span>
            </div>
          );
        })}
      </div>
      <div style={{ ...useEnter(120), fontFamily: SERIF, fontSize: 40, color: HAZE, marginTop: 54 }}>
        One grant key. Revoke it and the door shuts.
      </div>
    </AbsoluteFill>
  );
};

const SceneCTA: React.FC = () => {
  const logo = useEnter(6, 14);
  const h = useEnter(20);
  const url = useEnter(44);
  const foot = useEnter(70);
  return (
    <AbsoluteFill style={{ background: INK, justifyContent: "center", alignItems: "center" }}>
      <Glow color={EMBER} x="50%" y="20%" o={0.22} />
      <div style={{ opacity: logo.opacity, transform: `scale(${interpolate(logo.opacity, [0, 1], [0.7, 1])})` }}>
        <Logo size={90} />
      </div>
      <div
        style={{
          opacity: h.opacity,
          transform: `translateY(${h.y}px)`,
          fontFamily: SERIF,
          fontSize: 82,
          color: PARCHMENT,
          marginTop: 30,
          textAlign: "center",
        }}
      >
        Start the file that follows you.
      </div>
      <div
        style={{
          opacity: url.opacity,
          transform: `translateY(${url.y}px)`,
          fontFamily: MONO,
          fontSize: 44,
          color: EMBER,
          marginTop: 30,
          letterSpacing: 1,
        }}
      >
        everanima.vercel.app
      </div>
      <div
        style={{
          opacity: foot.opacity,
          fontFamily: MONO,
          fontSize: 24,
          color: HAZE,
          marginTop: 40,
          letterSpacing: 2,
        }}
      >
        Live on Solana devnet · Groq · Next.js
      </div>
    </AbsoluteFill>
  );
};

// Wraps a scene with a short cross-fade at its head and tail.
const Fade: React.FC<{ children: React.ReactNode; dur: number }> = ({ children, dur }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 14, dur - 14, dur], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return <AbsoluteFill style={{ opacity }}>{children}</AbsoluteFill>;
};

export const EveranimaDemo: React.FC = () => {
  const scenes: [React.FC, number][] = [
    [SceneHook, 120],
    [SceneProblem, 210],
    [SceneWallet, 210],
    [SceneChat, 390],
    [SceneAnchor, 270],
    [SceneAgents, 270],
    [SceneCTA, 330],
  ];
  let at = 0;
  return (
    <AbsoluteFill style={{ background: INK }}>
      {scenes.map(([Comp, dur], i) => {
        const from = at;
        at += dur;
        return (
          <Sequence key={i} from={from} durationInFrames={dur}>
            <Fade dur={dur}>
              <Comp />
            </Fade>
          </Sequence>
        );
      })}
      <Grain />
    </AbsoluteFill>
  );
};
