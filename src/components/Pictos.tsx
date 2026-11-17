import React from "react";

// ── Pictogrammes du site ───────────────────────────────────────────────────────
// Remplacent les emojis. Même dessin que les icônes de catégories : grille 24,
// trait 1.9 arrondi, une seule couleur (currentColor) qui suit le texte autour.
// Un picto accompagne un mot ; il n'est jamais seul pour porter un sens
// (aria-hidden), sauf s'il reçoit un `title`.

type P = { size?: number; title?: string; className?: string; style?: React.CSSProperties };

function Svg({ size = 18, title, className, style, children, fill = "none" }: P & { children: React.ReactNode; fill?: string }) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth="1.9"
      strokeLinecap="round" strokeLinejoin="round" className={className}
      style={{ flexShrink: 0, display: "inline-block", verticalAlign: "-0.15em", ...style }}
      role={title ? "img" : undefined} aria-hidden={title ? undefined : true} aria-label={title}
    >
      {children}
    </svg>
  );
}

/** Médaille avec son rang écrit dedans (1, 2, 3…). */
export function Medal({ rank, ...p }: P & { rank: number }) {
  return (
    <Svg {...p}>
      <path d="M8 2.5l2.4 5M16 2.5l-2.4 5" />
      <circle cx="12" cy="14.5" r="6.5" />
      <text x="12" y="17.6" textAnchor="middle" fontSize="8.5" fontWeight="800" fill="currentColor" stroke="none" fontFamily="var(--font-display), sans-serif">{rank}</text>
    </Svg>
  );
}
export function Crown(p: P) {
  return <Svg {...p}><path d="M3.5 8l4.2 4 4.3-6.5 4.3 6.5 4.2-4-1.8 10.5H5.3z" /><path d="M5.5 21h13" /></Svg>;
}
export function Flame(p: P) {
  return <Svg {...p}><path d="M12 21c-3.9 0-6.5-2.6-6.5-6.2 0-3.4 2.4-5.4 3.6-8.3.4 1.8 1.4 3 2.6 3.5.3-2.6 1.5-5.1 3.6-7 .2 3.3 3.2 5.8 3.2 10.4C18.5 18.1 16 21 12 21z" /><path d="M12 21c-1.6 0-2.7-1.1-2.7-2.6 0-1.6 1.3-2.4 1.9-3.8.9 1.3 3.5 2 3.5 4 0 1.4-1.1 2.4-2.7 2.4z" /></Svg>;
}
export function Ticket(p: P) {
  return <Svg {...p}><path d="M4 6h16a1 1 0 0 1 1 1v2.5a2.5 2.5 0 0 0 0 5V17a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-2.5a2.5 2.5 0 0 0 0-5V7a1 1 0 0 1 1-1z" /><path d="M15.5 7.5v1.2M15.5 11.4v1.2M15.5 15.3v1.2" /></Svg>;
}
export function Bolt(p: P) {
  return <Svg {...p}><path d="M13 2.5L4.5 13.5H11l-1 8 8.5-11H12z" /></Svg>;
}
export function Trophy(p: P) {
  return <Svg {...p}><path d="M7 4h10v5a5 5 0 0 1-10 0z" /><path d="M7 6H4.5a2.5 2.5 0 0 0 2.6 4.4M17 6h2.5a2.5 2.5 0 0 1-2.6 4.4" /><path d="M12 14v3.5M8.5 21h7M9.5 17.5h5" /></Svg>;
}
export function TrendUp(p: P) {
  return <Svg {...p}><path d="M3.5 17l6-6 3.5 3.5L20.5 7" /><path d="M15 7h5.5v5.5" /></Svg>;
}
export function Star(p: P & { filled?: boolean }) {
  return <Svg {...p} fill={p.filled ? "currentColor" : "none"}><path d="M12 3.2l2.7 5.6 6.1.8-4.5 4.2 1.1 6-5.4-2.9-5.4 2.9 1.1-6L3.2 9.6l6.1-.8z" /></Svg>;
}
export function Lock(p: P) {
  return <Svg {...p}><rect x="5" y="10.5" width="14" height="10" rx="2" /><path d="M8.5 10.5V7.5a3.5 3.5 0 0 1 7 0v3M12 14.5v2.5" /></Svg>;
}
export function InfinityLoop(p: P) {
  return <Svg {...p}><path d="M12 12c-2-2.6-3.6-4-5.5-4a4 4 0 0 0 0 8c1.9 0 3.5-1.4 5.5-4zm0 0c2 2.6 3.6 4 5.5 4a4 4 0 0 0 0-8c-1.9 0-3.5 1.4-5.5 4z" /></Svg>;
}
export function Chat(p: P) {
  return <Svg {...p}><path d="M4.5 5.5h15a1 1 0 0 1 1 1v9.5a1 1 0 0 1-1 1H10l-4.5 3.5v-3.5h-1a1 1 0 0 1-1-1V6.5a1 1 0 0 1 1-1z" /></Svg>;
}
export function Building(p: P) {
  return <Svg {...p}><path d="M4.5 21V4.5a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1V21M14.5 9.5h4a1 1 0 0 1 1 1V21M3 21h18" /><path d="M8 7.5h3M8 11h3M8 14.5h3" /></Svg>;
}
export function Check(p: P) {
  return <Svg {...p}><path d="M4.5 12.5l4.8 4.8L19.5 7" /></Svg>;
}
export function CheckCircle(p: P) {
  return <Svg {...p}><circle cx="12" cy="12" r="9" /><path d="M7.8 12.4l2.9 2.9 5.5-5.6" /></Svg>;
}
export function Cross(p: P) {
  return <Svg {...p}><path d="M6 6l12 12M18 6L6 18" /></Svg>;
}
export function Envelope(p: P) {
  return <Svg {...p}><rect x="3" y="5.5" width="18" height="13" rx="1.5" /><path d="M3.5 6.5l8.5 7 8.5-7" /></Svg>;
}
export function Bulb(p: P) {
  return <Svg {...p}><path d="M9 17.5h6M10 21h4" /><path d="M12 3a6 6 0 0 0-3.6 10.8c.6.5 1 1.2 1.1 2V16h5v-.2c.1-.8.5-1.5 1.1-2A6 6 0 0 0 12 3z" /></Svg>;
}
export function Clock(p: P) {
  return <Svg {...p}><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></Svg>;
}
export function Warning(p: P) {
  return <Svg {...p}><path d="M12 3.5l9 16H3z" /><path d="M12 9.5v4.5M12 17v.2" /></Svg>;
}
export function Sleep(p: P) {
  return <Svg {...p}><path d="M4 9h5l-5 6h5M13 5h4l-4 5h4M16.5 13.5h3.5l-3.5 4.5h3.5" /></Svg>;
}
export function Handshake(p: P) {
  return <Svg {...p}><path d="M2.5 11l3.5-4 4 1.5L12 7l2 1.5 4-1.5 3.5 4" /><path d="M6 7l3 8 2 1.5M18 7l-3 8-2 1.5M9 15l2.5 2M11 13l3 2.5M13 11.5l2.5 2" /></Svg>;
}
export function Gift(p: P) {
  return <Svg {...p}><rect x="3.5" y="8" width="17" height="4" rx="1" /><path d="M5 12v8.5h14V12M12 8v12.5" /><path d="M12 8c-2.5 0-4.5-.8-4.5-2.5S9.7 3 12 8c2.3-5 4.5-4.2 4.5-2.5S14.5 8 12 8z" /></Svg>;
}
export function Pencil(p: P) {
  return <Svg {...p}><path d="M15.5 4.5l4 4L8.5 19.5H4.5v-4z" /><path d="M13.5 6.5l4 4" /></Svg>;
}
export function Search(p: P) {
  return <Svg {...p}><circle cx="11" cy="11" r="6.5" /><path d="M20 20l-4.3-4.3" /></Svg>;
}
export function Users(p: P) {
  return <Svg {...p}><circle cx="9" cy="8.5" r="3.5" /><path d="M3 20c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5" /><path d="M16 5.2a3.4 3.4 0 0 1 0 6.6M17.5 14.7c2 .6 3.5 2.6 3.5 5.3" /></Svg>;
}
export function Megaphone(p: P) {
  return <Svg {...p}><path d="M4 10v4a1 1 0 0 0 1 1h2.5L15 19V5L7.5 9H5a1 1 0 0 0-1 1z" /><path d="M8 15l1.5 5M18.5 9.5a3.5 3.5 0 0 1 0 5" /></Svg>;
}
export function ThumbUp(p: P) {
  return <Svg {...p}><path d="M7 10.5V20H4.5a1 1 0 0 1-1-1v-7.5a1 1 0 0 1 1-1zM7 10.5l3.5-7a2.2 2.2 0 0 1 2.2 2.4l-.5 3.6H18a2 2 0 0 1 2 2.3l-1.2 6.5a2 2 0 0 1-2 1.7H7" /></Svg>;
}
export function ThumbDown(p: P) {
  return <ThumbUp {...p} style={{ ...p.style, transform: "rotate(180deg)" }} />;
}
/** Échelle d'humeur pour une note de 1 à 5 : la bouche passe de la grimace au sourire. */
export function Mood({ level, ...p }: P & { level: 1 | 2 | 3 | 4 | 5 }) {
  const mouths: Record<number, string> = {
    1: "M8 16.5c2.3-2 5.7-2 8 0",
    2: "M8.5 16c2-1 5-1 7 0",
    3: "M8.5 15.5h7",
    4: "M8.5 14.5c2 1.5 5 1.5 7 0",
    5: "M7.8 13.8c1.7 3.2 6.7 3.2 8.4 0z",
  };
  return (
    <Svg {...p}>
      <circle cx="12" cy="12" r="9" />
      {level === 1 ? <path d="M8 8.8l2 1.2M16 8.8l-2 1.2" /> : <path d="M9 9.5v.5M15 9.5v.5" />}
      <path d={mouths[level]} />
    </Svg>
  );
}
/** Tampon « validé » : remplace les 🎉 et ✅ des écrans de réussite. */
export function Stamp(p: P) {
  return <Svg {...p}><circle cx="12" cy="12" r="9.5" /><circle cx="12" cy="12" r="6.5" strokeDasharray="1.6 2.2" /><path d="M9 12.2l2.1 2.1L15.2 10" /></Svg>;
}
export function Podium(p: P) {
  return <Svg {...p}><path d="M8.5 21V10.5h7V21M2.5 21v-6h6M15.5 21v-8h6V21M1.5 21h21" /><path d="M12 3.5l.9 1.9 2 .3-1.5 1.4.4 2-1.8-1-1.8 1 .4-2-1.5-1.4 2-.3z" /></Svg>;
}
export function Shield(p: P) {
  return <Svg {...p}><path d="M12 3l7 3v5.5c0 4.3-3 7.7-7 9.5-4-1.8-7-5.2-7-9.5V6z" /><path d="M9 12l2.2 2.2L15.5 10" /></Svg>;
}
export function Globe(p: P) {
  return <Svg {...p}><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z" /></Svg>;
}
export function Inbox(p: P) {
  return <Svg {...p}><path d="M3.5 13.5l2.5-8h12l2.5 8V19a1 1 0 0 1-1 1h-15a1 1 0 0 1-1-1z" /><path d="M3.5 13.5h5l1 2.5h5l1-2.5h5" /></Svg>;
}
export function Plus(p: P) {
  return <Svg {...p}><path d="M12 5v14M5 12h14" /></Svg>;
}
