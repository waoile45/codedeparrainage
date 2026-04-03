"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";

// ── Types ──────────────────────────────────────────────────────────────────────
interface Avis {
  id: string;
  reviewer: string;
  company: string;
  rating: number;
  comment: string;
  date: string;
  xpGained?: number;
}

// ── Mock data — remplace par fetch Supabase ───────────────────────────────────
const MOCK_AVIS: Avis[] = [
  { id:"1", reviewer:"Manou",      company:"Winamax",    rating:5, comment:"Parrainage validé rapidement, très réactif. Je recommande !", date:"26 mars 2026", xpGained:20 },
  { id:"2", reviewer:"AlexCrypto", company:"Binance",    rating:4, comment:"Tout s'est bien passé, code fonctionnel.", date:"20 mars 2026", xpGained:20 },
  { id:"3", reviewer:"LucaF",      company:"Boursobank", rating:3, comment:"Correct mais un peu long à répondre.", date:"15 mars 2026" },
];

const MOCK_STATS = {
  moyenne: 4.0,
  total: 3,
  distribution: { 5:1, 4:1, 3:1, 2:0, 1:0 },
};

// ── Star rating ───────────────────────────────────────────────────────────────
function Stars({ rating, interactive=false, onChange }: { rating:number; interactive?:boolean; onChange?:(v:number)=>void }) {
  const [hover, setHover] = useState(0);
  return (
    <div style={{ display:"flex", gap:2 }}>
      {[1,2,3,4,5].map(n => {
        const filled = interactive ? (hover||rating) >= n : rating >= n;
        return (
          <span
            key={n}
            onClick={()=>interactive && onChange?.(n)}
            onMouseEnter={()=>interactive && setHover(n)}
            onMouseLeave={()=>interactive && setHover(0)}
            style={{ fontSize: interactive?"1.4rem":"1rem", cursor:interactive?"pointer":"default", transition:"transform .15s", display:"inline-block", transform: interactive && (hover||rating)>=n ? "scale(1.15)" : "scale(1)" }}
          >
            {filled ? "⭐" : "☆"}
          </span>
        );
      })}
    </div>
  );
}

// ── Rating distribution bar ───────────────────────────────────────────────────
function DistBar({ stars, count, total }: { stars:number; count:number; total:number }) {
  const pct = total > 0 ? (count/total)*100 : 0;
  const [w, setW] = useState(0);
  useState(() => { setTimeout(()=>setW(pct), 300); });
  return (
    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
      <span style={{ fontSize:".72rem", color:"rgba(255,255,255,.4)", width:12, textAlign:"right", flexShrink:0 }}>{stars}</span>
      <span style={{ fontSize:".75rem" }}>⭐</span>
      <div style={{ flex:1, height:5, background:"rgba(255,255,255,.06)", borderRadius:100, overflow:"hidden" }}>
        <div style={{ height:"100%", width:`${pct}%`, background:"linear-gradient(90deg,#7c3aed,#a855f7)", borderRadius:100, transition:"width 1s ease" }} />
      </div>
      <span style={{ fontSize:".72rem", color:"rgba(255,255,255,.3)", width:16, textAlign:"right", flexShrink:0 }}>{count}</span>
    </div>
  );
}

// ── Avis card ─────────────────────────────────────────────────────────────────
function AvisCard({ avis, index }: { avis:Avis; index:number }) {
  const colors = ["#7c3aed","#4f46e5","#0891b2","#059669","#d97706"];
  const color  = colors[avis.reviewer.charCodeAt(0) % colors.length];
  return (
    <div style={{ background:"rgba(255,255,255,.03)", border:"1px solid rgba(255,255,255,.07)", borderRadius:16, padding:"1.25rem", display:"flex", flexDirection:"column", gap:"0.75rem", animation:`fadeIn .3s ease ${index*0.06}s both` }}>
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:10 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:36, height:36, borderRadius:"50%", background:`linear-gradient(135deg,${color},${color}99)`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
            <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:".9rem", color:"#fff" }}>{avis.reviewer[0].toUpperCase()}</span>
          </div>
          <div>
            <p style={{ fontWeight:700, fontSize:".875rem", color:"#fff" }}>{avis.reviewer}</p>
            <p style={{ fontSize:".72rem", color:"rgba(255,255,255,.3)" }}>{avis.date}</p>
          </div>
        </div>
        <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:4 }}>
          <Stars rating={avis.rating} />
          <span style={{ fontSize:".68rem", background:"rgba(124,58,237,.12)", border:"1px solid rgba(124,58,237,.25)", color:"#a78bfa", padding:"1px 7px", borderRadius:100 }}>{avis.company}</span>
        </div>
      </div>
      {avis.comment && (
        <p style={{ fontSize:".82rem", color:"rgba(255,255,255,.6)", lineHeight:1.6, borderLeft:"2px solid rgba(124,58,237,.3)", paddingLeft:"0.75rem" }}>
          "{avis.comment}"
        </p>
      )}
      {avis.xpGained && (
        <div style={{ display:"flex", alignItems:"center", gap:5, fontSize:".72rem", color:"#4ade80" }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
          +{avis.xpGained} XP gagnés grâce à cet avis
        </div>
      )}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function AvisPage() {
  const [tab, setTab]       = useState<"recus"|"laisser">("recus");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [codeId, setCodeId]   = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted]   = useState(false);

  const handleSubmit = async () => {
    if (!rating || !codeId) return;
    setSubmitting(true);
    try {
      await fetch("/api/reviews", {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ announcementId:codeId, rating, comment }),
      });
      setSubmitted(true);
    } catch {}
    setSubmitting(false);
  };

  return (
    <>
      <style>{`
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)} }
        @keyframes spin   { to{transform:rotate(360deg)} }
        *,*::before,*::after { box-sizing:border-box; margin:0; padding:0; }
        body { background:#0A0A0F; color:#e2e8f0; font-family:'DM Sans',sans-serif; min-height:100vh; }
        .page { max-width:700px; margin:0 auto; padding:3rem 1.5rem 6rem; }

        .page-header { margin-bottom:2rem; }
        .header-label { display:inline-flex; align-items:center; gap:6px; font-size:.72rem; font-weight:600; letter-spacing:.1em; text-transform:uppercase; color:#7c3aed; margin-bottom:.75rem; }
        .header-label::before { content:''; width:18px; height:1px; background:#7c3aed; display:block; }
        .page-title { font-family:'Syne',sans-serif; font-weight:800; font-size:clamp(1.5rem,3.5vw,2rem); color:#fff; letter-spacing:-.03em; margin-bottom:.35rem; }
        .page-sub { color:rgba(255,255,255,.35); font-size:.875rem; }

        /* Tabs */
        .tabs { display:flex; gap:4px; background:rgba(255,255,255,.03); border:1px solid rgba(255,255,255,.07); border-radius:14px; padding:4px; margin-bottom:2rem; }
        .tab { flex:1; padding:.55rem 1rem; border-radius:10px; border:none; background:transparent; color:rgba(255,255,255,.45); font-size:.855rem; font-weight:500; cursor:pointer; transition:all .18s; font-family:'DM Sans',sans-serif; }
        .tab:hover { color:rgba(255,255,255,.75); }
        .tab.active { background:rgba(124,58,237,.18); border:1px solid rgba(124,58,237,.3); color:#fff; font-weight:600; }

        /* Stats card */
        .stats-card { background:rgba(255,255,255,.03); border:1px solid rgba(255,255,255,.07); border-radius:20px; padding:1.5rem; display:flex; gap:2rem; align-items:center; margin-bottom:1.5rem; flex-wrap:wrap; }
        .stats-left { display:flex; flex-direction:column; align-items:center; gap:4px; flex-shrink:0; }
        .stats-avg { font-family:'Syne',sans-serif; font-weight:800; font-size:3rem; color:#fff; line-height:1; }
        .stats-total { font-size:.75rem; color:rgba(255,255,255,.3); }
        .stats-right { flex:1; display:flex; flex-direction:column; gap:5px; min-width:160px; }

        /* Form */
        .form-card { background:rgba(255,255,255,.03); border:1px solid rgba(255,255,255,.07); border-radius:20px; padding:1.75rem; display:flex; flex-direction:column; gap:1.25rem; }
        .form-group { display:flex; flex-direction:column; gap:7px; }
        .form-label { font-size:.78rem; font-weight:600; color:rgba(255,255,255,.45); letter-spacing:.04em; }
        .form-input { background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.08); border-radius:12px; padding:.75rem 1rem; color:#fff; font-size:.9rem; font-family:'DM Sans',sans-serif; outline:none; transition:all .2s; width:100%; }
        .form-input:focus { border-color:rgba(124,58,237,.4); background:rgba(124,58,237,.05); box-shadow:0 0 0 3px rgba(124,58,237,.1); }
        .form-input::placeholder { color:rgba(255,255,255,.25); }
        .form-textarea { resize:vertical; min-height:100px; }
        .form-hint { font-size:.7rem; color:rgba(255,255,255,.22); }

        .submit-btn { display:flex; align-items:center; justify-content:center; gap:7px; width:100%; background:#7c3aed; color:#fff; border:none; border-radius:13px; padding:.875rem; font-size:.9rem; font-weight:700; cursor:pointer; transition:all .2s; font-family:'DM Sans',sans-serif; }
        .submit-btn:hover:not(:disabled) { background:#6d28d9; transform:translateY(-1px); box-shadow:0 6px 20px rgba(124,58,237,.4); }
        .submit-btn:disabled { opacity:.4; cursor:not-allowed; }

        /* Success */
        .success-wrap { text-align:center; padding:2.5rem 1rem; }
        .success-icon { font-size:3rem; display:inline-block; margin-bottom:1rem; animation:bounce .5s ease; }
        @keyframes bounce { 0%{transform:scale(.5)}60%{transform:scale(1.2)}100%{transform:scale(1)} }

        /* Empty */
        .empty { text-align:center; padding:3rem; color:rgba(255,255,255,.25); }
        .empty-icon { font-size:2.5rem; margin-bottom:.75rem; }

        @media(max-width:600px) {
          .page { padding:2rem 1rem 5rem; }
          .stats-card { flex-direction:column; align-items:flex-start; gap:1rem; }
        }
      `}</style>

      <Navbar activePage="profil" />

      <main className="page">

        {/* Header */}
        <div className="page-header">
          <div className="header-label">Réputation</div>
          <h1 className="page-title">Avis ⭐</h1>
          <p className="page-sub">Consulte les avis reçus et laisse un avis sur un parrain</p>
        </div>

        {/* Tabs */}
        <div className="tabs">
          <button className={`tab ${tab==="recus"?"active":""}`}   onClick={()=>setTab("recus")}>
            Avis reçus {MOCK_AVIS.length > 0 && `(${MOCK_AVIS.length})`}
          </button>
          <button className={`tab ${tab==="laisser"?"active":""}`} onClick={()=>setTab("laisser")}>
            Laisser un avis
          </button>
        </div>

        {/* ── Tab: Avis reçus ── */}
        {tab === "recus" && (
          <>
            {MOCK_AVIS.length > 0 ? (
              <>
                {/* Stats */}
                <div className="stats-card">
                  <div className="stats-left">
                    <span className="stats-avg">{MOCK_STATS.moyenne.toFixed(1)}</span>
                    <Stars rating={Math.round(MOCK_STATS.moyenne)} />
                    <span className="stats-total">{MOCK_STATS.total} avis</span>
                  </div>
                  <div className="stats-right">
                    {[5,4,3,2,1].map(n => (
                      <DistBar key={n} stars={n} count={MOCK_STATS.distribution[n as keyof typeof MOCK_STATS.distribution]} total={MOCK_STATS.total} />
                    ))}
                  </div>
                </div>

                {/* List */}
                <div style={{ display:"flex", flexDirection:"column", gap:".75rem" }}>
                  {MOCK_AVIS.map((avis,i) => <AvisCard key={avis.id} avis={avis} index={i} />)}
                </div>
              </>
            ) : (
              <div className="empty">
                <div className="empty-icon">⭐</div>
                <p style={{ fontSize:".875rem", marginBottom:".5rem" }}>Aucun avis reçu pour l'instant</p>
                <p style={{ fontSize:".78rem" }}>Les avis apparaîtront ici après tes premiers parrainages.</p>
              </div>
            )}
          </>
        )}

        {/* ── Tab: Laisser un avis ── */}
        {tab === "laisser" && (
          <div className="form-card">
            {submitted ? (
              <div className="success-wrap">
                <div className="success-icon">🎉</div>
                <h2 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:"1.25rem", color:"#fff", marginBottom:".5rem" }}>Avis envoyé !</h2>
                <p style={{ color:"rgba(255,255,255,.4)", fontSize:".875rem", marginBottom:"1.5rem" }}>Merci pour ton retour. Le parrain a été notifié.</p>
                <button onClick={()=>{ setSubmitted(false); setRating(0); setComment(""); setCodeId(""); }}
                  style={{ background:"rgba(124,58,237,.15)", border:"1px solid rgba(124,58,237,.3)", borderRadius:10, padding:".5rem 1.25rem", color:"#a78bfa", fontSize:".82rem", fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
                  Laisser un autre avis
                </button>
              </div>
            ) : (
              <>
                <div style={{ background:"rgba(251,191,36,.07)", border:"1px solid rgba(251,191,36,.2)", borderRadius:12, padding:".75rem 1rem", display:"flex", alignItems:"flex-start", gap:8 }}>
                  <span style={{ flexShrink:0 }}>💡</span>
                  <p style={{ fontSize:".78rem", color:"rgba(255,255,255,.5)", lineHeight:1.5 }}>
                    Tu peux laisser un avis après avoir utilisé un code de parrainage. Un avis ≥ 4⭐ rapporte <strong style={{ color:"#fbbf24" }}>+20 XP</strong> au parrain.
                  </p>
                </div>

                <div className="form-group">
                  <label className="form-label">ID de l'annonce</label>
                  <input className="form-input" placeholder="Ex : 12345" value={codeId} onChange={e=>setCodeId(e.target.value)} />
                  <p className="form-hint">Visible sur la page de l'annonce ou dans tes messages</p>
                </div>

                <div className="form-group">
                  <label className="form-label">Ta note</label>
                  <Stars rating={rating} interactive onChange={setRating} />
                  {rating > 0 && (
                    <p style={{ fontSize:".75rem", color:"rgba(255,255,255,.35)", marginTop:4 }}>
                      {["","Très décevant","Décevant","Correct","Bien","Excellent !"][rating]}
                    </p>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Commentaire
                    <span style={{ fontSize:".7rem", color:"rgba(255,255,255,.2)", fontWeight:400, marginLeft:6 }}>optionnel</span>
                  </label>
                  <textarea className="form-input form-textarea" placeholder="Décris ton expérience avec ce parrain..." value={comment} onChange={e=>setComment(e.target.value)} maxLength={400} />
                  <p className="form-hint">{comment.length}/400 caractères</p>
                </div>

                <button className="submit-btn" disabled={!rating || !codeId || submitting} onClick={handleSubmit}>
                  {submitting
                    ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation:"spin 1s linear infinite" }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                    : "Envoyer mon avis"
                  }
                </button>
              </>
            )}
          </div>
        )}

      </main>
    </>
  );
}