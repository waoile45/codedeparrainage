"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

// ── Data ──────────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { label: "Banque",       slug: "banque",    icon: "🏦", count: 124, color: "#3b82f6" },
  { label: "Crypto",       slug: "crypto",    icon: "₿",  count: 89,  color: "#f59e0b" },
  { label: "Sport & Paris",slug: "sport",     icon: "⚽", count: 97,  color: "#10b981" },
  { label: "Bourse",       slug: "bourse",    icon: "📈", count: 56,  color: "#6366f1" },
  { label: "Énergie",      slug: "energie",   icon: "⚡", count: 43,  color: "#ec4899" },
  { label: "Mobile",       slug: "mobile",    icon: "📱", count: 38,  color: "#8b5cf6" },
  { label: "E-commerce",   slug: "ecommerce", icon: "🛍️", count: 71,  color: "#14b8a6" },
  { label: "Assurance",    slug: "assurance", icon: "🛡️", count: 29,  color: "#f97316" },
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

const AVIS = [
  {
    pseudo: "Alexandre M.", level: "Super Parrain", avatar: "A", color: "#7c3aed", stars: 5,
    company: "Boursobank",
    text: "J'ai gagné 240€ en 3 mois grâce à mes codes Boursobank et Winamax. La plateforme est super simple et les XP motivent vraiment à publier régulièrement.",
    date: "Il y a 2 jours",
  },
  {
    pseudo: "Sarah L.", level: "Parrain Or", avatar: "S", color: "#f59e0b", stars: 5,
    company: "Revolut",
    text: "Top ! J'avais essayé d'autres sites mais ici la vérification des codes est vraiment sérieuse. Plus de codes expirés, que des vraies offres.",
    date: "Il y a 5 jours",
  },
  {
    pseudo: "Romain D.", level: "Parrain Argent", avatar: "R", color: "#6366f1", stars: 5,
    company: "Winamax",
    text: "Le système de boost est efficace, mon code Revolut a été copié 18 fois en une semaine après l'avoir mis en avant. Je recommande.",
    date: "Il y a 1 semaine",
  },
  {
    pseudo: "Camille B.", level: "Parrain Bronze", avatar: "C", color: "#10b981", stars: 4,
    company: "Binance",
    text: "Très bonne expérience. L'interface est agréable et le classement donne envie de s'améliorer. Hâte de passer niveau Parrain Or !",
    date: "Il y a 2 semaines",
  },
];

const FLOATING_CARDS = [
  {
    id: "boost", top: "6%", right: "2%",
    content: (
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        <span style={{ fontSize:22 }}>⚡</span>
        <div>
          <div style={{ fontWeight:700, fontSize:"0.85rem", color:"#fff" }}>Boost activé</div>
          <div style={{ fontSize:"0.72rem", color:"rgba(255,255,255,0.45)" }}>Ton annonce est en tête</div>
        </div>
      </div>
    ),
  },
  {
    id: "top", top: "36%", right: "18%",
    content: (
      <div>
        <div style={{ fontSize:"0.68rem", color:"rgba(255,255,255,0.35)", marginBottom:6, letterSpacing:"0.06em" }}>🏆 TOP PARRAIN</div>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ width:32, height:32, borderRadius:"50%", background:"linear-gradient(135deg,#7c3aed,#a78bfa)", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:"0.75rem", color:"#fff" }}>A</div>
          <div>
            <div style={{ fontWeight:700, fontSize:"0.82rem", color:"#fff" }}>Alexandre M.</div>
            <div style={{ fontSize:"0.68rem", color:"rgba(255,255,255,0.4)" }}>Super Parrain</div>
          </div>
        </div>
        <div style={{ marginTop:8, height:4, borderRadius:9999, background:"rgba(255,255,255,0.08)" }}>
          <div style={{ height:"100%", width:"65%", borderRadius:9999, background:"linear-gradient(90deg,#7c3aed,#a78bfa)" }} />
        </div>
        <div style={{ fontSize:"0.65rem", color:"rgba(255,255,255,0.3)", marginTop:3 }}>65 / 100 XP</div>
      </div>
    ),
  },
  {
    id: "badge", top: "54%", right: "3%",
    content: (
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        <span style={{ fontSize:20 }}>🥉</span>
        <div>
          <div style={{ fontSize:"0.65rem", color:"rgba(255,255,255,0.35)" }}>Nouveau badge !</div>
          <div style={{ fontWeight:700, fontSize:"0.82rem", color:"#fff" }}>Parrain Bronze</div>
        </div>
      </div>
    ),
  },
  {
    id: "copy", top: "72%", right: "19%",
    content: (
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        <div style={{ width:36, height:36, borderRadius:10, background:"rgba(16,185,129,0.15)", border:"1px solid rgba(16,185,129,0.3)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>🏦</div>
        <div>
          <div style={{ fontSize:"0.65rem", color:"rgba(255,255,255,0.35)" }}>✓ Code copié</div>
          <div style={{ fontWeight:700, fontSize:"0.82rem", color:"#fff" }}>Boursobank</div>
          <div style={{ fontSize:"0.72rem", color:"#a78bfa", fontWeight:600 }}>PAUL2024</div>
        </div>
        <div style={{ marginLeft:4, background:"rgba(16,185,129,0.15)", border:"1px solid rgba(16,185,129,0.3)", borderRadius:8, padding:"3px 8px", fontSize:"0.72rem", color:"#34d399", fontWeight:700 }}>+80€</div>
      </div>
    ),
  },
];

// ── Page ──────────────────────────────────────────────────────────────────────

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  return (
    <main style={{ background:"#0A0A0F", minHeight:"100vh", fontFamily:"var(--font-dm-sans),'DM Sans',sans-serif", color:"#fff", overflowX:"hidden" }}>

      {/* Grid bg */}
      <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:0, backgroundImage:"linear-gradient(rgba(255,255,255,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.025) 1px,transparent 1px)", backgroundSize:"60px 60px" }} />
      {/* Glow */}
      <div style={{ position:"fixed", top:-200, left:"50%", transform:"translateX(-50%)", width:700, height:700, borderRadius:"50%", background:"radial-gradient(circle,rgba(124,58,237,0.13) 0%,transparent 65%)", pointerEvents:"none", zIndex:0 }} />

      {/* ══ NAVBAR ══════════════════════════════════════════════════════════ */}
      <nav id="hp-nav" style={{ position:"relative", zIndex:10, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"1.25rem 2rem", maxWidth:1200, margin:"0 auto" }}>
        <Link href="/" style={{ fontFamily:"var(--font-syne),Syne,sans-serif", fontWeight:800, fontSize:"1.1rem", color:"#fff", textDecoration:"none", letterSpacing:"-0.02em" }}>
          code<span style={{ color:"#7c3aed" }}>de</span>parrainage.com
        </Link>
        <div id="hp-nav-links" style={{ display:"flex", alignItems:"center", gap:"0.25rem" }}>
          {[{ label:"Codes", href:"/codes" },{ label:"Classement", href:"/classement" },{ label:"Connexion", href:"/login" }].map(item => (
            <Link key={item.href} href={item.href}
              style={{ color:"rgba(255,255,255,0.55)", fontSize:"0.875rem", fontWeight:500, textDecoration:"none", padding:"0.5rem 0.875rem", borderRadius:10, transition:"color 0.18s" }}
              onMouseEnter={e=>(e.currentTarget.style.color="#fff")}
              onMouseLeave={e=>(e.currentTarget.style.color="rgba(255,255,255,0.55)")}
            >{item.label}</Link>
          ))}
          <Link href="/register"
            style={{ background:"#7c3aed", color:"#fff", fontWeight:700, fontSize:"0.875rem", padding:"0.55rem 1.25rem", borderRadius:12, textDecoration:"none", boxShadow:"0 0 20px rgba(124,58,237,0.35)", transition:"all 0.2s" }}
            onMouseEnter={e=>{ e.currentTarget.style.background="#6d28d9"; e.currentTarget.style.transform="translateY(-1px)"; }}
            onMouseLeave={e=>{ e.currentTarget.style.background="#7c3aed"; e.currentTarget.style.transform="translateY(0)"; }}
          >S&apos;inscrire</Link>
        </div>
      </nav>

      {/* ══ HERO ════════════════════════════════════════════════════════════ */}
      <section id="hp-hero" style={{ position:"relative", zIndex:1, maxWidth:1200, margin:"0 auto", padding:"3rem 2rem 5rem", display:"grid", gap:"2rem", alignItems:"center" }}>

        {/* Left */}
        <div style={{ animation: mounted ? "fadeInUp 0.6s ease both" : "none" }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:999, padding:"0.35rem 0.875rem", marginBottom:"1.75rem", fontSize:"0.78rem", color:"rgba(255,255,255,0.55)" }}>
            <span style={{ width:7, height:7, borderRadius:"50%", background:"#10b981", boxShadow:"0 0 6px #10b981", display:"inline-block" }} />
            +4 200 codes actifs en ce moment
          </div>
          <h1 style={{ fontFamily:"var(--font-syne),Syne,sans-serif", fontWeight:800, fontSize:"clamp(2.8rem,5vw,4.5rem)", lineHeight:1.05, letterSpacing:"-0.03em", margin:0, marginBottom:"1.5rem" }}>
            Parraine,<br /><span style={{ color:"#7c3aed" }}>gagne</span> des<br />récompenses.
          </h1>
          <p style={{ color:"rgba(255,255,255,0.5)", fontSize:"1rem", lineHeight:1.7, maxWidth:460, marginBottom:"2rem" }}>
            La plateforme de parrainage gamifiée. Publie ton code, monte de niveau, débloque des badges et rejoins 850+ parrains vérifiés.
          </p>
          <div style={{ display:"flex", gap:"0.875rem", flexWrap:"wrap" }}>
            <Link href="/codes"
              style={{ background:"#7c3aed", color:"#fff", fontWeight:700, padding:"0.9rem 1.75rem", borderRadius:14, textDecoration:"none", fontSize:"0.95rem", boxShadow:"0 8px 32px rgba(124,58,237,0.4)", transition:"all 0.2s" }}
              onMouseEnter={e=>{ e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow="0 12px 40px rgba(124,58,237,0.5)"; }}
              onMouseLeave={e=>{ e.currentTarget.style.transform="none"; e.currentTarget.style.boxShadow="0 8px 32px rgba(124,58,237,0.4)"; }}
            >Trouver un code gratuit</Link>
            <Link href="/publier"
              style={{ background:"rgba(255,255,255,0.05)", color:"#fff", fontWeight:600, padding:"0.9rem 1.75rem", borderRadius:14, textDecoration:"none", fontSize:"0.95rem", border:"1px solid rgba(255,255,255,0.1)", transition:"all 0.2s" }}
              onMouseEnter={e=>{ e.currentTarget.style.background="rgba(255,255,255,0.09)"; e.currentTarget.style.borderColor="rgba(255,255,255,0.2)"; }}
              onMouseLeave={e=>{ e.currentTarget.style.background="rgba(255,255,255,0.05)"; e.currentTarget.style.borderColor="rgba(255,255,255,0.1)"; }}
            >Publier mon code →</Link>
          </div>
          <div id="hp-hero-stats" style={{ display:"flex", gap:"2rem", marginTop:"2.5rem" }}>
            {[{ n:"4 200+", l:"Codes actifs" },{ n:"850+", l:"Parrains vérifiés" },{ n:"97%", l:"Avis positifs" }].map(s=>(
              <div key={s.l}>
                <div style={{ fontFamily:"var(--font-syne),Syne,sans-serif", fontWeight:800, fontSize:"1.5rem", color:"#fff" }}>{s.n}</div>
                <div style={{ fontSize:"0.75rem", color:"rgba(255,255,255,0.35)", marginTop:2 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right — floating cards */}
        <div id="hp-hero-right" style={{ position:"relative", height:480 }}>
          <div style={{ position:"absolute", width:300, height:300, borderRadius:"50%", background:"radial-gradient(circle,rgba(124,58,237,0.18) 0%,transparent 70%)", top:"50%", left:"50%", transform:"translate(-50%,-50%)", pointerEvents:"none" }} />
          {FLOATING_CARDS.map((card,i)=>(
            <div key={card.id} style={{ position:"absolute", top:card.top, right:card.right, background:"rgba(255,255,255,0.04)", backdropFilter:"blur(16px)", border:"1px solid rgba(255,255,255,0.09)", borderRadius:16, padding:"0.875rem 1rem", minWidth:200, animation: mounted ? `floatCard${i%2} ${3+i*0.5}s ease-in-out infinite` : "none", animationDelay:`${i*0.4}s`, boxShadow:"0 8px 32px rgba(0,0,0,0.4)" }}>
              {card.content}
            </div>
          ))}
        </div>
      </section>

      {/* ══ CATEGORIES ══════════════════════════════════════════════════════ */}
      <section style={{ position:"relative", zIndex:1, maxWidth:1200, margin:"0 auto", padding:"2rem 2rem 4rem" }}>
        <div style={{ display:"flex", alignItems:"baseline", justifyContent:"space-between", marginBottom:"1.5rem" }}>
          <h2 style={{ fontFamily:"var(--font-syne),Syne,sans-serif", fontWeight:700, fontSize:"1.4rem", margin:0 }}>Parcourir par catégorie</h2>
          <Link href="/codes" style={{ fontSize:"0.82rem", color:"#a78bfa", textDecoration:"none", fontWeight:600 }}>Voir tout →</Link>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:"0.875rem" }}>
          {CATEGORIES.map(cat=>(
            <Link key={cat.slug} href={`/codes?categorie=${cat.slug}`} style={{ textDecoration:"none" }}>
              <div
                style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:16, padding:"1.125rem 1.25rem", display:"flex", alignItems:"center", justifyContent:"space-between", transition:"all 0.2s", cursor:"pointer", position:"relative", overflow:"hidden" }}
                onMouseEnter={e=>{ const el=e.currentTarget as HTMLElement; el.style.background="rgba(255,255,255,0.055)"; el.style.borderColor=`${cat.color}40`; el.style.transform="translateY(-2px)"; }}
                onMouseLeave={e=>{ const el=e.currentTarget as HTMLElement; el.style.background="rgba(255,255,255,0.03)"; el.style.borderColor="rgba(255,255,255,0.07)"; el.style.transform="none"; }}
              >
                <div style={{ position:"absolute", bottom:0, left:0, right:0, height:2, background:cat.color, opacity:0.5 }} />
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <span style={{ fontSize:20 }}>{cat.icon}</span>
                  <span style={{ fontWeight:600, fontSize:"0.875rem", color:"#fff" }}>{cat.label}</span>
                </div>
                <span style={{ fontSize:"0.7rem", fontWeight:700, color:cat.color, background:`${cat.color}18`, border:`1px solid ${cat.color}30`, borderRadius:8, padding:"2px 8px" }}>{cat.count}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ══ COMMENT ÇA MARCHE ═══════════════════════════════════════════════ */}
      <section style={{ position:"relative", zIndex:1, maxWidth:1200, margin:"0 auto", padding:"2rem 2rem 4rem" }}>
        <h2 style={{ fontFamily:"var(--font-syne),Syne,sans-serif", fontWeight:700, fontSize:"1.4rem", margin:"0 0 2rem", textAlign:"center" }}>Comment ça marche ?</h2>
        <div id="hp-how" style={{ display:"grid", gap:"1.25rem" }}>
          {[
            { num:"01", title:"Trouve un code",   desc:"Parcours des milliers de codes vérifiés par catégorie ou marque.", icon:"🔍" },
            { num:"02", title:"Parraine & gagne",  desc:"Utilise le code, valide le parrainage et accumule des XP.",       icon:"🎁" },
            { num:"03", title:"Monte de niveau",   desc:"Débloque des badges, grimpe au classement, booste ta visibilité.", icon:"🏆" },
          ].map(step=>(
            <div key={step.num} style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:20, padding:"1.75rem", position:"relative", overflow:"hidden" }}>
              <div style={{ position:"absolute", top:16, right:20, fontFamily:"var(--font-syne),Syne,sans-serif", fontWeight:800, fontSize:"3rem", color:"rgba(124,58,237,0.12)", lineHeight:1 }}>{step.num}</div>
              <div style={{ fontSize:28, marginBottom:12 }}>{step.icon}</div>
              <div style={{ fontFamily:"var(--font-syne),Syne,sans-serif", fontWeight:700, fontSize:"1rem", marginBottom:8 }}>{step.title}</div>
              <div style={{ fontSize:"0.85rem", color:"rgba(255,255,255,0.45)", lineHeight:1.6 }}>{step.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ══ AVIS ════════════════════════════════════════════════════════════ */}
      <section style={{ position:"relative", zIndex:1, maxWidth:1200, margin:"0 auto", padding:"2rem 2rem 4rem" }}>
        <div style={{ display:"flex", alignItems:"baseline", justifyContent:"space-between", marginBottom:"1.5rem" }}>
          <h2 style={{ fontFamily:"var(--font-syne),Syne,sans-serif", fontWeight:700, fontSize:"1.4rem", margin:0 }}>Ce qu&apos;ils en pensent</h2>
          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
            <span style={{ color:"#fbbf24", fontSize:"0.9rem" }}>★★★★★</span>
            <span style={{ fontSize:"0.78rem", color:"rgba(255,255,255,0.35)" }}>4.9 / 5 · 850+ avis</span>
          </div>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:"1rem" }}>
          {AVIS.map(avis=>(
            <div key={avis.pseudo}
              style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:18, padding:"1.25rem 1.375rem", display:"flex", flexDirection:"column", gap:12, transition:"all 0.2s" }}
              onMouseEnter={e=>{ const el=e.currentTarget as HTMLElement; el.style.background="rgba(255,255,255,0.05)"; el.style.borderColor="rgba(255,255,255,0.12)"; }}
              onMouseLeave={e=>{ const el=e.currentTarget as HTMLElement; el.style.background="rgba(255,255,255,0.03)"; el.style.borderColor="rgba(255,255,255,0.07)"; }}
            >
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <div style={{ width:38, height:38, borderRadius:"50%", background:`linear-gradient(135deg,${avis.color},${avis.color}99)`, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:"0.9rem", color:"#fff", flexShrink:0 }}>
                  {avis.avatar}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:700, fontSize:"0.875rem", color:"#fff" }}>{avis.pseudo}</div>
                  <div style={{ fontSize:"0.68rem", color:avis.color, fontWeight:600 }}>{avis.level}</div>
                </div>
                <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:4 }}>
                  <span style={{ color:"#fbbf24", fontSize:"0.8rem" }}>{"★".repeat(avis.stars)}</span>
                  <span style={{ fontSize:"0.65rem", color:"rgba(255,255,255,0.25)" }}>{avis.date}</span>
                </div>
              </div>
              <span style={{ fontSize:"0.68rem", background:"rgba(124,58,237,0.12)", border:"1px solid rgba(124,58,237,0.25)", color:"#a78bfa", padding:"2px 8px", borderRadius:100, alignSelf:"flex-start" }}>{avis.company}</span>
              <p style={{ fontSize:"0.82rem", color:"rgba(255,255,255,0.5)", lineHeight:1.65, margin:0, borderLeft:"2px solid rgba(124,58,237,0.3)", paddingLeft:"0.75rem" }}>
                &ldquo;{avis.text}&rdquo;
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ══ TAGS POPULAIRES ═════════════════════════════════════════════════ */}
      <section style={{ position:"relative", zIndex:1, maxWidth:1200, margin:"0 auto", padding:"1rem 2rem 6rem" }}>
        <div style={{ fontSize:"0.72rem", fontWeight:700, letterSpacing:"0.08em", color:"rgba(255,255,255,0.2)", marginBottom:"1rem", fontFamily:"var(--font-syne),Syne,sans-serif", textTransform:"uppercase" }}>
          Codes populaires
        </div>
        <div style={{ display:"flex", flexWrap:"wrap", gap:"0.5rem" }}>
          {POPULAR_TAGS.map(tag=>(
            <Link key={tag.slug} href={`/codes?search=${encodeURIComponent(tag.label)}`}
              style={{ textDecoration:"none", fontSize:"0.8rem", padding:"0.45rem 0.875rem", borderRadius:10, background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.07)", color:"rgba(255,255,255,0.38)", transition:"all 0.18s" }}
              onMouseEnter={e=>{ const el=e.currentTarget as HTMLElement; el.style.background="rgba(124,58,237,0.12)"; el.style.borderColor="rgba(124,58,237,0.3)"; el.style.color="#a78bfa"; }}
              onMouseLeave={e=>{ const el=e.currentTarget as HTMLElement; el.style.background="rgba(255,255,255,0.04)"; el.style.borderColor="rgba(255,255,255,0.07)"; el.style.color="rgba(255,255,255,0.38)"; }}
            >{tag.label}</Link>
          ))}
        </div>
      </section>

      {/* Keyframes + Mobile */}
      <style>{`
        @keyframes fadeInUp   { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes floatCard0 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes floatCard1 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-14px)} }

        #hp-hero   { grid-template-columns: 1fr 1fr; }
        #hp-how    { grid-template-columns: repeat(3,1fr); }
        #hp-nav    { padding: 1.25rem 2rem; }
        #hp-hero-right { display: block; }

        @media (max-width: 768px) {
          #hp-nav { padding: 1rem 1.25rem !important; }
          #hp-nav-links { display: none !important; }
          #hp-hero { grid-template-columns: 1fr !important; padding: 2rem 1.25rem 3rem !important; }
          #hp-hero-right { display: none !important; }
          #hp-how  { grid-template-columns: 1fr !important; }
          #hp-sections { padding-left: 1.25rem !important; padding-right: 1.25rem !important; }
        }
        @media (max-width: 480px) {
          #hp-hero h1 { font-size: 2.4rem !important; }
          #hp-hero-stats { gap: 1rem !important; }
        }
      `}</style>
    </main>
  );
}