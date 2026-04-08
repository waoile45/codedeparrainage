"use client";

import Link from "next/link";

const COLUMNS = [
  {
    title: "Plateforme",
    links: [
      { label: "Parcourir les codes", href: "/codes" },
      { label: "Publier un code",     href: "/publier" },
      { label: "Classement",          href: "/classement" },
      { label: "Boost & Visibilité",  href: "/boost" },
      { label: "Crédits",             href: "/credits" },
    ],
  },
  {
    title: "Compte",
    links: [
      { label: "Mon profil",     href: "/profil" },
      { label: "Mes annonces",   href: "/profil?tab=annonces" },
      { label: "Mes badges",     href: "/profil?tab=badges" },
      { label: "Messages",       href: "/messages" },
      { label: "Paramètres",     href: "/profil?tab=parametres" },
    ],
  },
  {
    title: "Légal",
    links: [
      { label: "Conditions d'utilisation",    href: "/cgu" },
      { label: "Politique de confidentialité", href: "/confidentialite" },
      { label: "Mentions légales",            href: "/mentions-legales" },
      { label: "Cookies",                     href: "/cookies" },
    ],
  },
];

export default function Footer() {
  return (
    <footer style={{ borderTop: "1px solid rgba(255,255,255,0.06)", marginTop: "4rem" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "3rem 2rem 2rem" }}>

        {/* Top */}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: "2.5rem", marginBottom: "2.5rem" }}>

          {/* Brand */}
          <div>
            <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 8, textDecoration: "none", marginBottom: "0.875rem" }}>
              <img src="/logo.png" alt="logo" style={{ width: 40, height: 40, objectFit: "contain", flexShrink: 0 }} />
              <span style={{ fontFamily: "var(--font-syne),Syne,sans-serif", fontWeight: 700, fontSize: "1rem", color: "#fff" }}>
                codedeparrainage<span style={{ color: "#7c3aed" }}>.com</span>
              </span>
            </Link>
            <p style={{ fontSize: "0.83rem", color: "rgba(255,255,255,0.38)", lineHeight: 1.65, maxWidth: 260, margin: 0 }}>
              La plateforme de parrainage gamifiée. Publie ton code, monte de niveau, débloque des badges.
            </p>
          </div>

          {/* Link columns */}
          {COLUMNS.map(col => (
            <div key={col.title}>
              <p style={{ fontFamily: "var(--font-syne),Syne,sans-serif", fontWeight: 700, fontSize: "0.78rem", color: "rgba(255,255,255,0.55)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "0.875rem" }}>
                {col.title}
              </p>
              <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {col.links.map(l => (
                  <li key={l.href}>
                    <Link href={l.href} style={{ fontSize: "0.83rem", color: "rgba(255,255,255,0.38)", textDecoration: "none", transition: "color 0.15s" }}
                      onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
                      onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.38)")}
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: "rgba(255,255,255,0.06)", marginBottom: "1.5rem" }} />

        {/* Bottom */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.75rem" }}>
          <p style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.25)", margin: 0 }}>
            © {new Date().getFullYear()} codedeparrainage.com — Tous droits réservés
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981", boxShadow: "0 0 6px #10b981", display: "inline-block" }} />
            <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.3)" }}>Tous les services opérationnels</span>
          </div>
        </div>

      </div>

      {/* Mobile */}
      <style>{`
        @media (max-width: 768px) {
          footer > div > div:first-child {
            grid-template-columns: 1fr 1fr !important;
          }
          footer > div > div:first-child > div:first-child {
            grid-column: 1 / -1;
          }
        }
        @media (max-width: 480px) {
          footer > div > div:first-child {
            grid-template-columns: 1fr !important;
          }
        }
        [data-theme="light"] footer {
          border-top-color: rgba(0,0,0,0.08) !important;
          background: transparent !important;
        }
        [data-theme="light"] footer p,
        [data-theme="light"] footer span,
        [data-theme="light"] footer a {
          color: rgba(15,15,26,0.5) !important;
        }
        [data-theme="light"] footer a:hover {
          color: #0f0f1a !important;
        }
        [data-theme="light"] footer .brand-name,
        [data-theme="light"] footer [style*="font-weight: 700"][style*="1rem"] {
          color: #0f0f1a !important;
        }
        [data-theme="light"] footer [style*="textTransform"] {
          color: rgba(15,15,26,0.45) !important;
        }
        [data-theme="light"] footer [style*="height: 1"] {
          background: rgba(0,0,0,0.08) !important;
        }
      `}</style>
    </footer>
  );
}
