"use client";

import { useState } from "react";
import { Check } from "./Pictos";

/**
 * « Partager mon code » : un lien vers la page de la marque qui défile jusqu'au
 * code du parrain et le met en évidence (ancre #code-<id>, voir brand.css).
 * Sur téléphone, la feuille de partage du système (WhatsApp, Instagram…) ;
 * ailleurs, le lien et le code sont copiés dans le presse-papiers.
 */
export default function ShareCode({
  announcementId,
  brand,
  code,
  urlSlug,
  bonus,
  variant = "ghost",
}: {
  announcementId: string;
  brand: string;
  code: string;
  urlSlug: string | null | undefined;
  bonus?: string | null;
  variant?: "ghost" | "accent";
}) {
  const [done, setDone] = useState(false);
  if (!urlSlug) return null;

  const url = `https://www.codedeparrainage.com/code-parrainage/${urlSlug}#code-${announcementId}`;
  const isLink = /^https?:\/\//i.test(code.trim());
  const text = isLink
    ? `Mon lien de parrainage ${brand}${bonus ? ` (${bonus})` : ""}`
    : `Mon code parrainage ${brand} : ${code}${bonus ? ` (${bonus})` : ""}`;

  async function share() {
    try {
      if (navigator.share) {
        await navigator.share({ title: `Code parrainage ${brand}`, text, url });
        return;
      }
    } catch {
      return; // partage annulé par l'utilisateur
    }
    try {
      await navigator.clipboard.writeText(`${text}\n${url}`);
      setDone(true);
      setTimeout(() => setDone(false), 2500);
    } catch {
      window.prompt("Copie ce lien :", url);
    }
  }

  return (
    <button type="button" onClick={share} className={`share-btn share-${variant}`}>
      {done ? (
        <><Check size={15} /> Lien copié</>
      ) : (
        <>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="18" cy="5.5" r="2.5" /><circle cx="6" cy="12" r="2.5" /><circle cx="18" cy="18.5" r="2.5" />
            <path d="M8.2 10.8l7.6-4.1M8.2 13.2l7.6 4.1" />
          </svg>
          Partager mon code
        </>
      )}
      <style>{`
        .share-btn { display: inline-flex; align-items: center; gap: 7px; min-height: 40px; padding: 0 1rem; border-radius: 10px; border: 0; cursor: pointer; font: inherit; font-size: .92rem; font-weight: 700; white-space: nowrap; transition: box-shadow .15s ease, background-color .15s ease; }
        .share-ghost { background: transparent; color: var(--text-strong); box-shadow: inset 0 0 0 1.5px var(--border-lg); }
        .share-ghost:hover { box-shadow: inset 0 0 0 1.5px var(--accent); }
        .share-accent { background: var(--accent); color: var(--accent-ink); min-height: 48px; padding: 0 1.4rem; font-size: 1rem; }
        .share-accent:hover { background: var(--accent-hover); }
      `}</style>
    </button>
  );
}
