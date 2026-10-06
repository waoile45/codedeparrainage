"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase";

// Pages où proposer l'inscription n'a pas de sens (on y est déjà)
const HIDDEN_ON = ["/login", "/register", "/auth"];

export default function StickyBanner() {
  const [visible, setVisible] = useState(false);
  const pathname = usePathname();
  const hiddenHere = HIDDEN_ON.some((p) => pathname?.startsWith(p));

  useEffect(() => {
    if (hiddenHere) return;
    try {
      if (sessionStorage.getItem("banner_dismissed")) return;
    } catch { /* stockage indisponible : on affiche quand même */ }
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) setVisible(true);
    });
  }, [hiddenHere]);

  // Réserve la hauteur de la bannière en bas de page pour ne pas recouvrir
  // le footer ni le dernier bouton d'une page (padding défini dans globals.css).
  useEffect(() => {
    document.body.classList.toggle("has-sticky-banner", visible);
    return () => document.body.classList.remove("has-sticky-banner");
  }, [visible]);

  function dismiss() {
    try { sessionStorage.setItem("banner_dismissed", "1"); } catch {}
    setVisible(false);
  }

  if (!visible || hiddenHere) return null;

  return (
    <>
      <style>{`
        .sb {
          position: fixed; bottom: 0; left: 0; right: 0;
          /* Sous les modales (z 1000) et la navbar (z 200) : la bannière ne doit jamais recouvrir une action en cours */
          z-index: 100;
          background: #11091f;
          border-top: 1px solid rgba(124,58,237,0.4);
          padding: 0.75rem 1.25rem;
          padding-bottom: calc(0.75rem + env(safe-area-inset-bottom));
          display: flex; align-items: center; justify-content: space-between; gap: 12px;
          box-shadow: 0 -8px 32px rgba(0,0,0,0.5);
          font-family: 'DM Sans', sans-serif;
        }
        .sb-text { min-width: 0; }
        .sb-title { margin: 0; font-size: 0.9rem; font-weight: 700; color: #fff; font-family: 'Syne', sans-serif; line-height: 1.3; }
        .sb-sub { margin: 2px 0 0; font-size: 0.78rem; color: rgba(255,255,255,0.5); }
        .sb-actions { display: flex; align-items: center; gap: 6px; flex-shrink: 0; }
        .sb-cta {
          background: #7c3aed; color: #fff; text-decoration: none;
          padding: 0.55rem 1rem; border-radius: 10px;
          font-size: 0.82rem; font-weight: 700; white-space: nowrap;
          box-shadow: 0 4px 16px rgba(124,58,237,0.4);
        }
        .sb-close {
          background: none; border: none; cursor: pointer;
          color: rgba(255,255,255,0.45); font-size: 1.1rem; line-height: 1;
          width: 40px; height: 40px; border-radius: 10px; flex-shrink: 0;
          display: inline-flex; align-items: center; justify-content: center;
        }
        .sb-close:hover { color: #fff; background: rgba(255,255,255,0.06); }
        @media (max-width: 600px) {
          .sb { padding: 0.6rem 0.75rem; padding-bottom: calc(0.6rem + env(safe-area-inset-bottom)); gap: 8px; }
          .sb-title { font-size: 0.82rem; }
          .sb-sub { display: none; }
          .sb-cta { padding: 0.5rem 0.8rem; font-size: 0.78rem; }
        }
      `}</style>
      <div className="sb" role="region" aria-label="Proposition d'inscription">
        <div className="sb-text">
          <p className="sb-title">Tu as un code parrainage à partager ?</p>
          <p className="sb-sub">Publie-le gratuitement : il apparaît sur la page de la marque et tu gagnes des XP.</p>
        </div>
        <div className="sb-actions">
          <Link href="/register" className="sb-cta">Créer un compte</Link>
          <button onClick={dismiss} className="sb-close" aria-label="Fermer">✕</button>
        </div>
      </div>
    </>
  );
}
