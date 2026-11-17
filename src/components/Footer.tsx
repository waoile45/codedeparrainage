import Link from "next/link";
import Logo from "./Logo";
import { CATEGORIES } from "@/data/categories";

// Pied de page : le nom, une phrase sur ce qu'est le site, l'action principale,
// puis les liens. Les comparatifs VPN/banque (noindex, hors sujet) n'y sont plus.
const COLUMNS = [
  {
    title: "Le site",
    links: [
      { label: "Tous les codes", href: "/codes" },
      { label: "Publier un code", href: "/publier" },
      { label: "Classement des parrains", href: "/classement" },
      { label: "Booster une annonce", href: "/boost" },
      { label: "Questions fréquentes", href: "/faq" },
    ],
  },
  {
    title: "Catégories",
    links: CATEGORIES.map((c) => ({ label: c.short, href: `/code-parrainage/categorie/${c.slug}` })),
  },
  {
    title: "Ton compte",
    links: [
      { label: "Mon profil", href: "/profil" },
      { label: "Mes annonces", href: "/profil?tab=annonces" },
      { label: "Crédits", href: "/credits" },
      { label: "Messages", href: "/profil?tab=messages" },
    ],
  },
  {
    title: "Informations",
    links: [
      { label: "Conditions d'utilisation", href: "/cgu" },
      { label: "Confidentialité", href: "/confidentialite" },
      { label: "Mentions légales", href: "/mentions-legales" },
      { label: "Cookies", href: "/cookies" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="cdp-footer">
      <div className="wrap">
        <div className="cdp-footer-top">
          <div className="cdp-footer-brand">
            <Link href="/" aria-label="codedeparrainage.com, accueil" style={{ textDecoration: "none" }}>
              <Logo />
            </Link>
            <p>
              Des codes de parrainage publiés par des clients des marques. Tu copies un code, tu le colles à
              l&apos;inscription, la prime de bienvenue est pour toi.
            </p>
            <Link href="/publier" className="btn btn-accent">Publier mon code</Link>
          </div>

          <nav className="cdp-footer-cols" aria-label="Plan du site">
            {COLUMNS.map((col) => (
              <div key={col.title}>
                <p className="cdp-footer-title">{col.title}</p>
                <ul>
                  {col.links.map((l) => (
                    <li key={l.href}>
                      <Link href={l.href}>{l.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="cdp-footer-bottom">
          <p>© {new Date().getFullYear()} codedeparrainage.com</p>
          <p>Les primes sont versées par les marques, selon leurs conditions. Vérifie-les avant de t&apos;inscrire.</p>
        </div>
      </div>

      <style>{`
        .cdp-footer { border-top: 1px solid var(--border); margin-top: 0; padding: 4rem 0 2rem; background: var(--bg); }
        .cdp-footer-top { display: grid; grid-template-columns: minmax(260px, 1fr) 2.2fr; gap: 3rem; }
        .cdp-footer-brand p { color: var(--text-muted); font-size: .95rem; line-height: 1.6; max-width: 34ch; margin: 1rem 0 1.5rem; }
        .cdp-footer-cols { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 2rem; }
        .cdp-footer-title { font-family: var(--font-display), sans-serif; font-stretch: 112%; font-weight: 800; font-size: 1rem; color: var(--text-strong); margin: 0 0 1rem; }
        .cdp-footer ul { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: .65rem; }
        .cdp-footer ul a { color: var(--text-muted); text-decoration: none; font-size: .93rem; }
        .cdp-footer ul a:hover { color: var(--text-strong); text-decoration: underline; text-decoration-color: var(--accent); text-underline-offset: 4px; text-decoration-thickness: 2px; }
        .cdp-footer-bottom { display: flex; justify-content: space-between; gap: 1rem; flex-wrap: wrap; border-top: 1px solid var(--border); margin-top: 3rem; padding-top: 1.5rem; }
        .cdp-footer-bottom p { margin: 0; color: var(--text-dim); font-size: .85rem; }
        @media (max-width: 900px) {
          .cdp-footer-top { grid-template-columns: 1fr; gap: 2.5rem; }
          .cdp-footer-cols { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }
      `}</style>
    </footer>
  );
}
