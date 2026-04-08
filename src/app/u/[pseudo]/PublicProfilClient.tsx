"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import { createClient } from "@/lib/supabase";

// ── Types ──────────────────────────────────────────────────────────────────────
interface PublicUser {
  id: string;
  pseudo: string;
  avatar_url: string | null;
  bio: string | null;
  xp: number;
  level: string;
  streak_days: number;
  created_at: string;
}

interface PublicAnnonce {
  id: string;
  code: string;
  description: string | null;
  bumps_today: number;
  created_at: string;
  company: { name: string; slug: string; category: string; referral_bonus_description: string | null } | null;
}

interface ReceivedReview {
  id: string;
  raterPseudo: string;
  companyName: string;
  rating: number | null;
  tags: string[];
  comment: string | null;
  createdAt: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const XP_THRESHOLDS = [
  { max: 100,   next: "Parrain Bronze" },
  { max: 500,   next: "Parrain Argent" },
  { max: 2000,  next: "Parrain Or" },
  { max: 5000,  next: "Super Parrain" },
  { max: 10000, next: "Parrain Légendaire" },
  { max: 99999, next: "" },
];
function getXpInfo(xp: number) {
  const t = XP_THRESHOLDS.find(t => xp < t.max) ?? XP_THRESHOLDS[XP_THRESHOLDS.length - 1];
  return { xpNext: t.max, xpPct: Math.min((xp / t.max) * 100, 100) };
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
}

function timeAgo(dateStr: string) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
  if (diff === 0) return "Aujourd'hui";
  if (diff === 1) return "Hier";
  if (diff < 30) return `Il y a ${diff}j`;
  const m = Math.floor(diff / 30);
  if (m < 12) return `Il y a ${m} mois`;
  return new Date(dateStr).toLocaleDateString("fr-FR", { day:"numeric", month:"short", year:"numeric" });
}

const NIVEAU_COLORS: Record<string, string> = {
  Débutant:"#6366f1", "Parrain Bronze":"#cd7f32", "Parrain Argent":"#8b5cf6",
  "Parrain Or":"#f59e0b", "Super Parrain":"#a855f7", "Parrain Légendaire":"#ec4899",
};

const TAGS_INFO: Record<string, { label:string; emoji:string; positive:boolean }> = {
  code_ok:         { label:"Code fonctionnel",     emoji:"✅", positive:true  },
  reponse_rapide:  { label:"Réponse rapide",        emoji:"⚡", positive:true  },
  bon_gain:        { label:"Bon gain",              emoji:"🎁", positive:true  },
  sympa:           { label:"Parrain sympa",         emoji:"🤝", positive:true  },
  annonce_complete:{ label:"Annonce complète",      emoji:"📋", positive:true  },
  code_expire:     { label:"Code expiré",           emoji:"⏰", positive:false },
  code_invalide:   { label:"Code invalide",         emoji:"❌", positive:false },
  desc_inexacte:   { label:"Description inexacte",  emoji:"⚠️", positive:false },
  inactif:         { label:"Parrain inactif",       emoji:"💤", positive:false },
};

// ── Sub-components ─────────────────────────────────────────────────────────────
function Avatar({ pseudo, avatarUrl, size=72 }: { pseudo:string; avatarUrl:string|null; size?:number }) {
  const [err, setErr] = useState(false);
  const niveauColor = "#7c3aed";
  if (avatarUrl && !err) {
    return (
      <div style={{ width:size, height:size, borderRadius:"50%", border:"3px solid rgba(124,58,237,.4)", overflow:"hidden", flexShrink:0 }}>
        <img src={avatarUrl} alt={pseudo} style={{ width:"100%", height:"100%", objectFit:"cover" }} onError={() => setErr(true)} />
      </div>
    );
  }
  return (
    <div style={{ width:size, height:size, borderRadius:"50%", background:`linear-gradient(135deg,${niveauColor},${niveauColor}99)`, border:"3px solid rgba(124,58,237,.4)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
      <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:size*.4, color:"#fff" }}>{pseudo[0]?.toUpperCase()}</span>
    </div>
  );
}

function CopyButton({ code }: { code:string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={async () => { try { await navigator.clipboard.writeText(code); } catch {} setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      style={{ display:"inline-flex", alignItems:"center", gap:5, padding:".35rem .75rem", background:copied?"rgba(34,197,94,.15)":"rgba(124,58,237,.15)", border:`1px solid ${copied?"rgba(34,197,94,.35)":"rgba(124,58,237,.35)"}`, borderRadius:8, color:copied?"#4ade80":"#a78bfa", fontSize:".78rem", fontWeight:600, cursor:"pointer", transition:"all .2s", fontFamily:"'DM Sans',sans-serif", flexShrink:0 }}>
      {copied
        ? <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>Copié !</>
        : <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>Copier</>
      }
    </button>
  );
}

function BrandLogo({ slug, brand }: { slug:string; brand:string }) {
  const [error, setError] = useState(false);
  const domain = slug.includes(".") ? slug : `${slug}.com`;
  if (error) return <div style={{ width:36, height:36, borderRadius:10, background:"rgba(124,58,237,.15)", border:"1px solid rgba(124,58,237,.2)", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:".875rem", color:"#a78bfa", flexShrink:0 }}>{brand[0]?.toUpperCase()}</div>;
  return (
    <div style={{ width:36, height:36, borderRadius:10, background:"#fff", border:"1px solid rgba(255,255,255,.15)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, overflow:"hidden" }}>
      <img src={`https://www.google.com/s2/favicons?domain=${domain}&sz=64`} alt={brand} onError={() => setError(true)} style={{ width:"100%", height:"100%", objectFit:"contain", borderRadius:8, padding:2 }} />
    </div>
  );
}

function ReviewStars({ value }: { value:number }) {
  return (
    <span style={{ display:"inline-flex", gap:2 }}>
      {[1,2,3,4,5].map(n => (
        <svg key={n} width="12" height="12" viewBox="0 0 24 24" fill={value>=n?"#f59e0b":"none"} stroke="#f59e0b" strokeWidth="1.5">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ))}
    </span>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function PublicProfilClient() {
  const params = useParams();
  const pseudo = decodeURIComponent(params.pseudo as string);
  const supabase = createClient();

  const [user, setUser] = useState<PublicUser | null>(null);
  const [annonces, setAnnonces] = useState<PublicAnnonce[]>([]);
  const [reviews, setReviews] = useState<ReceivedReview[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setCurrentUserId(data.user?.id ?? null));
    loadProfile();
  }, [pseudo]);

  async function loadProfile() {
    setLoading(true);

    const { data: userData } = await supabase
      .from("users")
      .select("id, pseudo, avatar_url, bio, xp, level, streak_days, created_at")
      .eq("pseudo", pseudo)
      .single();

    if (!userData) { setNotFound(true); setLoading(false); return; }
    setUser(userData as PublicUser);

    const [{ data: annData }, { data: ratingRows }] = await Promise.all([
      supabase.from("announcements")
        .select("id, code, description, bumps_today, created_at, companies(name, slug, category, referral_bonus_description)")
        .eq("user_id", userData.id)
        .order("bumps_today", { ascending: false })
        .order("created_at", { ascending: false }),
      supabase.from("user_ratings")
        .select("id, rater_id, rating, tags, comment, created_at, announcement_id")
        .eq("ratee_id", userData.id)
        .order("created_at", { ascending: false }),
    ]);

    setAnnonces((annData ?? []).map((a: any) => ({
      id: a.id, code: a.code, description: a.description,
      bumps_today: a.bumps_today, created_at: a.created_at,
      company: a.companies ?? null,
    })));

    if (ratingRows && ratingRows.length > 0) {
      const raterIds = [...new Set(ratingRows.map((r: any) => r.rater_id))];
      const annIds   = [...new Set(ratingRows.map((r: any) => r.announcement_id))];
      const [{ data: raters }, { data: anns }] = await Promise.all([
        supabase.from("users").select("id, pseudo").in("id", raterIds),
        supabase.from("announcements").select("id, companies(name)").in("id", annIds),
      ]);
      const userMap: Record<string,string> = {};
      (raters ?? []).forEach((u:any) => { userMap[u.id] = u.pseudo; });
      const annMap: Record<string,string> = {};
      (anns ?? []).forEach((a:any) => { annMap[a.id] = a.companies?.name ?? ""; });

      setReviews(ratingRows.map((r:any) => ({
        id: r.id,
        raterPseudo: userMap[r.rater_id] ?? "Anonyme",
        companyName: annMap[r.announcement_id] ?? "",
        rating: r.rating ?? null,
        tags: r.tags ?? [],
        comment: r.comment ?? null,
        createdAt: r.created_at,
      })));
    }

    setLoading(false);
  }

  const niveauColor = NIVEAU_COLORS[user?.level ?? ""] ?? "#6366f1";
  const { xpNext, xpPct } = user ? getXpInfo(user.xp) : { xpNext: 100, xpPct: 0 };
  const withRating = reviews.filter(r => r.rating !== null);
  const avgRating  = withRating.length ? withRating.reduce((s,r) => s+(r.rating??0),0)/withRating.length : null;
  const isOwnProfile = currentUserId !== null && user !== null && currentUserId === user.id;

  return (
    <>
      <style>{`
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        body{background:#0A0A0F;color:#e2e8f0;font-family:'DM Sans',sans-serif;min-height:100vh}
        .wrap{max-width:760px;margin:0 auto;padding:2.5rem 1.5rem 6rem}
        .hero{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:24px;padding:2rem;margin-bottom:1.5rem;position:relative;overflow:hidden}
        .hero::before{content:'';position:absolute;top:-60px;left:-60px;width:240px;height:240px;background:radial-gradient(circle,rgba(124,58,237,.14),transparent 70%);pointer-events:none}
        .section{background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.07);border-radius:20px;padding:1.5rem;margin-bottom:1.25rem}
        .section-title{font-family:'Syne',sans-serif;font-weight:800;font-size:1rem;color:#fff;letter-spacing:-.02em;margin-bottom:.25rem}
        .section-sub{font-size:.78rem;color:rgba(255,255,255,.3);margin-bottom:1.25rem}
        .code-card{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:14px;padding:1rem 1.125rem;display:flex;align-items:center;gap:12px;transition:border-color .2s}
        .code-card:hover{border-color:rgba(124,58,237,.25)}
        .code-mono{font-family:'Courier New',monospace;font-size:.9rem;font-weight:700;color:#fff;letter-spacing:.06em}
        .tag-pill{font-size:.7rem;padding:2px 8px;border-radius:100px;border:1px solid;display:inline-flex;align-items:center;gap:3px}
        .review-card{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.07);border-radius:12px;padding:.875rem 1rem;margin-bottom:8px}
        .stat-box{flex:1;min-width:90px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.07);border-radius:12px;padding:.875rem;text-align:center}
        .not-found{text-align:center;padding:6rem 2rem;color:rgba(255,255,255,.3)}
        @media(max-width:600px){.wrap{padding:1.5rem 1rem 4rem}.hero{padding:1.25rem}}
      `}</style>

      <Navbar />

      <main className="wrap">
        {loading ? (
          <div style={{ textAlign:"center", padding:"4rem", color:"rgba(255,255,255,.25)" }}>Chargement…</div>
        ) : notFound ? (
          <div className="not-found">
            <div style={{ fontSize:"2.5rem", marginBottom:"1rem" }}>👤</div>
            <p style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:"1.1rem", color:"rgba(255,255,255,.5)", marginBottom:".5rem" }}>Profil introuvable</p>
            <p style={{ fontSize:".875rem" }}>Aucun utilisateur avec le pseudo &laquo;&nbsp;{pseudo}&nbsp;&raquo;</p>
            <a href="/codes" style={{ display:"inline-flex", marginTop:"1.5rem", padding:".6rem 1.25rem", background:"rgba(124,58,237,.15)", border:"1px solid rgba(124,58,237,.3)", borderRadius:10, color:"#a78bfa", fontSize:".82rem", fontWeight:600, textDecoration:"none" }}>← Parcourir les codes</a>
          </div>
        ) : user && (
          <>
            {/* ── Hero ── */}
            <div className="hero">
              {isOwnProfile && (
                <a href="/profil" style={{ position:"absolute", top:16, right:16, display:"inline-flex", alignItems:"center", gap:5, padding:".35rem .75rem", background:"rgba(124,58,237,.15)", border:"1px solid rgba(124,58,237,.3)", borderRadius:8, color:"#a78bfa", fontSize:".75rem", fontWeight:600, textDecoration:"none" }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  Modifier mon profil
                </a>
              )}
              <div style={{ display:"flex", alignItems:"center", gap:"1.25rem", flexWrap:"wrap", position:"relative", zIndex:1 }}>
                <Avatar pseudo={user.pseudo} avatarUrl={user.avatar_url} size={76} />
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10, flexWrap:"wrap", marginBottom:5 }}>
                    <h1 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:"1.4rem", color:"#fff", letterSpacing:"-.02em" }}>{user.pseudo}</h1>
                    <span style={{ fontSize:".72rem", fontWeight:700, padding:"3px 10px", borderRadius:100, background:`${niveauColor}22`, color:niveauColor, border:`1px solid ${niveauColor}44` }}>{user.level}</span>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap", fontSize:".78rem", color:"rgba(255,255,255,.35)", marginBottom:".75rem" }}>
                    <span style={{ color:"#a78bfa", fontWeight:700 }}>{user.xp} XP</span>
                    <span>·</span>
                    <span>Membre depuis {formatDate(user.created_at)}</span>
                    {user.streak_days > 0 && <><span>·</span><span>{user.streak_days} 🔥</span></>}
                  </div>
                  {/* XP bar */}
                  <div style={{ height:4, background:"rgba(255,255,255,.07)", borderRadius:100, overflow:"hidden", maxWidth:280 }}>
                    <div style={{ height:"100%", width:`${xpPct}%`, background:"linear-gradient(90deg,#7c3aed,#a855f7)", borderRadius:100, transition:"width 1s ease" }} />
                  </div>
                </div>
              </div>
              {user.bio && (
                <p style={{ marginTop:"1rem", fontSize:".875rem", color:"rgba(255,255,255,.5)", lineHeight:1.6, position:"relative", zIndex:1, borderTop:"1px solid rgba(255,255,255,.06)", paddingTop:"1rem" }}>
                  {user.bio}
                </p>
              )}
              {/* Stats */}
              <div style={{ display:"flex", gap:10, marginTop:"1.25rem", flexWrap:"wrap" }}>
                <div className="stat-box">
                  <p style={{ fontSize:"1.4rem", fontWeight:800, fontFamily:"'Syne',sans-serif", color:"#fff", lineHeight:1 }}>{annonces.length}</p>
                  <p style={{ fontSize:".68rem", color:"rgba(255,255,255,.3)", marginTop:4 }}>Annonce{annonces.length>1?"s":""}</p>
                </div>
                <div className="stat-box">
                  <p style={{ fontSize:"1.4rem", fontWeight:800, fontFamily:"'Syne',sans-serif", color:"#fff", lineHeight:1 }}>{reviews.length}</p>
                  <p style={{ fontSize:".68rem", color:"rgba(255,255,255,.3)", marginTop:4 }}>Avis reçus</p>
                </div>
                {avgRating !== null && (
                  <div className="stat-box">
                    <p style={{ fontSize:"1.4rem", fontWeight:800, fontFamily:"'Syne',sans-serif", color:"#f59e0b", lineHeight:1 }}>{avgRating.toFixed(1)}</p>
                    <p style={{ fontSize:".68rem", color:"rgba(255,255,255,.3)", marginTop:4 }}>Note moy.</p>
                  </div>
                )}
              </div>
            </div>

            {/* ── Annonces ── */}
            <div className="section">
              <p className="section-title">Codes de parrainage</p>
              <p className="section-sub">{annonces.length} code{annonces.length>1?"s":""} publié{annonces.length>1?"s":""}</p>
              {annonces.length === 0 ? (
                <p style={{ fontSize:".825rem", color:"rgba(255,255,255,.25)", textAlign:"center", padding:"1.5rem 0" }}>Aucune annonce publiée.</p>
              ) : (
                <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                  {annonces.map(a => (
                    <div key={a.id} className="code-card">
                      {a.company && <BrandLogo slug={a.company.slug} brand={a.company.name} />}
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
                          <span style={{ fontWeight:700, fontSize:".875rem", color:"rgba(255,255,255,.85)" }}>{a.company?.name ?? "—"}</span>
                          {a.company?.referral_bonus_description && (
                            <span style={{ fontSize:".7rem", color:"#16a34a", background:"rgba(34,197,94,.1)", border:"1px solid rgba(34,197,94,.2)", borderRadius:6, padding:"1px 7px" }}>{a.company.referral_bonus_description}</span>
                          )}
                        </div>
                        <div style={{ display:"flex", alignItems:"center", gap:6, marginTop:4 }}>
                          <span style={{ width:5, height:5, borderRadius:"50%", background:"#7c3aed", boxShadow:"0 0 5px #7c3aed", flexShrink:0 }} />
                          <span className="code-mono">{a.code}</span>
                        </div>
                      </div>
                      <div style={{ display:"flex", alignItems:"center", gap:8, flexShrink:0 }}>
                        {currentUserId && currentUserId !== user.id && (
                          <a href={`/messages?to=${user.id}&annonce=${a.id}`}
                            style={{ display:"inline-flex", alignItems:"center", gap:4, padding:".35rem .625rem", background:"rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.1)", borderRadius:8, color:"rgba(255,255,255,.45)", fontSize:".75rem", fontWeight:500, textDecoration:"none", transition:"all .18s" }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                          </a>
                        )}
                        <CopyButton code={a.code} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ── Avis reçus ── */}
            {reviews.length > 0 && (
              <div className="section">
                <p className="section-title">Avis reçus</p>
                <p className="section-sub">{reviews.length} avis · {avgRating !== null ? `${avgRating.toFixed(1)}/5` : "pas encore noté"}</p>
                <div>
                  {reviews.map(r => (
                    <div key={r.id} className="review-card">
                      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom: (r.tags.length||r.comment) ? ".5rem" : 0 }}>
                        <div style={{ width:28, height:28, borderRadius:"50%", background:"rgba(124,58,237,.2)", border:"1px solid rgba(124,58,237,.3)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                          <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:".7rem", color:"#a78bfa" }}>{r.raterPseudo[0]?.toUpperCase()}</span>
                        </div>
                        <div style={{ flex:1 }}>
                          <div style={{ display:"flex", alignItems:"center", gap:7, flexWrap:"wrap" }}>
                            <span style={{ fontWeight:600, fontSize:".82rem", color:"rgba(255,255,255,.8)" }}>{r.raterPseudo}</span>
                            {r.companyName && <span style={{ fontSize:".68rem", color:"#a78bfa", background:"rgba(124,58,237,.1)", border:"1px solid rgba(124,58,237,.2)", borderRadius:100, padding:"1px 7px" }}>{r.companyName}</span>}
                            {r.rating !== null && <ReviewStars value={r.rating} />}
                          </div>
                          <p style={{ fontSize:".68rem", color:"rgba(255,255,255,.2)", marginTop:1 }}>{timeAgo(r.createdAt)}</p>
                        </div>
                      </div>
                      {r.tags.length > 0 && (
                        <div style={{ display:"flex", flexWrap:"wrap", gap:4, marginBottom:r.comment?".5rem":0 }}>
                          {r.tags.map(tag => {
                            const info = TAGS_INFO[tag]; if (!info) return null;
                            return <span key={tag} className="tag-pill" style={{ borderColor:info.positive?"rgba(34,197,94,.3)":"rgba(239,68,68,.3)", background:info.positive?"rgba(34,197,94,.07)":"rgba(239,68,68,.06)", color:info.positive?"#4ade80":"#f87171" }}>{info.emoji} {info.label}</span>;
                          })}
                        </div>
                      )}
                      {r.comment && <p style={{ fontSize:".8rem", color:"rgba(255,255,255,.45)", fontStyle:"italic", borderLeft:"2px solid rgba(255,255,255,.07)", paddingLeft:".625rem" }}>&ldquo;{r.comment}&rdquo;</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </>
  );
}
