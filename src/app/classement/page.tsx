"use client";

import { useState, useEffect, useRef } from "react";
import Navbar from "@/components/Navbar";
import { createClient } from "@/lib/supabase";

// ── Types ──────────────────────────────────────────────────────────────────────
interface Parrain {
  id: string;
  pseudo: string;
  level: string;
  xp: number;
  annonces: number;
  streak: number;
  isMe?: boolean;
}

const NIVEAU_COLOR: Record<string, string> = {
  "Débutant":          "#6366f1",
  "Parrain Bronze":    "#8b5cf6",
  "Parrain Argent":    "#a855f7",
  "Parrain Or":        "#f59e0b",
  "Super Parrain":     "#f97316",
  "Parrain Légendaire":"#ef4444",
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
      <div style={{ position:"relative", width:size, height:size, borderRadius:"50%", background:`linear-gradient(135deg,${isMe?"#7c3aed,#4f46e5":"#1e1b4b,#312e81"})`, border:`2px solid ${isMe?"#7c3aed":"rgba(124,58,237,.3)"}`, display:"flex", alignItems:"center", justifyContent:"center" }}>
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
  return <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:"0.82rem", color:"var(--text-faint)", width:24, textAlign:"center", display:"inline-block" }}>#{rank}</span>;
}

// ── Podium card ───────────────────────────────────────────────────────────────
function PodiumCard({ parrain, config }: { parrain:Parrain; config:typeof PODIUM_CONFIG[0] }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVisible(true), config.rank * 120); return () => clearTimeout(t); }, [config.rank]);
  const color = NIVEAU_COLOR[parrain.level] ?? "#6366f1";

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
        <p style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:"0.95rem", color:"var(--text-strong)", marginBottom:3, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{parrain.pseudo}</p>
        <span style={{ fontSize:"0.65rem", fontWeight:700, background:`${color}22`, color, padding:"2px 8px", borderRadius:100, border:`1px solid ${color}44`, display:"inline-block", marginBottom:"0.75rem" }}>{parrain.level}</span>
        <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
          <p style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:"1.4rem", color:"var(--text-strong)", lineHeight:1 }}>{parrain.xp.toLocaleString("fr-FR")}</p>
          <p style={{ fontSize:"0.7rem", color:"var(--text-dim)" }}>XP total</p>
        </div>
        <div style={{ display:"flex", justifyContent:"center", gap:12, marginTop:"0.75rem", paddingTop:"0.75rem", borderTop:"1px solid var(--border)" }}>
          <span style={{ fontSize:"0.7rem", color:"var(--text-dim)" }}>📋 {parrain.annonces}</span>
          <span style={{ fontSize:"0.7rem", color:"var(--text-dim)" }}>🔥 {parrain.streak}</span>
        </div>
      </div>
      <div style={{ marginTop:"0.625rem", background:"var(--bg-card-md)", border:"1px solid var(--border-md)", borderRadius:100, padding:"3px 14px", fontSize:"0.72rem", color:"var(--text-muted)", fontWeight:600 }}>#{config.rank}</div>
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

  const color = NIVEAU_COLOR[parrain.level] ?? "#6366f1";

  return (
    <div ref={ref} style={{ display:"flex", alignItems:"center", gap:12, padding:"0.875rem 1.25rem", background:parrain.isMe?"rgba(124,58,237,.07)":"var(--bg-card)", border:`1px solid ${parrain.isMe?"rgba(124,58,237,.3)":"var(--border)"}`, borderRadius:14, opacity:visible?1:0, transform:visible?"translateX(0)":"translateX(-12px)", transition:"all 0.35s ease", position:"relative", overflow:"hidden" }}>
      {parrain.isMe && <div style={{ position:"absolute", top:0, left:0, bottom:0, width:2, background:"linear-gradient(180deg,#7c3aed,#a855f7)", borderRadius:"2px 0 0 2px" }} />}
      <div style={{ width:28, textAlign:"center", flexShrink:0 }}>
        <RankBadge rank={rank} />
      </div>
      <Avatar pseudo={parrain.pseudo} size={36} isMe={parrain.isMe} />
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
          <p style={{ fontWeight:700, color:"var(--text-strong)", fontSize:"0.875rem", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{parrain.pseudo}</p>
          {parrain.isMe && <span style={{ fontSize:"0.62rem", fontWeight:700, background:"rgba(124,58,237,.25)", color:"#a78bfa", padding:"1px 6px", borderRadius:100, border:"1px solid rgba(124,58,237,.3)", flexShrink:0 }}>Toi</span>}
        </div>
        <span style={{ fontSize:"0.68rem", fontWeight:600, color }}>{parrain.level}</span>
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:16, flexShrink:0 }}>
        <div style={{ textAlign:"center", display:"flex", flexDirection:"column", gap:1 }}>
          <span style={{ fontSize:"0.72rem", color:"var(--text-faint)" }}>Annonces</span>
          <span style={{ fontWeight:700, color:"var(--text-muted)", fontSize:"0.82rem" }}>{parrain.annonces}</span>
        </div>
        <div style={{ textAlign:"center", display:"flex", flexDirection:"column", gap:1 }}>
          <span style={{ fontSize:"0.72rem", color:"var(--text-faint)" }}>Streak</span>
          <span style={{ fontWeight:700, color:"var(--text-muted)", fontSize:"0.82rem" }}>🔥 {parrain.streak}</span>
        </div>
        <div style={{ textAlign:"right", minWidth:70 }}>
          <p style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:"1rem", color:parrain.isMe?"#a78bfa":"var(--text-strong)" }}>{parrain.xp.toLocaleString("fr-FR")}</p>
          <p style={{ fontSize:"0.68rem", color:"var(--text-faint)" }}>XP</p>
        </div>
      </div>
    </div>
  );
}

// ── Skeleton row ──────────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:12, padding:"0.875rem 1.25rem", background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:14 }}>
      <div style={{ width:28, height:20, background:"var(--border-md)", borderRadius:4 }} />
      <div style={{ width:36, height:36, borderRadius:"50%", background:"var(--border-md)" }} />
      <div style={{ flex:1 }}>
        <div style={{ width:"40%", height:12, background:"var(--border-md)", borderRadius:4, marginBottom:6 }} />
        <div style={{ width:"25%", height:10, background:"var(--border)", borderRadius:4 }} />
      </div>
      <div style={{ width:60, height:20, background:"var(--border-md)", borderRadius:4 }} />
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function ClassementPage() {
  const [parrains, setParrains] = useState<Parrain[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    async function fetchClassement() {
      const supabase = createClient();

      // Utilisateur connecté
      const { data: { user } } = await supabase.auth.getUser();

      // Users triés par XP
      const { data: users } = await supabase
        .from("users")
        .select("id, pseudo, xp, level, streak_days")
        .order("xp", { ascending: false })
        .limit(50);

      if (!users) { setLoading(false); return; }

      // Compter les annonces par user
      const { data: countRows } = await supabase
        .from("announcements")
        .select("user_id");

      const annonceCount: Record<string, number> = {};
      for (const row of countRows ?? []) {
        annonceCount[row.user_id] = (annonceCount[row.user_id] ?? 0) + 1;
      }

      const data: Parrain[] = users.map(u => ({
        id:      u.id,
        pseudo:  u.pseudo ?? "Anonyme",
        level:   u.level  ?? "Débutant",
        xp:      u.xp     ?? 0,
        annonces: annonceCount[u.id] ?? 0,
        streak:  u.streak_days ?? 0,
        isMe:    user?.id === u.id,
      }));

      setParrains(data);
      setLoading(false);
    }

    fetchClassement();
  }, []);

  const sorted = [...parrains].sort((a,b) => b.xp - a.xp || b.annonces - a.annonces);
  const top3   = sorted.slice(0, 3);
  const rest   = sorted.slice(3);
  const meRank = sorted.findIndex(p => p.isMe) + 1;
  const me     = sorted.find(p => p.isMe);

  const podiumOrder = [
    { parrain: top3[1], config: PODIUM_CONFIG[0] },
    { parrain: top3[0], config: PODIUM_CONFIG[1] },
    { parrain: top3[2], config: PODIUM_CONFIG[2] },
  ];

  const totalAnnonces = parrains.reduce((a,p) => a + p.annonces, 0);
  const totalXP       = parrains.reduce((a,p) => a + p.xp, 0);

  return (
    <>
      <style>{`
        @keyframes spin    { to { transform:rotate(360deg); } }
        @keyframes shimmer { 0%{opacity:.5} 50%{opacity:1} 100%{opacity:.5} }
        @keyframes float   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
        *,*::before,*::after { box-sizing:border-box; margin:0; padding:0; }
        body { background:var(--bg); color:var(--text); font-family:'DM Sans',sans-serif; min-height:100vh; }

        .page { max-width:800px; margin:0 auto; padding:3rem 1.5rem 6rem; }

        .page-header { text-align:center; margin-bottom:3rem; }
        .header-label { display:inline-flex; align-items:center; gap:6px; font-size:.72rem; font-weight:600; letter-spacing:.1em; text-transform:uppercase; color:#7c3aed; margin-bottom:.75rem; }
        .header-label::before { content:''; display:block; width:18px; height:1px; background:#7c3aed; }
        .header-label::after  { content:''; display:block; width:18px; height:1px; background:#7c3aed; }
        .page-title { font-family:'Syne',sans-serif; font-weight:800; font-size:clamp(1.75rem,4vw,2.5rem); color:var(--text-strong); letter-spacing:-.03em; margin-bottom:.5rem; }
        .page-sub { color:var(--text-dim); font-size:.88rem; display:flex; align-items:center; justify-content:center; gap:8px; }
        .live-dot { width:7px; height:7px; border-radius:50%; background:#22c55e; box-shadow:0 0 8px #22c55e; animation:shimmer 2s ease-in-out infinite; flex-shrink:0; }

        .stats-banner { display:grid; grid-template-columns:repeat(2,1fr); gap:.75rem; margin-bottom:3rem; max-width:360px; margin-left:auto; margin-right:auto; }
        .stat-b { background:var(--bg-card); border:1px solid var(--border); border-radius:16px; padding:1.1rem; text-align:center; }
        .stat-b-val { font-family:'Syne',sans-serif; font-weight:800; font-size:1.5rem; color:var(--text-strong); }
        .stat-b-lbl { font-size:.72rem; color:var(--text-dim); margin-top:2px; }

        .podium-wrap { display:flex; align-items:flex-end; gap:1rem; margin-bottom:2.5rem; }

        .list-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:.875rem; }
        .list-title { font-family:'Syne',sans-serif; font-weight:700; font-size:1rem; color:var(--text-muted); }
        .list-rows { display:flex; flex-direction:column; gap:.5rem; }

        .my-rank-banner { position:sticky; bottom:24px; margin-top:1.5rem; background:var(--bg-nav); backdrop-filter:blur(16px); border:1px solid rgba(124,58,237,.35); border-radius:16px; padding:.875rem 1.25rem; display:flex; align-items:center; justify-content:space-between; gap:12px; box-shadow:0 8px 32px rgba(124,58,237,.2); }
        .my-rank-left { display:flex; align-items:center; gap:10px; }
        .my-rank-label { font-size:.78rem; color:var(--text-dim); }
        .my-rank-pos { font-family:'Syne',sans-serif; font-weight:800; font-size:1.25rem; color:#a78bfa; }

        .cta-section { margin-top:3rem; position:relative; overflow:hidden; background:rgba(124,58,237,.08); border:1px solid rgba(124,58,237,.25); border-radius:24px; padding:3rem 2rem; text-align:center; }
        .cta-glow { position:absolute; top:-60px; left:50%; transform:translateX(-50%); width:300px; height:300px; background:radial-gradient(circle,rgba(124,58,237,.2),transparent 70%); pointer-events:none; }
        .cta-title { font-family:'Syne',sans-serif; font-weight:800; font-size:1.5rem; color:var(--text-strong); margin-bottom:.5rem; letter-spacing:-.02em; }
        .cta-sub { color:var(--text-muted); font-size:.875rem; margin-bottom:1.5rem; }
        .cta-btn { display:inline-flex; align-items:center; gap:8px; background:#7c3aed; color:#fff; border:none; padding:.75rem 1.75rem; border-radius:12px; font-size:.9rem; font-weight:700; cursor:pointer; transition:all .2s; text-decoration:none; font-family:'DM Sans',sans-serif; }
        .cta-btn:hover { background:#6d28d9; transform:translateY(-2px); box-shadow:0 6px 24px rgba(124,58,237,.4); }

        @media(max-width:600px) {
          .page { padding:2rem 1rem 5rem; }
          .podium-wrap { gap:.5rem; }
          .stats-banner { grid-template-columns:repeat(2,1fr); }
        }
      `}</style>

      <Navbar activePage="classement" />

      <main className="page">

        {/* Header */}
        <header className="page-header">
          <div className="header-label">Compétition</div>
          <h1 className="page-title">🏆 Classement des parrains</h1>
          <p className="page-sub">
            <span className="live-dot" />
            Les meilleurs parrains de la communauté
          </p>
        </header>

        {/* Stats banner */}
        <div className="stats-banner">
          <div className="stat-b">
            <div className="stat-b-val">{loading ? "—" : <Counter target={totalAnnonces} />}</div>
            <div className="stat-b-lbl">Annonces publiées</div>
          </div>
          <div className="stat-b">
            <div className="stat-b-val">{loading ? "—" : <Counter target={totalXP} />}</div>
            <div className="stat-b-lbl">XP distribués</div>
          </div>
        </div>

        {/* Rewards banner */}
        <div style={{ position:"relative", overflow:"hidden", background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:20, padding:"1.5rem", marginBottom:"2.5rem" }}>
          <div style={{ position:"absolute", inset:0, background:"radial-gradient(circle at 50% 0%,rgba(124,58,237,.1),transparent 65%)", pointerEvents:"none" }} />
          <div style={{ position:"absolute", top:0, left:0, right:0, height:1, background:"linear-gradient(90deg,transparent,rgba(124,58,237,.5),transparent)" }} />
          <div style={{ position:"relative", zIndex:1 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:"1.1rem" }}>
              <span style={{ fontSize:"1rem" }}>🎁</span>
              <p style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:"0.95rem", color:"var(--text-strong)" }}>Récompenses du mois</p>
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
                        <span style={{ fontSize:"0.75rem", color:"var(--text-muted)", lineHeight:1.4 }}>{rw}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Podium */}
        {loading ? (
          <div style={{ display:"flex", alignItems:"flex-end", gap:"1rem", marginBottom:"2.5rem" }}>
            {[2,1,3].map(r => (
              <div key={r} style={{ flex:1, background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:20, padding:"1.5rem 1rem", animation:"shimmer 1.5s ease-in-out infinite", height: r===1?180:150 }} />
            ))}
          </div>
        ) : top3.length >= 3 ? (
          <div className="podium-wrap">
            {podiumOrder.map(({ parrain, config }) => parrain && (
              <PodiumCard key={parrain.id} parrain={parrain} config={config} />
            ))}
          </div>
        ) : null}

        {/* Rest of list */}
        <div>
          <div className="list-header">
            <span className="list-title">Suite du classement</span>
            <span style={{ fontSize:".75rem", color:"var(--text-faint)" }}>Top {sorted.length}</span>
          </div>
          <div className="list-rows">
            {loading
              ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
              : rest.map((p, i) => <RankRow key={p.id} parrain={p} rank={i + 4} index={i} />)
            }
          </div>
        </div>

        {/* My rank sticky banner (if not in top 3) */}
        {!loading && me && meRank > 3 && (
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
                <p style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:"1rem", color:"var(--text-strong)" }}>{me.xp}</p>
                <p style={{ fontSize:"0.65rem", color:"var(--text-faint)" }}>XP</p>
              </div>
              {meRank > 1 && sorted[meRank-2] && (
                <div style={{ textAlign:"right" }}>
                  <p style={{ fontSize:"0.72rem", color:"var(--text-dim)" }}>Pour passer #{meRank-1}</p>
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
          <p className="cta-sub">Publie tes codes, gagne de l&rsquo;XP, et décroche le top 3.</p>
          <a href="/publier" className="cta-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Publier mon code
          </a>
        </div>

      </main>
    </>
  );
}
