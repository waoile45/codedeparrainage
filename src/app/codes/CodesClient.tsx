"use client";

import { useState, useEffect, useRef } from "react";
import Navbar from "@/components/Navbar";
import { createClient } from "@/lib/supabase";
import { CategoryIcon } from "@/components/CategoryIcons";
import { Cross } from "@/components/Pictos";
import { FraicheurCode } from "@/components/FraicheurCode";
import { trackCodeCopy } from "@/lib/track-copy";
import AnimalAvatar from "@/components/AnimalAvatar";

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
  testsOk: number;
  testsKo: number;
  lastTestedAt: string | null;
  ratingCount: number;
  topTag: string;
}

const CATEGORIES = ["Tout","banque","paris","cashback","energie","telephonie","crypto","assurance","shopping"];
const CATEGORY_LABELS: Record<string,string> = { Tout:"Tout", banque:"Banque", paris:"Paris", cashback:"Cashback", energie:"Énergie", telephonie:"Téléphonie", crypto:"Crypto", assurance:"Assurance", shopping:"Shopping" };
const NIVEAU_COLORS: Record<string,string> = { Débutant:"#A39E93", "Parrain Bronze":"#cd7f32", "Parrain Argent":"var(--accent)", "Parrain Or":"#f59e0b", "Super Parrain":"var(--accent)", "Parrain Légendaire":"#ec4899" };

function BrandLogo({ slug, brand }: { slug: string; brand: string }) {
  const [error, setError] = useState(false);
  const domain = slug.includes(".") ? slug : `${slug}.com`;
  if (error) return <div className="brand-logo brand-logo-fallback">{brand[0]?.toUpperCase()}</div>;
  return (
    <div className="brand-logo">
      <img src={`https://www.google.com/s2/favicons?domain=${domain}&sz=64`} alt="" onError={() => setError(true)} style={{ width:"100%", height:"100%", objectFit:"contain", borderRadius:8, padding:3 }} />
    </div>
  );
}

function CopyButton({ code, announcementId }: { code: string; announcementId?: string }) {
  const [state, setState] = useState<"idle"|"copied">("idle");
  const handleCopy = async () => {
    try { await navigator.clipboard.writeText(code); } catch {}
    trackCodeCopy(announcementId);
    setState("copied"); setTimeout(() => setState("idle"), 2000);
  };
  return (
    <button onClick={handleCopy} className={`copy-btn ${state==="copied"?"copied":""}`}>
      {state==="copied"
        ? <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>Copié</>
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
          {tagInfo.label}
        </span>
      )}
      <span style={{ fontSize:".7rem", color:"rgba(255,255,255,.2)" }}>({count} avis)</span>
    </span>
  );
}

const TAGS_POSITIVE = [
  { key:"code_ok",       label:"Code fonctionnel" },
  { key:"reponse_rapide",label:"Réponse rapide" },
  { key:"bon_gain",      label:"Bon gain" },
  { key:"sympa",         label:"Parrain sympa" },
  { key:"annonce_complete", label:"Annonce complète" },
];
const TAGS_NEGATIVE = [
  { key:"code_expire",   label:"Code expiré" },
  { key:"code_invalide", label:"Code invalide" },
  { key:"desc_inexacte", label:"Description inexacte" },
  { key:"inactif",       label:"Parrain inactif" },
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
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.65)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:"1rem" }} onClick={onClose}>
      <div style={{ background:"var(--bg-card)", border:"1px solid rgba(255,212,59,.3)", borderRadius:24, padding:"1.75rem", maxWidth:460, width:"100%", position:"relative", maxHeight:"90vh", overflowY:"auto" }} onClick={e=>e.stopPropagation()}>
        <button onClick={onClose} style={{ position:"absolute", top:14, right:14, background:"none", border:"none", color:"rgba(255,255,255,.3)", cursor:"pointer", fontSize:"1.25rem", lineHeight:1 }}>×</button>

        {done ? (
          <div style={{ textAlign:"center", padding:"1rem 0" }}>
            <p style={{ fontFamily:"var(--font-display)", fontWeight:800, fontSize:"1.1rem", color:"rgba(255,255,255,.9)", marginBottom:".5rem" }}>Avis envoyé</p>
            <p style={{ color:"rgba(255,255,255,.4)", fontSize:".875rem" }}>Merci pour ton retour.</p>
            <button onClick={onClose} style={{ marginTop:"1.25rem", background:"var(--accent)", color:"var(--accent-ink)", border:"none", borderRadius:12, padding:".7rem 1.5rem", fontWeight:700, fontSize:".875rem", cursor:"pointer", fontFamily:"var(--font-text)" }}>Fermer</button>
          </div>
        ) : (
          <>
            <p style={{ fontFamily:"var(--font-display)", fontWeight:800, fontSize:"1rem", color:"rgba(255,255,255,.9)", marginBottom:".2rem" }}>
              {existing ? "Modifier ton avis" : "Comment s'est passé le parrainage ?"}
            </p>
            <p style={{ color:"rgba(255,255,255,.35)", fontSize:".8rem", marginBottom:"1.5rem" }}>
              Annonce de <strong style={{ color:"rgba(255,255,255,.65)" }}>{card.parrain}</strong> · {card.brand}
            </p>

            {/* Tags positifs */}
            <p style={{ fontSize:".72rem", fontWeight:700, color:"rgba(34,197,94,.6)", marginBottom:".6rem" }}>Positif</p>
            <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:"1.25rem" }}>
              {TAGS_POSITIVE.map(t => {
                const active = selectedTags.includes(t.key);
                return (
                  <button key={t.key} type="button" onClick={() => toggleTag(t.key)}
                    style={{ display:"inline-flex", alignItems:"center", gap:5, padding:".35rem .75rem", borderRadius:100, border:`1px solid ${active?"rgba(34,197,94,.5)":"rgba(255,255,255,.1)"}`, background:active?"rgba(34,197,94,.12)":"rgba(255,255,255,.03)", color:active?"#4ade80":"rgba(255,255,255,.5)", fontSize:".8rem", fontWeight:500, cursor:"pointer", transition:"all .15s", fontFamily:"var(--font-text)" }}>
                    {t.label}
                  </button>
                );
              })}
            </div>

            {/* Tags négatifs */}
            <p style={{ fontSize:".72rem", fontWeight:700, color:"rgba(239,68,68,.6)", marginBottom:".6rem" }}>Négatif</p>
            <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:"1.5rem" }}>
              {TAGS_NEGATIVE.map(t => {
                const active = selectedTags.includes(t.key);
                return (
                  <button key={t.key} type="button" onClick={() => toggleTag(t.key)}
                    style={{ display:"inline-flex", alignItems:"center", gap:5, padding:".35rem .75rem", borderRadius:100, border:`1px solid ${active?"rgba(239,68,68,.4)":"rgba(255,255,255,.1)"}`, background:active?"rgba(239,68,68,.1)":"rgba(255,255,255,.03)", color:active?"#f87171":"rgba(255,255,255,.5)", fontSize:".8rem", fontWeight:500, cursor:"pointer", transition:"all .15s", fontFamily:"var(--font-text)" }}>
                    {t.label}
                  </button>
                );
              })}
            </div>

            {/* Étoiles optionnelles */}
            <p style={{ fontSize:".72rem", fontWeight:700, color:"rgba(255,255,255,.25)", marginBottom:".75rem" }}>Note globale <span style={{ fontWeight:400, textTransform:"none", letterSpacing:0 }}>(optionnel)</span></p>
            <div style={{ display:"flex", gap:8, marginBottom:"1.25rem" }}>
              {[1,2,3,4,5].map(n => (
                <button key={n} type="button" onClick={() => setRating(r => r===n?0:n)} onMouseEnter={() => setHovered(n)} onMouseLeave={() => setHovered(0)}
                  style={{ background:"none", border:"none", cursor:"pointer", padding:2, transition:"transform .15s", transform:(hovered||rating)>=n?"scale(1.2)":"scale(1)" }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill={(hovered||rating)>=n?"#f59e0b":"none"} stroke={(hovered||rating)>=n?"#f59e0b":"rgba(255,255,255,.2)"} strokeWidth="1.5">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                </button>
              ))}
              {rating > 0 && <button type="button" onClick={() => setRating(0)} style={{ background:"none", border:"none", color:"rgba(255,255,255,.4)", cursor:"pointer", padding:2, display:"inline-flex" }} aria-label="Effacer la note"><Cross size={14} /></button>}
            </div>

            {/* Commentaire */}
            <textarea value={comment} onChange={e=>setComment(e.target.value)} placeholder="Commentaire (optionnel)…" maxLength={300}
              style={{ width:"100%", background:"rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.08)", borderRadius:12, padding:".75rem 1rem", color:"rgba(255,255,255,.8)", fontSize:".875rem", fontFamily:"var(--font-text)", resize:"vertical", minHeight:72, outline:"none", marginBottom:".75rem" }} />

            {error && <p style={{ color:"#f87171", fontSize:".8rem", marginBottom:".75rem" }}>{error}</p>}
            <button onClick={submit} disabled={sending}
              style={{ width:"100%", background:"var(--accent)", color:"var(--accent-ink)", border:"none", borderRadius:12, padding:".8rem", fontWeight:700, fontSize:".875rem", cursor:"pointer", fontFamily:"var(--font-text)", opacity:sending?.5:1, transition:"opacity .2s" }}>
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
  const niveauColor = NIVEAU_COLORS[card.niveau] ?? "#A39E93";
  const isOwn = currentUserId !== null && currentUserId === card.userId;
  return (
    <div ref={ref} className={`code-card ${card.boosted?"boosted":""} ${isOwn?"own":""} ${visible?"visible":""}`}>
      {card.boosted && <div className="boost-badge"><svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M13 2L3 14h8l-1 8 10-12h-8z"/></svg><span>Annonce boostée</span></div>}
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
          <div className="parrain-avatar" style={{ borderColor:niveauColor+"66" }}><AnimalAvatar seed={card.parrain} /></div>
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
      <div style={{ marginBottom: ".7rem" }}><FraicheurCode stats={{ tests_ok: card.testsOk, tests_ko: card.testsKo, last_tested_at: card.lastTestedAt }} /></div>
      <div className="code-row">
        <div className="code-display">
          <span className="code-dot" />
          <code className={`code-text ${card.code.startsWith("http") ? "code-url" : ""}`}>{card.code}</code>
        </div>
        <CopyButton code={card.code} announcementId={card.id} />
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
  const [erreur, setErreur]         = useState(false);
  const [count, setCount]           = useState(0); // eslint-disable-line @typescript-eslint/no-unused-vars
  // Total réel en base pour l'en-tête (count ne compte que les codes chargés).
  const [total, setTotal]           = useState<number | null>(null);
  useEffect(() => {
    createClient().from("announcements").select("id", { count: "exact", head: true })
      .then(({ count: n }) => { if (typeof n === "number") setTotal(n); });
  }, []);
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

  // Notes des annonces : calculées à part, pour afficher les cartes sans les attendre.
  function notesDe(ratingsData: any[], id: string) {
    const lignes = ratingsData.filter((r: any) => r.announcement_id === id);
    const notes = lignes.map((r: any) => r.rating).filter(Boolean) as number[];
    const tagCounts: Record<string, number> = {};
    lignes.forEach((r: any) => (r.tags ?? []).forEach((tag: string) => { tagCounts[tag] = (tagCounts[tag] ?? 0) + 1; }));
    return {
      avgRating: notes.length ? notes.reduce((a, b) => a + b, 0) / notes.length : 0,
      ratingCount: lignes.length,
      topTag: Object.entries(tagCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "",
    };
  }

  async function doFetch(pageNum: number, reset: boolean, category: Category, sortMode: "popular"|"recent") {
    if (reset) { setLoading(true); setErreur(false); } else setLoadingMore(true);

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

    const SELECT = `id, user_id, code, description, bumps_today, created_at, tests_ok, tests_ko, last_tested_at, companies(name, slug, category, referral_bonus_description), users(pseudo, level), boosts(active, ends_at)`;
    let annQuery = supabase.from("announcements")
      .select(SELECT)
      .range(pageNum * PAGE_SIZE, (pageNum + 1) * PAGE_SIZE - 1);

    if (sortMode === "popular") annQuery = annQuery.order("bumps_today", { ascending: false }).order("created_at", { ascending: false });
    else annQuery = annQuery.order("created_at", { ascending: false });

    if (companyIds) annQuery = annQuery.in("company_id", companyIds);

    // Annonces boostées : en tri « Populaires », TOUTES celles dont le boost est
    // en cours passent en tête du premier chargement (pas seulement celles du
    // paquet de 20). Les deux requêtes partent en même temps.
    let boostQuery: PromiseLike<{ data: any[] | null }> = Promise.resolve({ data: [] });
    if (sortMode === "popular" && pageNum === 0) {
      let bq = supabase.from("announcements")
        .select(SELECT.replace("boosts(active, ends_at)", "boosts!inner(active, ends_at)"))
        .eq("boosts.active", true)
        .gt("boosts.ends_at", new Date().toISOString())
        .order("created_at", { ascending: false })
        .limit(60);
      if (companyIds) bq = bq.in("company_id", companyIds);
      boostQuery = bq;
    }
    const [{ data: pageData, error }, { data: bdata }] = await Promise.all([annQuery, boostQuery]);
    if (error) {
      console.error(error);
      if (reset) { setErreur(true); setLoading(false); } else setLoadingMore(false);
      return;
    }

    const boostedRows: any[] = bdata ?? [];
    const boostedIds = new Set(boostedRows.map((r: any) => r.id));
    const data = [...boostedRows, ...(pageData ?? []).filter((r: any) => !boostedIds.has(r.id))];

    const mapped: CodeCard[] = data.map((row: any) => {
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
        boosted:     (row.boosts ?? []).some((b: any) => b.active && new Date(b.ends_at) > new Date()),
        brand:       row.companies?.name ?? "Inconnu",
        slug:        row.companies?.slug ?? "",
        category:    row.companies?.category ?? "shopping",
        reward:      customReward ?? row.companies?.referral_bonus_description ?? "Offre de bienvenue",
        parrain:     row.users?.pseudo ?? "Anonyme",
        niveau:      row.users?.level ?? "Débutant",
        avgRating:   0,
        testsOk:     row.tests_ok ?? 0,
        testsKo:     row.tests_ko ?? 0,
        lastTestedAt: row.last_tested_at ?? null,
        ratingCount: 0,
        topTag:      "",
      };
    });

    // Les annonces boostées passent en tête (tri "populaire").
    // sort() est stable : à boost égal, l'ordre bumps/récence de la requête est conservé.
    if (sortMode === "popular") {
      mapped.sort((a, b) => Number(b.boosted) - Number(a.boosted));
    }

    setHasMore((pageData ?? []).length === PAGE_SIZE); // le paquet seul, sans les boostées ajoutées en tête

    // Les cartes s'affichent tout de suite ; les notes arrivent juste après.
    if (reset) {
      setCodes(mapped);
      setCount(mapped.length);
      setLoading(false);
    } else {
      // Une annonce boostée déjà affichée en tête ne revient pas dans la suite de la liste.
      setCodes(prev => { const seen = new Set(prev.map(c => c.id)); const next = [...prev, ...mapped.filter(c => !seen.has(c.id))]; setCount(next.length); return next; });
      setLoadingMore(false);
    }

    const ids = mapped.map((c) => c.id);
    if (ids.length === 0) return;
    const { data: ratingsData } = await supabase.from("user_ratings").select("announcement_id, rating, tags").in("announcement_id", ids);
    if (!ratingsData?.length) return;
    const idsAvecNotes = new Set(ratingsData.map((r: any) => r.announcement_id));
    setCodes(prev => prev.map(c => idsAvecNotes.has(c.id) ? { ...c, ...notesDe(ratingsData, c.id) } : c));
  }

  useEffect(() => {
    setPage(0);
    doFetch(0, true, activeCategory, sort);
  }, [activeCategory, sort]);

  function handleContact(card: CodeCard) {
    const dest = `/profil?tab=messages&to=${card.userId}&annonce=${card.id}`;
    if (!currentUserId) { window.location.href = `/login?next=${encodeURIComponent(dest)}`; return; }
    window.location.href = dest;
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
        body{background:var(--bg);color:var(--text);font-family:var(--font-text);min-height:100vh;overflow-x:clip}
        .page-wrapper{position:relative;z-index:1;max-width:940px;margin:0 auto;padding:clamp(2rem,5vw,3.5rem) var(--gutter) 5rem}
        .page-header{margin-bottom:2.25rem;max-width:760px}
        .page-title{font-family:var(--font-display);font-stretch:118%;font-weight:800;font-size:clamp(2.3rem,5.4vw,4rem);line-height:1;color:var(--text-strong);letter-spacing:-.015em;margin:0 0 1rem}
        .page-subtitle{color:var(--text-muted);font-size:1.08rem;line-height:1.55;margin:0}
        .count-num{color:var(--text-strong);font-weight:700;font-variant-numeric:tabular-nums}
        .codes-layout{max-width:860px}
        .search-wrap{position:relative;margin-bottom:1.25rem}
        .search-icon{position:absolute;left:1rem;top:50%;transform:translateY(-50%);color:var(--text-dim);pointer-events:none}
        .search-input{width:100%;height:52px;background:var(--bg-raised);border:1.5px solid var(--border-lg);border-radius:12px;padding:0 1rem 0 2.75rem;color:var(--text-strong);font-size:1rem;font-family:var(--font-text);outline:none;transition:border-color .2s}
        .search-input::placeholder{color:var(--text-faint)}
        .search-input:focus{border-color:var(--accent)}
        .sort-row{display:flex;align-items:center;gap:1.25rem;margin-bottom:1.25rem;border-bottom:1px solid var(--border-md)}
        .sort-tab{position:relative;display:flex;align-items:center;gap:6px;padding:.6rem 0 .75rem;background:none;border:0;color:var(--text-muted);font-size:.95rem;font-weight:600;cursor:pointer;font-family:var(--font-text)}
        .sort-tab:hover{color:var(--text-strong)}
        .sort-tab.active{color:var(--text-strong)}
        .sort-tab.active::after{content:"";position:absolute;left:0;right:0;bottom:-1px;height:3px;border-radius:2px;background:var(--accent)}
        .cats-row{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:2rem}
        .cat-pill{display:inline-flex;align-items:center;gap:6px;min-height:40px;padding:0 .95rem;background:transparent;border:0;box-shadow:inset 0 0 0 1.5px var(--border-lg);border-radius:100px;color:var(--text-muted);font-size:.9rem;font-weight:600;cursor:pointer;transition:color .15s,box-shadow .15s;font-family:var(--font-text)}
        .cat-pill:hover{color:var(--text-strong);box-shadow:inset 0 0 0 1.5px var(--text-dim)}
        .cat-pill.active{background:var(--accent);box-shadow:none;color:var(--accent-ink)}
        .cards-list{display:flex;flex-direction:column;gap:.9rem}
        .code-card{background:var(--bg-raised);border-radius:18px;padding:1.4rem;box-shadow:inset 0 0 0 1px var(--border-md);opacity:0;transform:translateY(12px);transition:opacity .4s ease,transform .4s ease,box-shadow .2s;position:relative}
        .code-card:hover{box-shadow:inset 0 0 0 1px var(--border-lg)}
        .code-card.visible{opacity:1;transform:none}
        .code-card.boosted{box-shadow:inset 0 0 0 1.5px var(--accent)}
        .code-card.own{box-shadow:inset 0 0 0 1.5px var(--accent-text)}
        .boost-badge{display:inline-flex;align-items:center;gap:6px;padding:.25rem .65rem;background:var(--accent);border-radius:100px;font-size:.78rem;font-weight:700;color:var(--accent-ink);margin-bottom:1rem}
        .card-top{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:1.1rem}
        .brand-row{display:flex;align-items:center;gap:12px;flex:1;min-width:0}
        .brand-logo{width:44px;height:44px;border-radius:11px;background:var(--paper);display:flex;align-items:center;justify-content:center;flex-shrink:0;overflow:hidden}
        .brand-logo-fallback{background:var(--accent)!important;font-family:var(--font-display);font-weight:800;font-size:1.1rem;color:var(--accent-ink)}
        .brand-info{flex:1;min-width:0}
        .brand-name{font-family:var(--font-display);font-stretch:112%;font-weight:800;font-size:1.2rem;color:var(--text-strong);margin:0 0 3px}
        .brand-desc{color:var(--text-muted);font-size:.92rem;line-height:1.45;margin:0}
        .reward-pill{padding:.3rem .65rem;background:rgba(76,195,138,.14);border-radius:8px;color:var(--ok);font-size:.88rem;font-weight:700;white-space:nowrap;flex-shrink:0;margin-left:.75rem}
        .code-row{display:flex;align-items:center;justify-content:space-between;gap:1rem;background:var(--bg);border-radius:12px;padding:.7rem .75rem .7rem 1rem;box-shadow:inset 0 0 0 1px var(--border-md)}
        .code-display{display:flex;align-items:center;gap:8px;min-width:0}
        .code-dot{display:none}
        .code-text{font-family:var(--font-code),ui-monospace,monospace;font-size:1.08rem;font-weight:600;color:var(--text-strong);letter-spacing:.04em;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
        .copy-btn{display:inline-flex;align-items:center;gap:6px;min-height:42px;padding:0 1rem;background:var(--accent);border:0;border-radius:10px;color:var(--accent-ink);font-size:.92rem;font-weight:700;cursor:pointer;transition:background-color .15s;font-family:var(--font-text);white-space:nowrap;flex-shrink:0}
        .copy-btn:hover{background:var(--accent-hover)}
        .copy-btn.copied{background:var(--ok);color:#0B2016}
        .card-footer{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:.75rem}
        .parrain-info{display:flex;align-items:center;gap:8px}
        .parrain-avatar{width:28px;height:28px;border-radius:50%;border:1px solid;display:flex;align-items:center;justify-content:center;font-size:.75rem;font-weight:700;color:var(--text-strong);flex-shrink:0}
        .parrain-name{font-size:.92rem;font-weight:700;color:var(--text-strong)}
        .niveau-badge{font-size:.75rem;font-weight:600;padding:.12rem .5rem;border:1px solid;border-radius:100px}
        .card-actions{display:flex;gap:6px}
        .action-btn{display:inline-flex;align-items:center;gap:5px;min-height:36px;padding:0 .8rem;background:transparent;border:0;box-shadow:inset 0 0 0 1px var(--border-lg);border-radius:9px;color:var(--text-muted);font-size:.85rem;font-weight:600;cursor:pointer;transition:color .15s,box-shadow .15s;font-family:var(--font-text)}
        .action-btn:hover{color:var(--text-strong);box-shadow:inset 0 0 0 1px var(--text-dim)}
        .action-btn-own{color:var(--accent-text);box-shadow:inset 0 0 0 1px var(--accent-text)}
        .action-btn-delete{color:var(--danger);box-shadow:inset 0 0 0 1px rgba(242,102,90,.45)}
        .action-btn-delete:hover{color:var(--danger);box-shadow:inset 0 0 0 1px var(--danger)}
        .code-url{color:var(--text-muted)!important;font-family:var(--font-text)!important;font-size:.95rem!important;letter-spacing:0!important}
        .results-meta{display:flex;align-items:center;justify-content:space-between;margin-bottom:1rem}
        .anj-note{margin:0 0 1rem;font-size:.85rem;line-height:1.5;color:var(--text-dim)}
        .results-count{font-size:.92rem;color:var(--text-dim);margin:0}
        .publish-strip{display:flex;align-items:center;justify-content:space-between;gap:1rem;flex-wrap:wrap;margin:0 0 1.25rem;padding:.9rem 1.1rem;border-radius:14px;background:var(--accent);color:var(--accent-ink);text-decoration:none;font-size:.92rem;line-height:1.45}
        .publish-strip strong{flex-shrink:0;padding:.5rem .9rem;border-radius:10px;background:var(--ink);color:var(--paper);font-size:.85rem}
        .publish-strip:hover strong{background:#000}
        .publish-link{display:inline-block;margin-top:.75rem;color:var(--accent-text);font-weight:700;text-decoration:underline;text-underline-offset:4px}
        .results-count strong{color:var(--text-strong)}
        .load-more-btn{display:inline-flex;align-items:center;gap:8px;min-height:48px;padding:0 1.6rem;background:transparent;border:0;box-shadow:inset 0 0 0 1.5px var(--border-lg);border-radius:12px;color:var(--text-strong);font-size:.95rem;font-weight:700;cursor:pointer;transition:box-shadow .2s;font-family:var(--font-text)}
        .load-more-btn:hover{box-shadow:inset 0 0 0 1.5px var(--accent)}
        .load-more-btn:disabled{opacity:.5;cursor:not-allowed}
        .empty-state{text-align:center;padding:4rem 2rem;color:var(--text-dim)}
        .loading-wrap{display:flex;flex-direction:column;gap:1rem}
        .loading-card{background:var(--bg-raised);border-radius:18px;padding:1.4rem}
        .skeleton{background:var(--border-md);border-radius:8px;animation:shimmer 1.5s ease-in-out infinite}
        @keyframes shimmer{0%,100%{opacity:.5}50%{opacity:1}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @media(max-width:600px){
          .code-card{padding:1.1rem}
          .card-top{flex-direction:column;align-items:stretch;gap:.65rem}
          .brand-row{display:grid;grid-template-columns:44px minmax(0,1fr);align-items:start;column-gap:12px;row-gap:.6rem}
          .reward-pill{grid-column:2;justify-self:start;white-space:normal;margin-left:0}
          .brand-desc{word-break:break-word}
          .card-footer{flex-direction:column;align-items:flex-start}
          .card-actions{flex-wrap:wrap}
          .search-input{font-size:16px}
        }
      `}</style>

      <Navbar activePage="codes" />

      <main className="page-wrapper">
        <header className="page-header">
          <h1 className="page-title">Codes de parrainage</h1>
          <p className="page-subtitle">
            {total !== null
              ? <><span className="count-num">{total.toLocaleString("fr-FR")}</span> codes publiés par des membres inscrits, du plus remonté au plus ancien. Cherche une marque ou filtre par catégorie.</>
              : <>Les codes publiés par des membres inscrits, du plus remonté au plus ancien. Cherche une marque ou filtre par catégorie.</>}
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
              <CategoryIcon name={cat} size={16} /> {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>

        {(activeCategory === "Tout" || activeCategory === "paris") && (
          <p className="anj-note">
            Paris sportifs : jouer comporte des risques (endettement, isolement, dépendance). Pour être aidé,
            appelle le 09 74 75 13 13 (appel non surtaxé). Interdit aux moins de 18 ans.
          </p>
        )}
        <div className="results-meta">
          <p className="results-count">
            <strong>{filtered.length}</strong> résultat{filtered.length!==1?"s":""}
            {activeCategory!=="Tout" && <> · {CATEGORY_LABELS[activeCategory]}</>}
            {search && <> pour « {search} »</>}
          </p>
        </div>

        <a href="/publier" className="publish-strip">
          <span>Tu as un code de parrainage ? Publie-le : il apparaît ici et sur la page de la marque.</span>
          <strong>Publier mon code</strong>
        </a>

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
        ) : erreur ? (
          <div className="empty-state">
            <p>Les codes n'ont pas pu être chargés.</p>
            <button className="load-more-btn" onClick={() => doFetch(0, true, activeCategory, sort)}>Réessayer</button>
          </div>
        ) : (
          <div className="empty-state">
            <p>Aucun code trouvé pour cette recherche.</p>
            <a href="/publier" className="publish-link">Tu es client ? Publie le premier code</a>
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
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.65)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:"1rem" }} onClick={() => setEditModal(null)}>
          <div style={{ background:"var(--bg-card)", border:"1px solid rgba(255,212,59,.3)", borderRadius:24, padding:"1.75rem", maxWidth:460, width:"100%", position:"relative" }} onClick={e=>e.stopPropagation()}>
            <button onClick={() => setEditModal(null)} style={{ position:"absolute", top:14, right:14, background:"none", border:"none", color:"rgba(255,255,255,.3)", cursor:"pointer", fontSize:"1.25rem" }}>×</button>
            <p style={{ fontFamily:"var(--font-display)", fontWeight:800, fontSize:"1rem", color:"var(--text-strong)", marginBottom:"1.25rem" }}>Modifier mon annonce</p>
            <div style={{ display:"flex", flexDirection:"column", gap:"1rem" }}>
              <div>
                <label style={{ fontSize:".78rem", fontWeight:600, color:"var(--text-muted)", display:"block", marginBottom:5 }}>Code de parrainage</label>
                <input value={editCode} onChange={e=>setEditCode(e.target.value)} style={{ width:"100%", background:"var(--bg-input)", border:"1px solid var(--border-md)", borderRadius:10, padding:".7rem 1rem", color:"var(--text-strong)", fontSize:".9rem", fontFamily:"var(--font-text)", outline:"none" }} />
              </div>
              <div>
                <label style={{ fontSize:".78rem", fontWeight:600, color:"var(--text-muted)", display:"block", marginBottom:5 }}>Description</label>
                <textarea value={editDesc} onChange={e=>setEditDesc(e.target.value)} rows={3} style={{ width:"100%", background:"var(--bg-input)", border:"1px solid var(--border-md)", borderRadius:10, padding:".7rem 1rem", color:"var(--text-strong)", fontSize:".875rem", fontFamily:"var(--font-text)", outline:"none", resize:"vertical" }} />
              </div>
              <button onClick={handleEditSave} disabled={editSaving || !editCode.trim()} style={{ background:"var(--accent)", color:"var(--accent-ink)", border:"none", borderRadius:12, padding:".8rem", fontWeight:700, fontSize:".875rem", cursor:"pointer", fontFamily:"var(--font-text)", opacity:editSaving?.5:1 }}>
                {editSaving ? "Sauvegarde…" : "Enregistrer"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal suppression */}
      {deleteConfirm && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.65)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:"1rem" }} onClick={() => setDeleteConfirm(null)}>
          <div style={{ background:"var(--bg-card)", border:"1px solid rgba(239,68,68,.3)", borderRadius:24, padding:"1.75rem", maxWidth:400, width:"100%", textAlign:"center" }} onClick={e=>e.stopPropagation()}>
            <p style={{ fontFamily:"var(--font-display)", fontWeight:800, fontSize:"1rem", color:"var(--text-strong)", marginBottom:".5rem" }}>Supprimer cette annonce ?</p>
            <p style={{ fontSize:".875rem", color:"var(--text-muted)", marginBottom:"1.5rem" }}>Cette action est irréversible.</p>
            <div style={{ display:"flex", gap:10, justifyContent:"center" }}>
              <button onClick={() => setDeleteConfirm(null)} style={{ background:"none", border:"1px solid var(--border-md)", borderRadius:10, padding:".65rem 1.25rem", color:"var(--text-muted)", fontSize:".875rem", cursor:"pointer", fontFamily:"var(--font-text)" }}>Annuler</button>
              <button onClick={() => handleDelete(deleteConfirm)} style={{ background:"rgba(239,68,68,.9)", color:"#fff", border:"none", borderRadius:10, padding:".65rem 1.25rem", fontWeight:700, fontSize:".875rem", cursor:"pointer", fontFamily:"var(--font-text)" }}>Supprimer</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}