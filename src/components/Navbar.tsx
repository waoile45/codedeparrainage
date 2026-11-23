"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useTheme } from "./ThemeProvider";
import Logo from "./Logo";
import { createClient } from "@/lib/supabase";
import AnimalAvatar from "@/components/AnimalAvatar";

interface NavbarProps {
  activePage?: "codes" | "classement" | "publier" | "messages" | "profil" | "home" | "forum";
}

// ── État de connexion partagé entre les pages ──────────────────────────────
// Le bandeau est recréé à chaque navigation. Sans mémoire, il affichait
// « Connexion / S'inscrire » à un membre connecté le temps de redemander la
// session, puis basculait sur son avatar : un clignotement sur chaque page.
// - `memo` (module) survit aux navigations dans l'onglet ;
// - le localStorage permet de retrouver le pseudo dès un rechargement ;
// - tant que l'état est inconnu, la zone de droite reste vide.
type NavUser = { pseudo: string; avatarUrl: string | null; unread: number };
let memo: NavUser | null | undefined; // undefined = inconnu, null = déconnecté
const STORE_KEY = "cdp_nav_user";
function readStore(): NavUser | null | undefined {
  try {
    const v = localStorage.getItem(STORE_KEY);
    return v === null ? undefined : (JSON.parse(v) as NavUser);
  } catch { return undefined; }
}
function writeStore(u: NavUser | null) {
  memo = u;
  try {
    if (u) localStorage.setItem(STORE_KEY, JSON.stringify(u));
    else localStorage.removeItem(STORE_KEY);
  } catch { /* stockage indisponible : le bandeau marche quand même */ }
}

export default function Navbar({ activePage }: NavbarProps) {
  // Deux états distincts : le tiroir mobile (hamburger) et le menu avatar.
  // Un seul état partagé ouvrait les deux en même temps sur mobile connecté,
  // le dropdown venant se superposer au tiroir.
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  useTheme();
  const [auth, setAuth] = useState<NavUser | null | undefined>(memo);
  const isLoggedIn = !!auth;
  const pseudo = auth?.pseudo ?? "";
  const avatarUrl = auth?.avatarUrl ?? null;
  const unreadCount = auth?.unread ?? 0;
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Rechargement complet : on reprend le dernier état connu sans attendre.
    if (memo === undefined) {
      const stored = readStore();
      // eslint-disable-next-line react-hooks/set-state-in-effect -- lecture du stockage local après hydratation
      if (stored !== undefined) setAuth(stored);
    }
    const supabase = createClient();
    // getSession lit la session locale (pas d'aller-retour réseau) : on sait
    // tout de suite si quelqu'un est connecté.
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const user = session?.user;
      if (!user) { writeStore(null); setAuth(null); return; }
      const [{ data: profile }, { count }] = await Promise.all([
        supabase.from("users").select("pseudo, avatar_url").eq("id", user.id).single(),
        supabase.from("messages").select("*", { count: "exact", head: true }).eq("receiver_id", user.id).eq("read", false),
      ]);
      const u: NavUser = {
        pseudo: profile?.pseudo ?? user.email?.split("@")[0] ?? "Moi",
        avatarUrl: profile?.avatar_url ?? null,
        unread: count ?? 0,
      };
      writeStore(u);
      setAuth(u);
    });
  }, []);

  // La messagerie du profil prévient quand des messages passent en lus
  useEffect(() => {
    const onUnread = (e: Event) => {
      if (!memo) return;
      const u = { ...memo, unread: Number((e as CustomEvent<number>).detail) || 0 };
      writeStore(u);
      setAuth(u);
    };
    window.addEventListener("cdp:unread", onUnread);
    return () => window.removeEventListener("cdp:unread", onUnread);
  }, []);

  // Fermeture au clic extérieur et à Échap
  useEffect(() => {
    if (!menuOpen && !dropdownOpen) return;
    function onDown(e: MouseEvent | TouchEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
        setDropdownOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") { setMenuOpen(false); setDropdownOpen(false); }
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("touchstart", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen, dropdownOpen]);

  async function signOut() {
    setMenuOpen(false);
    setDropdownOpen(false);
    const supabase = createClient();
    await supabase.auth.signOut();
    writeStore(null);
    window.location.href = "/login";
  }

  return (
    <>
      <style>{`
        .navbar {
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 var(--gutter); height: 68px;
          background: var(--bg-nav);
          border-bottom: 1px solid var(--border);
        }
        .nav-logo-wrap { display: flex; align-items: center; gap: 8px; flex-shrink: 0; min-width: 0; }
        .nav-logo {
          display: flex; align-items: center; gap: 8px;
          font-family: var(--font-display); font-weight: 800; font-size: 1.05rem;
          color: var(--text-strong); text-decoration: none; letter-spacing: -0.02em;
          white-space: nowrap;
        }

        /* Dans le flux (et non centré en absolu) : les liens ne peuvent plus
           passer sous le logo ou l'avatar quand la largeur manque. */
        .nav-center {
          display: flex; align-items: center; justify-content: center; gap: 2px;
          flex: 1; min-width: 0; padding: 0 1rem;
        }
        .nav-link {
          position: relative;
          color: var(--text-nav); text-decoration: none;
          font-size: 0.92rem; font-weight: 600;
          padding: 0.4rem 0.75rem; border-radius: 9px;
          transition: all 0.18s; white-space: nowrap;
          font-family: var(--font-text);
          border: 1px solid transparent;
        }
        .nav-link:hover { color: var(--text-strong); background: var(--bg-card-md); }
        .nav-link.active { color: var(--text-strong); }
        .nav-link.active::after {
          content: ""; position: absolute; left: .75rem; right: .75rem; bottom: -2px;
          height: 3px; border-radius: 2px; background: var(--accent);
        }
        .nav-unread-dot {
          position: absolute; top: 4px; right: 4px; width: 8px; height: 8px;
          background: #ef4444; border-radius: 50%; border: 2px solid var(--bg-nav);
        }

        .nav-right { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
        .nav-skel { display: inline-block; width: 150px; height: 40px; }
        @media (max-width: 768px) { .nav-skel { width: 90px; } }

        /* Déconnecté */
        .nav-btn-ghost {
          color: var(--text-btn-ghost); background: none;
          border: 1px solid var(--border-btn-ghost); border-radius: 10px;
          padding: 0.45rem 0.875rem; font-size: 0.82rem; font-weight: 500;
          cursor: pointer; transition: all 0.18s; text-decoration: none;
          font-family: var(--font-text); display: inline-flex; align-items: center;
        }
        .nav-btn-ghost:hover { color: var(--text-strong); border-color: var(--border-lg); }
        .nav-btn-primary {
          background: var(--accent); color: var(--accent-ink); border: none;
          border-radius: 10px; padding: 0.55rem 1rem;
          font-size: 0.88rem; font-weight: 700; cursor: pointer;
          transition: all 0.18s; text-decoration: none; white-space: nowrap;
          font-family: var(--font-text); display: inline-flex; align-items: center; gap: 5px;
        }
        .nav-btn-primary:hover { background: var(--accent-hover); }
        .nav-label-short { display: none; }

        /* Connecté — bouton avatar */
        .nav-avatar-btn {
          display: flex; align-items: center; gap: 8px;
          background: var(--bg-card-md); border: 1px solid var(--border-md);
          border-radius: 12px; padding: 0.35rem 0.75rem 0.35rem 0.4rem;
          cursor: pointer; transition: all 0.18s; color: var(--text-strong);
          font-family: var(--font-text); min-height: 40px;
        }
        .nav-avatar-btn:hover { background: var(--bg-btn); border-color: rgba(255,212,59,0.3); }
        .nav-avatar {
          width: 28px; height: 28px; border-radius: 50%;
          background: var(--accent);
          display: flex; align-items: center; justify-content: center;
          font-family: var(--font-display); font-weight: 800; font-size: 0.8rem; color: var(--accent-ink);
          flex-shrink: 0; overflow: hidden;
        }
        .nav-avatar img { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; }
        .nav-pseudo { font-size: 0.82rem; font-weight: 500; color: var(--text-strong); max-width: 120px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .nav-chevron { color: var(--text-dim); transition: transform 0.18s; flex-shrink: 0; }
        .nav-chevron.open { transform: rotate(180deg); }

        .nav-dropdown {
          position: absolute; top: calc(100% + 8px); right: 0;
          min-width: 200px;
          background: var(--bg-dropdown); border: 1px solid var(--border-md);
          border-radius: 16px; overflow: hidden;
          box-shadow: 0 16px 48px rgba(0,0,0,0.3);
          animation: dropIn 0.18s ease;
          z-index: 5;
        }
        @keyframes dropIn { from { opacity:0; transform:translateY(-6px); } to { opacity:1; transform:translateY(0); } }
        .nav-dropdown-item {
          display: flex; align-items: center; gap: 10px;
          padding: 0.7rem 1rem; color: var(--text-muted);
          font-size: 0.855rem; font-weight: 500; text-decoration: none;
          transition: all 0.15s; cursor: pointer; background: none; border: none;
          width: 100%; text-align: left; font-family: var(--font-text);
        }
        .nav-dropdown-item:hover { color: var(--text-strong); background: var(--bg-card-md); }
        .nav-dropdown-item.danger:hover { color: #f87171; background: rgba(239,68,68,0.08); }
        .nav-dropdown-sep { height: 1px; background: var(--border); margin: 4px 0; }
        .nav-dropdown-section { padding: 6px 0; }

        .nav-publier {
          display: flex; align-items: center; gap: 5px;
          background: var(--accent); border: none;
          border-radius: 10px; padding: 0.55rem 0.9rem;
          color: var(--accent-ink); font-size: 0.88rem; font-weight: 700;
          cursor: pointer; transition: all 0.18s; text-decoration: none;
          font-family: var(--font-text); white-space: nowrap;
        }
        .nav-publier:hover { background: var(--accent-hover); }

        /* Hamburger — zone tactile 40×40 */
        .nav-hamburger {
          display: none; flex-direction: column; justify-content: center; gap: 5px;
          background: none; border: none; cursor: pointer;
          width: 40px; height: 40px; padding: 0 9px; border-radius: 9px;
          flex-shrink: 0;
        }
        .nav-hamburger:active { background: var(--bg-card-md); }
        .nav-hamburger span {
          display: block; width: 22px; height: 2px;
          background: var(--text-dim); border-radius: 2px; transition: transform 0.2s, opacity 0.2s;
        }
        .nav-hamburger.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
        .nav-hamburger.open span:nth-child(2) { opacity: 0; }
        .nav-hamburger.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

        /* Tiroir mobile : en superposition sous la barre, sans pousser la page */
        .nav-mobile {
          display: none; flex-direction: column; gap: 2px;
          position: absolute; left: 0; right: 0; top: 100%;
          padding: 0.75rem 1rem calc(1rem + env(safe-area-inset-bottom));
          background: var(--bg-dropdown); border-bottom: 1px solid var(--border);
          box-shadow: 0 16px 40px rgba(0,0,0,0.35);
          max-height: calc(100vh - 68px); overflow-y: auto;
        }
        .nav-mobile.open { display: flex; }
        .nav-mobile-link {
          display: flex; align-items: center; gap: 10px;
          min-height: 44px; padding: 0.5rem 0.875rem; border-radius: 10px;
          color: var(--text-link); font-size: 0.95rem; font-weight: 500;
          text-decoration: none; transition: all 0.15s;
          font-family: var(--font-text); background: none; border: none; width: 100%; text-align: left; cursor: pointer;
        }
        .nav-mobile-link:hover, .nav-mobile-link.active { color: var(--text-strong); background: var(--bg-card-md); }
        .nav-mobile-link.active { background: rgba(255,212,59,0.15); }
        .nav-mobile-link.primary { color: var(--accent-ink); background: var(--accent); justify-content: center; font-weight: 600; margin-top: 4px; }
        .nav-mobile-sep { height: 1px; background: var(--border); margin: 6px 0; }
        .nav-mobile-badge { background: #ef4444; color: #fff; border-radius: 100px; font-size: 0.7rem; font-weight: 700; padding: 1px 7px; margin-left: 4px; }

        @media (max-width: 1100px) {
          .nav-pseudo, .nav-avatar-btn .nav-chevron { display: none; }
          .nav-avatar-btn { padding: 0.25rem; border-radius: 50%; }
          .nav-label-long { display: none; }
          .nav-label-short { display: inline; }
        }
        @media (max-width: 860px) {
          .navbar { padding: 0 1rem; }
          .nav-center { display: none; }
          .nav-hamburger { display: flex; }
          .nav-btn-ghost, .nav-publier, .nav-pseudo { display: none; }
          .nav-label-long { display: none; }
          .nav-label-short { display: inline; }
          .nav-btn-primary { padding: 0.45rem 0.8rem; }
          .nav-avatar-btn { padding: 0.25rem; border-radius: 50%; }
          .nav-avatar-btn .nav-chevron { display: none; }
          .nav-avatar { width: 32px; height: 32px; }
        }
      `}</style>

      <div ref={rootRef} style={{ position: "sticky", top: 0, zIndex: 200 }}>
        <nav className="navbar" aria-label="Navigation principale">
          <div className="nav-logo-wrap">
            <Link href="/" className="nav-logo" aria-label="codedeparrainage.com — accueil">
              <Logo />
            </Link>
          </div>

          <div className="nav-center">
            <Link href="/codes"      className={`nav-link ${activePage==="codes"      ? "active" : ""}`}>Codes</Link>
            <Link href="/classement" className={`nav-link ${activePage==="classement" ? "active" : ""}`}>Classement</Link>
            {/* Lien « Communauté » retiré : la table forum_posts n'a jamais été créée,
                la page affichait donc un forum vide impossible à distinguer d'un forum
                désert. Pour le réactiver : exécuter scripts/forum-tables.sql, remettre
                ce lien et celui du menu mobile, et retirer le noindex de forum/layout.tsx. */}
            {isLoggedIn && (
              <Link href="/profil?tab=messages" className={`nav-link ${activePage==="messages" ? "active" : ""}`}>
                Messages
                {unreadCount > 0 && <span className="nav-unread-dot" aria-label={`${unreadCount} non lus`} />}
              </Link>
            )}
          </div>

          <div className="nav-right">
            {isLoggedIn ? (
              <>
                <Link href="/publier" className="nav-publier">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  Publier
                </Link>
                <div style={{ position: "relative" }}>
                  <button
                    className="nav-avatar-btn"
                    onClick={() => { setDropdownOpen(v => !v); setMenuOpen(false); }}
                    aria-haspopup="menu"
                    aria-expanded={dropdownOpen}
                    aria-label="Menu du compte"
                  >
                    <div className="nav-avatar">
                      {avatarUrl
                        ? <img src={avatarUrl} alt="" onError={() => setAuth(a => (a ? { ...a, avatarUrl: null } : a))} />
                        : <AnimalAvatar seed={pseudo} />
                      }
                    </div>
                    <span className="nav-pseudo">{pseudo}</span>
                    <svg className={`nav-chevron ${dropdownOpen ? "open" : ""}`} width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
                  </button>
                  {dropdownOpen && (
                    <div className="nav-dropdown" role="menu">
                      <div className="nav-dropdown-section">
                        <Link href="/profil" className="nav-dropdown-item" role="menuitem">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
                          Mon profil
                        </Link>
                        <Link href="/profil?tab=annonces" className="nav-dropdown-item" role="menuitem">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="5" width="18" height="14" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                          Mes annonces
                        </Link>
                        <Link href="/profil?tab=credits" className="nav-dropdown-item" role="menuitem">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                          Crédits & Boosts
                        </Link>
                        <Link href="/profil?tab=badges" className="nav-dropdown-item" role="menuitem">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="6"/><path d="M8.56 2.75c4.37 6.03 6.02 9.42 8.03 17.72"/></svg>
                          Badges
                        </Link>
                      </div>
                      <div className="nav-dropdown-sep" />
                      <div className="nav-dropdown-section">
                        <Link href="/profil?tab=parametres" className="nav-dropdown-item" role="menuitem">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                          Paramètres
                        </Link>
                        <button className="nav-dropdown-item danger" onClick={signOut} role="menuitem">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                          Déconnexion
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : auth === undefined ? (
              <span className="nav-skel" aria-hidden="true" />
            ) : (
              <>
                <Link href="/login" className="nav-btn-ghost">Connexion</Link>
                <Link href="/register" className="nav-btn-primary">
                  <span className="nav-label-long">S&apos;inscrire gratuitement</span>
                  <span className="nav-label-short">S&apos;inscrire</span>
                </Link>
              </>
            )}
            <button
              className={`nav-hamburger ${menuOpen ? "open" : ""}`}
              onClick={() => { setMenuOpen(v => !v); setDropdownOpen(false); }}
              aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
              aria-expanded={menuOpen}
              aria-controls="nav-mobile-menu"
            >
              <span /><span /><span />
            </button>
          </div>
        </nav>

        <div id="nav-mobile-menu" className={`nav-mobile ${menuOpen ? "open" : ""}`}>
          <Link href="/codes"      className={`nav-mobile-link ${activePage==="codes"      ? "active":""}`}>Codes de parrainage</Link>
          <Link href="/classement" className={`nav-mobile-link ${activePage==="classement" ? "active":""}`}>Classement</Link>
          {/* Voir le commentaire du menu bureau : lien « Communauté » retiré. */}
          {isLoggedIn && (
            <>
              <Link href="/profil?tab=messages" className={`nav-mobile-link ${activePage==="messages" ? "active":""}`}>
                Messages {unreadCount > 0 && <span className="nav-mobile-badge">{unreadCount}</span>}
              </Link>
              <Link href="/profil" className={`nav-mobile-link ${activePage==="profil" ? "active":""}`}>Mon profil</Link>
              <Link href="/profil?tab=credits" className="nav-mobile-link">Crédits & Boosts</Link>
              <div className="nav-mobile-sep" />
              <Link href="/publier" className={`nav-mobile-link primary ${activePage==="publier" ? "active":""}`}>Publier un code</Link>
              <button className="nav-mobile-link" style={{ color:"#f87171" }} onClick={signOut}>Déconnexion</button>
            </>
          )}
          {auth === null && (
            <>
              <div className="nav-mobile-sep" />
              <Link href="/login" className="nav-mobile-link">Connexion</Link>
              <Link href="/register" className="nav-mobile-link primary">S&apos;inscrire gratuitement</Link>
            </>
          )}
        </div>
      </div>
    </>
  );
}
