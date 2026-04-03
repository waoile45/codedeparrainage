"use client";

import { useState, useEffect, useRef } from "react";
import Navbar from "@/components/Navbar";

// ── Types ──────────────────────────────────────────────────────────────────────
interface Parrain {
  id: string;
  pseudo: string;
  niveau: "Débutant" | "Confirmé" | "Expert" | "Légende";
  xp: number;
  annonces: number;
  streak: number;
  isMe?: boolean;
}

// ── Mock data — remplace par fetch Supabase ───────────────────────────────────
const MOCK_DATA: Parrain[] = [
  { id:"1", pseudo:"AlexCrypto",   niveau:"Légende",  xp:2840, annonces:24, streak:32 },
  { id:"2", pseudo:"SarahBoost",   niveau:"Expert",   xp:1920, annonces:18, streak:14 },
  { id:"3", pseudo:"MaxParrain",   niveau:"Expert",   xp:1540, annonces:15, streak:9  },
  { id:"4", pseudo:"LucaFinance",  niveau:"Confirmé", xp:980,  annonces:11, streak:7  },
  { id:"5", pseudo:"EmmaCash",     niveau:"Confirmé", xp:760,  annonces:8,  streak:5  },
  { id:"6", pseudo:"ThomasXP",     niveau:"Confirmé", xp:640,  annonces:7,  streak:4  },
  { id:"7", pseudo:"JulieCode",    niveau:"Débutant", xp:420,  annonces:5,  streak:3  },
  { id:"8", pseudo:"PierreTop",    niveau:"Débutant", xp:310,  annonces:4,  streak:2  },
  { id:"9", pseudo:"TestParrain",  niveau:"Débutant", xp:2,    annonces:2,  streak:2  },
  { id:"10",pseudo:"PaulParrain",  niveau:"Débutant", xp:2,    annonces:0,  streak:0  },
  { id:"11",pseudo:"Test3",        niveau:"Débutant", xp:2,    annonces:1,  streak:2, isMe:true },
];

const NIVEAU_COLOR: Record<string, string> = {
  Débutant: "#6366f1",
  Confirmé: "#8b5cf6",
  Expert:   "#a855f7",
  Légende:  "#f59e0b",
};

const PODIUM_CONFIG = [
  { rank:2, scale:"scale-95", top:"mt-8",  glow:"rgba(156,163,175,.25)", border:"rgba(156,163,175,.35)", bg:"rgba(156,163,175,.08)", crown:"🥈", label:"Argent" },
  { rank:1, scale:"scale-100",top:"mt-0",  glow:"rgba(251,191,36,.3)",   border:"rgba(251,191,36,.45)", bg:"rgba(251,191,36,.08)",   crown:"👑", label:"Or" },
  { rank:3, scale:"scale-90", top:"mt-12", glow:"rgba(180,83,9,.25)",    border:"rgba(180,83,9,.35)",   bg:"rgba(180,83,9,.08)",     crown:"🥉", label:"Bronze" },
];

// ── Animated counter ──────────────────────────────────────────────────────────
function Counter({ target, duration=800 }: { target:number; duration?:number }) {
  const [v, setV] = useState(0);
  const ref = useRef(false);
  useEffect(() => {
    if (ref.current) return; ref.current = true;
    const steps = 30;
    const inc = target / steps;
    let cur = 0;
    const t = setInterval(() => {
      cur = Math.min(cur + inc, target);
      setV(Math.round(cur));
      if (cur >= target) clearInterval(t);
    }, duration / steps);
    return () => clearInterval(t);
  }, [target, duration]);
  return <>{v.toLocaleString("fr-FR")}</>;
}

// ── Avatar ────────────────────────────────────────────────────────────────────
function Avatar({ pseudo, size=44, isMe=false }: { pseudo:string; size?:number; isMe?:boolean }) {
  return (
    <div style={{ position:"relative", width:size, height:size, flexShrink:0 }}>
      {isMe && <div style={{ position:"absolute", inset:-2, borderRadius:"50%", background:"conic-gradient(#7c3aed,#a855f7,#7c3aed)", animation:"spin 4s linear infinite" }} />}
      <div style={{ position:"relative", width:size, height:size, borderRadius:"50%", background:`linear-gradient(135deg,${isMe?"#7c3aed,#4f46e5":"#1e1b4b,#312e81"})`, border:`2px solid ${isMe?"#7c3aed":"rgba(255,255,255,.1)"}`, display:"flex", alignItems:"center", justifyContent:"center" }}>
        <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:size*.38, color:"#fff" }}>{pseudo[0]?.toUpperCase()}</span>
      </div>
    </div>
  );
}

// ── Rank badge ────────────────────────────────────────────────────────────────
function RankBadge({ rank }: { rank:number }) {
  if (rank === 1) return <span style={{ fontSize:"1.1rem" }}>🥇</span>;
  if (rank === 2) return <span style={{ fontSize:"1.1rem" }}>🥈</span>;
  if (rank === 3) return <span style={{ fontSize:"1.1rem" }}>🥉</span>;
  return <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:"0.82rem", color:"rgba(255,255,255,.3)", width:24, textAlign:"center", display:"inline-block" }}>#{rank}</span>;
}

// ── Podium card ───────────────────────────────────────────────────────────────
function PodiumCard({ parrain, config }: { parrain:Parrain; config:typeof PODIUM_CONFIG[0] }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVisible(true), config.rank * 120); return () => clearTimeout(t); }, []);

  return (
    <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", opacity:visible?1:0, transform:visible?"translateY(0)":"translateY(20px)", transition:"all 0.5s ease" }} className={config.top}>
      <div style={{ fontSize:"1.5rem", marginBottom:"0.5rem" }}>{config.crown}</div>
      <div style={{ position:"relative", width:"100%", background:config.bg, border:`1px solid ${config.border}`, borderRadius:20, padding:"1.5rem 1rem", textAlign:"center", boxShadow:`0 8px 32px ${config.glow}` }}>
        {config.rank === 1 && (
          <div style={{ position:"absolute", top:0, left:0, right:0, height:1, background:"linear-gradient(90deg,transparent,rgba(251,191,36,.6),transparent)", borderRadius:"20px 20px 0 0" }} />
        )}
        <div style={{ display:"flex", justifyContent:"center", marginBottom:"0.75rem" }}>
          <Avatar pseudo={parrain.pseudo} size={52} isMe={parrain.isMe} />
        </div>
        <p style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:"0.95rem", color:"#fff", marginBottom:3, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{parrain.pseudo}</p>
        <span style={{ fontSize:"0.65rem", fontWeight:700, background:`${NIVEAU_COLOR[parrain.niveau]}22`, color:NIVEAU_COLOR[parrain.niveau], padding:"2px 8px", borderRadius:100, border:`1px solid ${NIVEAU_COLOR[parrain.niveau]}44`, display:"inline-block", marginBottom:"0.75rem" }}>{parrain.niveau}</span>
        <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
          <p style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:"1.4rem", color:"#fff", lineHeight:1 }}>{parrain.xp.toLocaleString("fr-FR")}</p>
          <p style={{ fontSize:"0.7rem", color:"rgba(255,255,255,.35)" }}>XP total</p>
        </div>
        <div style={{ display:"flex", justifyContent:"center", gap:12, marginTop:"0.75rem", paddingTop:"0.75rem", borderTop:"1px solid rgba(255,255,255,.07)" }}>
          <span style={{ fontSize:"0.7rem", color:"rgba(255,255,255,.3)" }}>📋 {parrain.annonces}</span>
          <span style={{ fontSize:"0.7rem", color:"rgba(255,255,255,.3)" }}>🔥 {parrain.streak}</span>
        </div>
      </div>
      <div style={{ marginTop:"0.625rem", background:"rgba(255,255,255,.05)", border:"1px solid rgba(255,255,255,.08)", borderRadius:100, padding:"3px 14px", fontSize:"0.72rem", color:"rgba(255,255,255,.45)", fontWeight:600 }}>#{config.rank}</div>
    </div>
  );
}

// ── Row ───────────────────────────────────────────────────────────────────────
function RankRow({ parrain, rank, index }: { parrain:Parrain; rank:number; index:number }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setTimeout(() => setVisible(true), index * 40); obs.disconnect(); } }, { threshold:0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [index]);

  return (
    <div ref={ref} style={{ display:"flex", alignItems:"center", gap:12, padding:"0.875rem 1.25rem", background:parrain.isMe?"rgba(124,58,237,.07)":"rgba(255,255,255,.02)", border:`1px solid ${parrain.isMe?"rgba(124,58,237,.3)":"rgba(255,255,255,.06)"}`, borderRadius:14, opacity:visible?1:0, transform:visible?"translateX(0)":"translateX(-12px)", transition:"all 0.35s ease", position:"relative", overflow:"hidden" }}>
      {parrain.isMe && <div style={{ position:"absolute", top:0, left:0, bottom:0, width:2, background:"linear-gradient(180deg,#7c3aed,#a855f7)", borderRadius:"2px 0 0 2px" }} />}
      <div style={{ width:28, textAlign:"center", flexShrink:0 }}>
        <RankBadge rank={rank} />
      </div>
      <Avatar pseudo={parrain.pseudo} size={36} isMe={parrain.isMe} />
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
          <p style={{ fontWeight:700, color:parrain.isMe?"#fff":"rgba(255,255,255,.85)", fontSize:"0.875rem", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{parrain.pseudo}</p>
          {parrain.isMe && <span style={{ fontSize:"0.62rem", fontWeight:700, background:"rgba(124,58,237,.25)", color:"#a78bfa", padding:"1px 6px", borderRadius:100, border:"1px solid rgba(124,58,237,.3)", flexShrink:0 }}>Toi</span>}
        </div>
        <span style={{ fontSize:"0.68rem", fontWeight:600, color:NIVEAU_COLOR[parrain.niveau] }}>{parrain.niveau}</span>
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:16, flexShrink:0 }}>
        <div style={{ textAlign:"center", display:"flex", flexDirection:"column", gap:1 }}>
          <span style={{ fontSize:"0.72rem", color:"rgba(255,255,255,.25)" }}>Annonces</span>
          <span style={{ fontWeight:700, color:"rgba(255,255,255,.6)", fontSize:"0.82rem" }}>{parrain.annonces}</span>
        </div>
        <div style={{ textAlign:"center", display:"flex", flexDirection:"column", gap:1 }}>
          <span style={{ fontSize:"0.72rem", color:"rgba(255,255,255,.25)" }}>Streak</span>
          <span style={{ fontWeight:700, color:"rgba(255,255,255,.6)", fontSize:"0.82rem" }}>🔥 {parrain.streak}</span>
        </div>
        <div style={{ textAlign:"right", minWidth:70 }}>
          <p style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:"1rem", color:parrain.isMe?"#a78bfa":"#fff" }}>{parrain.xp.toLocaleString("fr-FR")}</p>
          <p style={{ fontSize:"0.68rem", color:"rgba(255,255,255,.3)" }}>XP</p>
        </div>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function ClassementPage() {
  const sorted = [...MOCK_DATA].sort((a,b) => b.xp - a.xp || b.annonces - a.annonces);
  const top3   = sorted.slice(0, 3);
  const rest   = sorted.slice(3);
  const meRank = sorted.findIndex(p => p.isMe) + 1;
  const me     = sorted.find(p => p.isMe);

  // podium order: 2nd left, 1st center, 3rd right
  const podiumOrder = [
    { parrain: top3[1], config: PODIUM_CONFIG[0] },
    { parrain: top3[0], config: PODIUM_CONFIG[1] },
    { parrain: top3[2], config: PODIUM_CONFIG[2] },
  ];

  return (
    <>
      <style>{`
        @keyframes spin    { to { transform:rotate(360deg); } }
        @keyframes shimmer { 0%{opacity:.5} 50%{opacity:1} 100%{opacity:.5} }
        @keyframes float   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
        *,*::before,*::after { box-sizing:border-box; margin:0; padding:0; }
        body { background:#0A0A0F; color:#e2e8f0; font-family:'DM Sans',sans-serif; min-height:100vh; }

        .navbar { position:sticky; top:0; z-index:100; display:flex; align-items:center; justify-content:space-between; padding:0 2rem; height:64px; background:rgba(10,10,15,.88); backdrop-filter:blur(20px); border-bottom:1px solid rgba(124,58,237,.12); }
        .nav-logo { font-family:'Syne',sans-serif; font-weight:800; font-size:1.05rem; color:#fff; text-decoration:none; letter-spacing:-.02em; }
        .nav-logo span { color:#7c3aed; }
        .nav-links { display:flex; align-items:center; gap:.25rem; }
        .nav-link { color:rgba(255,255,255,.5); text-decoration:none; font-size:.85rem; padding:.4rem .75rem; border-radius:8px; transition:all .2s; }
        .nav-link:hover { color:#fff; background:rgba(255,255,255,.06); }
        .nav-link.active { color:#fff; }
        .nav-cta { background:#7c3aed; color:#fff; border:none; padding:.5rem 1.125rem; border-radius:10px; font-size:.875rem; font-weight:600; cursor:pointer; transition:all .2s; text-decoration:none; margin-left:.5rem; }
        .nav-cta:hover { background:#6d28d9; transform:translateY(-1px); box-shadow:0 4px 20px rgba(124,58,237,.4); }

        .page { max-width:800px; margin:0 auto; padding:3rem 1.5rem 6rem; }

        /* header */
        .page-header { text-align:center; margin-bottom:3rem; }
        .header-label { display:inline-flex; align-items:center; gap:6px; font-size:.72rem; font-weight:600; letter-spacing:.1em; text-transform:uppercase; color:#7c3aed; margin-bottom:.75rem; }
        .header-label::before { content:''; display:block; width:18px; height:1px; background:#7c3aed; }
        .header-label::after  { content:''; display:block; width:18px; height:1px; background:#7c3aed; }
        .page-title { font-family:'Syne',sans-serif; font-weight:800; font-size:clamp(1.75rem,4vw,2.5rem); color:#fff; letter-spacing:-.03em; margin-bottom:.5rem; }
        .page-sub { color:rgba(255,255,255,.35); font-size:.88rem; display:flex; align-items:center; justify-content:center; gap:8px; }
        .live-dot { width:7px; height:7px; border-radius:50%; background:#22c55e; box-shadow:0 0 8px #22c55e; animation:shimmer 2s ease-in-out infinite; flex-shrink:0; }

        /* stats banner */
        .stats-banner { display:grid; grid-template-columns:repeat(2,1fr); gap:.75rem; margin-bottom:3rem; max-width:360px; margin-left:auto; margin-right:auto; }
        .stat-b { background:rgba(255,255,255,.03); border:1px solid rgba(255,255,255,.07); border-radius:16px; padding:1.1rem; text-align:center; }
        .stat-b-val { font-family:'Syne',sans-serif; font-weight:800; font-size:1.5rem; color:#fff; }
        .stat-b-lbl { font-size:.72rem; color:rgba(255,255,255,.35); margin-top:2px; }

        /* podium */
        .podium-wrap { display:flex; align-items:flex-end; gap:1rem; margin-bottom:2.5rem; }

        /* list */
        .list-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:.875rem; }
        .list-title { font-family:'Syne',sans-serif; font-weight:700; font-size:1rem; color:rgba(255,255,255,.7); }
        .list-rows { display:flex; flex-direction:column; gap:.5rem; }

        /* my rank sticky */
        .my-rank-banner { position:sticky; bottom:24px; margin-top:1.5rem; background:rgba(10,10,15,.92); backdrop-filter:blur(16px); border:1px solid rgba(124,58,237,.35); border-radius:16px; padding:.875rem 1.25rem; display:flex; align-items:center; justify-content:space-between; gap:12px; box-shadow:0 8px 32px rgba(124,58,237,.2); }
        .my-rank-left { display:flex; align-items:center; gap:10px; }
        .my-rank-label { font-size:.78rem; color:rgba(255,255,255,.4); }
        .my-rank-pos { font-family:'Syne',sans-serif; font-weight:800; font-size:1.25rem; color:#a78bfa; }

        /* CTA */
        .cta-section { margin-top:3rem; position:relative; overflow:hidden; background:rgba(124,58,237,.08); border:1px solid rgba(124,58,237,.25); border-radius:24px; padding:3rem 2rem; text-align:center; }
        .cta-glow { position:absolute; top:-60px; left:50%; transform:translateX(-50%); width:300px; height:300px; background:radial-gradient(circle,rgba(124,58,237,.2),transparent 70%); pointer-events:none; }
        .cta-title { font-family:'Syne',sans-serif; font-weight:800; font-size:1.5rem; color:#fff; margin-bottom:.5rem; letter-spacing:-.02em; }
        .cta-sub { color:rgba(255,255,255,.4); font-size:.875rem; margin-bottom:1.5rem; }
        .cta-btn { display:inline-flex; align-items:center; gap:8px; background:#7c3aed; color:#fff; border:none; padding:.75rem 1.75rem; border-radius:12px; font-size:.9rem; font-weight:700; cursor:pointer; transition:all .2s; text-decoration:none; font-family:'DM Sans',sans-serif; }
        .cta-btn:hover { background:#6d28d9; transform:translateY(-2px); box-shadow:0 6px 24px rgba(124,58,237,.4); }

        @media(max-width:600px) {
          .navbar { padding:0 1rem; }
          .page { padding:2rem 1rem 5rem; }
          .podium-wrap { gap:.5rem; }
          .stats-banner { grid-template-columns:repeat(3,1fr); }
        }
      `}</style>

      {/* Navbar */}
      // classement
      <Navbar activePage="classement" />

      <main className="page">

        {/* Header */}
        <header className="page-header">
          <div className="header-label">Compétition</div>
          <h1 className="page-title">🏆 Classement des parrains</h1>
          <p className="page-sub">
            <span className="live-dot" />
            Les meilleurs parrains de la communauté — mis à jour en temps réel
          </p>
        </header>

        {/* Stats banner */}
        <div className="stats-banner">
          {[
            { val: MOCK_DATA.reduce((a,p)=>a+p.annonces,0), label: "Annonces publiées" },
            { val: MOCK_DATA.reduce((a,p)=>a+p.xp,0), label: "XP distribués" },
          ].map((s,i) => (
            <div key={i} className="stat-b">
              <div className="stat-b-val"><Counter target={s.val} /></div>
              <div className="stat-b-lbl">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Rewards banner */}
        <div style={{ position:"relative", overflow:"hidden", background:"rgba(255,255,255,.02)", border:"1px solid rgba(255,255,255,.07)", borderRadius:20, padding:"1.5rem", marginBottom:"2.5rem" }}>
          <div style={{ position:"absolute", inset:0, background:"radial-gradient(circle at 50% 0%,rgba(124,58,237,.1),transparent 65%)", pointerEvents:"none" }} />
          <div style={{ position:"absolute", top:0, left:0, right:0, height:1, background:"linear-gradient(90deg,transparent,rgba(124,58,237,.5),transparent)" }} />
          <div style={{ position:"relative", zIndex:1 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:"1.1rem" }}>
              <span style={{ fontSize:"1rem" }}>🎁</span>
              <p style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:"0.95rem", color:"#fff" }}>Récompenses du mois</p>
              <span style={{ fontSize:"0.65rem", fontWeight:700, background:"rgba(124,58,237,.2)", color:"#a78bfa", padding:"2px 8px", borderRadius:100, border:"1px solid rgba(124,58,237,.3)", marginLeft:2 }}>Remise le 1er du mois</span>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"0.75rem" }}>
              {[
                { rank:"#1", crown:"🥇", color:"rgba(251,191,36,.9)", bg:"rgba(251,191,36,.07)", border:"rgba(251,191,36,.25)", rewards:["Badge « Top 1 » permanent", "⭐ Tag Parrain du mois (30j)", "5 crédits boost"] },
                { rank:"#2", crown:"🥈", color:"rgba(156,163,175,.8)", bg:"rgba(156,163,175,.05)", border:"rgba(156,163,175,.2)",  rewards:["Badge « Top 2 » permanent", "3 crédits boost"] },
                { rank:"#3", crown:"🥉", color:"rgba(180,83,9,.9)",    bg:"rgba(180,83,9,.06)",   border:"rgba(180,83,9,.22)",    rewards:["Badge « Top 3 » permanent", "1 crédit boost"] },
              ].map((r) => (
                <div key={r.rank} style={{ background:r.bg, border:`1px solid ${r.border}`, borderRadius:14, padding:"1rem" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:"0.625rem" }}>
                    <span style={{ fontSize:"1.1rem" }}>{r.crown}</span>
                    <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:"0.9rem", color:r.color }}>{r.rank}</span>
                  </div>
                  <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
                    {r.rewards.map((rw, i) => (
                      <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:5 }}>
                        <span style={{ color:r.color, fontSize:"0.65rem", marginTop:2, flexShrink:0 }}>✦</span>
                        <span style={{ fontSize:"0.75rem", color:"rgba(255,255,255,.6)", lineHeight:1.4 }}>{rw}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Podium */}
        {top3.length >= 3 && (
          <div className="podium-wrap">
            {podiumOrder.map(({ parrain, config }) => parrain && (
              <PodiumCard key={parrain.id} parrain={parrain} config={config} />
            ))}
          </div>
        )}

        {/* Rest of list */}
        <div>
          <div className="list-header">
            <span className="list-title">Suite du classement</span>
            <span style={{ fontSize:".75rem", color:"rgba(255,255,255,.25)" }}>Top {sorted.length}</span>
          </div>
          <div className="list-rows">
            {rest.map((p, i) => (
              <RankRow key={p.id} parrain={p} rank={i + 4} index={i} />
            ))}
          </div>
        </div>

        {/* My rank sticky banner (if not in top 3) */}
        {me && meRank > 3 && (
          <div className="my-rank-banner">
            <div className="my-rank-left">
              <Avatar pseudo={me.pseudo} size={32} isMe />
              <div>
                <p className="my-rank-label">Ta position</p>
                <p className="my-rank-pos">#{meRank} sur {sorted.length}</p>
              </div>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:16 }}>
              <div style={{ textAlign:"center" }}>
                <p style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:"1rem", color:"#fff" }}>{me.xp}</p>
                <p style={{ fontSize:"0.65rem", color:"rgba(255,255,255,.3)" }}>XP</p>
              </div>
              {meRank > 1 && (
                <div style={{ textAlign:"right" }}>
                  <p style={{ fontSize:"0.72rem", color:"rgba(255,255,255,.35)" }}>Pour passer #{meRank-1}</p>
                  <p style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:"0.875rem", color:"#a78bfa" }}>+{sorted[meRank-2].xp - me.xp + 1} XP</p>
                </div>
              )}
              <a href="/publier" style={{ display:"inline-flex", alignItems:"center", gap:5, background:"rgba(124,58,237,.2)", border:"1px solid rgba(124,58,237,.4)", borderRadius:9, padding:".4rem .875rem", color:"#c4b5fd", fontSize:".78rem", fontWeight:600, textDecoration:"none", transition:"all .2s", whiteSpace:"nowrap" }}>
                Monter ↑
              </a>
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="cta-section">
          <div className="cta-glow" />
          <p style={{ fontSize:"2rem", marginBottom:".75rem", animation:"float 3s ease-in-out infinite", display:"inline-block" }}>🚀</p>
          <h2 className="cta-title">Tu veux grimper dans le classement ?</h2>
          <p className="cta-sub">Publie tes codes, gagne de l'XP, et décroche le top 3.</p>
          <a href="/publier" className="cta-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Publier mon code
          </a>
        </div>

      </main>
    </>
  );
}