import React from "react";

// ── Icônes de catégories ───────────────────────────────────────────────────────
// Trait unique en currentColor (la couleur vient du texte autour : encre sur le
// jaune, blanc cassé sur le noir). Grille 24, trait 1.9, extrémités arrondies.
// Aucune librairie, aucun emoji.

type IconProps = { size?: number };

function Svg({ size = 22, children }: { size?: number; children: React.ReactNode }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      {children}
    </svg>
  );
}

export function BanqueIcon({ size }: IconProps) {
  return <Svg size={size}><path d="M3 9.5L12 4l9 5.5" /><path d="M5 10v8M9.5 10v8M14.5 10v8M19 10v8" /><path d="M3 20h18" /></Svg>;
}
export function CryptoIcon({ size }: IconProps) {
  return <Svg size={size}><circle cx="12" cy="12" r="8.5" /><path d="M10 8h3.2a2 2 0 0 1 0 4H10zM10 12h3.7a2 2 0 0 1 0 4H10zM10 8v8M11.5 6.5V8M11.5 16v1.5" /></Svg>;
}
export function EnergieIcon({ size }: IconProps) {
  return <Svg size={size}><path d="M13 3L5 13.5h6L10 21l8-10.5h-6z" /></Svg>;
}
export function CashbackIcon({ size }: IconProps) {
  return <Svg size={size}><path d="M4 12a8 8 0 1 0 2.4-5.7" /><path d="M4 4v4h4" /><path d="M14.5 9.2a2.4 2.4 0 0 0-2.3-1.2c-1.3 0-2.3.7-2.3 1.8 0 2.6 4.8 1.4 4.8 4 0 1.1-1.1 1.9-2.5 1.9a2.6 2.6 0 0 1-2.5-1.3M12 6.8v1.2M12 16.2v1" /></Svg>;
}
export function TelephonieIcon({ size }: IconProps) {
  return <Svg size={size}><rect x="6.5" y="2.5" width="11" height="19" rx="2.5" /><path d="M10.5 18.5h3" /></Svg>;
}
export function ParisIcon({ size }: IconProps) {
  return <Svg size={size}><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5l3.4 2.5-1.3 4h-4.2l-1.3-4z" /><path d="M12 3.5v4M15.4 10l4.3-1.2M14.1 14l2.6 3.6M9.9 14l-2.6 3.6M8.6 10L4.3 8.8" /></Svg>;
}
export function AssuranceIcon({ size }: IconProps) {
  return <Svg size={size}><path d="M12 3l7 3v5.5c0 4.3-3 7.7-7 9.5-4-1.8-7-5.2-7-9.5V6z" /><path d="M9 12l2.2 2.2L15.5 10" /></Svg>;
}
export function ShoppingIcon({ size }: IconProps) {
  return <Svg size={size}><path d="M5 8h14l-1.2 12.5H6.2z" /><path d="M9 10V7a3 3 0 0 1 6 0v3" /></Svg>;
}
export function ToutIcon({ size }: IconProps) {
  return <Svg size={size}><rect x="4" y="4" width="6.5" height="6.5" rx="1.5" /><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5" /><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5" /><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5" /></Svg>;
}
export function GeneralIcon({ size }: IconProps) {
  return <Svg size={size}><path d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H9l-5 4z" /></Svg>;
}
export function AstuceIcon({ size }: IconProps) {
  return <Svg size={size}><path d="M9 17.5h6M10 21h4" /><path d="M12 3a6 6 0 0 0-3.6 10.8c.6.5 1 1.2 1.1 2V16h5v-.2c.1-.8.5-1.5 1.1-2A6 6 0 0 0 12 3z" /></Svg>;
}
export function BourseIcon({ size }: IconProps) {
  return <Svg size={size}><path d="M4 4v16h16" /><path d="M7.5 15l4-4.5 3 2.5 5-6" /><path d="M15.5 7h4v4" /></Svg>;
}
export function MobiliteIcon({ size }: IconProps) {
  return <Svg size={size}><path d="M5 16V11l2-4.5h10L19 11v5" /><path d="M4 16h16v2.5H4z" /><circle cx="7.5" cy="13.5" r=".6" fill="currentColor" /><circle cx="16.5" cy="13.5" r=".6" fill="currentColor" /></Svg>;
}

// ── Résolution par nom (gère minuscules, accents et variantes) ────────────────

const ICONS: Record<string, React.ComponentType<IconProps>> = {
  banque: BanqueIcon,
  crypto: CryptoIcon,
  energie: EnergieIcon,
  cashback: CashbackIcon,
  telephonie: TelephonieIcon,
  paris: ParisIcon,
  assurance: AssuranceIcon,
  shopping: ShoppingIcon,
  tout: ToutIcon,
  general: GeneralIcon,
  astuce: AstuceIcon,
  bourse: BourseIcon,
  mobilite: MobiliteIcon,
};

const ALIASES: Record<string, string> = {
  banque: "banque",
  crypto: "crypto",
  energie: "energie",
  cashback: "cashback",
  telephonie: "telephonie",
  paris: "paris",
  "paris sportifs": "paris",
  "paris-sportifs": "paris",
  assurance: "assurance",
  shopping: "shopping",
  tout: "tout",
  general: "general",
  astuce: "astuce",
  bourse: "bourse",
  mobilite: "mobilite",
};

function normalize(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // retire les accents
    .trim();
}

/**
 * Affiche l'icône de la catégorie correspondant à `name`.
 * Accepte les slugs (banque) comme les libellés (Banque, « Paris Sportifs », Énergie…).
 */
export function CategoryIcon({ name, size = 20 }: { name: string; size?: number }) {
  const key = ALIASES[normalize(name)] ?? "general";
  const Icon = ICONS[key];
  return (
    <span style={{ display: "inline-flex", alignItems: "center", verticalAlign: "middle" }}>
      <Icon size={size} />
    </span>
  );
}
