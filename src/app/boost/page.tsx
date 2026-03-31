"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";

// ── Types ──────────────────────────────────────────────────────────────────────
interface Annonce {
  id: string; company: string; code: string;
  category: string; icon: string;
  costPerDay: number; views: number; boosted: boolean; boostDaysLeft?: number;
}

// ── Mock data — remplace par fetch Supabase ───────────────────────────────────
const MOCK_CREDITS = 0.00;
const MOCK_ANNONCES: Annonce[] = [
  { id:"1", company:"Binance",  code:"test3",        category:"Crypto",  icon:"₿",  costPerDay:0.10, views:45,  boosted:false },
  { id:"2", company:"EDF",      code:"EDF-TEST2024", category:"Energie", icon:"⚡", costPerDay:0.10, views:12,  boosted:true, boostDaysLeft:3 },
];

// ── Why boost — arguments ─────────────────────────────────────────────────────
const WHY = [
  { icon:"📈", title:"3× plus de vues",     desc:"Ton annonce remonte en tête de la page /codes automatiquement." },
  { icon:"🏆", title:"Meilleur classement", desc:"Les annonces boostées gagnent plus d'XP et montent dans le classement." },
  { icon:"⚡", title:"Activation immédiate",desc:"Le boost est actif dès la validation, sans délai." },
];

// ── Day selector ──────────────────────────────────────────────────────────────
function DaySelector({ value, onChange, max }: { value:number; onChange:(v:number)=>void; max:number }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
      <button onClick={()=>onChange(Math.max(1,value-1))} style={{ width:28, height:28, borderRadius:8, background:"rgba(255,255,255,.06)", border:"1px solid rgba(255,255,255,.1)", color:"#fff", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1rem", transition:"all .18s" }}
        onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background="rgba(255,255,255,.1)"}
        onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background="rgba(255,255,255,.06)"}>−</button>
      <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:"1rem", color:"#fff", minWidth:24, textAlign:"center" }}>{value}</span>
      <button onClick={()=>onChange(Math.min(max,value+1))} style={{ width:28, height:28, borderRadius:8, background:"rgba(255,255,255,.06)", border:"1px solid rgba(255,255,255,.1)", color:"#fff", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1rem", transition:"all .18s" }}
        onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background="rgba(255,255,255,.1)"}
        onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background="rgba(255,255,255,.06)"}>+</button>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function BoostPage() {
  const [credits]  = useState(MOCK_CREDITS);
  const [annonces] = useState(MOCK_ANNONCES);
  const [days, setDays] = useState<Record<string,number>>( Object.fromEntries(MOCK_ANNONCES.map(a=>[a.id,1])) );
  const [selected, setSelected] = useState<string[]>([]);
  const [success, setSuccess]   = useState(false);

  const toggle = (id:string) => setSelected(s => s.includes(id) ? s.filter(x=>x!==id) : [...s,id]);

  const totalCost = selected.reduce((sum,id) => {
    const a = annonces.find(a=>a.id===id);
    return sum + (a ? a.costPerDay * (days[id]??1) : 0);
  }, 0);

  const canBoost = selected.length > 0 && totalCost <= credits;

  const handleBoost = async () => {
    // TODO: supabase update + Stripe if needed
    await new Promise(r=>setTimeout(r,800));
    setSuccess(true);
  };

  if (success) return (
    <>
      <style>{`*,*::before,*::after{box-sizing:border-box;margin:0;padding:0} body{background:#0A0A0F;color:#e2e8f0;font-family:'DM Sans',sans-serif;min-height:100vh} @keyframes pop{0%{transform:scale(.7);opacity:0}60%{transform:scale(1.1)}100%{transform:scale(1);opacity:1}}`}</style>
      <Navbar activePage="profil" isLoggedIn={true} pseudo="Test3" />
      <div style={{ maxWidth:480, margin:"6rem auto", textAlign:"center", padding:"0 1.5rem" }}>
        <div style={{ fontSize:"3.5rem", animation:"pop .5s ease forwards", display:"inline-block", marginBottom:"1rem" }}>⚡</div>
        <h2 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:"1.75rem", color:"#fff", marginBottom:".5rem" }}>Boost activé !</h2>
        <p style={{ color:"rgba(255,255,255,.4)", fontSize:".875rem", marginBottom:"2rem" }}>
          {selected.length} annonce{selected.length>1?"s":""} boostée{selected.length>1?"s":""} — visible en tête de /codes maintenant.
        </p>
        <div style={{ display:"flex", gap:10, justifyContent:"center" }}>
          <a href="/codes" style={{ display:"inline-flex", alignItems:"center", gap:6, background:"#7c3aed", color:"#fff", border:"none", borderRadius:11, padding:".65rem 1.25rem", fontSize:".875rem", fontWeight:600, textDecoration:"none" }}>Voir mes annonces</a>
          <a href="/profil" style={{ display:"inline-flex", alignItems:"center", gap:6, background:"rgba(255,255,255,.05)", color:"rgba(255,255,255,.6)", border:"1px solid rgba(255,255,255,.1)", borderRadius:11, padding:".65rem 1.25rem", fontSize:".875rem", fontWeight:600, textDecoration:"none" }}>Mon profil</a>
        </div>
      </div>
    </>
  );

  return (
    <>
      <style>{`
        @keyframes shimmer { 0%{opacity:.6}50%{opacity:1}100%{opacity:.6} }
        @keyframes float   { 0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)} }
        @keyframes fadeIn  { from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)} }
        *,*::before,*::after { box-sizing:border-box; margin:0; padding:0; }
        body { background:#0A0A0F; color:#e2e8f0; font-family:'DM Sans',sans-serif; min-height:100vh; }

        .page { max-width:720px; margin:0 auto; padding:3rem 1.5rem 6rem; }

        .page-header { margin-bottom:2.5rem; }
        .header-label { display:inline-flex; align-items:center; gap:6px; font-size:.72rem; font-weight:600; letter-spacing:.1em; text-transform:uppercase; color:#7c3aed; margin-bottom:.75rem; }
        .header-label::before { content:''; width:18px; height:1px; background:#7c3aed; display:block; }
        .page-title { font-family:'Syne',sans-serif; font-weight:800; font-size:clamp(1.5rem,3.5vw,2rem); color:#fff; letter-spacing:-.03em; margin-bottom:.35rem; display:flex; align-items:center; gap:10px; }
        .page-sub { color:rgba(255,255,255,.35); font-size:.875rem; }

        /* Solde banner */
        .solde-banner {
          display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:1rem;
          background:rgba(124,58,237,.07); border:1px solid rgba(124,58,237,.22);
          border-radius:16px; padding:1.1rem 1.5rem; margin-bottom:2rem;
          position:relative; overflow:hidden;
        }
        .solde-banner::before { content:''; position:absolute; top:0; left:0; right:0; height:1px; background:linear-gradient(90deg,transparent,rgba(124,58,237,.5),transparent); }
        .solde-left { display:flex; align-items:center; gap:10px; }
        .solde-icon { font-size:1.5rem; animation:float 3s ease-in-out infinite; }
        .solde-val { font-family:'Syne',sans-serif; font-weight:800; font-size:1.5rem; color:#a78bfa; }
        .solde-lbl { font-size:.75rem; color:rgba(255,255,255,.35); margin-top:1px; }
        .solde-cta { display:inline-flex; align-items:center; gap:6px; background:#7c3aed; color:#fff; border:none; border-radius:10px; padding:.5rem 1rem; font-size:.82rem; font-weight:600; cursor:pointer; transition:all .2s; text-decoration:none; font-family:'DM Sans',sans-serif; }
        .solde-cta:hover { background:#6d28d9; transform:translateY(-1px); box-shadow:0 4px 16px rgba(124,58,237,.35); }

        /* Why boost */
        .why-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:.75rem; margin-bottom:2.5rem; }
        .why-card { background:rgba(255,255,255,.02); border:1px solid rgba(255,255,255,.06); border-radius:16px; padding:1rem; display:flex; flex-direction:column; gap:6px; }
        .why-icon { font-size:1.25rem; margin-bottom:2px; }
        .why-title { font-weight:700; font-size:.82rem; color:#fff; }
        .why-desc { font-size:.72rem; color:rgba(255,255,255,.35); line-height:1.5; }

        /* Section title */
        .section-title { font-family:'Syne',sans-serif; font-weight:800; font-size:1rem; color:#fff; margin-bottom:.875rem; display:flex; align-items:center; gap:8px; }
        .section-count { font-size:.72rem; color:rgba(255,255,255,.3); font-family:'DM Sans',sans-serif; font-weight:400; }

        /* Annonce cards */
        .annonce-card {
          background:rgba(255,255,255,.03); border:1px solid rgba(255,255,255,.07);
          border-radius:16px; padding:1.1rem 1.25rem;
          display:flex; align-items:center; gap:12px;
          cursor:pointer; transition:all .2s; margin-bottom:.625rem;
          animation:fadeIn .3s ease;
          position:relative; overflow:hidden;
        }
        .annonce-card:hover { border-color:rgba(124,58,237,.25); }
        .annonce-card.selected { background:rgba(124,58,237,.08); border-color:rgba(124,58,237,.4); }
        .annonce-card.selected::before { content:''; position:absolute; top:0; left:0; bottom:0; width:3px; background:linear-gradient(180deg,#7c3aed,#a855f7); border-radius:3px 0 0 3px; }
        .annonce-card.boosted-active { border-color:rgba(251,191,36,.3); background:rgba(251,191,36,.04); }

        .annonce-checkbox {
          width:20px; height:20px; border-radius:6px; flex-shrink:0;
          border:1.5px solid rgba(255,255,255,.2); transition:all .18s;
          display:flex; align-items:center; justify-content:center;
        }
        .annonce-card.selected .annonce-checkbox { background:#7c3aed; border-color:#7c3aed; }

        .annonce-icon { width:42px; height:42px; border-radius:12px; background:rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.08); display:flex; align-items:center; justify-content:center; font-size:1.1rem; flex-shrink:0; }
        .annonce-info { flex:1; min-width:0; }
        .annonce-company { font-weight:700; font-size:.9rem; color:#fff; margin-bottom:2px; }
        .annonce-code { font-family:'Courier New',monospace; font-size:.78rem; color:rgba(255,255,255,.35); letter-spacing:.06em; }
        .annonce-tags { display:flex; gap:5px; margin-top:4px; flex-wrap:wrap; }
        .tag { padding:1px 7px; border-radius:100px; font-size:.65rem; font-weight:600; }
        .tag-cat { background:rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.08); color:rgba(255,255,255,.4); }
        .tag-boosted { background:rgba(251,191,36,.12); border:1px solid rgba(251,191,36,.3); color:#fbbf24; display:flex; align-items:center; gap:3px; }
        .tag-views { background:rgba(34,197,94,.08); border:1px solid rgba(34,197,94,.2); color:#4ade80; }

        .annonce-right { display:flex; flex-direction:column; align-items:flex-end; gap:8px; flex-shrink:0; }
        .cost-per-day { font-size:.75rem; color:rgba(255,255,255,.3); }
        .cost-per-day strong { color:#a78bfa; font-family:'Syne',sans-serif; }

        /* Summary */
        .summary-card {
          position:sticky; bottom:24px;
          background:rgba(10,10,15,.92); backdrop-filter:blur(16px);
          border:1px solid rgba(124,58,237,.3); border-radius:18px;
          padding:1.1rem 1.5rem;
          display:flex; align-items:center; justify-content:space-between; gap:1rem;
          flex-wrap:wrap;
          box-shadow:0 8px 32px rgba(124,58,237,.2);
          margin-top:1.5rem;
          transition:all .3s;
          opacity: ${selected.length > 0 ? 1 : 0.5};
        }
        .summary-left { display:flex; flex-direction:column; gap:3px; }
        .summary-detail { font-size:.78rem; color:rgba(255,255,255,.35); }
        .summary-total { font-family:'Syne',sans-serif; font-weight:800; font-size:1.15rem; color:#fff; }
        .summary-total span { color:#a78bfa; }
        .boost-btn {
          display:inline-flex; align-items:center; gap:7px;
          background:#7c3aed; color:#fff; border:none; border-radius:12px;
          padding:.65rem 1.5rem; font-size:.9rem; font-weight:700;
          cursor:pointer; transition:all .2s; font-family:'DM Sans',sans-serif;
          white-space:nowrap;
        }
        .boost-btn:hover:not(:disabled) { background:#6d28d9; transform:translateY(-1px); box-shadow:0 6px 20px rgba(124,58,237,.4); }
        .boost-btn:disabled { opacity:.4; cursor:not-allowed; }
        .no-credits-hint { font-size:.72rem; color:#f87171; margin-top:2px; }

        @media(max-width:600px) {
          .page { padding:2rem 1rem 5rem; }
          .why-grid { grid-template-columns:1fr; }
          .summary-card { flex-direction:column; align-items:stretch; }
          .boost-btn { justify-content:center; }
        }
      `}</style>

      <Navbar activePage="profil" isLoggedIn={true} pseudo="Test3" />

      <main className="page">

        {/* Header */}
        <div className="page-header">
          <div className="header-label">Visibilité</div>
          <h1 className="page-title">
            Booster une annonce
            <span style={{ fontSize:"1.5rem", animation:"float 3s ease-in-out infinite", display:"inline-block" }}>⚡</span>
          </h1>
          <p className="page-sub">Passe en tête de la page /codes et multiplie tes parrainages</p>
        </div>

        {/* Solde */}
        <div className="solde-banner">
          <div className="solde-left">
            <span className="solde-icon">⚡</span>
            <div>
              <p className="solde-val">{credits.toFixed(2)}</p>
              <p className="solde-lbl">crédits disponibles</p>
            </div>
          </div>
          <a href="/credits" className="solde-cta">
            Acheter des crédits
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </a>
        </div>

        {/* Why boost */}
        <div className="why-grid">
          {WHY.map((w,i) => (
            <div key={i} className="why-card">
              <div className="why-icon">{w.icon}</div>
              <p className="why-title">{w.title}</p>
              <p className="why-desc">{w.desc}</p>
            </div>
          ))}
        </div>

        {/* Annonces */}
        <p className="section-title">
          Mes annonces
          <span className="section-count">{annonces.length} annonce{annonces.length>1?"s":""}</span>
        </p>

        {annonces.length === 0 ? (
          <div style={{ textAlign:"center", padding:"3rem", color:"rgba(255,255,255,.25)" }}>
            <p style={{ fontSize:"2rem", marginBottom:".75rem" }}>📋</p>
            <p style={{ fontSize:".875rem" }}>Tu n'as pas encore d'annonce.</p>
            <a href="/publier" style={{ display:"inline-flex", marginTop:"1rem", background:"rgba(124,58,237,.15)", border:"1px solid rgba(124,58,237,.3)", borderRadius:10, padding:".5rem 1rem", color:"#a78bfa", fontSize:".82rem", fontWeight:600, textDecoration:"none" }}>Publier un code</a>
          </div>
        ) : annonces.map(a => (
          <div
            key={a.id}
            className={`annonce-card ${selected.includes(a.id)?"selected":""} ${a.boosted?"boosted-active":""}`}
            onClick={()=>!a.boosted && toggle(a.id)}
            style={{ cursor: a.boosted ? "default" : "pointer" }}
          >
            {/* Checkbox */}
            {!a.boosted && (
              <div className="annonce-checkbox">
                {selected.includes(a.id) && (
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                )}
              </div>
            )}

            {/* Icon */}
            <div className="annonce-icon">{a.icon}</div>

            {/* Info */}
            <div className="annonce-info">
              <p className="annonce-company">{a.company}</p>
              <p className="annonce-code">{a.code}</p>
              <div className="annonce-tags">
                <span className="tag tag-cat">{a.category}</span>
                <span className="tag tag-views">👁 {a.views} vues</span>
                {a.boosted && <span className="tag tag-boosted">⚡ Boost actif — {a.boostDaysLeft}j restants</span>}
              </div>
            </div>

            {/* Right */}
            <div className="annonce-right">
              {a.boosted ? (
                <span style={{ fontSize:".75rem", color:"#fbbf24", fontWeight:600 }}>En cours</span>
              ) : (
                <>
                  <p className="cost-per-day"><strong>{a.costPerDay.toFixed(2)}</strong> crédit/j</p>
                  {selected.includes(a.id) && (
                    <DaySelector
                      value={days[a.id]??1}
                      onChange={v=>setDays(d=>({...d,[a.id]:v}))}
                      max={30}
                    />
                  )}
                  {selected.includes(a.id) && (
                    <p style={{ fontSize:".7rem", color:"rgba(255,255,255,.3)", textAlign:"right" }}>
                      = <strong style={{ color:"#a78bfa" }}>{(a.costPerDay*(days[a.id]??1)).toFixed(2)}</strong> crédits
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        ))}

        {/* Summary sticky */}
        {annonces.some(a=>!a.boosted) && (
          <div className="summary-card">
            <div className="summary-left">
              <p className="summary-detail">
                {selected.length === 0
                  ? "Sélectionne une annonce à booster"
                  : `${selected.length} annonce${selected.length>1?"s":""} · ${selected.reduce((s,id)=>s+(days[id]??1),0)} jour${selected.reduce((s,id)=>s+(days[id]??1),0)>1?"s":""}`
                }
              </p>
              <p className="summary-total">
                Total : <span>{totalCost.toFixed(2)}</span> crédits
              </p>
              {selected.length > 0 && totalCost > credits && (
                <p className="no-credits-hint">Solde insuffisant — <a href="/credits" style={{ color:"#f87171" }}>recharger</a></p>
              )}
            </div>
            <button className="boost-btn" disabled={!canBoost} onClick={handleBoost}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
              Activer le boost
            </button>
          </div>
        )}

      </main>
    </>
  );
}