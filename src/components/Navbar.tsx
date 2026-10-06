"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useTheme } from "./ThemeProvider";
import { createClient } from "@/lib/supabase";

interface NavbarProps {
  activePage?: "codes" | "classement" | "publier" | "messages" | "profil" | "home" | "forum";
}

export default function Navbar({ activePage }: NavbarProps) {
  // Deux états distincts : le tiroir mobile (hamburger) et le menu avatar.
  // Un seul état partagé ouvrait les deux en même temps sur mobile connecté,
  // le dropdown venant se superposer au tiroir.
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  useTheme();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [pseudo, setPseudo] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      const [{ data: profile }, { count }] = await Promise.all([
        supabase.from("users").select("pseudo, avatar_url").eq("id", user.id).single(),
        supabase.from("messages").select("*", { count: "exact", head: true }).eq("receiver_id", user.id).eq("read", false),
      ]);
      setIsLoggedIn(true);
      setPseudo(profile?.pseudo ?? user.email?.split("@")[0] ?? "Moi");
      setAvatarUrl(profile?.avatar_url ?? null);
      setUnreadCount(count ?? 0);
    });
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
    window.location.href = "/login";
  }

  return (
    <>
      <style>{`
        .navbar {
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 2rem; height: 64px;
          background: var(--bg-nav);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(124,58,237,0.12);
        }
        .nav-logo-wrap { display: flex; align-items: center; gap: 8px; flex-shrink: 0; min-width: 0; }
        .nav-logo {
          display: flex; align-items: center; gap: 8px;
          font-family: 'Syne', sans-serif; font-weight: 800; font-size: 1.05rem;
          color: var(--text-strong); text-decoration: none; letter-spacing: -0.02em;
          white-space: nowrap;
        }
        .nav-logo img { height: 40px; width: auto; }
        .nav-logo em { font-style: normal; color: #7c3aed; }
        .nav-home-btn {
          display: inline-flex; align-items: center; justify-content: center;
          background: var(--bg-card-md); border: 1px solid var(--border-md);
          border-radius: 8px; width: 32px; height: 32px;
          color: var(--text-muted); text-decoration: none; transition: all 0.18s;
        }
        .nav-home-btn:hover { color: var(--text-strong); border-color: rgba(124,58,237,0.3); background: rgba(124,58,237,0.08); }

        .nav-center {
          display: flex; align-items: center; gap: 2px;
          position: absolute; left: 50%; transform: translateX(-50%);
        }
        .nav-link {
          position: relative;
          color: var(--text-nav); text-decoration: none;
          font-size: 0.855rem; font-weight: 500;
          padding: 0.4rem 0.75rem; border-radius: 9px;
          transition: all 0.18s; white-space: nowrap;
          font-family: 'DM Sans', sans-serif;
          border: 1px solid transparent;
        }
        .nav-link:hover { color: var(--text-strong); background: var(--bg-card-md); }
        .nav-link.active {
          color: var(--text-strong); background: rgba(124,58,237,0.15);
          border-color: rgba(124,58,237,0.25);
        }
        .nav-link.active:hover { background: rgba(124,58,237,0.2); }
        .nav-unread-dot {
          position: absolute; top: 4px; right: 4px; width: 8px; height: 8px;
          background: #ef4444; border-radius: 50%; border: 2px solid var(--bg-nav);
        }

        .nav-right { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }

        /* Déconnecté */
        .nav-btn-ghost {
          color: var(--text-btn-ghost); background: none;
          border: 1px solid var(--border-btn-ghost); border-radius: 10px;
          padding: 0.45rem 0.875rem; font-size: 0.82rem; font-weight: 500;
          cursor: pointer; transition: all 0.18s; text-decoration: none;
          font-family: 'DM Sans', sans-serif; display: inline-flex; align-items: center;
        }
        .nav-btn-ghost:hover { color: var(--text-strong); border-color: var(--border-lg); }
        .nav-btn-primary {
          background: #7c3aed; color: #fff; border: none;
          border-radius: 10px; padding: 0.45rem 1rem;
          font-size: 0.82rem; font-weight: 600; cursor: pointer;
          transition: all 0.18s; text-decoration: none; white-space: nowrap;
          font-family: 'DM Sans', sans-serif; display: inline-flex; align-items: center; gap: 5px;
        }
        .nav-btn-primary:hover { background: #6d28d9; transform: translateY(-1px); box-shadow: 0 4px 16px rgba(124,58,237,0.35); }
        .nav-label-short { display: none; }

        /* Connecté — bouton avatar */
        .nav-avatar-btn {
          display: flex; align-items: center; gap: 8px;
          background: var(--bg-card-md); border: 1px solid var(--border-md);
          border-radius: 12px; padding: 0.35rem 0.75rem 0.35rem 0.4rem;
          cursor: pointer; transition: all 0.18s; color: var(--text-strong);
          font-family: 'DM Sans', sans-serif; min-height: 40px;
        }
        .nav-avatar-btn:hover { background: var(--bg-btn); border-color: rgba(124,58,237,0.3); }
        .nav-avatar {
          width: 28px; height: 28px; border-radius: 50%;
          background: linear-gradient(135deg,#7c3aed,#4f46e5);
          display: flex; align-items: center; justify-content: center;
          font-family: 'Syne', sans-serif; font-weight: 800; font-size: 0.8rem; color: #fff;
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
          width: 100%; text-align: left; font-family: 'DM Sans', sans-serif;
        }
        .nav-dropdown-item:hover { color: var(--text-strong); background: var(--bg-card-md); }
        .nav-dropdown-item.danger:hover { color: #f87171; background: rgba(239,68,68,0.08); }
        .nav-dropdown-sep { height: 1px; background: var(--border); margin: 4px 0; }
        .nav-dropdown-section { padding: 6px 0; }

        .nav-publier {
          display: flex; align-items: center; gap: 5px;
          background: rgba(124,58,237,0.12); border: 1px solid rgba(124,58,237,0.3);
          border-radius: 9px; padding: 0.4rem 0.75rem;
          color: #a78bfa; font-size: 0.82rem; font-weight: 600;
          cursor: pointer; transition: all 0.18s; text-decoration: none;
          font-family: 'DM Sans', sans-serif; white-space: nowrap;
        }
        .nav-publier:hover { background: rgba(124,58,237,0.22); color: #fff; border-color: rgba(124,58,237,0.5); }

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
          max-height: calc(100vh - 64px); overflow-y: auto;
        }
        .nav-mobile.open { display: flex; }
        .nav-mobile-link {
          display: flex; align-items: center; gap: 10px;
          min-height: 44px; padding: 0.5rem 0.875rem; border-radius: 10px;
          color: var(--text-link); font-size: 0.95rem; font-weight: 500;
          text-decoration: none; transition: all 0.15s;
          font-family: 'DM Sans', sans-serif; background: none; border: none; width: 100%; text-align: left; cursor: pointer;
        }
        .nav-mobile-link:hover, .nav-mobile-link.active { color: var(--text-strong); background: var(--bg-card-md); }
        .nav-mobile-link.active { background: rgba(124,58,237,0.15); }
        .nav-mobile-link.primary { color: #fff; background: #7c3aed; justify-content: center; font-weight: 600; margin-top: 4px; }
        .nav-mobile-sep { height: 1px; background: var(--border); margin: 6px 0; }
        .nav-mobile-badge { background: #ef4444; color: #fff; border-radius: 100px; font-size: 0.7rem; font-weight: 700; padding: 1px 7px; margin-left: 4px; }

        @media (max-width: 768px) {
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
          .nav-logo img { height: 34px; }
          .nav-logo { font-size: 0.95rem; }
        }
        @media (max-width: 420px) {
          .nav-home-btn { display: none; }
          .nav-logo { font-size: 0.88rem; }
        }
      `}</style>

      <div ref={rootRef} style={{ position: "sticky", top: 0, zIndex: 200 }}>
        <nav className="navbar" aria-label="Navigation principale">
          <div className="nav-logo-wrap">
            <Link href="/" className="nav-logo" aria-label="codedeparrainage.com — accueil">
              <img src="/logo-96.png" alt="" width={78} height={96} />
              <span>code<em>de</em>parrainage</span>
            </Link>
            {activePage && activePage !== "home" && (
              <Link href="/" className="nav-home-btn" aria-label="Accueil">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              </Link>
            )}
          </div>

          <div className="nav-center">
            <Link href="/codes"      className={`nav-link ${activePage==="codes"      ? "active" : ""}`}>Codes</Link>
            <Link href="/classement" className={`nav-link ${activePage==="classement" ? "active" : ""}`}>Classement</Link>
            <Link href="/forum"      className={`nav-link ${activePage==="forum"      ? "active" : ""}`}>Communauté</Link>
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
                        ? <img src={avatarUrl} alt="" onError={() => setAvatarUrl(null)} />
                        : pseudo[0]?.toUpperCase()
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
          <Link href="/forum"      className={`nav-mobile-link ${activePage==="forum"      ? "active":""}`}>Communauté</Link>
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
          {!isLoggedIn && (
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
