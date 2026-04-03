"use client";

import { useState, useEffect } from "react";
import { useTheme } from "./ThemeProvider";
import { createClient } from "@/lib/supabase";

interface NavbarProps {
  activePage?: "codes" | "classement" | "publier" | "messages" | "profil" | "home";
}

export default function Navbar({ activePage }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { theme, toggle: toggleTheme } = useTheme();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [pseudo, setPseudo] = useState("");

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      const { data: profile } = await supabase
        .from("users")
        .select("pseudo")
        .eq("id", user.id)
        .single();
      setIsLoggedIn(true);
      setPseudo(profile?.pseudo ?? user.email?.split("@")[0] ?? "Moi");
    });
  }, []);

  return (
    <>
      <style>{`
        .navbar {
          position: sticky; top: 0; z-index: 200;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 2rem; height: 64px;
          background: rgba(10,10,15,0.9);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(124,58,237,0.12);
        }
        .nav-logo {
          font-family: 'Syne', sans-serif; font-weight: 800; font-size: 1.05rem;
          color: #fff; text-decoration: none; letter-spacing: -0.02em; flex-shrink: 0;
        }
        .nav-logo span { color: #7c3aed; }

        .nav-center {
          display: flex; align-items: center; gap: 2px;
          position: absolute; left: 50%; transform: translateX(-50%);
        }
        .nav-link {
          color: rgba(255,255,255,0.5); text-decoration: none;
          font-size: 0.855rem; font-weight: 500;
          padding: 0.4rem 0.75rem; border-radius: 9px;
          transition: all 0.18s; white-space: nowrap;
          font-family: 'DM Sans', sans-serif;
        }
        .nav-link:hover { color: rgba(255,255,255,0.85); background: rgba(255,255,255,0.05); }
        .nav-link.active {
          color: #fff; background: rgba(124,58,237,0.15);
          border: 1px solid rgba(124,58,237,0.25);
        }
        .nav-link.active:hover { background: rgba(124,58,237,0.2); }

        .nav-right { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }

        /* Logged out */
        .nav-btn-ghost {
          color: rgba(255,255,255,0.55); background: none;
          border: 1px solid rgba(255,255,255,0.1); border-radius: 10px;
          padding: 0.45rem 0.875rem; font-size: 0.82rem; font-weight: 500;
          cursor: pointer; transition: all 0.18s; text-decoration: none;
          font-family: 'DM Sans', sans-serif; display: inline-flex; align-items: center;
        }
        .nav-btn-ghost:hover { color: #fff; border-color: rgba(255,255,255,0.2); }
        .nav-btn-primary {
          background: #7c3aed; color: #fff; border: none;
          border-radius: 10px; padding: 0.45rem 1rem;
          font-size: 0.82rem; font-weight: 600; cursor: pointer;
          transition: all 0.18s; text-decoration: none;
          font-family: 'DM Sans', sans-serif; display: inline-flex; align-items: center; gap: 5px;
        }
        .nav-btn-primary:hover { background: #6d28d9; transform: translateY(-1px); box-shadow: 0 4px 16px rgba(124,58,237,0.35); }

        /* Logged in — avatar dropdown */
        .nav-avatar-btn {
          display: flex; align-items: center; gap: 8px;
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px; padding: 0.35rem 0.75rem 0.35rem 0.4rem;
          cursor: pointer; transition: all 0.18s; color: #fff;
          font-family: 'DM Sans', sans-serif;
        }
        .nav-avatar-btn:hover { background: rgba(255,255,255,0.07); border-color: rgba(124,58,237,0.3); }
        .nav-avatar {
          width: 28px; height: 28px; border-radius: 50%;
          background: linear-gradient(135deg,#7c3aed,#4f46e5);
          display: flex; align-items: center; justify-content: center;
          font-family: 'Syne', sans-serif; font-weight: 800; font-size: 0.8rem; color: #fff;
          flex-shrink: 0;
        }
        .nav-pseudo { font-size: 0.82rem; font-weight: 500; }
        .nav-chevron { color: rgba(255,255,255,0.4); font-size: 0.6rem; transition: transform 0.18s; }
        .nav-chevron.open { transform: rotate(180deg); }

        /* Dropdown */
        .nav-dropdown {
          position: absolute; top: calc(100% + 8px); right: 0;
          min-width: 200px;
          background: #111118; border: 1px solid rgba(255,255,255,0.1);
          border-radius: 16px; overflow: hidden;
          box-shadow: 0 16px 48px rgba(0,0,0,0.5);
          animation: dropIn 0.18s ease;
        }
        @keyframes dropIn { from { opacity:0; transform:translateY(-6px); } to { opacity:1; transform:translateY(0); } }
        .nav-dropdown-item {
          display: flex; align-items: center; gap: 10px;
          padding: 0.7rem 1rem; color: rgba(255,255,255,0.6);
          font-size: 0.855rem; font-weight: 500; text-decoration: none;
          transition: all 0.15s; cursor: pointer; background: none; border: none;
          width: 100%; text-align: left; font-family: 'DM Sans', sans-serif;
        }
        .nav-dropdown-item:hover { color: #fff; background: rgba(255,255,255,0.05); }
        .nav-dropdown-item.danger:hover { color: #f87171; background: rgba(239,68,68,0.08); }
        .nav-dropdown-sep { height: 1px; background: rgba(255,255,255,0.07); margin: 4px 0; }
        .nav-dropdown-section { padding: 6px 0; }

        /* Publier CTA in nav */
        .nav-publier {
          display: flex; align-items: center; gap: 5px;
          background: rgba(124,58,237,0.12); border: 1px solid rgba(124,58,237,0.3);
          border-radius: 9px; padding: 0.4rem 0.75rem;
          color: #a78bfa; font-size: 0.82rem; font-weight: 600;
          cursor: pointer; transition: all 0.18s; text-decoration: none;
          font-family: 'DM Sans', sans-serif; white-space: nowrap;
        }
        .nav-publier:hover { background: rgba(124,58,237,0.22); color: #fff; border-color: rgba(124,58,237,0.5); }

        /* Mobile hamburger */
        .nav-hamburger {
          display: none; flex-direction: column; gap: 5px;
          background: none; border: none; cursor: pointer; padding: 4px;
        }
        .nav-hamburger span {
          display: block; width: 22px; height: 2px;
          background: rgba(255,255,255,0.7); border-radius: 2px; transition: all 0.2s;
        }

        /* Mobile menu */
        .nav-mobile {
          display: none; flex-direction: column; gap: 2px;
          padding: 0.75rem 1rem 1rem;
          background: #111118; border-bottom: 1px solid rgba(255,255,255,0.07);
        }
        .nav-mobile.open { display: flex; }
        .nav-mobile-link {
          display: flex; align-items: center; gap: 10px;
          padding: 0.65rem 0.875rem; border-radius: 10px;
          color: rgba(255,255,255,0.55); font-size: 0.875rem; font-weight: 500;
          text-decoration: none; transition: all 0.15s;
          font-family: 'DM Sans', sans-serif;
        }
        .nav-mobile-link:hover, .nav-mobile-link.active { color: #fff; background: rgba(255,255,255,0.05); }
        .nav-mobile-link.active { background: rgba(124,58,237,0.15); color: #fff; }
        .nav-mobile-sep { height: 1px; background: rgba(255,255,255,0.07); margin: 6px 0; }

        /* Theme toggle */
        .nav-theme-btn {
          display: flex; align-items: center; justify-content: center;
          width: 34px; height: 34px; border-radius: 9px;
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
          cursor: pointer; transition: all 0.18s; color: rgba(255,255,255,0.55);
          flex-shrink: 0;
        }
        .nav-theme-btn:hover { color: #fff; background: rgba(255,255,255,0.08); border-color: rgba(124,58,237,0.3); }

        @media (max-width: 768px) {
          .navbar { padding: 0 1rem; }
          .nav-center { display: none; }
          .nav-right .nav-btn-ghost { display: none; }
          .nav-hamburger { display: flex; }
        }
        @media (min-width: 769px) {
          .nav-hamburger { display: none; }
          .nav-mobile { display: none !important; }
        }
      `}</style>

      <div style={{ position: "sticky", top: 0, zIndex: 200 }}>
        <nav className="navbar">
          {/* Logo */}
          <a href="/" className="nav-logo">
            code<span>de</span>parrainage.com
          </a>

          {/* Center links */}
          <div className="nav-center">
            <a href="/codes"      className={`nav-link ${activePage==="codes"      ? "active" : ""}`}>Codes</a>
            <a href="/classement" className={`nav-link ${activePage==="classement" ? "active" : ""}`}>Classement</a>
            {isLoggedIn && (
              <a href="/messages" className={`nav-link ${activePage==="messages"   ? "active" : ""}`}>Messages</a>
            )}
          </div>

          {/* Right side */}
          <div className="nav-right">
            {/* Theme toggle */}
            <button className="nav-theme-btn" onClick={toggleTheme} aria-label="Changer le thème" title={theme === "dark" ? "Passer en mode clair" : "Passer en mode sombre"}>
              {theme === "dark"
                ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
                : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
              }
            </button>
            {isLoggedIn ? (
              <>
                <a href="/publier" className="nav-publier">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  Publier
                </a>
                {/* Avatar dropdown */}
                <div style={{ position: "relative" }}>
                  <button className="nav-avatar-btn" onClick={() => setMenuOpen(!menuOpen)}>
                    <div className="nav-avatar">{pseudo[0]?.toUpperCase()}</div>
                    <span className="nav-pseudo">{pseudo}</span>
                    <svg className={`nav-chevron ${menuOpen ? "open" : ""}`} width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
                  </button>
                  {menuOpen && (
                    <div className="nav-dropdown">
                      <div className="nav-dropdown-section">
                        <a href="/profil"    className="nav-dropdown-item" onClick={()=>setMenuOpen(false)}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
                          Mon profil
                        </a>
                        <a href="/profil?tab=annonces" className="nav-dropdown-item" onClick={()=>setMenuOpen(false)}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="5" width="18" height="14" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                          Mes annonces
                        </a>
                        <a href="/profil?tab=credits"  className="nav-dropdown-item" onClick={()=>setMenuOpen(false)}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                          Crédits & Boosts
                        </a>
                        <a href="/profil?tab=badges"   className="nav-dropdown-item" onClick={()=>setMenuOpen(false)}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="6"/><path d="M8.56 2.75c4.37 6.03 6.02 9.42 8.03 17.72"/></svg>
                          Badges
                        </a>
                      </div>
                      <div className="nav-dropdown-sep" />
                      <div className="nav-dropdown-section">
                        <a href="/profil?tab=parametres" className="nav-dropdown-item" onClick={()=>setMenuOpen(false)}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                          Paramètres
                        </a>
                        <button className="nav-dropdown-item danger" onClick={async ()=>{ setMenuOpen(false); const supabase = createClient(); await supabase.auth.signOut(); window.location.href = "/login"; }}>
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
                <a href="/login"    className="nav-btn-ghost">Connexion</a>
                <a href="/register" className="nav-btn-primary">
                  S'inscrire gratuitement
                </a>
              </>
            )}
            {/* Mobile hamburger */}
            <button className="nav-hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
              <span /><span /><span />
            </button>
          </div>
        </nav>

        {/* Mobile menu */}
        <div className={`nav-mobile ${menuOpen ? "open" : ""}`}>
          <a href="/codes"      className={`nav-mobile-link ${activePage==="codes"      ? "active":""}`} onClick={()=>setMenuOpen(false)}>🔍 Codes</a>
          <a href="/classement" className={`nav-mobile-link ${activePage==="classement" ? "active":""}`} onClick={()=>setMenuOpen(false)}>🏆 Classement</a>
          {isLoggedIn && <a href="/messages" className={`nav-mobile-link ${activePage==="messages" ? "active":""}`} onClick={()=>setMenuOpen(false)}>💬 Messages</a>}
          {isLoggedIn && <a href="/publier"  className={`nav-mobile-link ${activePage==="publier"  ? "active":""}`} onClick={()=>setMenuOpen(false)}>➕ Publier un code</a>}
          {isLoggedIn && <a href="/profil"   className={`nav-mobile-link ${activePage==="profil"   ? "active":""}`} onClick={()=>setMenuOpen(false)}>👤 Mon profil</a>}
          <div className="nav-mobile-sep" />
          {isLoggedIn
            ? <button className="nav-mobile-link" style={{ color:"#f87171" }} onClick={async ()=>{ setMenuOpen(false); const supabase = createClient(); await supabase.auth.signOut(); window.location.href = "/login"; }}>🚪 Déconnexion</button>
            : <>
                <a href="/login"    className="nav-mobile-link" onClick={()=>setMenuOpen(false)}>Connexion</a>
                <a href="/register" className="nav-mobile-link" style={{ color:"#a78bfa" }} onClick={()=>setMenuOpen(false)}>S'inscrire gratuitement</a>
              </>
          }
        </div>
      </div>
    </>
  );
}