// Avatar des membres sans photo : un petit animal au trait sur un rond de
// couleur. Le même pseudo donne toujours le même animal et la même couleur
// (empreinte du pseudo), sur toutes les pages.
//
// Dessins : viewBox 32×32, trait encre de 2, comme les pictos du site.

import type { CSSProperties, ReactNode } from "react";

const EYE = (x: number, y: number, r = 1.4) => <circle cx={x} cy={y} r={r} fill="#141414" stroke="none" />;

export const ANIMAUX: { nom: string; dessin: ReactNode }[] = [
  { nom: "chat", dessin: <>
    <path d="M8 14 7.5 6l5.5 4.5q3-1 6 0L24.5 6 24 14q1.5 10-8 11-9.5-1-8-11z" />
    {EYE(12.5, 16)}{EYE(19.5, 16)}
    <path d="M15 19.3h2l-1 1.3z" fill="#141414" />
    <path d="M10.5 19.5 6 18.8M10.5 21 6.3 21.8M21.5 19.5l4.5-.7M21.5 21l4.2.8" strokeWidth={1.4} />
  </> },
  { nom: "chien", dessin: <>
    <circle cx="16" cy="17.5" r="7.5" />
    <path d="M10 12.5Q5 11 5.5 18.5q2 2.5 4.5-1M22 12.5q5-1.5 4.5 6-2 2.5-4.5-1" />
    {EYE(13, 16)}{EYE(19, 16)}
    <ellipse cx="16" cy="20.5" rx="1.8" ry="1.3" fill="#141414" stroke="none" />
    <path d="M16 21.8v1.5" strokeWidth={1.4} />
  </> },
  { nom: "renard", dessin: <>
    <path d="M6 10q5 2.5 10 2.5T26 10l-3.5 9L16 25.5 9.5 19z" />
    <path d="M7 10.5 8.5 4.5l4 6.5M25 10.5l-1.5-6-4 6.5" />
    {EYE(12.5, 15.5)}{EYE(19.5, 15.5)}
    <circle cx="16" cy="22.5" r="1.2" fill="#141414" stroke="none" />
  </> },
  { nom: "ours", dessin: <>
    <circle cx="9.5" cy="10.5" r="3" /><circle cx="22.5" cy="10.5" r="3" />
    <circle cx="16" cy="17.5" r="8" />
    {EYE(12.8, 15.8)}{EYE(19.2, 15.8)}
    <ellipse cx="16" cy="21" rx="3.6" ry="2.6" />
    <ellipse cx="16" cy="20.2" rx="1.2" ry=".9" fill="#141414" stroke="none" />
  </> },
  { nom: "lapin", dessin: <>
    <path d="M13 13.5Q10 3 12.5 3t2.3 10M19 13.5Q22 3 19.5 3t-2.3 10" />
    <circle cx="16" cy="20" r="7" />
    {EYE(13.2, 19)}{EYE(18.8, 19)}
    <path d="M15.2 22h1.6l-.8 1z" fill="#141414" />
  </> },
  { nom: "hibou", dessin: <>
    <path d="M8 10.5q8-4 16 0V22q-8 6.5-16 0z" />
    <path d="M8 10.5 7 6.5l4 2.3M24 10.5l1-4-4 2.3" />
    <circle cx="12.5" cy="15.5" r="3" /><circle cx="19.5" cy="15.5" r="3" />
    {EYE(12.5, 15.5, 1.2)}{EYE(19.5, 15.5, 1.2)}
    <path d="M16 18.5 14.8 20.5h2.4z" fill="#141414" />
  </> },
  { nom: "panda", dessin: <>
    <circle cx="9.5" cy="10.5" r="3" fill="#141414" /><circle cx="22.5" cy="10.5" r="3" fill="#141414" />
    <circle cx="16" cy="17.5" r="8" fill="#FAF8F3" />
    <ellipse cx="12.6" cy="16.3" rx="2" ry="2.6" fill="#141414" transform="rotate(25 12.6 16.3)" />
    <ellipse cx="19.4" cy="16.3" rx="2" ry="2.6" fill="#141414" transform="rotate(-25 19.4 16.3)" />
    <ellipse cx="16" cy="20.8" rx="1.3" ry=".9" fill="#141414" stroke="none" />
  </> },
  { nom: "pingouin", dessin: <>
    <circle cx="16" cy="16.5" r="9" fill="#141414" />
    <path d="M9.5 18.5q1-6 6.5-6t6.5 6q-2.5 5-6.5 5t-6.5-5z" fill="#FAF8F3" stroke="none" />
    <circle cx="13.3" cy="16.5" r="1.2" fill="#141414" stroke="none" />
    <circle cx="18.7" cy="16.5" r="1.2" fill="#141414" stroke="none" />
    <path d="M14.6 19h2.8L16 20.8z" fill="#F4A261" stroke="#141414" strokeWidth={1} />
  </> },
  { nom: "grenouille", dessin: <>
    <circle cx="11" cy="11.5" r="3.4" /><circle cx="21" cy="11.5" r="3.4" />
    {EYE(11, 11.5, 1.5)}{EYE(21, 11.5, 1.5)}
    <path d="M7.7 13.5Q5.5 16 6 19q1.5 5.5 10 5.5T26 19q.5-3-1.7-5.5" />
    <path d="M11.5 19.5q4.5 3 9 0" />
  </> },
  { nom: "souris", dessin: <>
    <circle cx="9.5" cy="11" r="4.3" /><circle cx="22.5" cy="11" r="4.3" />
    <path d="M10 15.5q-1 7 6 9.5 7-2.5 6-9.5-2.5-3-6-3t-6 3z" />
    {EYE(13.5, 17)}{EYE(18.5, 17)}
    <circle cx="16" cy="21.8" r="1.1" fill="#141414" stroke="none" />
    <path d="M11.5 21 7.5 20.5M11.5 22.5l-3.8 1M20.5 21l4-.5M20.5 22.5l3.8 1" strokeWidth={1.3} />
  </> },
  { nom: "koala", dessin: <>
    <circle cx="8.5" cy="12.5" r="4" /><circle cx="23.5" cy="12.5" r="4" />
    <circle cx="16" cy="17.5" r="7.5" />
    {EYE(13, 15.8)}{EYE(19, 15.8)}
    <ellipse cx="16" cy="19.5" rx="2.2" ry="3" fill="#141414" stroke="none" />
  </> },
  { nom: "poussin", dessin: <>
    <circle cx="16" cy="18" r="8.5" />
    <path d="M14.5 9.6q.6-3.6 2-3.3m-.3 3.3q1.6-2.6 2.8-1.6" />
    {EYE(13, 16.5)}{EYE(19, 16.5)}
    <path d="M14.5 19.2h3L16 21.4z" fill="#F4A261" strokeWidth={1.3} />
  </> },
];

// Couleurs de fond : douces, lisibles avec un trait encre sur fond sombre.
export const COULEURS = ["#FFD43B", "#F4A261", "#8FD3B6", "#A8C1F0", "#F2A7B5", "#D9C7A7", "#B9DE7E", "#83D0D6"];

function empreinte(s: string): number {
  let h = 2166136261;
  for (const c of s.trim().toLowerCase()) {
    h ^= c.codePointAt(0)!;
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export default function AnimalAvatar({ seed, size, className, style }: {
  seed: string;
  /** Sans taille, l'avatar remplit son conteneur (rond déjà dimensionné). */
  size?: number;
  className?: string;
  style?: CSSProperties;
}) {
  const h = empreinte(seed || "?");
  const animal = ANIMAUX[h % ANIMAUX.length];
  const fond = COULEURS[Math.floor(h / ANIMAUX.length) % COULEURS.length];
  return (
    <span
      className={className}
      aria-hidden="true"
      style={{
        width: size ?? "100%", height: size ?? "100%", borderRadius: "50%", background: fond, flexShrink: 0,
        display: "inline-flex", alignItems: "center", justifyContent: "center", overflow: "hidden",
        ...style,
      }}
    >
      <svg viewBox="0 0 32 32" width={size ? Math.round(size * 0.86) : "86%"} height={size ? Math.round(size * 0.86) : "86%"} fill="none"
        stroke="#141414" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" focusable="false">
        {animal.dessin}
      </svg>
    </span>
  );
}
