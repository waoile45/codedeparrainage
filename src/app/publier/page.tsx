"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";

// ── Types ──────────────────────────────────────────────────────────────────────
type Category = "Banque" | "Crypto" | "Energie" | "Cashback" | "Telephonie" | "Paris" | "Assurance" | "Shopping";

interface Company { name: string; category: Category; reward: string; icon: string; }

// ── Mock companies — remplace par fetch Supabase ───────────────────────────────
const COMPANIES: Company[] = [
  { name:"Boursobank",  category:"Banque",      reward:"80€ offerts",              icon:"🏦" },
  { name:"Fortuneo",   category:"Banque",      reward:"130€ offerts",             icon:"🏦" },
  { name:"Hello bank", category:"Banque",      reward:"80€ offerts",              icon:"🏦" },
  { name:"Binance",    category:"Crypto",      reward:"10% de réduction",         icon:"₿"  },
  { name:"Coinbase",   category:"Crypto",      reward:"10$ en BTC",               icon:"₿"  },
  { name:"EDF",        category:"Energie",     reward:"60€ offerts",              icon:"⚡" },
  { name:"Totalénergie",category:"Energie",    reward:"50€ offerts",              icon:"⚡" },
  { name:"iGraal",     category:"Cashback",    reward:"5€ offerts",               icon:"💸" },
  { name:"Widilo",     category:"Cashback",    reward:"3€ offerts",               icon:"💸" },
  { name:"Free Mobile",category:"Telephonie",  reward:"1 mois offert",            icon:"📱" },
  { name:"Winamax",    category:"Paris",       reward:"100€ remboursés",          icon:"⚽" },
  { name:"BetClic",    category:"Paris",       reward:"100€ remboursés",          icon:"⚽" },
];

const CATEGORIES: Category[] = ["Banque","Crypto","Energie","Cashback","Telephonie","Paris","Assurance","Shopping"];
const CAT_ICONS: Record<string,string> = { Banque:"🏦", Crypto:"₿", Energie:"⚡", Cashback:"💸", Telephonie:"📱", Paris:"⚽", Assurance:"🛡️", Shopping:"🛍️" };

const XP_GAIN = 10;

// ── Step indicator ─────────────────────────────────────────────────────────────
function Steps({ current }: { current: 1|2|3 }) {
  const steps = [
    { n:1, label:"Entreprise" },
    { n:2, label:"Ton code" },
    { n:3, label:"Confirmation" },
  ];
  return (
    <div style={{ display:"flex", alignItems:"center", gap:0, marginBottom:"2.5rem" }}>
      {steps.map((s, i) => {
        const done    = current > s.n;
        const active  = current === s.n;
        return (
          <div key={s.n} style={{ display:"flex", alignItems:"center", flex: i < steps.length-1 ? 1 : "none" }}>
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:5 }}>
              <div style={{ width:32, height:32, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", background: done?"#7c3aed": active?"rgba(124,58,237,.2)":"rgba(255,255,255,.06)", border:`2px solid ${done||active?"#7c3aed":"rgba(255,255,255,.1)"}`, transition:"all .3s", flexShrink:0 }}>
                {done
                  ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  : <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:"0.78rem", color: active?"#a78bfa":"rgba(255,255,255,.3)" }}>{s.n}</span>
                }
              </div>
              <span style={{ fontSize:"0.68rem", fontWeight:600, color: active?"#fff": done?"rgba(255,255,255,.5)":"rgba(255,255,255,.25)", whiteSpace:"nowrap" }}>{s.label}</span>
            </div>
            {i < steps.length-1 && (
              <div style={{ flex:1, height:1, background: done?"#7c3aed":"rgba(255,255,255,.08)", margin:"0 8px", marginBottom:20, transition:"background .3s" }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────────
export default function PublierPage() {
  const [step, setStep]               = useState<1|2|3>(1);
  const [selectedCompany, setSelectedCompany] = useState<Company|null>(null);
  const [filterCat, setFilterCat]     = useState<Category|"Tout">("Tout");
  const [search, setSearch]           = useState("");
  const [code, setCode]               = useState("");
  const [desc, setDesc]               = useState("");
  const [submitting, setSubmitting]   = useState(false);

  const filtered = COMPANIES.filter(c => {
    const matchCat  = filterCat === "Tout" || c.category === filterCat;
    const matchSearch = search === "" || c.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleSubmit = async () => {
    if (!code.trim() || !selectedCompany) return;
    setSubmitting(true);
    // TODO: supabase.from('codes').insert({ company: selectedCompany.name, code, desc, user_id })
    await new Promise(r => setTimeout(r, 900)); // simulate
    setStep(3);
    setSubmitting(false);
  };

  return (
    <>
      <style>{`
        @keyframes spin    { to { transform:rotate(360deg); } }
        @keyframes fadeIn  { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pop     { 0%{transform:scale(.8);opacity:0} 60%{transform:scale(1.1)} 100%{transform:scale(1);opacity:1} }
        *,*::before,*::after { box-sizing:border-box; margin:0; padding:0; }
        body { background:#0A0A0F; color:#e2e8f0; font-family:'DM Sans',sans-serif; min-height:100vh; }

        .page { max-width:680px; margin:0 auto; padding:3rem 1.5rem 6rem; }

        .page-header { margin-bottom:2rem; }
        .header-label { display:inline-flex; align-items:center; gap:6px; font-size:.72rem; font-weight:600; letter-spacing:.1em; text-transform:uppercase; color:#7c3aed; margin-bottom:.75rem; }
        .header-label::before { content:''; width:18px; height:1px; background:#7c3aed; display:block; }
        .page-title { font-family:'Syne',sans-serif; font-weight:800; font-size:clamp(1.5rem,3.5vw,2rem); color:#fff; letter-spacing:-.03em; margin-bottom:.35rem; }
        .page-sub { color:rgba(255,255,255,.35); font-size:.875rem; }
        .xp-badge { display:inline-flex; align-items:center; gap:5px; background:rgba(124,58,237,.15); border:1px solid rgba(124,58,237,.3); color:#a78bfa; font-size:.75rem; font-weight:700; padding:3px 10px; border-radius:100px; margin-left:8px; }

        /* Form card */
        .form-card { background:rgba(255,255,255,.03); border:1px solid rgba(255,255,255,.07); border-radius:20px; padding:2rem; animation:fadeIn .3s ease; }

        /* Search */
        .search-wrap { position:relative; margin-bottom:1rem; }
        .search-icon { position:absolute; left:1rem; top:50%; transform:translateY(-50%); color:rgba(255,255,255,.3); pointer-events:none; }
        .search-input { width:100%; background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.08); border-radius:12px; padding:.75rem 1rem .75rem 2.75rem; color:#fff; font-size:.875rem; font-family:'DM Sans',sans-serif; outline:none; transition:all .2s; }
        .search-input::placeholder { color:rgba(255,255,255,.3); }
        .search-input:focus { border-color:rgba(124,58,237,.4); background:rgba(124,58,237,.05); box-shadow:0 0 0 3px rgba(124,58,237,.1); }

        /* Cat pills */
        .cats { display:flex; flex-wrap:wrap; gap:6px; margin-bottom:1.25rem; }
        .cat-pill { padding:.3rem .75rem; background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.08); border-radius:100px; color:rgba(255,255,255,.5); font-size:.75rem; font-weight:500; cursor:pointer; transition:all .18s; font-family:'DM Sans',sans-serif; }
        .cat-pill:hover { color:#fff; border-color:rgba(124,58,237,.3); }
        .cat-pill.active { background:#7c3aed; border-color:#7c3aed; color:#fff; box-shadow:0 0 14px rgba(124,58,237,.3); }

        /* Company grid */
        .company-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:.625rem; max-height:320px; overflow-y:auto; padding-right:4px; }
        .company-grid::-webkit-scrollbar { width:4px; }
        .company-grid::-webkit-scrollbar-track { background:rgba(255,255,255,.03); border-radius:4px; }
        .company-grid::-webkit-scrollbar-thumb { background:rgba(124,58,237,.4); border-radius:4px; }
        .company-card { display:flex; align-items:center; gap:10px; background:rgba(255,255,255,.03); border:1px solid rgba(255,255,255,.07); border-radius:12px; padding:.75rem 1rem; cursor:pointer; transition:all .18s; }
        .company-card:hover { border-color:rgba(124,58,237,.3); background:rgba(124,58,237,.06); }
        .company-card.selected { border-color:rgba(124,58,237,.5); background:rgba(124,58,237,.12); box-shadow:0 0 16px rgba(124,58,237,.15); }
        .company-icon { width:34px; height:34px; border-radius:10px; background:rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.08); display:flex; align-items:center; justify-content:center; font-size:1rem; flex-shrink:0; }
        .company-name { font-weight:600; font-size:.855rem; color:#fff; }
        .company-reward { font-size:.7rem; color:rgba(255,255,255,.35); margin-top:1px; }
        .company-check { width:18px; height:18px; border-radius:50%; background:#7c3aed; border:none; display:flex; align-items:center; justify-content:center; flex-shrink:0; margin-left:auto; }

        /* Form inputs */
        .form-group { display:flex; flex-direction:column; gap:7px; }
        .form-label { font-size:.78rem; font-weight:600; color:rgba(255,255,255,.45); letter-spacing:.04em; display:flex; align-items:center; gap:8px; }
        .form-label-opt { font-size:.7rem; color:rgba(255,255,255,.2); font-weight:400; }
        .form-input { background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.08); border-radius:12px; padding:.75rem 1rem; color:#fff; font-size:.9rem; font-family:'DM Sans',sans-serif; outline:none; transition:all .2s; width:100%; }
        .form-input:focus { border-color:rgba(124,58,237,.4); background:rgba(124,58,237,.05); box-shadow:0 0 0 3px rgba(124,58,237,.1); }
        .form-input::placeholder { color:rgba(255,255,255,.25); }
        .form-textarea { resize:vertical; min-height:100px; }
        .form-hint { font-size:.7rem; color:rgba(255,255,255,.22); }

        /* Selected company display */
        .selected-display { display:flex; align-items:center; gap:10px; background:rgba(124,58,237,.1); border:1px solid rgba(124,58,237,.3); border-radius:12px; padding:.75rem 1rem; margin-bottom:1.5rem; }
        .selected-icon { width:36px; height:36px; border-radius:10px; background:rgba(124,58,237,.2); display:flex; align-items:center; justify-content:center; font-size:1rem; }
        .selected-change { margin-left:auto; background:none; border:1px solid rgba(255,255,255,.1); border-radius:8px; color:rgba(255,255,255,.4); font-size:.75rem; padding:.3rem .625rem; cursor:pointer; transition:all .18s; font-family:'DM Sans',sans-serif; }
        .selected-change:hover { color:#fff; border-color:rgba(255,255,255,.25); }

        /* Code input highlight */
        .code-input-wrap { position:relative; }
        .code-input { font-family:'Courier New',monospace !important; font-size:1rem !important; font-weight:700 !important; letter-spacing:.08em; text-transform:uppercase; }
        .code-preview { display:flex; align-items:center; gap:8px; background:rgba(0,0,0,.25); border:1px solid rgba(255,255,255,.06); border-radius:10px; padding:.6rem .875rem; margin-top:6px; }
        .code-dot { width:6px; height:6px; border-radius:50%; background:#7c3aed; box-shadow:0 0 6px #7c3aed; }

        /* Buttons */
        .btn-next { display:flex; align-items:center; justify-content:center; gap:7px; width:100%; background:#7c3aed; color:#fff; border:none; border-radius:13px; padding:.875rem; font-size:.9rem; font-weight:700; cursor:pointer; transition:all .2s; font-family:'DM Sans',sans-serif; margin-top:1.5rem; }
        .btn-next:hover { background:#6d28d9; transform:translateY(-1px); box-shadow:0 6px 24px rgba(124,58,237,.4); }
        .btn-next:disabled { opacity:.4; cursor:not-allowed; transform:none; box-shadow:none; }
        .btn-back { display:flex; align-items:center; gap:6px; background:none; border:1px solid rgba(255,255,255,.1); border-radius:10px; padding:.5rem .875rem; color:rgba(255,255,255,.45); font-size:.82rem; cursor:pointer; transition:all .18s; font-family:'DM Sans',sans-serif; margin-bottom:1.25rem; }
        .btn-back:hover { color:#fff; border-color:rgba(255,255,255,.22); }

        /* Success */
        .success-wrap { text-align:center; padding:2rem 1rem; animation:fadeIn .4s ease; }
        .success-icon { font-size:3.5rem; animation:pop .5s ease forwards; display:inline-block; margin-bottom:1rem; }
        .success-title { font-family:'Syne',sans-serif; font-weight:800; font-size:1.5rem; color:#fff; letter-spacing:-.03em; margin-bottom:.5rem; }
        .success-sub { color:rgba(255,255,255,.4); font-size:.875rem; margin-bottom:2rem; }
        .success-xp { display:inline-flex; align-items:center; gap:8px; background:rgba(124,58,237,.15); border:1px solid rgba(124,58,237,.3); border-radius:100px; padding:.5rem 1.25rem; color:#a78bfa; font-family:'Syne',sans-serif; font-weight:800; font-size:1.1rem; margin-bottom:2rem; }
        .success-actions { display:flex; gap:10px; justify-content:center; flex-wrap:wrap; }
        .btn-success-primary { display:inline-flex; align-items:center; gap:6px; background:#7c3aed; color:#fff; border:none; border-radius:11px; padding:.65rem 1.25rem; font-size:.875rem; font-weight:600; cursor:pointer; text-decoration:none; font-family:'DM Sans',sans-serif; transition:all .2s; }
        .btn-success-primary:hover { background:#6d28d9; }
        .btn-success-ghost { display:inline-flex; align-items:center; gap:6px; background:none; color:rgba(255,255,255,.5); border:1px solid rgba(255,255,255,.1); border-radius:11px; padding:.65rem 1.25rem; font-size:.875rem; font-weight:600; cursor:pointer; text-decoration:none; font-family:'DM Sans',sans-serif; transition:all .2s; }
        .btn-success-ghost:hover { color:#fff; border-color:rgba(255,255,255,.25); }

        @media(max-width:600px) {
          .page { padding:2rem 1rem 4rem; }
          .company-grid { grid-template-columns:1fr; }
        }
      `}</style>

      <Navbar activePage="publier" isLoggedIn={true} pseudo="Test3" />

      <main className="page">
        {/* Header */}
        <div className="page-header">
          <div className="header-label">Publication</div>
          <h1 className="page-title">
            Publier mon code
            <span className="xp-badge">+{XP_GAIN} XP</span>
          </h1>
          <p className="page-sub">Partage ton code de parrainage et gagne des points XP</p>
        </div>

        {/* Steps */}
        {step < 3 && <Steps current={step} />}

        <div className="form-card">

          {/* ── Step 1 : choisir l'entreprise ── */}
          {step === 1 && (
            <div>
              <div className="search-wrap">
                <svg className="search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <input className="search-input" placeholder="Rechercher une entreprise..." value={search} onChange={e=>setSearch(e.target.value)} />
              </div>
              <div className="cats">
                {(["Tout", ...CATEGORIES] as (Category|"Tout")[]).map(c => (
                  <button key={c} className={`cat-pill ${filterCat===c?"active":""}`} onClick={()=>setFilterCat(c)}>
                    {c !== "Tout" ? CAT_ICONS[c]+" " : ""}{c}
                  </button>
                ))}
              </div>
              <div className="company-grid">
                {filtered.map(c => (
                  <div key={c.name} className={`company-card ${selectedCompany?.name===c.name?"selected":""}`} onClick={()=>setSelectedCompany(c)}>
                    <div className="company-icon">{c.icon}</div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <p className="company-name">{c.name}</p>
                      <p className="company-reward">{c.reward}</p>
                    </div>
                    {selectedCompany?.name===c.name && (
                      <div className="company-check">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                      </div>
                    )}
                  </div>
                ))}
                {filtered.length === 0 && (
                  <div style={{ gridColumn:"1/-1", textAlign:"center", padding:"2rem", color:"rgba(255,255,255,.25)", fontSize:".875rem" }}>
                    Aucune entreprise trouvée
                  </div>
                )}
              </div>
              <button className="btn-next" disabled={!selectedCompany} onClick={()=>setStep(2)}>
                Continuer
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </button>
            </div>
          )}

          {/* ── Step 2 : saisir le code ── */}
          {step === 2 && (
            <div>
              <button className="btn-back" onClick={()=>setStep(1)}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
                Retour
              </button>

              {/* Selected company recap */}
              {selectedCompany && (
                <div className="selected-display">
                  <div className="selected-icon">{selectedCompany.icon}</div>
                  <div>
                    <p style={{ fontWeight:700, color:"#fff", fontSize:".9rem" }}>{selectedCompany.name}</p>
                    <p style={{ fontSize:".72rem", color:"rgba(255,255,255,.4)" }}>{selectedCompany.reward} · {selectedCompany.category}</p>
                  </div>
                  <button className="selected-change" onClick={()=>setStep(1)}>Changer</button>
                </div>
              )}

              <div style={{ display:"flex", flexDirection:"column", gap:"1.25rem" }}>
                <div className="form-group">
                  <label className="form-label">
                    Votre code de parrainage
                    <span style={{ fontSize:".7rem", color:"rgba(255,255,255,.3)", fontWeight:400 }}>obligatoire</span>
                  </label>
                  <div className="code-input-wrap">
                    <input
                      className="form-input code-input"
                      placeholder="Ex : PAUL2024"
                      value={code}
                      onChange={e=>setCode(e.target.value.toUpperCase())}
                      maxLength={32}
                    />
                  </div>
                  {code && (
                    <div className="code-preview">
                      <span className="code-dot" />
                      <code style={{ fontFamily:"'Courier New',monospace", fontWeight:700, fontSize:".9rem", color:"#e2e8f0", letterSpacing:".08em" }}>{code}</code>
                    </div>
                  )}
                  <p className="form-hint">Tel qu'il apparaîtra sur la page des codes</p>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Description
                    <span className="form-label-opt">optionnel</span>
                  </label>
                  <textarea
                    className="form-input form-textarea"
                    placeholder="Ex : Profite de 80€ offerts à l'ouverture de ton compte..."
                    value={desc}
                    onChange={e=>setDesc(e.target.value)}
                    maxLength={280}
                  />
                  <p className="form-hint">{desc.length}/280 caractères</p>
                </div>
              </div>

              <button className="btn-next" disabled={!code.trim() || submitting} onClick={handleSubmit}>
                {submitting ? (
                  <>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation:"spin 1s linear infinite" }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                    Publication...
                  </>
                ) : (
                  <>
                    Publier mon annonce
                    <span style={{ background:"rgba(255,255,255,.2)", borderRadius:100, padding:"1px 8px", fontSize:".75rem" }}>+{XP_GAIN} XP</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* ── Step 3 : succès ── */}
          {step === 3 && (
            <div className="success-wrap">
              <div className="success-icon">🎉</div>
              <h2 className="success-title">Annonce publiée !</h2>
              <p className="success-sub">Ton code {selectedCompany?.name} est maintenant visible par toute la communauté.</p>
              <div className="success-xp">+{XP_GAIN} XP gagnés ⚡</div>
              <div className="success-actions">
                <a href="/codes" className="btn-success-primary">Voir les codes</a>
                <button className="btn-success-ghost" onClick={()=>{ setStep(1); setSelectedCompany(null); setCode(""); setDesc(""); }}>
                  Publier un autre code
                </button>
                <a href="/profil" className="btn-success-ghost">Mon profil</a>
              </div>
            </div>
          )}

        </div>

        {/* Tip box */}
        {step < 3 && (
          <div style={{ marginTop:"1.25rem", background:"rgba(255,255,255,.02)", border:"1px solid rgba(255,255,255,.06)", borderRadius:14, padding:"1rem 1.25rem", display:"flex", alignItems:"flex-start", gap:10 }}>
            <span style={{ fontSize:"1rem", flexShrink:0 }}>💡</span>
            <p style={{ fontSize:".78rem", color:"rgba(255,255,255,.35)", lineHeight:1.6 }}>
              Les annonces avec une description claire reçoivent <strong style={{ color:"rgba(255,255,255,.6)" }}>2× plus de clics</strong>.
              Précise le montant offert et les conditions pour maximiser tes parrainages.
            </p>
          </div>
        )}
      </main>
    </>
  );
}