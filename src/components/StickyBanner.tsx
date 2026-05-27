"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";

export default function StickyBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("banner_dismissed")) return;
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) setVisible(true);
    });
  }, []);

  function dismiss() {
    sessionStorage.setItem("banner_dismissed", "1");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div style={{
      position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 9999,
      background: "linear-gradient(135deg, #1a0533 0%, #0f0a1e 100%)",
      borderTop: "1px solid rgba(124,58,237,0.4)",
      padding: "0.875rem 1.5rem",
      display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16,
      boxShadow: "0 -8px 32px rgba(0,0,0,0.5)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
        <span style={{ fontSize: "1.4rem", flexShrink: 0 }}>🎁</span>
        <div style={{ minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: "0.9rem", fontWeight: 700, color: "#fff", fontFamily: "'Syne', sans-serif", lineHeight: 1.3 }}>
            Tu as un code parrainage ?
          </p>
          <p style={{ margin: 0, fontSize: "0.78rem", color: "rgba(255,255,255,0.5)", marginTop: 2 }}>
            Publie-le gratuitement et gagne des XP, badges et récompenses
          </p>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
        <a href="/register" style={{
          background: "#7c3aed", color: "#fff", textDecoration: "none",
          padding: "0.5rem 1.1rem", borderRadius: 10,
          fontSize: "0.82rem", fontWeight: 700, fontFamily: "'DM Sans', sans-serif",
          whiteSpace: "nowrap", boxShadow: "0 4px 16px rgba(124,58,237,0.4)",
        }}>
          S'inscrire gratuitement →
        </a>
        <button onClick={dismiss} aria-label="Fermer" style={{
          background: "none", border: "none", cursor: "pointer",
          color: "rgba(255,255,255,0.35)", fontSize: "1.1rem", lineHeight: 1,
          padding: "4px 8px", flexShrink: 0,
        }}>✕</button>
      </div>
    </div>
  );
}
