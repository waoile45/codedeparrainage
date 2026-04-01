"use client";

import { useState, useEffect, useRef } from "react";
import Navbar from "@/components/Navbar";
import { createClient } from "@/lib/supabase";

type Category = "Tout" | "banque" | "paris" | "cashback" | "energie" | "telephonie" | "crypto" | "assurance" | "shopping";

interface CodeCard {
  id: string;
  brand: string;
  slug: string;
  description: string;
  reward: string;
  code: string;
  category: string;
  parrain: string;
  niveau: string;
  boosted: boolean;
}

const CATEGORIES = ["Tout","banque","paris","cashback","energie","telephonie","crypto","assurance","shopping"];
const CATEGORY_LABELS: Record<string,string> = { Tout:"Tout", banque:"Banque", paris:"Paris", cashback:"Cashback", energie:"Énergie", telephonie:"Téléphonie", crypto:"Crypto", assurance:"Assurance", shopping:"Shopping" };
const CATEGORY_ICONS: Record<string,string> = { Tout:"✦", banque:"🏦", paris:"⚽", cashback:"💸", energie:"⚡", telephonie:"📱", crypto:"₿", assurance:"🛡️", shopping:"🛍️" };
const NIVEAU_COLORS: Record<string,string> = { Débutant:"#6366f1", "Parrain Bronze":"#cd7f32", "Parrain Argent":"#8b5cf6", "Parrain Or":"#f59e0b", "Super Parrain":"#a855f7", "Parrain Légendaire":"#ec4899" };

function BrandLogo({ slug, brand }: { slug: string; brand: string }) {
  const [error, setError] = useState(false);
  const domain = slug.includes(".") ? slug : `${slug}.com`;
  if (error) return <div className="brand-logo brand-logo-fallback">{brand[0]?.toUpperCase()}</div>;
  return (
    <div className="brand-logo">
      <img src={`https://www.google.com/s2/favicons?domain=${domain}&sz=64`} alt={brand} onError={() => setError(true)} style={{ width:"100%", height:"100%", objectFit:"contain", borderRadius:8, padding:3 }} />
    </div>
  );
}

function Particles() {
  return (
    <div className="particles-container" aria-hidden="true">
      {Array.from({ length: 18 }).map((_, i) => (
        <span key={i} className="particle" style={{ left:`${Math.random()*100}%`, animationDelay:`${Math.random()*8}s`, animationDuration:`${6+Math.random()*8}s`, opacity:0.15+Math.random()*0.2, width:`${2+Math.random()*3}px`, height:`${2+Math.random()*3}px` }} />
      ))}
    </div>
  );
}

function CopyButton({ code }: { code: string }) {
  const [state, setState] = useState<"idle"|"copied">("idle");
  const handleCopy = async () => {
    try { await navigator.clipboard.writeText(code); } catch {}
    setState("copied"); setTimeout(() => setState("idle"), 2000);
  };
  return (
    <button onClick={handleCopy} className={`copy-btn ${state==="copied"?"copied":""}`}>
      {state==="copied"
        ? <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>Copié !</>
        : <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>Copier</>
      }
    </button>
  );
}

function CodeCardItem({ card, index }: { card: CodeCard; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setTimeout(() => setVisible(true), index*60); obs.disconnect(); } }, { threshold:0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [index]);
  const niveauColor = NIVEAU_COLORS[card.niveau] ?? "#6366f1";
  return (
    <div ref={ref} className={`code-card ${card.boosted?"boosted":""} ${visible?"visible":""}`}>
      {card.boosted && <div className="boost-badge"><span className="boost-lightning">⚡</span><span>Annonce boostée</span></div>}
      <div className="card-top">
        <div className="brand-row">
          <BrandLogo slug={card.slug} brand={card.brand} />
          <div className="brand-info">
            <h3 className="brand-name">{card.brand}</h3>
            <p className="brand-desc">{card.description}</p>
          </div>
          <div className="reward-pill">{card.reward}</div>
        </div>
      </div>
      <div className="code-row">
        <div className="code-display"><span className="code-dot" /><code className="code-text">{card.code}</code></div>
        <CopyButton code={card.code} />
      </div>
      <div className="card-footer">
        <div className="parrain-info">
          <div className="parrain-avatar" style={{ background:niveauColor+"33", borderColor:niveauColor+"66" }}>{card.parrain[0]?.toUpperCase()}</div>
          <span className="parrain-name">{card.parrain}</span>
          <span className="niveau-badge" style={{ color:niveauColor, borderColor:niveauColor+"44", background:niveauColor+"11" }}>{card.niveau}</span>
        </div>
        <div className="card-actions">
          <button className="action-btn"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>Contacter</button>
          <button className="action-btn"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>Avis</button>
        </div>
      </div>
    </div>
  );
}

export default function CodesPage() {
  const [codes, setCodes]           = useState<CodeCard[]>([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [activeCategory, setActiveCategory] = useState<Category>("Tout");
  const [sort, setSort]             = useState<"popular"|"recent">("popular");
  const [count, setCount]           = useState(0);
  const supabase = createClient();

  useEffect(() => {
    async function fetchCodes() {
      setLoading(true);
      const { data, error } = await supabase
        .from("announcements")
        .select(`id, code, description, bumps_today, created_at, companies(name, slug, category, referral_bonus_description), users(pseudo, level)`)
        .order("bumps_today", { ascending: false });

      if (error) { console.error(error); setLoading(false); return; }

      const mapped: CodeCard[] = (data ?? []).map((row: any) => ({
        id:          row.id,
        code:        row.code,
        description: row.description || row.companies?.referral_bonus_description || "",
        boosted:     (row.bumps_today ?? 0) > 0,
        brand:       row.companies?.name ?? "Inconnu",
        slug:        row.companies?.slug ?? "",
        category:    row.companies?.category ?? "shopping",
        reward:      row.companies?.referral_bonus_description ?? "Offre de bienvenue",
        parrain:     row.users?.pseudo ?? "Anonyme",
        niveau:      row.users?.level ?? "Débutant",
      }));

      setCodes(mapped);
      let current = 0;
      const timer = setInterval(() => {
        current = Math.min(current + Math.ceil(mapped.length / 20), mapped.length);
        setCount(current);
        if (current >= mapped.length) clearInterval(timer);
      }, 40);
      setLoading(false);
    }
    fetchCodes();
  }, []);

  const filtered = codes.filter(c => {
    const matchCat    = activeCategory === "Tout" || c.category === activeCategory;
    const matchSearch = search === "" || c.brand.toLowerCase().includes(search.toLowerCase()) || c.code.toLowerCase().includes(search.toLowerCase()) || c.description.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  }).sort((a, b) => sort === "popular" ? (a.boosted === b.boosted ? 0 : a.boosted ? -1 : 1) : 0);

  return (
    <>
      <style>{`
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        body{background:#0A0A0F;color:#e2e8f0;font-family:'DM Sans',sans-serif;min-height:100vh;overflow-x:hidden}
        .particles-container{position:fixed;inset:0;pointer-events:none;z-index:0;overflow:hidden}
        .particle{position:absolute;bottom:-10px;border-radius:50%;background:#7c3aed;animation:floatUp linear infinite}
        @keyframes floatUp{0%{transform:translateY(0) scale(1);opacity:0}10%{opacity:1}90%{opacity:.5}100%{transform:translateY(-100vh) scale(.3);opacity:0}}
        .page-wrapper{position:relative;z-index:1;max-width:860px;margin:0 auto;padding:3rem 1.5rem 6rem}
        .page-header{margin-bottom:2.5rem}
        .header-label{display:inline-flex;align-items:center;gap:6px;font-size:.75rem;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:#7c3aed;margin-bottom:.75rem}
        .header-label::before{content:'';display:block;width:18px;height:1px;background:#7c3aed}
        .page-title{font-family:'Syne',sans-serif;font-weight:800;font-size:clamp(1.75rem,4vw,2.5rem);line-height:1.1;color:#fff;letter-spacing:-.03em;margin-bottom:.5rem}
        .page-subtitle{color:rgba(255,255,255,.4);font-size:.9rem;display:flex;align-items:center;gap:8px}
        .live-dot{width:7px;height:7px;border-radius:50%;background:#22c55e;box-shadow:0 0 8px #22c55e;animation:pulse 2s ease-in-out infinite;flex-shrink:0}
        @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.6;transform:scale(.8)}}
        .count-num{color:#fff;font-weight:700}
        .search-wrap{position:relative;margin-bottom:1.25rem}
        .search-icon{position:absolute;left:1rem;top:50%;transform:translateY(-50%);color:rgba(255,255,255,.3);pointer-events:none}
        .search-input{width:100%;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:14px;padding:.875rem 1rem .875rem 2.75rem;color:#fff;font-size:.9rem;font-family:'DM Sans',sans-serif;outline:none;transition:all .2s}
        .search-input::placeholder{color:rgba(255,255,255,.3)}
        .search-input:focus{border-color:rgba(124,58,237,.5);background:rgba(124,58,237,.05);box-shadow:0 0 0 3px rgba(124,58,237,.1)}
        .sort-row{display:flex;align-items:center;gap:8px;margin-bottom:1.25rem}
        .sort-tab{display:flex;align-items:center;gap:6px;padding:.4rem .875rem;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:10px;color:rgba(255,255,255,.5);font-size:.8rem;font-weight:500;cursor:pointer;transition:all .2s;font-family:'DM Sans',sans-serif}
        .sort-tab:hover{color:#fff;border-color:rgba(255,255,255,.15)}
        .sort-tab.active{background:rgba(124,58,237,.15);border-color:rgba(124,58,237,.4);color:#a78bfa}
        .cats-row{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:2.5rem}
        .cat-pill{display:inline-flex;align-items:center;gap:5px;padding:.4rem .875rem;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:100px;color:rgba(255,255,255,.55);font-size:.8rem;font-weight:500;cursor:pointer;transition:all .2s;font-family:'DM Sans',sans-serif}
        .cat-pill:hover{color:#fff;border-color:rgba(124,58,237,.3);background:rgba(124,58,237,.08)}
        .cat-pill.active{background:#7c3aed;border-color:#7c3aed;color:#fff;box-shadow:0 0 16px rgba(124,58,237,.35)}
        .cards-list{display:flex;flex-direction:column;gap:1rem}
        .code-card{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.07);border-radius:20px;padding:1.5rem;opacity:0;transform:translateY(16px);transition:opacity .4s ease,transform .4s ease,border-color .2s,box-shadow .2s;position:relative;overflow:hidden}
        .code-card:hover{border-color:rgba(124,58,237,.25);box-shadow:0 8px 32px rgba(0,0,0,.3)}
        .code-card.visible{opacity:1;transform:translateY(0)}
        .code-card.boosted{border-color:rgba(124,58,237,.3);background:rgba(124,58,237,.04)}
        .code-card.boosted::after{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,#7c3aed,transparent)}
        .boost-badge{display:inline-flex;align-items:center;gap:5px;padding:.25rem .625rem;background:rgba(124,58,237,.15);border:1px solid rgba(124,58,237,.3);border-radius:100px;font-size:.72rem;font-weight:600;color:#a78bfa;margin-bottom:1rem}
        .boost-lightning{animation:flicker 1.5s ease-in-out infinite}
        @keyframes flicker{0%,100%{opacity:1}50%{opacity:.6}}
        .card-top{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:1.25rem}
        .brand-row{display:flex;align-items:center;gap:12px;flex:1}
        .brand-logo{width:44px;height:44px;border-radius:12px;background:#fff;border:1px solid rgba(255,255,255,.12);display:flex;align-items:center;justify-content:center;flex-shrink:0;overflow:hidden}
        .brand-logo-fallback{background:rgba(124,58,237,.15)!important;border:1px solid rgba(124,58,237,.2)!important;font-family:'Syne',sans-serif;font-weight:800;font-size:1.1rem;color:#a78bfa}
        .brand-info{flex:1}
        .brand-name{font-family:'Syne',sans-serif;font-weight:700;font-size:1rem;color:#fff;margin-bottom:2px}
        .brand-desc{color:rgba(255,255,255,.45);font-size:.8rem}
        .reward-pill{padding:.3rem .625rem;background:rgba(34,197,94,.12);border:1px solid rgba(34,197,94,.25);border-radius:8px;color:#4ade80;font-size:.8rem;font-weight:700;white-space:nowrap;flex-shrink:0}
        .code-row{display:flex;align-items:center;justify-content:space-between;background:rgba(0,0,0,.25);border:1px solid rgba(255,255,255,.06);border-radius:12px;padding:.75rem .875rem;margin-bottom:1.25rem}
        .code-display{display:flex;align-items:center;gap:8px}
        .code-dot{width:6px;height:6px;border-radius:50%;background:#7c3aed;box-shadow:0 0 6px #7c3aed;flex-shrink:0}
        .code-text{font-family:'Courier New',monospace;font-size:.95rem;font-weight:700;color:#e2e8f0;letter-spacing:.08em}
        .copy-btn{display:inline-flex;align-items:center;gap:6px;padding:.4rem .875rem;background:rgba(124,58,237,.15);border:1px solid rgba(124,58,237,.35);border-radius:8px;color:#a78bfa;font-size:.8rem;font-weight:600;cursor:pointer;transition:all .2s;font-family:'DM Sans',sans-serif;white-space:nowrap}
        .copy-btn:hover{background:rgba(124,58,237,.25);color:#fff;transform:scale(1.03)}
        .copy-btn.copied{background:rgba(34,197,94,.15);border-color:rgba(34,197,94,.35);color:#4ade80}
        .card-footer{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:.75rem}
        .parrain-info{display:flex;align-items:center;gap:8px}
        .parrain-avatar{width:26px;height:26px;border-radius:50%;border:1px solid;display:flex;align-items:center;justify-content:center;font-size:.7rem;font-weight:700;color:#fff;flex-shrink:0}
        .parrain-name{font-size:.82rem;font-weight:500;color:rgba(255,255,255,.6)}
        .niveau-badge{font-size:.72rem;font-weight:600;padding:.15rem .5rem;border:1px solid;border-radius:100px}
        .card-actions{display:flex;gap:6px}
        .action-btn{display:inline-flex;align-items:center;gap:5px;padding:.35rem .75rem;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:8px;color:rgba(255,255,255,.5);font-size:.78rem;font-weight:500;cursor:pointer;transition:all .2s;font-family:'DM Sans',sans-serif}
        .action-btn:hover{color:#fff;border-color:rgba(255,255,255,.18);background:rgba(255,255,255,.07)}
        .results-meta{display:flex;align-items:center;justify-content:space-between;margin-bottom:1rem}
        .results-count{font-size:.8rem;color:rgba(255,255,255,.3)}
        .results-count strong{color:rgba(255,255,255,.6)}
        .empty-state{text-align:center;padding:4rem 2rem;color:rgba(255,255,255,.3)}
        .empty-icon{font-size:2.5rem;margin-bottom:1rem}
        .loading-wrap{display:flex;flex-direction:column;gap:1rem}
        .loading-card{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.07);border-radius:20px;padding:1.5rem}
        .skeleton{background:rgba(255,255,255,.06);border-radius:8px;animation:shimmer 1.5s ease-in-out infinite}
        @keyframes shimmer{0%,100%{opacity:.5}50%{opacity:1}}
        @media(max-width:600px){.page-wrapper{padding:2rem 1rem 4rem}.card-footer{flex-direction:column;align-items:flex-start}}
      `}</style>

      <Particles />
      <Navbar activePage="codes" isLoggedIn={true} pseudo="Test3" />

      <main className="page-wrapper">
        <header className="page-header">
          <div className="header-label">Annuaire</div>
          <h1 className="page-title">Codes de parrainage</h1>
          <p className="page-subtitle">
            <span className="live-dot" />
            <span className="count-num">{count}</span>&nbsp;codes disponibles — mis à jour en temps réel
          </p>
        </header>

        <div className="search-wrap">
          <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" className="search-input" placeholder="Rechercher... (ex: Boursobank, Winamax, crypto)" value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        <div className="sort-row">
          <button className={`sort-tab ${sort==="popular"?"active":""}`} onClick={() => setSort("popular")}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            Populaires
          </button>
          <button className={`sort-tab ${sort==="recent"?"active":""}`} onClick={() => setSort("recent")}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            Récentes
          </button>
        </div>

        <div className="cats-row">
          {CATEGORIES.map(cat => (
            <button key={cat} className={`cat-pill ${activeCategory===cat?"active":""}`} onClick={() => setActiveCategory(cat as Category)}>
              <span>{CATEGORY_ICONS[cat]}</span>{CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>

        <div className="results-meta">
          <p className="results-count">
            <strong>{filtered.length}</strong> résultat{filtered.length!==1?"s":""}
            {activeCategory!=="Tout" && <> · {CATEGORY_LABELS[activeCategory]}</>}
            {search && <> pour « {search} »</>}
          </p>
        </div>

        {loading ? (
          <div className="loading-wrap">
            {[1,2,3].map(i => (
              <div key={i} className="loading-card">
                <div className="skeleton" style={{ width:"30%", height:16, marginBottom:16 }} />
                <div style={{ display:"flex", gap:12, marginBottom:16 }}>
                  <div className="skeleton" style={{ width:44, height:44, borderRadius:12, flexShrink:0 }} />
                  <div style={{ flex:1 }}>
                    <div className="skeleton" style={{ width:"40%", height:14, marginBottom:8 }} />
                    <div className="skeleton" style={{ width:"60%", height:12 }} />
                  </div>
                </div>
                <div className="skeleton" style={{ width:"100%", height:48, borderRadius:12 }} />
              </div>
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <div className="cards-list">
            {filtered.map((card, i) => <CodeCardItem key={card.id} card={card} index={i} />)}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <p>Aucun code trouvé pour cette recherche.</p>
          </div>
        )}
      </main>
    </>
  );
}