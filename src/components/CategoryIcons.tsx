import React from "react";

// ── Icônes de catégories dessinées sur mesure (SVG duotone) ───────────────────
// Style maison, pensé pour le fond sombre du site. Aucune librairie, aucun emoji.

type IconProps = { size?: number };

export function BanqueIcon({ size = 22 }: IconProps) {
  return (
    <svg viewBox="0 0 40 40" width={size} height={size} fill="none">
      <path d="M20 4 L35 13 H5 Z" fill="#9ec5ff" />
      <rect x="5" y="13.5" width="30" height="3" rx="1.5" fill="#5b9dff" />
      <rect x="9" y="18" width="3.6" height="10" rx="1.2" fill="#5b9dff" />
      <rect x="15.6" y="18" width="3.6" height="10" rx="1.2" fill="#5b9dff" />
      <rect x="21.2" y="18" width="3.6" height="10" rx="1.2" fill="#5b9dff" />
      <rect x="27.4" y="18" width="3.6" height="10" rx="1.2" fill="#5b9dff" />
      <rect x="6" y="29.5" width="28" height="4" rx="1.5" fill="#9ec5ff" />
    </svg>
  );
}

export function CryptoIcon({ size = 22 }: IconProps) {
  return (
    <svg viewBox="0 0 40 40" width={size} height={size} fill="none">
      <circle cx="20" cy="20" r="14" fill="#f5b13c" />
      <circle cx="20" cy="20" r="14" fill="none" stroke="#ffd279" strokeWidth="1.6" opacity=".55" />
      <g stroke="#3a2606" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" fill="none">
        <path d="M17 13 V27" />
        <path d="M17 13 H22 a3.2 3.2 0 0 1 0 6.4 H17" />
        <path d="M17 19.4 H22.7 a3.4 3.4 0 0 1 0 6.6 H17" />
        <path d="M19 10.6 V13 M22 10.6 V13 M19 27 V29.4 M22 27 V29.4" />
      </g>
    </svg>
  );
}

export function EnergieIcon({ size = 22 }: IconProps) {
  return (
    <svg viewBox="0 0 40 40" width={size} height={size} fill="none">
      <path d="M23 4 L10 23 H18 L16 36 L30 16 H21 Z" fill="#f472b6" />
      <path d="M23 4 L10 23 H18 L21.5 9 Z" fill="#f9a8d4" />
    </svg>
  );
}

// Cashback — option 1 : pièce € + boucle de remboursement (bien détachée)
export function CashbackIcon({ size = 22 }: IconProps) {
  return (
    <svg viewBox="0 0 40 40" width={size} height={size} fill="none">
      <path d="M10 29 A13 13 0 1 1 30 29" fill="none" stroke="#b4baff" strokeWidth="2.6" strokeLinecap="round" />
      <path d="M30 29 L31.5 24 L26 25.5 Z" fill="#b4baff" />
      <circle cx="20" cy="20" r="8.5" fill="#818cf8" />
      <g stroke="#16183a" strokeWidth="2.1" strokeLinecap="round" fill="none">
        <path d="M23.5 16.5 a5.2 5.2 0 1 0 0 7" />
        <path d="M15 19.3 H22.5" />
        <path d="M15 21.6 H21" />
      </g>
    </svg>
  );
}

export function TelephonieIcon({ size = 22 }: IconProps) {
  return (
    <svg viewBox="0 0 40 40" width={size} height={size} fill="none">
      <rect x="12" y="4" width="16" height="32" rx="4.5" fill="#a78bfa" />
      <rect x="14.6" y="9" width="10.8" height="18" rx="1.6" fill="#0A0A0F" opacity=".55" />
      <rect x="17.6" y="6.6" width="4.8" height="1.5" rx=".75" fill="#0A0A0F" opacity=".4" />
      <circle cx="20" cy="31.5" r="1.7" fill="#0A0A0F" opacity=".45" />
      <path d="M16 12 L20 12" stroke="#c9b8ff" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function ParisIcon({ size = 22 }: IconProps) {
  return (
    <svg viewBox="0 0 40 40" width={size} height={size} fill="none">
      <path d="M9 8 a4.5 4.5 0 0 0 0 9" fill="none" stroke="#34d399" strokeWidth="2.6" />
      <path d="M31 8 a4.5 4.5 0 0 1 0 9" fill="none" stroke="#34d399" strokeWidth="2.6" />
      <path d="M12 6 H28 V14 a8 8 0 0 1 -16 0 Z" fill="#34d399" />
      <path d="M12 6 H28 V9 H12 Z" fill="#6ee7b7" />
      <rect x="18" y="22" width="4" height="5" fill="#6ee7b7" />
      <rect x="13.5" y="27" width="13" height="3.6" rx="1.6" fill="#6ee7b7" />
    </svg>
  );
}

export function AssuranceIcon({ size = 22 }: IconProps) {
  return (
    <svg viewBox="0 0 40 40" width={size} height={size} fill="none">
      <path d="M20 4 L33 9 V19 C33 27 27 33 20 36 C13 33 7 27 7 19 V9 Z" fill="#fb923c" />
      <path d="M20 4 L7 9 V19 C7 27 13 33 20 36 Z" fill="#fdba74" opacity=".45" />
      <path d="M13.5 20 L18.5 25.5 L27 14.5" fill="none" stroke="#0A0A0F" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" opacity=".75" />
    </svg>
  );
}

export function ShoppingIcon({ size = 22 }: IconProps) {
  return (
    <svg viewBox="0 0 40 40" width={size} height={size} fill="none">
      <path d="M15 15 V11 a5 5 0 0 1 10 0 V15" fill="none" stroke="#5eead4" strokeWidth="2.6" strokeLinecap="round" />
      <path d="M9 13 H31 L29.5 33.5 a2.2 2.2 0 0 1 -2.2 2 H12.7 a2.2 2.2 0 0 1 -2.2 -2 Z" fill="#2dd4bf" />
      <path d="M9 13 H31 L30.5 18 H9.5 Z" fill="#5eead4" opacity=".4" />
      <circle cx="15.5" cy="21" r="1.5" fill="#0A0A0F" opacity=".35" />
      <circle cx="24.5" cy="21" r="1.5" fill="#0A0A0F" opacity=".35" />
    </svg>
  );
}

// ── Catégories secondaires (forum / filtres) ──────────────────────────────────

export function ToutIcon({ size = 22 }: IconProps) {
  return (
    <svg viewBox="0 0 40 40" width={size} height={size} fill="none">
      <rect x="6" y="6" width="12" height="12" rx="3.2" fill="#c9b8ff" />
      <rect x="22" y="6" width="12" height="12" rx="3.2" fill="#a78bfa" />
      <rect x="6" y="22" width="12" height="12" rx="3.2" fill="#a78bfa" />
      <rect x="22" y="22" width="12" height="12" rx="3.2" fill="#c9b8ff" />
    </svg>
  );
}

export function GeneralIcon({ size = 22 }: IconProps) {
  return (
    <svg viewBox="0 0 40 40" width={size} height={size} fill="none">
      <path d="M7 8 H33 a3 3 0 0 1 3 3 V25 a3 3 0 0 1 -3 3 H17 L10 34 V28 H7 a3 3 0 0 1 -3 -3 V11 a3 3 0 0 1 3 -3 Z" fill="#a78bfa" />
      <circle cx="14" cy="18" r="2" fill="#ede9fe" />
      <circle cx="20" cy="18" r="2" fill="#ede9fe" />
      <circle cx="26" cy="18" r="2" fill="#ede9fe" />
    </svg>
  );
}

export function AstuceIcon({ size = 22 }: IconProps) {
  return (
    <svg viewBox="0 0 40 40" width={size} height={size} fill="none">
      <path d="M20 4 C13.5 4 9 8.5 9 14.5 C9 18.5 11.5 21 13 24 H27 C28.5 21 31 18.5 31 14.5 C31 8.5 26.5 4 20 4 Z" fill="#fbbf24" />
      <path d="M20 4 C13.5 4 9 8.5 9 14.5 C9 18.5 11.5 21 13 24 H20 Z" fill="#fde68a" opacity=".5" />
      <rect x="14.5" y="25.5" width="11" height="3.4" rx="1.7" fill="#fde68a" />
      <rect x="16" y="30" width="8" height="3.2" rx="1.6" fill="#fde68a" />
      <line x1="20" y1="9" x2="20" y2="19" stroke="#fff7d6" strokeWidth="1.6" strokeLinecap="round" opacity=".7" />
    </svg>
  );
}

export function BourseIcon({ size = 22 }: IconProps) {
  return (
    <svg viewBox="0 0 40 40" width={size} height={size} fill="none">
      <line x1="5" y1="34" x2="35" y2="34" stroke="#a5b4fc" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="6" y1="34" x2="6" y2="8" stroke="#a5b4fc" strokeWidth="2.5" strokeLinecap="round" />
      <polyline points="9,28 17,20 23,25 33,11" fill="none" stroke="#6366f1" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M33 11 L26 11 M33 11 L33 18" stroke="#6366f1" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
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
};

const ALIASES: Record<string, string> = {
  banque: "banque",
  crypto: "crypto",
  energie: "energie",
  cashback: "cashback",
  telephonie: "telephonie",
  paris: "paris",
  "paris sportifs": "paris",
  assurance: "assurance",
  shopping: "shopping",
  tout: "tout",
  general: "general",
  astuce: "astuce",
  bourse: "bourse",
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
