"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useTheme } from "@/components/ThemeProvider";
import { CategoryIcon } from "@/components/CategoryIcons";

// ── Compteur animé ────────────────────────────────────────────────────────────
function CountUp({ target, suffix="" }: { target: number; suffix?: string }) {
  const [val, setVal] = useState(target);
  const started = useRef(false);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Sans JS (ou avant hydratation) la vraie valeur est déjà dans le HTML.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true;
        const steps = 40;
        const dur = 2000;
        let cur = 0;
        const inc = target / steps;
        setVal(0);
        const t = setInterval(() => {
          cur = Math.min(cur + inc, target);
          setVal(Math.round(cur));
          if (cur >= target) clearInterval(t);
        }, dur / steps);
      }
    }, { threshold: 0.5 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [target]);
  return <span ref={ref}>{val.toLocaleString("fr-FR")}{suffix}</span>;
}

// ── Données statiques ─────────────────────────────────────────────────────────

const CATEGORIES = [
  { label: "Banque",         slug: "banque",     color: "#3b82f6" },
  { label: "Crypto",         slug: "crypto",     color: "#f59e0b" },
  { label: "Paris sportifs", slug: "paris",      color: "#10b981" },
  { label: "Cashback",       slug: "cashback",   color: "#6366f1" },
  { label: "Énergie",        slug: "energie",    color: "#ec4899" },
  { label: "Téléphonie",     slug: "telephonie", color: "#8b5cf6" },
  { label: "Shopping",       slug: "shopping",   color: "#14b8a6" },
  { label: "Assurance",      slug: "assurance",  color: "#f97316" },
];

const POPULAR_TAGS = [
  { label: "Boursobank",     slug: "boursobank"     },
  { label: "Winamax",        slug: "winamax"        },
  { label: "Revolut",        slug: "revolut"        },
  { label: "Binance",        slug: "binance"        },
  { label: "Fortuneo",       slug: "fortuneo"       },
  { label: "Trade Republic", slug: "trade-republic" },
  { label: "Free Mobile",    slug: "free-mobile"    },
  { label: "BlaBlaCar",      slug: "blablacar"      },
  { label: "Lydia",          slug: "lydia"          },
  { label: "Coinbase",       slug: "coinbase"       },
  { label: "Betclic",        slug: "betclic"        },
  { label: "Swile",          slug: "swile"          },
];

const HOW_IT_WORKS = [
  { num: "01", title: "Trouve un code",        desc: "Cherche la marque ou parcours une catégorie. Chaque code affiche son parrain, sa date de publication et les notes laissées par ceux qui l'ont utilisé." },
  { num: "02", title: "Inscris-toi avec",      desc: "Copie le code et renseigne-le dans le formulaire d'inscription de la marque. La prime est créditée quand les conditions (premier dépôt, première commande…) sont remplies." },
  { num: "03", title: "Publie le tien",        desc: "Une fois client, partage ton propre code : il apparaît sur la page de la marque, et chaque publication ou avis reçu fait progresser ton profil." },
];

const FAQ = [
  {
    q: "Qu'est-ce qu'un code de parrainage ?",
    a: "C'est un code (ou un lien) que la marque remet à ses clients pour qu'ils invitent leurs proches. Quand quelqu'un s'inscrit avec ce code, le nouveau client et le parrain reçoivent une contrepartie : prime en euros, mois offerts, réduction, freebets… Les banques en ligne, les bookmakers, les plateformes crypto et les applis de cashback fonctionnent tous de cette façon.",
  },
  {
    q: "Comment utiliser un code de parrainage ?",
    a: "Au moment de créer ton compte chez la marque, un champ « code parrainage », « code promo » ou « code ami » apparaît dans le formulaire. Colle le code copié ici, puis termine l'inscription. Il est rarement possible d'ajouter un code après coup : vérifie ce champ avant de valider.",
  },
  {
    q: "Les codes publiés ici sont-ils vérifiés ?",
    a: "Chaque code est publié par un membre inscrit et daté. Ceux qui l'utilisent peuvent ensuite le noter (code accepté, parrain réactif…) ; les codes mal notés ou anciens descendent dans la liste. La date de dernière mise à jour est affichée sur chaque page de marque pour juger de sa fraîcheur.",
  },
  {
    q: "Combien rapporte un parrainage ?",
    a: "Cela dépend entièrement de la marque et change souvent. Les banques en ligne versent en général une prime en euros à l'ouverture du compte, les bookmakers offrent des paris gratuits ou remboursés, les exchanges crypto une réduction de frais. Le montant en vigueur est indiqué sur chaque page de marque quand il est renseigné, et toujours à confirmer sur le site de la marque avant de s'inscrire.",
  },
  {
    q: "Peut-on partager son propre code ?",
    a: "Oui. Crée un compte, clique sur « Publier », choisis la marque et colle ton code. L'annonce est visible immédiatement sur la page de la marque et dans l'annuaire. Publier un code et recevoir des avis rapportent des XP qui font monter ton profil dans le classement.",
  },
  {
    q: "Est-ce légal d'utiliser un code de parrainage ?",
    a: "Oui : le parrainage est un programme officiel de la marque, prévu dans ses conditions générales. Tu bénéficies simplement de l'offre de bienvenue qu'elle réserve aux clients recommandés. Seule règle habituelle : un seul code par nouveau compte.",
  },
];

// ── Types ─────────────────────────────────────────────────────────────────────

type TopCode = {
  slug: string; logo: string; name: string; category: string; catColor: string;
  gain: string | null; gainSub: string | null; desc: string; nbCodes: number; rating: number | null;
};
export type HomeData = {
  codesCount: number;
  parrainsCount: number;
  entreprisesCount: number;
  catCounts: Record<string, number>;
  topCodes: TopCode[];
  topParrain: { pseudo: string; level: string } | null;
};

// ── Cartes flottantes du hero (illustration du produit, données neutres) ──────

function TopParrainCard({ parrain }: { parrain: { pseudo: string; level: string } | null }) {
  const pseudo = parrain?.pseudo ?? "Toi, bientôt ?";
  const level = parrain?.level ?? "Deviens Top Parrain";
  const initial = (parrain?.pseudo?.[0] ?? "?").toUpperCase();
  return (
    <div>
      <div style={{ fontSize:"0.68rem", color:"var(--text-dim)", marginBottom:6, letterSpacing:"0.06em", textTransform:"uppercase" }}>Top parrain</div>
      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
        <div style={{ width:32, height:32, borderRadius:"50%", background:"linear-gradient(135deg,#7c3aed,#a78bfa)", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:"0.75rem", color:"#fff" }}>{initial}</div>
        <div>
          <div style={{ fontWeight:700, fontSize:"0.82rem", color:"var(--text-strong)" }}>{pseudo}</div>
          <div style={{ fontSize:"0.68rem", color:"var(--text-dim)" }}>{level}</div>
        </div>
      </div>
    </div>
  );
}

const FLOATING_CARDS = [
  {
    id: "boost", top: "6%", right: "2%",
    content: (
      <div>
        <div style={{ fontWeight:700, fontSize:"0.85rem", color:"var(--text-strong)" }}>Boost activé</div>
        <div style={{ fontSize:"0.72rem", color:"var(--text-dim)" }}>Ton annonce passe en tête</div>
      </div>
    ),
  },
  { id: "top", top: "36%", right: "18%", content: null },
  {
    id: "badge", top: "54%", right: "3%",
    content: (
      <div>
        <div style={{ fontSize:"0.65rem", color:"var(--text-dim)" }}>Nouveau badge</div>
        <div style={{ fontWeight:700, fontSize:"0.82rem", color:"var(--text-strong)" }}>Parrain Bronze</div>
      </div>
    ),
  },
  {
    id: "copy", top: "72%", right: "19%",
    content: (
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        <div style={{ width:36, height:36, borderRadius:10, background:"rgba(16,185,129,0.15)", border:"1px solid rgba(16,185,129,0.3)", display:"flex", alignItems:"center", justifyContent:"center" }}>
          <CategoryIcon name="banque" size={18} />
        </div>
        <div>
          <div style={{ fontSize:"0.65rem", color:"#34d399" }}>Code copié</div>
          <div style={{ fontWeight:700, fontSize:"0.82rem", color:"var(--text-strong)" }}>Boursobank</div>
          <div style={{ fontSize:"0.72rem", color:"#a78bfa", fontWeight:600, fontFamily:"'Courier New',monospace" }}>CODE-PARRAIN</div>
        </div>
      </div>
    ),
  },
];

// ── Page ──────────────────────────────────────────────────────────────────────

export default function HomeClient({ data }: { data?: HomeData }) {
  // La section « codes populaires » n'apparaît que si au moins 3 marques ont des codes
  const topCodes = data?.topCodes ?? [];
  useTheme();

  return (
    <>
      <Navbar activePage="home" />
      <main style={{ background:"var(--bg)", minHeight:"100vh", fontFamily:"var(--font-dm-sans),'DM Sans',sans-serif", color:"var(--text-strong)", overflowX:"hidden" }}>

        {/* Décor : grille + halo (les particules viennent du layout) */}
        <div aria-hidden="true" style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:0, backgroundImage:"linear-gradient(rgba(124,58,237,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(124,58,237,0.04) 1px,transparent 1px)", backgroundSize:"60px 60px" }} />
        <div aria-hidden="true" style={{ position:"fixed", top:-200, left:"50%", transform:"translateX(-50%)", width:700, height:700, borderRadius:"50%", background:"radial-gradient(circle,rgba(124,58,237,0.13) 0%,transparent 65%)", pointerEvents:"none", zIndex:0 }} />

        {/* ══ HERO ════════════════════════════════════════════════════════════ */}
        <section id="hp-hero" style={{ position:"relative", zIndex:1, maxWidth:1200, margin:"0 auto", padding:"2.5rem 2rem 2.5rem", display:"grid", gap:"2rem", alignItems:"center" }}>

          <div style={{ animation: "fadeInUp 0.6s ease both" }}>
            <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"var(--bg-card-md)", border:"1px solid var(--border-lg)", borderRadius:999, padding:"0.35rem 0.875rem", marginBottom:"1.5rem", fontSize:"0.78rem", color:"var(--text-link)" }}>
              <span style={{ width:7, height:7, borderRadius:"50%", background:"#10b981", boxShadow:"0 0 6px #10b981", display:"inline-block" }} />
              {data?.codesCount ?? 0} codes publiés par la communauté
            </div>
            <h1 style={{ fontFamily:"var(--font-syne),Syne,sans-serif", fontWeight:800, fontSize:"clamp(2.4rem,5vw,4.5rem)", lineHeight:1.05, letterSpacing:"-0.03em", margin:0, marginBottom:"1.25rem", color:"var(--text-strong)" }}>
              Ton code de<br /><span style={{ color:"#7c3aed" }}>parrainage</span><br />qui rapporte.
            </h1>
            <p style={{ color:"var(--text-muted)", fontSize:"1rem", lineHeight:1.7, maxWidth:460, marginBottom:"1.75rem" }}>
              Des codes de parrainage publiés par de vrais clients, datés et notés par ceux qui les utilisent. Banques en ligne, paris sportifs, crypto, cashback, télécom : copie le code, inscris-toi, touche la prime.
            </p>
            <div id="hp-hero-cta" style={{ display:"flex", gap:"0.875rem", flexWrap:"wrap" }}>
              <Link href="/codes" className="hp-btn hp-btn-primary">Trouver un code</Link>
              <Link href="/publier" className="hp-btn hp-btn-ghost">Publier mon code</Link>
            </div>
            <div id="hp-hero-stats" style={{ display:"flex", gap:"2rem", marginTop:"2.25rem", flexWrap:"wrap" }}>
              {[
                { target: data?.codesCount ?? 0,       l:"Codes publiés" },
                { target: data?.parrainsCount ?? 0,    l:"Parrains inscrits" },
                { target: data?.entreprisesCount ?? 0, l:"Marques référencées" },
              ].map(s=>(
                <div key={s.l}>
                  <div style={{ fontFamily:"var(--font-syne),Syne,sans-serif", fontWeight:800, fontSize:"1.5rem", color:"var(--text-strong)" }}>
                    <CountUp target={s.target} />
                  </div>
                  <div style={{ fontSize:"0.75rem", color:"var(--text-dim)", marginTop:2 }}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>

          <div id="hp-hero-right" aria-hidden="true" style={{ position:"relative", height:480 }}>
            <div style={{ position:"absolute", width:300, height:300, borderRadius:"50%", background:"radial-gradient(circle,rgba(124,58,237,0.18) 0%,transparent 70%)", top:"50%", left:"50%", transform:"translate(-50%,-50%)", pointerEvents:"none" }} />
            {FLOATING_CARDS.map((card,i)=>(
              <div key={card.id} style={{ position:"absolute", top:card.top, right:card.right, background:"var(--bg-card-md)", backdropFilter:"blur(16px)", border:"1px solid var(--border)", borderRadius:16, padding:"0.875rem 1rem", minWidth:200, animation: `floatCard${i%2} ${3+i*0.5}s ease-in-out ${i*0.4}s infinite`, boxShadow:"0 8px 32px rgba(0,0,0,0.2)" }}>
                {card.id === "top" ? <TopParrainCard parrain={data?.topParrain ?? null} /> : card.content}
              </div>
            ))}
          </div>
        </section>

        {/* ══ COMMENT ÇA MARCHE ═══════════════════════════════════════════════ */}
        <section className="hp-section" style={{ position:"relative", zIndex:1, maxWidth:1200, margin:"0 auto", paddingTop:"1rem", paddingBottom:"2rem" }}>
          <h2 style={{ fontFamily:"var(--font-syne),Syne,sans-serif", fontWeight:700, fontSize:"1.4rem", margin:"0 0 1.5rem", textAlign:"center" }}>Comment ça marche</h2>
          <div id="hp-how" style={{ display:"grid", gap:"1.25rem" }}>
            {HOW_IT_WORKS.map(step=>(
              <div key={step.num} style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:20, padding:"1.5rem 1.5rem 1.5rem", position:"relative", overflow:"hidden" }}>
                <div aria-hidden="true" style={{ position:"absolute", top:12, right:18, fontFamily:"var(--font-syne),Syne,sans-serif", fontWeight:800, fontSize:"2.75rem", color:"var(--step-num)", lineHeight:1 }}>{step.num}</div>
                <h3 style={{ fontFamily:"var(--font-syne),Syne,sans-serif", fontWeight:700, fontSize:"1rem", margin:"0 0 8px", color:"var(--text-strong)", paddingRight:"3rem" }}>{step.title}</h3>
                <p style={{ fontSize:"0.85rem", color:"var(--text-muted)", lineHeight:1.6, margin:0 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ══ MARQUES LES PLUS ACTIVES (≥ 3 marques avec des codes) ═══════════ */}
        {topCodes.length >= 3 && (
        <section className="hp-section" style={{ position:"relative", zIndex:1, maxWidth:1200, margin:"0 auto", paddingTop:"0.5rem", paddingBottom:"2rem" }}>
          <div className="hp-section-head">
            <h2 style={{ fontFamily:"var(--font-syne),Syne,sans-serif", fontWeight:700, fontSize:"1.4rem", margin:0 }}>
              Marques avec le plus de codes
            </h2>
            <Link href="/codes" style={{ fontSize:"0.82rem", color:"#a78bfa", textDecoration:"none", fontWeight:600, whiteSpace:"nowrap" }}>Voir tout →</Link>
          </div>
          <div id="hp-top-codes" style={{ display:"grid", gap:"1rem" }}>
            {topCodes.map(code => (
              <Link key={code.slug} href={`/code-parrainage/${code.slug}`} style={{ textDecoration:"none" }}>
                <div className="top-code-card">
                  <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                    <div style={{ width:48, height:48, borderRadius:14, background:`${code.catColor}18`, border:`1px solid ${code.catColor}35`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, overflow:"hidden" }}>
                      <img
                        src={code.logo}
                        alt=""
                        width={32}
                        height={32}
                        loading="lazy"
                        decoding="async"
                        style={{ objectFit:"contain", borderRadius:6 }}
                        onError={e => { (e.currentTarget as HTMLImageElement).style.display="none"; (e.currentTarget.nextSibling as HTMLElement).style.display="flex"; }}
                      />
                      <span style={{ display:"none" }}><CategoryIcon name={code.category} size={24} /></span>
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontWeight:800, fontSize:"1rem", color:"var(--text-strong)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{code.name}</div>
                      <span style={{ fontSize:"0.68rem", fontWeight:700, color:code.catColor, background:`${code.catColor}18`, border:`1px solid ${code.catColor}30`, borderRadius:6, padding:"1px 7px", whiteSpace:"nowrap", display:"inline-block", marginTop:4 }}>{code.category}</span>
                    </div>
                    {code.gain && (
                    <div style={{ textAlign:"right", flexShrink:0, maxWidth:120 }}>
                      <div style={{ fontFamily:"var(--font-syne),Syne,sans-serif", fontWeight:800, fontSize:"1.2rem", color:"#34d399", lineHeight:1 }}>{code.gain}</div>
                      {code.gainSub && <div style={{ fontSize:"0.68rem", color:"var(--text-dim)", marginTop:3, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{code.gainSub}</div>}
                    </div>
                    )}
                  </div>
                  <p style={{ fontSize:"0.82rem", color:"var(--text-muted)", margin:0, lineHeight:1.55 }}>{code.desc}</p>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:8 }}>
                    <span style={{ fontSize:"0.75rem", color:"var(--text-dim)", fontWeight:500 }}>{code.nbCodes} code{code.nbCodes > 1 ? "s" : ""} publié{code.nbCodes > 1 ? "s" : ""}</span>
                    <span style={{ background:"#7c3aed", color:"#fff", fontWeight:700, fontSize:"0.78rem", padding:"0.45rem 1rem", borderRadius:10 }}>Voir les codes</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
        )}

        {/* ══ CATÉGORIES ══════════════════════════════════════════════════════ */}
        <section className="hp-section" style={{ position:"relative", zIndex:1, maxWidth:1200, margin:"0 auto", paddingTop:"1rem", paddingBottom:"2rem" }}>
          <div className="hp-section-head">
            <h2 style={{ fontFamily:"var(--font-syne),Syne,sans-serif", fontWeight:700, fontSize:"1.4rem", margin:0 }}>Parcourir par catégorie</h2>
            <Link href="/codes" style={{ fontSize:"0.82rem", color:"#a78bfa", textDecoration:"none", fontWeight:600, whiteSpace:"nowrap" }}>Voir tout →</Link>
          </div>
          <div id="hp-cat-grid" style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))", gap:"0.75rem" }}>
            {CATEGORIES.map(cat=>(
              <Link key={cat.slug} href={`/codes?categorie=${cat.slug}`} className="hp-cat-card" style={{ borderBottomColor: cat.color }}>
                <span style={{ display:"flex", alignItems:"center", gap:10, minWidth:0 }}>
                  <CategoryIcon name={cat.slug} size={20} />
                  <span style={{ fontWeight:600, fontSize:"0.875rem", color:"var(--text-strong)" }}>{cat.label}</span>
                </span>
                <span style={{ fontSize:"0.7rem", fontWeight:700, color:cat.color, background:`${cat.color}18`, border:`1px solid ${cat.color}30`, borderRadius:8, padding:"2px 8px", flexShrink:0 }}>{data?.catCounts?.[cat.slug] ?? 0}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* ══ MARQUES RECHERCHÉES ═════════════════════════════════════════════ */}
        <section className="hp-section" style={{ position:"relative", zIndex:1, maxWidth:1200, margin:"0 auto", paddingTop:"1rem", paddingBottom:"3rem" }}>
          <h2 style={{ fontSize:"0.72rem", fontWeight:700, letterSpacing:"0.08em", color:"var(--text-faint)", margin:"0 0 1rem", fontFamily:"var(--font-syne),Syne,sans-serif", textTransform:"uppercase" }}>
            Marques les plus recherchées
          </h2>
          <div style={{ display:"flex", flexWrap:"wrap", gap:"0.5rem" }}>
            {POPULAR_TAGS.map(tag=>(
              <Link key={tag.slug} href={`/code-parrainage/${tag.slug}`} className="hp-tag">Code parrainage {tag.label}</Link>
            ))}
          </div>
        </section>

        {/* ══ FAQ ═══════════════════════════════════════════════════════════════ */}
        <section className="hp-section" style={{ position:"relative", zIndex:1, maxWidth:860, margin:"0 auto", paddingTop:"1rem", paddingBottom:"3.5rem" }}>
          <div style={{ fontSize:"0.72rem", fontWeight:700, letterSpacing:"0.08em", color:"var(--text-faint)", marginBottom:"1.25rem", fontFamily:"var(--font-syne),Syne,sans-serif", textTransform:"uppercase" }}>
            Questions fréquentes
          </div>
          <h2 style={{ fontFamily:"var(--font-syne),Syne,sans-serif", fontWeight:800, fontSize:"1.5rem", color:"var(--text-strong)", margin:"0 0 1.5rem" }}>
            Le parrainage, concrètement
          </h2>
          {FAQ.map(({ q, a }, i) => (
            <details key={i} style={{ borderBottom:"1px solid var(--border)", paddingBottom:"1rem", marginBottom:"1rem" }}>
              <summary style={{ cursor:"pointer", fontWeight:700, fontSize:"0.95rem", color:"var(--text-strong)", padding:"0.5rem 0", listStyle:"none", display:"flex", justifyContent:"space-between", alignItems:"center", gap:12 }}>
                <span>{q}</span>
                <span aria-hidden="true" style={{ color:"#a78bfa", fontSize:"1.1rem", flexShrink:0 }}>+</span>
              </summary>
              <p style={{ color:"var(--text-muted)", fontSize:"0.875rem", lineHeight:1.7, margin:"0.75rem 0 0", paddingLeft:"0.25rem" }}>{a}</p>
            </details>
          ))}
        </section>

        <style>{`
          @keyframes fadeInUp      { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
          @keyframes floatCard0    { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
          @keyframes floatCard1    { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-14px)} }

          details summary::-webkit-details-marker { display: none; }

          .hp-btn { display:inline-flex; align-items:center; justify-content:center; font-weight:700; padding:0.9rem 1.6rem; border-radius:14px; text-decoration:none; font-size:0.95rem; transition:all 0.2s; min-height:48px; }
          .hp-btn-primary { background:#7c3aed; color:#fff; box-shadow:0 8px 32px rgba(124,58,237,0.4); }
          .hp-btn-primary:hover { transform:translateY(-2px); box-shadow:0 12px 40px rgba(124,58,237,0.5); }
          .hp-btn-ghost { background:var(--bg-card-md); color:var(--text-strong); font-weight:600; border:1px solid var(--border-lg); }
          .hp-btn-ghost:hover { background:var(--bg-btn); }

          .hp-section-head { display:flex; align-items:baseline; justify-content:space-between; gap:1rem; flex-wrap:wrap; margin-bottom:1.5rem; }

          .top-code-card { background:var(--bg-card); border:1px solid var(--border); border-radius:18px; padding:1.25rem 1.375rem; display:flex; flex-direction:column; gap:12px; transition:all 0.22s; height:100%; }
          .top-code-card:hover { background:var(--bg-card-hover); border-color:rgba(124,58,237,0.35); transform:translateY(-3px); box-shadow:0 8px 28px rgba(124,58,237,0.12); }

          .hp-cat-card { display:flex; align-items:center; justify-content:space-between; gap:8px; background:var(--bg-card); border:1px solid var(--border); border-bottom:2px solid; border-radius:14px; padding:1rem 1.125rem; text-decoration:none; transition:all 0.2s; min-height:56px; }
          .hp-cat-card:hover { background:var(--bg-card-hover); transform:translateY(-2px); }

          .hp-tag { text-decoration:none; font-size:0.8rem; padding:0.5rem 0.875rem; border-radius:10px; background:var(--bg-card-md); border:1px solid var(--border); color:var(--text-dim); transition:all 0.18s; }
          .hp-tag:hover { background:rgba(124,58,237,0.12); border-color:rgba(124,58,237,0.3); color:#a78bfa; }

          #hp-hero      { grid-template-columns: 1fr 1fr; }
          #hp-how       { grid-template-columns: repeat(3,1fr); }
          #hp-top-codes { grid-template-columns: repeat(3,1fr); }
          .hp-section   { padding-left: 2rem; padding-right: 2rem; }

          @media (max-width: 1024px) {
            #hp-top-codes { grid-template-columns: repeat(2,1fr); }
          }
          @media (max-width: 768px) {
            #hp-hero { grid-template-columns: 1fr; padding: 1.75rem 1rem 2rem; }
            #hp-hero-right { display: none; }
            #hp-how { grid-template-columns: 1fr; }
            .hp-section { padding-left: 1rem; padding-right: 1rem; }
          }
          @media (max-width: 640px) {
            #hp-top-codes { grid-template-columns: 1fr; }
            #hp-hero-stats { gap: 1.25rem; }
            #hp-hero-cta .hp-btn { flex: 1 1 100%; }
          }
        `}</style>
      </main>
    </>
  );
}
