"use client";

import { useState } from "react";
import Link from "next/link";
import { useTheme } from "@/components/ThemeProvider";

// ── Featured companies with referral codes ────────────────────────────────────

const FEATURED = [
  {
    name: "Boursobank",
    logo: "🏦",
    color: "#00a8e0",
    bg: "rgba(0,168,224,0.1)",
    category: "Banque",
    bonus: "+240€",
    bonusLabel: "offerts à l'ouverture",
    codes: 48,
    rating: 4.9,
    description: "Banque en ligne, compte gratuit + prime de bienvenue.",
    slug: "boursobank",
  },
  {
    name: "Revolut",
    logo: "💳",
    color: "#191c82",
    bg: "rgba(25,28,130,0.1)",
    category: "Banque",
    bonus: "+30€",
    bonusLabel: "en cashback",
    codes: 31,
    rating: 4.7,
    description: "Carte internationale sans frais, virements instantanés.",
    slug: "revolut",
  },
  {
    name: "Winamax",
    logo: "⚽",
    color: "#e63946",
    bg: "rgba(230,57,70,0.1)",
    category: "Paris sportifs",
    bonus: "+100€",
    bonusLabel: "en freebets",
    codes: 62,
    rating: 4.8,
    description: "Le leader des paris sportifs en France.",
    slug: "winamax",
  },
  {
    name: "Binance",
    logo: "₿",
    color: "#f0b90b",
    bg: "rgba(240,185,11,0.1)",
    category: "Crypto",
    bonus: "-20%",
    bonusLabel: "sur les frais",
    codes: 27,
    rating: 4.6,
    description: "La plus grande plateforme crypto au monde.",
    slug: "binance",
  },
  {
    name: "Trade Republic",
    logo: "📈",
    color: "#0cce6b",
    bg: "rgba(12,206,107,0.1)",
    category: "Bourse",
    bonus: "+5€",
    bonusLabel: "en actions",
    codes: 19,
    rating: 4.8,
    description: "Investissez en actions et ETF à 1€/ordre.",
    slug: "trade-republic",
  },
  {
    name: "Free Mobile",
    logo: "📱",
    color: "#e63946",
    bg: "rgba(230,57,70,0.1)",
    category: "Téléphonie",
    bonus: "+20€",
    bonusLabel: "de réduction",
    codes: 22,
    rating: 4.5,
    description: "Forfait mobile pas cher avec parrainage.",
    slug: "free-mobile",
  },
];

const STEPS = [
  { icon: "🔍", title: "Choisis une entreprise", desc: "Parcours les offres vérifiées et trouve celle qui t'intéresse." },
  { icon: "📋", title: "Copie le code", desc: "Récupère le code de parrainage en un clic, directement depuis la fiche." },
  { icon: "🎁", title: "Active le bonus", desc: "Utilise le code lors de ton inscription et débloque ta récompense." },
];

export default function HomeV2() {
  const [activeCategory, setActiveCategory] = useState("Tout");
  const { theme, toggle } = useTheme();

  const categories = ["Tout", "Banque", "Crypto", "Paris sportifs", "Bourse", "Téléphonie"];
  const filtered = activeCategory === "Tout" ? FEATURED : FEATURED.filter(c => c.category === activeCategory);

  return (
    <main style={{ background: "var(--bg)", minHeight: "100vh", fontFamily: "var(--font-dm-sans),'DM Sans',sans-serif", color: "var(--text-strong)", overflowX: "hidden" }}>

      {/* Glow bg */}
      <div style={{ position: "fixed", top: -300, left: "50%", transform: "translateX(-50%)", width: 800, height: 800, borderRadius: "50%", background: "radial-gradient(circle,rgba(124,58,237,0.08) 0%,transparent 65%)", pointerEvents: "none", zIndex: 0 }} />

      {/* ══ NAVBAR ══════════════════════════════════════════════════════════ */}
      <nav style={{ position: "relative", zIndex: 10, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1rem 1.25rem", maxWidth: 1200, margin: "0 auto" }}>
        <Link href="/" style={{ fontFamily: "var(--font-syne),Syne,sans-serif", fontWeight: 800, fontSize: "1rem", color: "var(--text-strong)", textDecoration: "none" }}>
          code<span style={{ color: "#7c3aed" }}>de</span>parrainage.com
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <button onClick={toggle} style={{ background: "var(--bg-card-md)", border: "1px solid var(--border-lg)", borderRadius: 10, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--text-dim)" }}>
            {theme === "light"
              ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z" /></svg>
              : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>
            }
          </button>
          <Link href="/register" style={{ background: "#7c3aed", color: "#fff", fontWeight: 700, fontSize: "0.85rem", padding: "0.5rem 1rem", borderRadius: 10, textDecoration: "none" }}>
            S&apos;inscrire
          </Link>
        </div>
      </nav>

      {/* ══ HERO — compact, benefit-first ════════════════════════════════════ */}
      <section style={{ position: "relative", zIndex: 1, maxWidth: 1200, margin: "0 auto", padding: "2rem 1.25rem 1.5rem", textAlign: "center" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "var(--bg-card-md)", border: "1px solid var(--border-lg)", borderRadius: 999, padding: "0.3rem 0.75rem", marginBottom: "1.25rem", fontSize: "0.75rem", color: "var(--text-link)" }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981", boxShadow: "0 0 6px #10b981", display: "inline-block" }} />
          +4 200 codes de parrainage vérifiés
        </div>
        <h1 style={{ fontFamily: "var(--font-syne),Syne,sans-serif", fontWeight: 800, fontSize: "clamp(1.9rem,5vw,3.2rem)", lineHeight: 1.1, letterSpacing: "-0.03em", margin: "0 0 1rem", color: "var(--text-strong)" }}>
          Trouve un code de parrainage<br />
          <span style={{ color: "#7c3aed" }}>et gagne des récompenses</span>
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "1rem", lineHeight: 1.65, maxWidth: 520, margin: "0 auto 1.75rem" }}>
          Banque, crypto, paris sportifs… Des centaines d&apos;entreprises offrent des bonus exclusifs
          à leurs nouveaux clients parrainés. Copie un code en un clic et profite de l&apos;offre.
        </p>
        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/codes" style={{ background: "#7c3aed", color: "#fff", fontWeight: 700, padding: "0.85rem 1.75rem", borderRadius: 12, textDecoration: "none", fontSize: "0.95rem", boxShadow: "0 8px 28px rgba(124,58,237,0.38)" }}>
            Voir tous les codes →
          </Link>
          <Link href="/publier" style={{ background: "var(--bg-card-md)", color: "var(--text-strong)", fontWeight: 600, padding: "0.85rem 1.75rem", borderRadius: 12, textDecoration: "none", fontSize: "0.95rem", border: "1px solid var(--border-lg)" }}>
            Publier mon code
          </Link>
        </div>

        {/* Quick stats */}
        <div style={{ display: "flex", gap: "2rem", justifyContent: "center", marginTop: "2rem", flexWrap: "wrap" }}>
          {[{ n: "4 200+", l: "Codes actifs" }, { n: "850+", l: "Parrains vérifiés" }, { n: "97%", l: "Avis positifs" }].map(s => (
            <div key={s.l} style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "var(--font-syne),Syne,sans-serif", fontWeight: 800, fontSize: "1.5rem", color: "var(--text-strong)" }}>{s.n}</div>
              <div style={{ fontSize: "0.72rem", color: "var(--text-dim)", marginTop: 2 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ══ COMMENT ÇA MARCHE (compact, above fold) ════════════════════════ */}
      <section style={{ position: "relative", zIndex: 1, maxWidth: 1200, margin: "0 auto", padding: "1.5rem 1.25rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "0.75rem" }} id="v2-steps">
          {STEPS.map((step, i) => (
            <div key={i} style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, padding: "1.125rem 1rem", display: "flex", gap: 12, alignItems: "flex-start" }}>
              <span style={{ fontSize: 22, flexShrink: 0 }}>{step.icon}</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: "0.82rem", color: "var(--text-strong)", marginBottom: 4 }}>{step.title}</div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", lineHeight: 1.5 }}>{step.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══ CODES POPULAIRES ════════════════════════════════════════════════ */}
      <section style={{ position: "relative", zIndex: 1, maxWidth: 1200, margin: "0 auto", padding: "2rem 1.25rem 4rem" }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "1.25rem", flexWrap: "wrap", gap: "0.75rem" }}>
          <h2 style={{ fontFamily: "var(--font-syne),Syne,sans-serif", fontWeight: 700, fontSize: "1.3rem", margin: 0 }}>
            Codes les plus populaires
          </h2>
          <Link href="/codes" style={{ fontSize: "0.82rem", color: "#a78bfa", textDecoration: "none", fontWeight: 600 }}>Voir tout →</Link>
        </div>

        {/* Category filter */}
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1.25rem" }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                fontSize: "0.78rem", fontWeight: 600, padding: "0.4rem 0.875rem", borderRadius: 999, cursor: "pointer", border: "1px solid", transition: "all 0.15s",
                background: activeCategory === cat ? "#7c3aed" : "var(--bg-card-md)",
                color: activeCategory === cat ? "#fff" : "var(--text-dim)",
                borderColor: activeCategory === cat ? "#7c3aed" : "var(--border)",
              }}
            >{cat}</button>
          ))}
        </div>

        {/* Cards grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: "1rem" }} id="v2-cards">
          {filtered.map(company => (
            <Link key={company.slug} href={`/codes?search=${encodeURIComponent(company.name)}`} style={{ textDecoration: "none" }}>
              <div
                style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 18, padding: "1.25rem", transition: "all 0.2s", cursor: "pointer", height: "100%" }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.transform = "translateY(-3px)"; el.style.boxShadow = "0 12px 40px rgba(0,0,0,0.12)"; el.style.borderColor = company.color + "50"; }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.transform = "none"; el.style.boxShadow = "none"; el.style.borderColor = "var(--border)"; }}
              >
                {/* Header */}
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: company.bg, border: `1px solid ${company.color}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
                    {company.logo}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--text-strong)" }}>{company.name}</div>
                    <div style={{ fontSize: "0.7rem", color: "var(--text-dim)", marginTop: 2 }}>
                      <span style={{ background: `${company.color}18`, color: company.color, border: `1px solid ${company.color}30`, borderRadius: 6, padding: "1px 6px", fontWeight: 600 }}>{company.category}</span>
                      <span style={{ marginLeft: 6 }}>★ {company.rating}</span>
                    </div>
                  </div>
                  {/* Bonus badge */}
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontFamily: "var(--font-syne),Syne,sans-serif", fontWeight: 800, fontSize: "1.2rem", color: "#10b981" }}>{company.bonus}</div>
                    <div style={{ fontSize: "0.65rem", color: "var(--text-dim)" }}>{company.bonusLabel}</div>
                  </div>
                </div>

                <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", lineHeight: 1.55, margin: "0 0 14px" }}>{company.description}</p>

                {/* Footer */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "0.72rem", color: "var(--text-dim)" }}>
                    <strong style={{ color: "var(--text-strong)" }}>{company.codes}</strong> codes disponibles
                  </span>
                  <span style={{ background: "#7c3aed", color: "#fff", fontSize: "0.75rem", fontWeight: 700, padding: "0.35rem 0.875rem", borderRadius: 8 }}>
                    Voir les codes
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ══ FOOTER CTA ═══════════════════════════════════════════════════════ */}
      <section style={{ position: "relative", zIndex: 1, maxWidth: 1200, margin: "0 auto", padding: "1rem 1.25rem 5rem", textAlign: "center" }}>
        <div style={{ background: "linear-gradient(135deg,rgba(124,58,237,0.12),rgba(167,139,250,0.08))", border: "1px solid rgba(124,58,237,0.2)", borderRadius: 24, padding: "2.5rem 1.5rem" }}>
          <div style={{ fontSize: "1.75rem", marginBottom: 12 }}>🎁</div>
          <h2 style={{ fontFamily: "var(--font-syne),Syne,sans-serif", fontWeight: 800, fontSize: "1.4rem", margin: "0 0 0.75rem", color: "var(--text-strong)" }}>
            Tu as aussi un code de parrainage ?
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "1.5rem", maxWidth: 400, margin: "0 auto 1.5rem" }}>
            Publie-le gratuitement, gagne des XP et monte dans le classement.
          </p>
          <Link href="/register" style={{ background: "#7c3aed", color: "#fff", fontWeight: 700, fontSize: "0.95rem", padding: "0.9rem 2rem", borderRadius: 12, textDecoration: "none", boxShadow: "0 8px 28px rgba(124,58,237,0.38)" }}>
            Publier mon code gratuitement
          </Link>
        </div>
      </section>

      <style>{`
        @media (max-width: 600px) {
          #v2-steps { grid-template-columns: 1fr !important; }
          #v2-cards  { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </main>
  );
}
