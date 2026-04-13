"use client";

import { useState, useEffect, useRef } from "react";
import Navbar from "@/components/Navbar";
import { createClient } from "@/lib/supabase";

type Category = "Tout" | "banque" | "paris" | "cashback" | "energie" | "telephonie" | "crypto" | "assurance" | "shopping";

interface CodeCard {
  id: string;
  userId: string;
  brand: string;
  slug: string;
  description: string;
  reward: string;
  code: string;
  category: string;
  parrain: string;
  niveau: string;
  boosted: boolean;
  avgRating: number;
  ratingCount: number;
  topTag: string;
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

function MiniStars({ avg, count, topTag }: { avg:number; count:number; topTag?:string }) {
  if (count === 0) return <span style={{ fontSize:".72rem", color:"rgba(255,255,255,.18)", fontStyle:"italic" }}>Pas encore noté</span>;
  const tagInfo = topTag ? ALL_TAGS.find(t => t.key === topTag) : null;
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:5, flexWrap:"wrap" }}>
      {avg > 0 && (
        <span style={{ display:"inline-flex", alignItems:"center", gap:2 }}>
          {[1,2,3,4,5].map(n => (
            <svg key={n} width="11" height="11" viewBox="0 0 24 24" fill={avg>=n?"#f59e0b":"none"} stroke="#f59e0b" strokeWidth="1.5">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
          ))}
          <span style={{ fontSize:".72rem", color:"rgba(255,255,255,.4)", marginLeft:2 }}>{avg.toFixed(1)}</span>
        </span>
      )}
      {tagInfo && (
        <span style={{ fontSize:".7rem", color:"rgba(255,255,255,.35)", background:"rgba(255,255,255,.05)", borderRadius:100, padding:"1px 7px", border:"1px solid rgba(255,255,255,.08)" }}>
          {tagInfo.emoji} {tagInfo.label}
        </span>
      )}
      <span style={{ fontSize:".7rem", color:"rgba(255,255,255,.2)" }}>({count} avis)</span>
    </span>
  );
}

const TAGS_POSITIVE = [
  { key:"code_ok",       label:"Code fonctionnel", emoji:"✅" },
  { key:"reponse_rapide",label:"Réponse rapide",   emoji:"⚡" },
  { key:"bon_gain",      label:"Bon gain",          emoji:"🎁" },
  { key:"sympa",         label:"Parrain sympa",     emoji:"🤝" },
  { key:"annonce_complete", label:"Annonce complète", emoji:"📋" },
];
const TAGS_NEGATIVE = [
  { key:"code_expire",   label:"Code expiré",        emoji:"⏰" },
  { key:"code_invalide", label:"Code invalide",       emoji:"❌" },
  { key:"desc_inexacte", label:"Description inexacte",emoji:"⚠️" },
  { key:"inactif",       label:"Parrain inactif",     emoji:"💤" },
];
const ALL_TAGS = [...TAGS_POSITIVE, ...TAGS_NEGATIVE];

interface RatingModalProps { card:CodeCard; onClose:()=>void; onSubmitted:(avg:number,count:number,topTag:string)=>void; }
function RatingModal({ card, onClose, onSubmitted }: RatingModalProps) {  // eslint-disable-line
  const supabase = createClient();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [rating, setRating]   = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone]       = useState(false);
  const [error, setError]     = useState("");
  const [existing, setExisting] = useState<{rating:number; tags:string[]}|null>(null);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("user_ratings").select("rating, tags").eq("rater_id", user.id).eq("announcement_id", card.id).maybeSingle();
      if (data) { setExisting(data); setRating(data.rating ?? 0); setSelectedTags(data.tags ?? []); }
    })();
  }, [card.id]);

  function toggleTag(key: string) {
    setSelectedTags(prev => prev.includes(key) ? prev.filter(t => t !== key) : [...prev, key]);
  }

  async function submit() {
    if (selectedTags.length === 0) { setError("Sélectionne au moins une étiquette."); return; }
    setSending(true); setError("");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setError("Tu dois être connecté pour noter."); setSending(false); return; }
    if (user.id === card.userId) { setError("Tu ne peux pas noter ta propre annonce."); setSending(false); return; }
    const { error: err } = await supabase.from("user_ratings").upsert(
      { rater_id: user.id, ratee_id: card.userId, announcement_id: card.id, rating: rating||null, tags: selectedTags, comment: comment.trim()||null },
      { onConflict: "rater_id,announcement_id" }
    );
    if (err) { setError("Erreur : " + err.message); setSending(false); return; }
    const { data: rows } = await supabase.from("user_ratings").select("rating, tags").eq("announcement_id", card.id);
    const ratings = (rows ?? []).map((r:any)=>r.rating).filter(Boolean);
    const avg = ratings.length ? ratings.reduce((a:number,b:number)=>a+b,0)/ratings.length : 0;
    const tagCounts: Record<string,number> = {};
    (rows ?? []).forEach((r:any) => (r.tags??[]).forEach((t:string) => { tagCounts[t] = (tagCounts[t]??0)+1; }));
    const topTag = Object.entries(tagCounts).sort((a,b)=>b[1]-a[1])[0]?.[0] ?? "";
    onSubmitted(avg, (rows ?? []).length, topTag);
    setDone(true); setSending(false);
  }

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.65)", backdropFilter:"blur(4px)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:"1rem" }} onClick={onClose}>
      <div style={{ background:"var(--bg-card)", border:"1px solid rgba(124,58,237,.3)", borderRadius:24, padding:"1.75rem", maxWidth:460, width:"100%", position:"relative", maxHeight:"90vh", overflowY:"auto" }} onClick={e=>e.stopPropagation()}>
        <button onClick={onClose} style={{ position:"absolute", top:14, right:14, background:"none", border:"none", color:"rgba(255,255,255,.3)", cursor:"pointer", fontSize:"1.25rem", lineHeight:1 }}>×</button>

        {done ? (
          <div style={{ textAlign:"center", padding:"1rem 0" }}>
            <div style={{ fontSize:"2.5rem", marginBottom:".75rem" }}>⭐</div>
            <p style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:"1.1rem", color:"rgba(255,255,255,.9)", marginBottom:".5rem" }}>Avis envoyé !</p>
            <p style={{ color:"rgba(255,255,255,.4)", fontSize:".875rem" }}>Merci pour ton retour.</p>
            <button onClick={onClose} style={{ marginTop:"1.25rem", background:"#7c3aed", color:"#fff", border:"none", borderRadius:12, padding:".7rem 1.5rem", fontWeight:700, fontSize:".875rem", cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>Fermer</button>
          </div>
        ) : (
          <>
            <p style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:"1rem", color:"rgba(255,255,255,.9)", marginBottom:".2rem" }}>
              {existing ? "Modifier ton avis" : "Comment s'est passé le parrainage ?"}
            </p>
            <p style={{ color:"rgba(255,255,255,.35)", fontSize:".8rem", marginBottom:"1.5rem" }}>
              Annonce de <strong style={{ color:"rgba(255,255,255,.65)" }}>{card.parrain}</strong> · {card.brand}
            </p>

            {/* Tags positifs */}
            <p style={{ fontSize:".72rem", fontWeight:700, letterSpacing:".08em", textTransform:"uppercase", color:"rgba(34,197,94,.6)", marginBottom:".6rem" }}>Positif</p>
            <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:"1.25rem" }}>
              {TAGS_POSITIVE.map(t => {
                const active = selectedTags.includes(t.key);
                return (
                  <button key={t.key} type="button" onClick={() => toggleTag(t.key)}
                    style={{ display:"inline-flex", alignItems:"center", gap:5, padding:".35rem .75rem", borderRadius:100, border:`1px solid ${active?"rgba(34,197,94,.5)":"rgba(255,255,255,.1)"}`, background:active?"rgba(34,197,94,.12)":"rgba(255,255,255,.03)", color:active?"#4ade80":"rgba(255,255,255,.5)", fontSize:".8rem", fontWeight:500, cursor:"pointer", transition:"all .15s", fontFamily:"'DM Sans',sans-serif" }}>
                    <span>{t.emoji}</span>{t.label}
                  </button>
                );
              })}
            </div>

            {/* Tags négatifs */}
            <p style={{ fontSize:".72rem", fontWeight:700, letterSpacing:".08em", textTransform:"uppercase", color:"rgba(239,68,68,.6)", marginBottom:".6rem" }}>Négatif</p>
            <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:"1.5rem" }}>
              {TAGS_NEGATIVE.map(t => {
                const active = selectedTags.includes(t.key);
                return (
                  <button key={t.key} type="button" onClick={() => toggleTag(t.key)}
                    style={{ display:"inline-flex", alignItems:"center", gap:5, padding:".35rem .75rem", borderRadius:100, border:`1px solid ${active?"rgba(239,68,68,.4)":"rgba(255,255,255,.1)"}`, background:active?"rgba(239,68,68,.1)":"rgba(255,255,255,.03)", color:active?"#f87171":"rgba(255,255,255,.5)", fontSize:".8rem", fontWeight:500, cursor:"pointer", transition:"all .15s", fontFamily:"'DM Sans',sans-serif" }}>
                    <span>{t.emoji}</span>{t.label}
                  </button>
                );
              })}
            </div>

            {/* Étoiles optionnelles */}
            <p style={{ fontSize:".72rem", fontWeight:700, letterSpacing:".08em", textTransform:"uppercase", color:"rgba(255,255,255,.25)", marginBottom:".75rem" }}>Note globale <span style={{ fontWeight:400, textTransform:"none", letterSpacing:0 }}>(optionnel)</span></p>
            <div style={{ display:"flex", gap:8, marginBottom:"1.25rem" }}>
              {[1,2,3,4,5].map(n => (
                <button key={n} type="button" onClick={() => setRating(r => r===n?0:n)} onMouseEnter={() => setHovered(n)} onMouseLeave={() => setHovered(0)}
                  style={{ background:"none", border:"none", cursor:"pointer", padding:2, transition:"transform .15s", transform:(hovered||rating)>=n?"scale(1.2)":"scale(1)" }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill={(hovered||rating)>=n?"#f59e0b":"none"} stroke={(hovered||rating)>=n?"#f59e0b":"rgba(255,255,255,.2)"} strokeWidth="1.5">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                </button>
              ))}
              {rating > 0 && <button type="button" onClick={() => setRating(0)} style={{ background:"none", border:"none", color:"rgba(255,255,255,.2)", fontSize:".75rem", cursor:"pointer", padding:2 }}>✕</button>}
            </div>

            {/* Commentaire */}
            <textarea value={comment} onChange={e=>setComment(e.target.value)} placeholder="Commentaire (optionnel)…" maxLength={300}
              style={{ width:"100%", background:"rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.08)", borderRadius:12, padding:".75rem 1rem", color:"rgba(255,255,255,.8)", fontSize:".875rem", fontFamily:"'DM Sans',sans-serif", resize:"vertical", minHeight:72, outline:"none", marginBottom:".75rem" }} />

            {error && <p style={{ color:"#f87171", fontSize:".8rem", marginBottom:".75rem" }}>{error}</p>}
            <button onClick={submit} disabled={sending}
              style={{ width:"100%", background:"#7c3aed", color:"#fff", border:"none", borderRadius:12, padding:".8rem", fontWeight:700, fontSize:".875rem", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", opacity:sending?.5:1, transition:"opacity .2s" }}>
              {sending ? "Envoi…" : "Envoyer mon avis"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function CodeCardItem({ card, index, onRate, onContact, onEdit, onDelete, currentUserId }: { card: CodeCard; index: number; onRate:(card:CodeCard)=>void; onContact:(card:CodeCard)=>void; onEdit:(card:CodeCard)=>void; onDelete:(card:CodeCard)=>void; currentUserId:string|null }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setTimeout(() => setVisible(true), index*60); obs.disconnect(); } }, { threshold:0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [index]);
  const niveauColor = NIVEAU_COLORS[card.niveau] ?? "#6366f1";
  const isOwn = currentUserId !== null && currentUserId === card.userId;
  return (
    <div ref={ref} className={`code-card ${card.boosted?"boosted":""} ${isOwn?"own":""} ${visible?"visible":""}`}>
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
      {/* Parrain au-dessus du code */}
      <div className="card-footer" style={{ marginBottom:"0.75rem" }}>
        <div className="parrain-info">
          <div className="parrain-avatar" style={{ background:niveauColor+"33", borderColor:niveauColor+"66" }}>{card.parrain[0]?.toUpperCase()}</div>
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:6 }}>
              <a href={`/u/${encodeURIComponent(card.parrain)}`} className="parrain-name" style={{ textDecoration:"none" }} onClick={e => e.stopPropagation()}>{card.parrain}</a>
              <span className="niveau-badge" style={{ color:niveauColor, borderColor:niveauColor+"44", background:niveauColor+"11" }}>{card.niveau}</span>
            </div>
            <div style={{ marginTop:2 }}><MiniStars avg={card.avgRating} count={card.ratingCount} topTag={card.topTag} /></div>
          </div>
        </div>
        <div className="card-actions">
          {isOwn ? (
            <>
              <button className="action-btn action-btn-own" onClick={() => onEdit(card)} title="Modifier mon annonce">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                Modifier
              </button>
              <button className="action-btn action-btn-delete" onClick={() => onDelete(card)} title="Supprimer mon annonce">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
                Supprimer
              </button>
            </>
          ) : (
            <>
              <button className="action-btn" onClick={() => onContact(card)}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>Contacter</button>
              <button className="action-btn" onClick={() => onRate(card)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                Avis
              </button>
            </>
          )}
        </div>
      </div>
      <div className="code-row">
        <div className="code-display">
          <span className="code-dot" />
          <code className={`code-text ${card.code.startsWith("http") ? "code-url" : ""}`}>{card.code}</code>
        </div>
        <CopyButton code={card.code} />
      </div>
    </div>
  );
}

export default function CodesClient() {
  const PAGE_SIZE = 20;
  const [codes, setCodes]           = useState<CodeCard[]>([]);
  const [loading, setLoading]       = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore]       = useState(false);
  const [page, setPage]             = useState(0);
  const [search, setSearch]         = useState("");
  const [activeCategory, setActiveCategory] = useState<Category>("Tout");
  const [sort, setSort]             = useState<"popular"|"recent">("popular");
  const [count, setCount]           = useState(0);
  const [ratingModal, setRatingModal] = useState<CodeCard|null>(null);
  const [editModal, setEditModal]   = useState<CodeCard|null>(null);
  const [editCode, setEditCode]     = useState("");
  const [editDesc, setEditDesc]     = useState("");
  const [editSaving, setEditSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<CodeCard|null>(null);
  const [currentUserId, setCurrentUserId] = useState<string|null>(null);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setCurrentUserId(data.user?.id ?? null));
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cat = params.get("categorie");
    if (cat && CATEGORIES.includes(cat)) setActiveCategory(cat as Category);
    const s = params.get("search");
    if (s) setSearch(s);
  }, []);

  async function doFetch(pageNum: number, reset: boolean, category: Category, sortMode: "popular"|"recent") {
    if (reset) setLoading(true); else setLoadingMore(true);

    // Server-side category filter: get matching company IDs first
    let companyIds: string[] | null = null;
    if (category !== "Tout") {
      const { data: companies } = await supabase.from("companies").select("id").eq("category", category);
      companyIds = (companies ?? []).map((c: any) => c.id);
      if (companyIds.length === 0) {
        if (reset) { setCodes([]); setCount(0); setHasMore(false); setLoading(false); }
        else setLoadingMore(false);
        return;
      }
    }

    let annQuery = supabase.from("announcements")
      .select(`id, user_id, code, description, bumps_today, created_at, companies(name, slug, category, referral_bonus_description), users(pseudo, level)`)
      .range(pageNum * PAGE_SIZE, (pageNum + 1) * PAGE_SIZE - 1);

    if (sortMode === "popular") annQuery = annQuery.order("bumps_today", { ascending: false }).order("created_at", { ascending: false });
    else annQuery = annQuery.order("created_at", { ascending: false });

    if (companyIds) annQuery = annQuery.in("company_id", companyIds);

    const { data, error } = await annQuery;
    if (error) { console.error(error); if (reset) setLoading(false); else setLoadingMore(false); return; }

    // Ratings only for this page's IDs
    const ids = (data ?? []).map((row: any) => row.id);
    const { data: ratingsData } = ids.length > 0
      ? await supabase.from("user_ratings").select("announcement_id, rating, tags").in("announcement_id", ids)
      : { data: [] };

    const ratingsByAnn: Record<string, number[]> = {};
    const tagsByAnn: Record<string, Record<string, number>> = {};
    (ratingsData ?? []).forEach((r: any) => {
      if (r.rating) {
        if (!ratingsByAnn[r.announcement_id]) ratingsByAnn[r.announcement_id] = [];
        ratingsByAnn[r.announcement_id].push(r.rating);
      }
      if (r.tags?.length) {
        if (!tagsByAnn[r.announcement_id]) tagsByAnn[r.announcement_id] = {};
        r.tags.forEach((tag: string) => { tagsByAnn[r.announcement_id][tag] = (tagsByAnn[r.announcement_id][tag] ?? 0) + 1; });
      }
    });

    const mapped: CodeCard[] = (data ?? []).map((row: any) => {
      const ratings = ratingsByAnn[row.id] ?? [];
      const avg = ratings.length ? ratings.reduce((a:number,b:number)=>a+b,0)/ratings.length : 0;
      const tagCounts = tagsByAnn[row.id] ?? {};
      const topTag = Object.entries(tagCounts).sort((a,b) => b[1]-a[1])[0]?.[0] ?? "";
      const totalRatings = (ratingsData ?? []).filter((r:any) => r.announcement_id === row.id).length;
      // Extraire le gain personnalisé si présent (format: __gain__texte\nreste)
      const rawDesc = row.description ?? "";
      let customReward: string | null = null;
      let cleanDesc = rawDesc;
      if (rawDesc.startsWith("__gain__")) {
        const firstLine = rawDesc.split("\n")[0];
        customReward = firstLine.replace("__gain__", "").trim();
        cleanDesc = rawDesc.split("\n").slice(1).join("\n").trim();
      }
      return {
        id:          row.id,
        userId:      row.user_id ?? "",
        code:        row.code,
        description: cleanDesc || row.companies?.referral_bonus_description || "",
        boosted:     (row.bumps_today ?? 0) > 0,
        brand:       row.companies?.name ?? "Inconnu",
        slug:        row.companies?.slug ?? "",
        category:    row.companies?.category ?? "shopping",
        reward:      customReward ?? row.companies?.referral_bonus_description ?? "Offre de bienvenue",
        parrain:     row.users?.pseudo ?? "Anonyme",
        niveau:      row.users?.level ?? "Débutant",
        avgRating:   avg,
        ratingCount: totalRatings,
        topTag,
      };
    });

    setHasMore((data ?? []).length === PAGE_SIZE);

    if (reset) {
      setCodes(mapped);
      setCount(mapped.length);
      setLoading(false);
    } else {
      setCodes(prev => { const next = [...prev, ...mapped]; setCount(next.length); return next; });
      setLoadingMore(false);
    }
  }

  useEffect(() => {
    setPage(0);
    doFetch(0, true, activeCategory, sort);
  }, [activeCategory, sort]);

  function handleContact(card: CodeCard) {
    if (!currentUserId) { window.location.href = `/login?redirect=/codes`; return; }
    window.location.href = `/messages?to=${card.userId}&annonce=${card.id}`;
  }

  function handleEditOpen(card: CodeCard) {
    setEditModal(card);
    setEditCode(card.code);
    setEditDesc(card.description);
  }

  async function handleEditSave() {
    if (!editModal) return;
    setEditSaving(true);
    await supabase.from("announcements").update({ code: editCode.trim(), description: editDesc.trim() }).eq("id", editModal.id);
    setCodes(prev => prev.map(c => c.id === editModal.id ? { ...c, code: editCode.trim(), description: editDesc.trim() } : c));
    setEditModal(null);
    setEditSaving(false);
  }

  async function handleDelete(card: CodeCard) {
    await supabase.from("announcements").delete().eq("id", card.id);
    setCodes(prev => prev.filter(c => c.id !== card.id));
    setDeleteConfirm(null);
  }

  function loadMore() {
    const next = page + 1;
    setPage(next);
    doFetch(next, false, activeCategory, sort);
  }

  const filtered = search === ""
    ? codes
    : codes.filter(c =>
        c.brand.toLowerCase().includes(search.toLowerCase()) ||
        c.code.toLowerCase().includes(search.toLowerCase()) ||
        c.description.toLowerCase().includes(search.toLowerCase())
      );

  return (
    <>
      <style>{`
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        body{background:var(--bg);color:var(--text);font-family:'DM Sans',sans-serif;min-height:100vh;overflow-x:hidden}
        .particles-container{position:fixed;inset:0;pointer-events:none;z-index:0;overflow:hidden}
        .particle{position:absolute;bottom:-10px;border-radius:50%;background:#7c3aed;animation:floatUp linear infinite}
        @keyframes floatUp{0%{transform:translateY(0) scale(1);opacity:0}10%{opacity:1}90%{opacity:.5}100%{transform:translateY(-100vh) scale(.3);opacity:0}}
        .page-wrapper{position:relative;z-index:1;max-width:860px;margin:0 auto;padding:3rem 1.5rem 6rem}
        .page-header{margin-bottom:2.5rem}
        .header-label{display:inline-flex;align-items:center;gap:6px;font-size:.75rem;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:#7c3aed;margin-bottom:.75rem}
        .header-label::before{content:'';display:block;width:18px;height:1px;background:#7c3aed}
        .page-title{font-family:'Syne',sans-serif;font-weight:800;font-size:clamp(1.75rem,4vw,2.5rem);line-height:1.1;color:var(--text-strong);letter-spacing:-.03em;margin-bottom:.5rem}
        .page-subtitle{color:var(--text-dim);font-size:.9rem;display:flex;align-items:center;gap:8px}
        .live-dot{width:7px;height:7px;border-radius:50%;background:#22c55e;box-shadow:0 0 8px #22c55e;animation:pulse 2s ease-in-out infinite;flex-shrink:0}
        @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.6;transform:scale(.8)}}
        .count-num{color:var(--text-strong);font-weight:700}
        .search-wrap{position:relative;margin-bottom:1.25rem}
        .search-icon{position:absolute;left:1rem;top:50%;transform:translateY(-50%);color:var(--text-faint);pointer-events:none}
        .search-input{width:100%;background:var(--bg-input);border:1px solid var(--border-md);border-radius:14px;padding:.875rem 1rem .875rem 2.75rem;color:var(--text-strong);font-size:.9rem;font-family:'DM Sans',sans-serif;outline:none;transition:all .2s}
        .search-input::placeholder{color:var(--text-faint)}
        .search-input:focus{border-color:rgba(124,58,237,.5);background:rgba(124,58,237,.05);box-shadow:0 0 0 3px rgba(124,58,237,.1)}
        .sort-row{display:flex;align-items:center;gap:8px;margin-bottom:1.25rem}
        .sort-tab{display:flex;align-items:center;gap:6px;padding:.4rem .875rem;background:var(--bg-card-md);border:1px solid var(--border-md);border-radius:10px;color:var(--text-nav);font-size:.8rem;font-weight:500;cursor:pointer;transition:all .2s;font-family:'DM Sans',sans-serif}
        .sort-tab:hover{color:var(--text-strong);border-color:var(--border-lg)}
        .sort-tab.active{background:rgba(124,58,237,.15);border-color:rgba(124,58,237,.4);color:#a78bfa}
        .cats-row{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:2.5rem}
        .cat-pill{display:inline-flex;align-items:center;gap:5px;padding:.4rem .875rem;background:var(--bg-card-md);border:1px solid var(--border-md);border-radius:100px;color:var(--text-link);font-size:.8rem;font-weight:500;cursor:pointer;transition:all .2s;font-family:'DM Sans',sans-serif}
        .cat-pill:hover{color:var(--text-strong);border-color:rgba(124,58,237,.3);background:rgba(124,58,237,.08)}
        .cat-pill.active{background:#7c3aed;border-color:#7c3aed;color:#fff;box-shadow:0 0 16px rgba(124,58,237,.35)}
        .cards-list{display:flex;flex-direction:column;gap:1rem}
        .code-card{background:var(--bg-card);border:1px solid var(--border);border-radius:20px;padding:1.5rem;opacity:0;transform:translateY(16px);transition:opacity .4s ease,transform .4s ease,border-color .2s,box-shadow .2s;position:relative;overflow:hidden}
        .code-card:hover{border-color:rgba(124,58,237,.25);box-shadow:0 8px 32px rgba(0,0,0,.15)}
        .code-card.visible{opacity:1;transform:translateY(0)}
        .code-card.boosted{border-color:rgba(34,197,94,.3);background:rgba(34,197,94,.03)}
        .code-card.boosted::after{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,#22c55e,transparent)}
        .code-card:not(.boosted){border-color:rgba(124,58,237,.2);background:rgba(124,58,237,.03)}
        .code-card.own{border-color:rgba(124,58,237,.55)!important;background:rgba(124,58,237,.08)!important;box-shadow:0 0 0 1px rgba(124,58,237,.2)}
        .code-card.own .code-dot{background:#a78bfa;box-shadow:0 0 8px #a78bfa}
        .code-card.own .code-text{color:#c4b5fd!important}
        .boost-badge{display:inline-flex;align-items:center;gap:5px;padding:.25rem .625rem;background:rgba(34,197,94,.12);border:1px solid rgba(34,197,94,.3);border-radius:100px;font-size:.72rem;font-weight:600;color:#22c55e;margin-bottom:1rem}
        .boost-lightning{animation:flicker 1.5s ease-in-out infinite}
        @keyframes flicker{0%,100%{opacity:1}50%{opacity:.6}}
        .card-top{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:1.25rem}
        .brand-row{display:flex;align-items:center;gap:12px;flex:1}
        .brand-logo{width:44px;height:44px;border-radius:12px;background:#fff;border:1px solid var(--border-md);display:flex;align-items:center;justify-content:center;flex-shrink:0;overflow:hidden}
        .brand-logo-fallback{background:rgba(124,58,237,.15)!important;border:1px solid rgba(124,58,237,.2)!important;font-family:'Syne',sans-serif;font-weight:800;font-size:1.1rem;color:#a78bfa}
        .brand-info{flex:1}
        .brand-name{font-family:'Syne',sans-serif;font-weight:700;font-size:1rem;color:var(--text-strong);margin-bottom:2px}
        .brand-desc{color:var(--text-muted);font-size:.8rem}
        .reward-pill{padding:.3rem .625rem;background:rgba(34,197,94,.12);border:1px solid rgba(34,197,94,.25);border-radius:8px;color:#16a34a;font-size:.8rem;font-weight:700;white-space:nowrap;flex-shrink:0}
        .code-row{display:flex;align-items:center;justify-content:space-between;background:var(--bg-code);border:1px solid var(--border);border-radius:12px;padding:.75rem .875rem;margin-bottom:1.25rem}
        .code-display{display:flex;align-items:center;gap:8px}
        .code-dot{width:6px;height:6px;border-radius:50%;background:#7c3aed;box-shadow:0 0 6px #7c3aed;flex-shrink:0}
        .code-text{font-family:'Courier New',monospace;font-size:.95rem;font-weight:700;color:var(--text-strong);letter-spacing:.08em}
        .copy-btn{display:inline-flex;align-items:center;gap:6px;padding:.4rem .875rem;background:rgba(124,58,237,.15);border:1px solid rgba(124,58,237,.35);border-radius:8px;color:#a78bfa;font-size:.8rem;font-weight:600;cursor:pointer;transition:all .2s;font-family:'DM Sans',sans-serif;white-space:nowrap}
        .copy-btn:hover{background:rgba(124,58,237,.25);color:#fff;transform:scale(1.03)}
        .copy-btn.copied{background:rgba(34,197,94,.15);border-color:rgba(34,197,94,.35);color:#16a34a}
        .card-footer{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:.75rem}
        .parrain-info{display:flex;align-items:center;gap:8px}
        .parrain-avatar{width:26px;height:26px;border-radius:50%;border:1px solid;display:flex;align-items:center;justify-content:center;font-size:.7rem;font-weight:700;color:#fff;flex-shrink:0}
        .parrain-name{font-size:.82rem;font-weight:500;color:var(--text-muted)}
        .niveau-badge{font-size:.72rem;font-weight:600;padding:.15rem .5rem;border:1px solid;border-radius:100px}
        .card-actions{display:flex;gap:6px}
        .action-btn{display:inline-flex;align-items:center;gap:5px;padding:.35rem .75rem;background:var(--bg-card-md);border:1px solid var(--border-md);border-radius:8px;color:var(--text-muted);font-size:.78rem;font-weight:500;cursor:pointer;transition:all .2s;font-family:'DM Sans',sans-serif}
        .action-btn:hover{color:var(--text-strong);border-color:var(--border-lg);background:var(--bg-btn)}
        .action-btn-own{background:rgba(124,58,237,.12);border-color:rgba(124,58,237,.35);color:#a78bfa}
        .action-btn-own:hover{background:rgba(124,58,237,.22);color:#c4b5fd}
        .action-btn-delete{background:rgba(239,68,68,.08);border-color:rgba(239,68,68,.25);color:#f87171}
        .action-btn-delete:hover{background:rgba(239,68,68,.15);color:#fca5a5}
        .code-url{color:#60a5fa !important;text-decoration:underline;word-break:break-all}
        .results-meta{display:flex;align-items:center;justify-content:space-between;margin-bottom:1rem}
        .results-count{font-size:.8rem;color:var(--text-faint)}
        .results-count strong{color:var(--text-muted)}
        .load-more-btn{display:inline-flex;align-items:center;gap:8px;padding:.65rem 1.75rem;background:rgba(124,58,237,.15);border:1px solid rgba(124,58,237,.35);border-radius:12px;color:#a78bfa;font-size:.875rem;font-weight:600;cursor:pointer;transition:all .2s;font-family:'DM Sans',sans-serif}
        .load-more-btn:hover{background:rgba(124,58,237,.25);color:#fff}
        .load-more-btn:disabled{opacity:.5;cursor:not-allowed}
        .empty-state{text-align:center;padding:4rem 2rem;color:var(--text-faint)}
        .empty-icon{font-size:2.5rem;margin-bottom:1rem}
        .loading-wrap{display:flex;flex-direction:column;gap:1rem}
        .loading-card{background:var(--bg-card);border:1px solid var(--border);border-radius:20px;padding:1.5rem}
        .skeleton{background:var(--border-md);border-radius:8px;animation:shimmer 1.5s ease-in-out infinite}
        @keyframes shimmer{0%,100%{opacity:.5}50%{opacity:1}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @media(max-width:600px){.page-wrapper{padding:2rem 1rem 4rem}.card-footer{flex-direction:column;align-items:flex-start}}
      `}</style>

      <Particles />
      <Navbar activePage="codes" />

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
            {filtered.map((card, i) => (
              <CodeCardItem key={card.id} card={card} index={i} onRate={setRatingModal} onContact={handleContact} onEdit={handleEditOpen} onDelete={c => setDeleteConfirm(c)} currentUserId={currentUserId} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <p>Aucun code trouvé pour cette recherche.</p>
          </div>
        )}

        {hasMore && !search && (
          <div style={{ textAlign:"center", marginTop:"2rem" }}>
            <button className="load-more-btn" onClick={loadMore} disabled={loadingMore}>
              {loadingMore
                ? <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation:"spin 1s linear infinite" }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>Chargement…</>
                : <>Voir plus<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg></>
              }
            </button>
          </div>
        )}
        {search && hasMore && (
          <p style={{ textAlign:"center", marginTop:"1.5rem", fontSize:".78rem", color:"rgba(255,255,255,.25)" }}>
            Résultats limités aux {codes.length} codes chargés — effacez la recherche pour en voir plus.
          </p>
        )}
      </main>

      {ratingModal && (
        <RatingModal
          card={ratingModal}
          onClose={() => setRatingModal(null)}
          onSubmitted={(avg, count, topTag) => {
            setCodes(prev => prev.map(c => c.id === ratingModal.id ? { ...c, avgRating: avg, ratingCount: count, topTag } : c));
            setRatingModal(null);
          }}
        />
      )}

      {/* Modal édition */}
      {editModal && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.65)", backdropFilter:"blur(4px)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:"1rem" }} onClick={() => setEditModal(null)}>
          <div style={{ background:"var(--bg-card)", border:"1px solid rgba(124,58,237,.3)", borderRadius:24, padding:"1.75rem", maxWidth:460, width:"100%", position:"relative" }} onClick={e=>e.stopPropagation()}>
            <button onClick={() => setEditModal(null)} style={{ position:"absolute", top:14, right:14, background:"none", border:"none", color:"rgba(255,255,255,.3)", cursor:"pointer", fontSize:"1.25rem" }}>×</button>
            <p style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:"1rem", color:"var(--text-strong)", marginBottom:"1.25rem" }}>Modifier mon annonce</p>
            <div style={{ display:"flex", flexDirection:"column", gap:"1rem" }}>
              <div>
                <label style={{ fontSize:".78rem", fontWeight:600, color:"var(--text-muted)", display:"block", marginBottom:5 }}>Code de parrainage</label>
                <input value={editCode} onChange={e=>setEditCode(e.target.value)} style={{ width:"100%", background:"var(--bg-input)", border:"1px solid var(--border-md)", borderRadius:10, padding:".7rem 1rem", color:"var(--text-strong)", fontSize:".9rem", fontFamily:"'DM Sans',sans-serif", outline:"none" }} />
              </div>
              <div>
                <label style={{ fontSize:".78rem", fontWeight:600, color:"var(--text-muted)", display:"block", marginBottom:5 }}>Description</label>
                <textarea value={editDesc} onChange={e=>setEditDesc(e.target.value)} rows={3} style={{ width:"100%", background:"var(--bg-input)", border:"1px solid var(--border-md)", borderRadius:10, padding:".7rem 1rem", color:"var(--text-strong)", fontSize:".875rem", fontFamily:"'DM Sans',sans-serif", outline:"none", resize:"vertical" }} />
              </div>
              <button onClick={handleEditSave} disabled={editSaving || !editCode.trim()} style={{ background:"#7c3aed", color:"#fff", border:"none", borderRadius:12, padding:".8rem", fontWeight:700, fontSize:".875rem", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", opacity:editSaving?.5:1 }}>
                {editSaving ? "Sauvegarde…" : "Enregistrer"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal suppression */}
      {deleteConfirm && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.65)", backdropFilter:"blur(4px)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:"1rem" }} onClick={() => setDeleteConfirm(null)}>
          <div style={{ background:"var(--bg-card)", border:"1px solid rgba(239,68,68,.3)", borderRadius:24, padding:"1.75rem", maxWidth:400, width:"100%", textAlign:"center" }} onClick={e=>e.stopPropagation()}>
            <div style={{ fontSize:"2rem", marginBottom:".75rem" }}>🗑️</div>
            <p style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:"1rem", color:"var(--text-strong)", marginBottom:".5rem" }}>Supprimer cette annonce ?</p>
            <p style={{ fontSize:".875rem", color:"var(--text-muted)", marginBottom:"1.5rem" }}>Cette action est irréversible.</p>
            <div style={{ display:"flex", gap:10, justifyContent:"center" }}>
              <button onClick={() => setDeleteConfirm(null)} style={{ background:"none", border:"1px solid var(--border-md)", borderRadius:10, padding:".65rem 1.25rem", color:"var(--text-muted)", fontSize:".875rem", cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>Annuler</button>
              <button onClick={() => handleDelete(deleteConfirm)} style={{ background:"rgba(239,68,68,.9)", color:"#fff", border:"none", borderRadius:10, padding:".65rem 1.25rem", fontWeight:700, fontSize:".875rem", cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>Supprimer</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}