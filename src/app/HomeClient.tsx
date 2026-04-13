"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useTheme } from "@/components/ThemeProvider";

// ── Count-up animation ────────────────────────────────────────────────────────
function CountUp({ target, suffix="" }: { target: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  const started = useRef(false);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true;
        const steps = 40;
        const dur = 3200;
        let cur = 0;
        const inc = target / steps;
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

// ── Particles ─────────────────────────────────────────────────────────────────

const PARTICLES = [
  { id: 0,  left: "3%",   size: 4, delay: "0s",    dur: "12s", opacity: 0.30 },
  { id: 1,  left: "8%",   size: 3, delay: "1.5s",  dur: "10s", opacity: 0.22 },
  { id: 2,  left: "15%",  size: 5, delay: "3s",    dur: "14s", opacity: 0.28 },
  { id: 3,  left: "22%",  size: 3, delay: "0.8s",  dur: "11s", opacity: 0.20 },
  { id: 4,  left: "30%",  size: 4, delay: "2.2s",  dur: "13s", opacity: 0.18 },
  { id: 5,  left: "38%",  size: 3, delay: "4s",    dur: "9s",  opacity: 0.30 },
  { id: 6,  left: "45%",  size: 5, delay: "1s",    dur: "15s", opacity: 0.22 },
  { id: 7,  left: "52%",  size: 3, delay: "3.5s",  dur: "10s", opacity: 0.26 },
  { id: 8,  left: "60%",  size: 4, delay: "0.5s",  dur: "12s", opacity: 0.24 },
  { id: 9,  left: "67%",  size: 3, delay: "2.8s",  dur: "11s", opacity: 0.18 },
  { id: 10, left: "74%",  size: 5, delay: "1.8s",  dur: "13s", opacity: 0.30 },
  { id: 11, left: "81%",  size: 3, delay: "4.5s",  dur: "9s",  opacity: 0.22 },
  { id: 12, left: "88%",  size: 4, delay: "0.3s",  dur: "14s", opacity: 0.26 },
  { id: 13, left: "93%",  size: 3, delay: "3.2s",  dur: "10s", opacity: 0.24 },
  { id: 14, left: "12%",  size: 4, delay: "6s",    dur: "11s", opacity: 0.18 },
  { id: 15, left: "27%",  size: 3, delay: "5s",    dur: "12s", opacity: 0.30 },
  { id: 16, left: "55%",  size: 5, delay: "7s",    dur: "10s", opacity: 0.22 },
  { id: 17, left: "70%",  size: 3, delay: "5.5s",  dur: "13s", opacity: 0.26 },
  { id: 18, left: "85%",  size: 4, delay: "2s",    dur: "15s", opacity: 0.24 },
  { id: 19, left: "42%",  size: 3, delay: "6.5s",  dur: "9s",  opacity: 0.30 },
  { id: 20, left: "18%",  size: 4, delay: "8s",    dur: "11s", opacity: 0.20 },
  { id: 21, left: "35%",  size: 3, delay: "9s",    dur: "12s", opacity: 0.22 },
  { id: 22, left: "63%",  size: 5, delay: "7.5s",  dur: "10s", opacity: 0.28 },
  { id: 23, left: "78%",  size: 3, delay: "8.5s",  dur: "13s", opacity: 0.20 },
  { id: 24, left: "96%",  size: 4, delay: "4.8s",  dur: "14s", opacity: 0.24 },
];

// ── Top Codes ─────────────────────────────────────────────────────────────────

const TOP_CODES = [
  { name: "Boursobank",     icon: "🏦", logo: "https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://boursobank.com&size=128",      category: "Banque",        catColor: "#3b82f6", rating: 4.9, gain: "+130€",   gainSub: "offerts à l'ouverture",    desc: "Banque en ligne, compte gratuit + prime de bienvenue.",        nbCodes: 48, slug: "boursobank"     },
  { name: "Revolut",        icon: "💳", logo: "https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://revolut.com&size=128",          category: "Banque",        catColor: "#3b82f6", rating: 4.7, gain: "+200€",   gainSub: "offerts",                  desc: "Carte internationale sans frais, virements instantanés.",      nbCodes: 31, slug: "revolut"        },
  { name: "Winamax",        icon: "⚽", logo: "https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://winamax.fr&size=128",           category: "Paris sportifs",catColor: "#10b981", rating: 4.8, gain: "+100€",   gainSub: "remboursés si 1er pari perdu", desc: "Le leader des paris sportifs en France.",                nbCodes: 62, slug: "winamax"        },
  { name: "Trade Republic", icon: "📈", logo: "https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://traderepublic.com&size=128",   category: "Bourse",        catColor: "#6366f1", rating: 4.8, gain: "+200€",   gainSub: "d'actions offerts",        desc: "Investissez en actions et ETF à 1€/ordre.",                    nbCodes: 19, slug: "trade-republic" },
  { name: "Betclic",        icon: "🎰", logo: "https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://betclic.fr&size=128",           category: "Paris sportifs",catColor: "#10b981", rating: 4.6, gain: "+30€",    gainSub: "offerts à l'ouverture",    desc: "Plateforme de paris sportifs et casino en ligne.",             nbCodes: 34, slug: "betclic"        },
  { name: "Free Mobile",    icon: "📱", logo: "https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://free.fr&size=128",              category: "Téléphonie",    catColor: "#8b5cf6", rating: 4.5, gain: "+20€",    gainSub: "de réduction",             desc: "Forfait mobile pas cher avec parrainage.",                      nbCodes: 22, slug: "free-mobile"    },
];

// ── Data ──────────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { label: "Banque",        slug: "banque",     icon: "🏦", count: 124, color: "#3b82f6" },
  { label: "Crypto",        slug: "crypto",     icon: "₿",  count: 89,  color: "#f59e0b" },
  { label: "Paris sportifs",slug: "paris",      icon: "⚽", count: 97,  color: "#10b981" },
  { label: "Cashback",      slug: "cashback",   icon: "💸", count: 56,  color: "#6366f1" },
  { label: "Énergie",       slug: "energie",    icon: "⚡", count: 43,  color: "#ec4899" },
  { label: "Téléphonie",    slug: "telephonie", icon: "📱", count: 38,  color: "#8b5cf6" },
  { label: "Shopping",      slug: "shopping",   icon: "🛍️", count: 71,  color: "#14b8a6" },
  { label: "Assurance",     slug: "assurance",  icon: "🛡️", count: 29,  color: "#f97316" },
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
          <div style={{ fontWeight:700, fontSize:"0.85rem", color:"var(--text-strong)" }}>Boost activé</div>
          <div style={{ fontSize:"0.72rem", color:"var(--text-dim)" }}>Ton annonce est en tête</div>
        </div>
      </div>
    ),
  },
  {
    id: "top", top: "36%", right: "18%",
    content: (
      <div>
        <div style={{ fontSize:"0.68rem", color:"var(--text-dim)", marginBottom:6, letterSpacing:"0.06em" }}>🏆 TOP PARRAIN</div>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ width:32, height:32, borderRadius:"50%", background:"linear-gradient(135deg,#7c3aed,#a78bfa)", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:"0.75rem", color:"#fff" }}>A</div>
          <div>
            <div style={{ fontWeight:700, fontSize:"0.82rem", color:"var(--text-strong)" }}>Alexandre M.</div>
            <div style={{ fontSize:"0.68rem", color:"var(--text-dim)" }}>Super Parrain</div>
          </div>
        </div>
        <div style={{ marginTop:8, height:4, borderRadius:9999, background:"var(--border-md)" }}>
          <div style={{ height:"100%", width:"65%", borderRadius:9999, background:"linear-gradient(90deg,#7c3aed,#a78bfa)" }} />
        </div>
        <div style={{ fontSize:"0.65rem", color:"var(--text-faint)", marginTop:3 }}>65 / 100 XP</div>
      </div>
    ),
  },
  {
    id: "badge", top: "54%", right: "3%",
    content: (
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        <span style={{ fontSize:20 }}>🥉</span>
        <div>
          <div style={{ fontSize:"0.65rem", color:"var(--text-dim)" }}>Nouveau badge !</div>
          <div style={{ fontWeight:700, fontSize:"0.82rem", color:"var(--text-strong)" }}>Parrain Bronze</div>
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
          <div style={{ fontSize:"0.65rem", color:"var(--text-dim)" }}>✓ Code copié</div>
          <div style={{ fontWeight:700, fontSize:"0.82rem", color:"var(--text-strong)" }}>Boursobank</div>
          <div style={{ fontSize:"0.72rem", color:"#a78bfa", fontWeight:600 }}>PAUL2024</div>
        </div>
        <div style={{ marginLeft:4, background:"rgba(16,185,129,0.15)", border:"1px solid rgba(16,185,129,0.3)", borderRadius:8, padding:"3px 8px", fontSize:"0.72rem", color:"#34d399", fontWeight:700 }}>+80€</div>
      </div>
    ),
  },
];

// ── Page ──────────────────────────────────────────────────────────────────────

export default function HomeClient() {
  const [mounted, setMounted] = useState(false);
  const { theme, toggle } = useTheme();
  useEffect(() => { setMounted(true); }, []);

  return (
    <main style={{ background:"var(--bg)", minHeight:"100vh", fontFamily:"var(--font-dm-sans),'DM Sans',sans-serif", color:"var(--text-strong)", overflowX:"hidden" }}>

      {/* ── Particles ─────────────────────────────────────────────────────── */}
      {mounted && (
        <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:0, overflow:"hidden" }}>
          {PARTICLES.map(p => (
            <div
              key={p.id}
              style={{
                position:"absolute",
                left: p.left,
                top: "-20px",
                width: p.size,
                height: p.size,
                borderRadius: "50%",
                background: "#7c3aed",
                opacity: p.opacity,
                animation: `particleFall ${p.dur} linear ${p.delay} infinite`,
              }}
            />
          ))}
        </div>
      )}

      {/* Grid bg */}
      <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:0, backgroundImage:"linear-gradient(rgba(124,58,237,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(124,58,237,0.04) 1px,transparent 1px)", backgroundSize:"60px 60px" }} />
      {/* Glow */}
      <div style={{ position:"fixed", top:-200, left:"50%", transform:"translateX(-50%)", width:700, height:700, borderRadius:"50%", background:"radial-gradient(circle,rgba(124,58,237,0.13) 0%,transparent 65%)", pointerEvents:"none", zIndex:0 }} />

      {/* ══ NAVBAR ══════════════════════════════════════════════════════════ */}
      <nav id="hp-nav" style={{ position:"relative", zIndex:10, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"1.25rem 2rem", maxWidth:1200, margin:"0 auto" }}>
        <Link id="hp-nav-logo" href="/" style={{ fontFamily:"var(--font-syne),Syne,sans-serif", fontWeight:800, fontSize:"1.1rem", color:"var(--text-strong)", textDecoration:"none", letterSpacing:"-0.02em", display:"flex", alignItems:"center", gap:8 }}>
          <img src="/logo.jpg" alt="codedeparrainage.com" style={{ height:32, width:"auto", borderRadius:6, objectFit:"contain" }} />
        </Link>
        <div id="hp-nav-links" style={{ display:"flex", alignItems:"center", gap:"0.25rem" }}>
          {[{ label:"Codes", href:"/codes" },{ label:"Classement", href:"/classement" },{ label:"Connexion", href:"/login" }].map(item => (
            <Link key={item.href} href={item.href}
              style={{ color:"var(--text-link)", fontSize:"0.875rem", fontWeight:500, textDecoration:"none", padding:"0.5rem 0.875rem", borderRadius:10, transition:"color 0.18s" }}
              onMouseEnter={e=>(e.currentTarget.style.color="var(--text-strong)")}
              onMouseLeave={e=>(e.currentTarget.style.color="var(--text-link)")}
            >{item.label}</Link>
          ))}
          <button
            onClick={toggle}
            title={theme === "light" ? "Passer en mode sombre" : "Passer en mode clair"}
            style={{ background:"var(--bg-card-md)", border:"1px solid var(--border-lg)", borderRadius:10, width:38, height:38, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:"var(--text-dim)", fontSize:"1rem", transition:"all 0.18s", flexShrink:0 }}
            onMouseEnter={e=>{ e.currentTarget.style.background="var(--bg-btn)"; e.currentTarget.style.color="var(--text-strong)"; }}
            onMouseLeave={e=>{ e.currentTarget.style.background="var(--bg-card-md)"; e.currentTarget.style.color="var(--text-dim)"; }}
          >
            {theme === "light"
              ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z"/></svg>
              : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
            }
          </button>
          <Link href="/register"
            style={{ background:"#7c3aed", color:"#fff", fontWeight:700, fontSize:"0.875rem", padding:"0.55rem 1.25rem", borderRadius:12, textDecoration:"none", boxShadow:"0 0 20px rgba(124,58,237,0.35)", transition:"all 0.2s" }}
            onMouseEnter={e=>{ e.currentTarget.style.background="#6d28d9"; e.currentTarget.style.transform="translateY(-1px)"; }}
            onMouseLeave={e=>{ e.currentTarget.style.background="#7c3aed"; e.currentTarget.style.transform="translateY(0)"; }}
          >S&apos;inscrire</Link>
        </div>
      </nav>

      {/* ══ HERO ════════════════════════════════════════════════════════════ */}
      <section id="hp-hero" style={{ position:"relative", zIndex:1, maxWidth:1200, margin:"0 auto", padding:"1.5rem 2rem 2.5rem", display:"grid", gap:"2rem", alignItems:"center" }}>

        {/* Left */}
        <div style={{ animation: mounted ? "fadeInUp 0.6s ease both" : "none" }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"var(--bg-card-md)", border:"1px solid var(--border-lg)", borderRadius:999, padding:"0.35rem 0.875rem", marginBottom:"1.75rem", fontSize:"0.78rem", color:"var(--text-link)" }}>
            <span style={{ width:7, height:7, borderRadius:"50%", background:"#10b981", boxShadow:"0 0 6px #10b981", display:"inline-block" }} />
            +4 200 codes actifs en ce moment
          </div>
          <h1 style={{ fontFamily:"var(--font-syne),Syne,sans-serif", fontWeight:800, fontSize:"clamp(2.8rem,5vw,4.5rem)", lineHeight:1.05, letterSpacing:"-0.03em", margin:0, marginBottom:"1.5rem", color:"var(--text-strong)" }}>
            Parraine et<br /><span style={{ color:"#7c3aed" }}>gagne</span> des<br />récompenses.
          </h1>
          <p style={{ color:"var(--text-muted)", fontSize:"1rem", lineHeight:1.7, maxWidth:460, marginBottom:"2rem" }}>
            La plateforme de parrainage gamifiée. Publie ton code, monte de niveau, débloque des badges et rejoins 850+ parrains vérifiés.
          </p>
          <div style={{ display:"flex", gap:"0.875rem", flexWrap:"wrap" }}>
            <Link href="/codes"
              style={{ background:"#7c3aed", color:"#fff", fontWeight:700, padding:"0.9rem 1.75rem", borderRadius:14, textDecoration:"none", fontSize:"0.95rem", boxShadow:"0 8px 32px rgba(124,58,237,0.4)", transition:"all 0.2s" }}
              onMouseEnter={e=>{ e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow="0 12px 40px rgba(124,58,237,0.5)"; }}
              onMouseLeave={e=>{ e.currentTarget.style.transform="none"; e.currentTarget.style.boxShadow="0 8px 32px rgba(124,58,237,0.4)"; }}
            >Trouver un code gratuit</Link>
            <Link href="/publier"
              style={{ background:"var(--bg-card-md)", color:"var(--text-strong)", fontWeight:600, padding:"0.9rem 1.75rem", borderRadius:14, textDecoration:"none", fontSize:"0.95rem", border:"1px solid var(--border-lg)", transition:"all 0.2s" }}
              onMouseEnter={e=>{ e.currentTarget.style.background="var(--bg-btn)"; e.currentTarget.style.borderColor="var(--border-md)"; }}
              onMouseLeave={e=>{ e.currentTarget.style.background="var(--bg-card-md)"; e.currentTarget.style.borderColor="var(--border-lg)"; }}
            >Publier mon code →</Link>
          </div>
          <div id="hp-hero-stats" style={{ display:"flex", gap:"2rem", marginTop:"2.5rem" }}>
            {[
              { target:4200, suffix:"+", l:"Codes actifs" },
              { target:850,  suffix:"+", l:"Parrains vérifiés" },
              { target:97,   suffix:"%", l:"Avis positifs" },
            ].map(s=>(
              <div key={s.l}>
                <div style={{ fontFamily:"var(--font-syne),Syne,sans-serif", fontWeight:800, fontSize:"1.5rem", color:"var(--text-strong)" }}>
                  <CountUp target={s.target} suffix={s.suffix} />
                </div>
                <div style={{ fontSize:"0.75rem", color:"var(--text-dim)", marginTop:2 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right — floating cards */}
        <div id="hp-hero-right" style={{ position:"relative", height:480 }}>
          <div style={{ position:"absolute", width:300, height:300, borderRadius:"50%", background:"radial-gradient(circle,rgba(124,58,237,0.18) 0%,transparent 70%)", top:"50%", left:"50%", transform:"translate(-50%,-50%)", pointerEvents:"none" }} />
          {FLOATING_CARDS.map((card,i)=>(
            <div key={card.id} style={{ position:"absolute", top:card.top, right:card.right, background:"var(--bg-card-md)", backdropFilter:"blur(16px)", border:"1px solid var(--border)", borderRadius:16, padding:"0.875rem 1rem", minWidth:200, animation: mounted ? `floatCard${i%2} ${3+i*0.5}s ease-in-out ${i*0.4}s infinite` : "none", boxShadow:"0 8px 32px rgba(0,0,0,0.2)" }}>
              {card.content}
            </div>
          ))}
        </div>
      </section>

      {/* ══ COMMENT ÇA MARCHE ═══════════════════════════════════════════════ */}
      <section className="hp-section" style={{ position:"relative", zIndex:1, maxWidth:1200, margin:"0 auto", paddingTop:"1rem", paddingBottom:"2rem" }}>
        <h2 style={{ fontFamily:"var(--font-syne),Syne,sans-serif", fontWeight:700, fontSize:"1.4rem", margin:"0 0 1.5rem", textAlign:"center" }}>Comment ça marche ?</h2>
        <div id="hp-how" style={{ display:"grid", gap:"1.25rem" }}>
          {[
            { num:"01", title:"Trouve un code",   desc:"Parcours des milliers de codes vérifiés par catégorie ou marque.", icon:"🔍" },
            { num:"02", title:"Parraine & gagne",  desc:"Utilise le code, valide le parrainage et accumule des XP.",       icon:"🎁" },
            { num:"03", title:"Monte de niveau",   desc:"Débloque des badges, grimpe au classement, booste ta visibilité.", icon:"🏆" },
          ].map(step=>(
            <div key={step.num} style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:20, padding:"1.75rem", position:"relative", overflow:"hidden" }}>
              <div style={{ position:"absolute", top:16, right:20, fontFamily:"var(--font-syne),Syne,sans-serif", fontWeight:800, fontSize:"3rem", color:"var(--step-num)", lineHeight:1 }}>{step.num}</div>
              <div style={{ fontSize:28, marginBottom:12 }}>{step.icon}</div>
              <div style={{ fontFamily:"var(--font-syne),Syne,sans-serif", fontWeight:700, fontSize:"1rem", marginBottom:8, color:"var(--text-strong)" }}>{step.title}</div>
              <div style={{ fontSize:"0.85rem", color:"var(--text-muted)", lineHeight:1.6 }}>{step.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ══ MEILLEURS CODES ═════════════════════════════════════════════════ */}
      <section className="hp-section" style={{ position:"relative", zIndex:1, maxWidth:1200, margin:"0 auto", paddingTop:"0.5rem", paddingBottom:"2rem" }}>
        <div style={{ display:"flex", alignItems:"baseline", justifyContent:"space-between", marginBottom:"1.5rem" }}>
          <h2 style={{ fontFamily:"var(--font-syne),Syne,sans-serif", fontWeight:700, fontSize:"1.4rem", margin:0 }}>
            🔥 Codes les plus populaires
          </h2>
          <Link href="/codes" style={{ fontSize:"0.82rem", color:"#a78bfa", textDecoration:"none", fontWeight:600 }}>Voir tout →</Link>
        </div>
        <div id="hp-top-codes" style={{ display:"grid", gap:"1rem" }}>
          {TOP_CODES.map(code => (
            <Link key={code.slug} href={`/code-parrainage/${code.slug}`} style={{ textDecoration:"none" }}>
              <div
                className="top-code-card"
                style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:18, padding:"1.375rem 1.5rem", display:"flex", flexDirection:"column", gap:12, transition:"all 0.22s", cursor:"pointer" }}
                onMouseEnter={e=>{ const el=e.currentTarget as HTMLElement; el.style.background="var(--bg-card-hover)"; el.style.borderColor=`${code.catColor}50`; el.style.transform="translateY(-3px)"; el.style.boxShadow=`0 8px 28px ${code.catColor}22`; el.style.filter="brightness(1.04)"; }}
                onMouseLeave={e=>{ const el=e.currentTarget as HTMLElement; el.style.background="var(--bg-card)"; el.style.borderColor="var(--border)"; el.style.transform="none"; el.style.boxShadow="none"; el.style.filter="none"; }}
              >
                {/* Top row: icon + name + rating | gain */}
                <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                  <div style={{ width:50, height:50, borderRadius:14, background:`${code.catColor}18`, border:`1px solid ${code.catColor}35`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:26, flexShrink:0, overflow:"hidden" }}>
                    <img
                      src={code.logo}
                      alt={code.name}
                      width={34}
                      height={34}
                      style={{ objectFit:"contain", borderRadius:6 }}
                      onError={e => { (e.currentTarget as HTMLImageElement).style.display="none"; (e.currentTarget.nextSibling as HTMLElement).style.display="flex"; }}
                    />
                    <span style={{ display:"none", fontSize:26 }}>{code.icon}</span>
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontWeight:800, fontSize:"1rem", color:"var(--text-strong)" }}>{code.name}</div>
                    <div style={{ display:"flex", alignItems:"center", gap:6, marginTop:3 }}>
                      <span style={{ fontSize:"0.68rem", fontWeight:700, color:code.catColor, background:`${code.catColor}18`, border:`1px solid ${code.catColor}30`, borderRadius:6, padding:"1px 7px", whiteSpace:"nowrap" }}>{code.category}</span>
                      <span style={{ fontSize:"0.72rem", color:"#fbbf24" }}>★</span>
                      <span style={{ fontSize:"0.72rem", color:"var(--text-dim)", fontWeight:600 }}>{code.rating}</span>
                    </div>
                  </div>
                  <div style={{ textAlign:"right", flexShrink:0, maxWidth:130 }}>
                    <div style={{ fontFamily:"var(--font-syne),Syne,sans-serif", fontWeight:800, fontSize:"1.35rem", color:"#34d399", lineHeight:1 }}>{code.gain}</div>
                    <div style={{ fontSize:"0.68rem", color:"var(--text-dim)", marginTop:3, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{code.gainSub}</div>
                  </div>
                </div>
                {/* Description */}
                <p style={{ fontSize:"0.82rem", color:"var(--text-muted)", margin:0, lineHeight:1.55 }}>{code.desc}</p>
                {/* Bottom row: nb codes + button */}
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                  <span style={{ fontSize:"0.75rem", color:"var(--text-dim)", fontWeight:500 }}>{code.nbCodes} codes disponibles</span>
                  <div style={{ background:"#7c3aed", color:"#fff", fontWeight:700, fontSize:"0.78rem", padding:"0.45rem 1rem", borderRadius:10, pointerEvents:"none" }}>Voir les codes</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ══ CATEGORIES ══════════════════════════════════════════════════════ */}
      <section className="hp-section" style={{ position:"relative", zIndex:1, maxWidth:1200, margin:"0 auto", paddingTop:"1rem", paddingBottom:"2rem" }}>
        <div style={{ display:"flex", alignItems:"baseline", justifyContent:"space-between", marginBottom:"1.5rem" }}>
          <h2 style={{ fontFamily:"var(--font-syne),Syne,sans-serif", fontWeight:700, fontSize:"1.4rem", margin:0 }}>Parcourir par catégorie</h2>
          <Link href="/codes" style={{ fontSize:"0.82rem", color:"#a78bfa", textDecoration:"none", fontWeight:600 }}>Voir tout →</Link>
        </div>
        <div id="hp-cat-grid" style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:"0.875rem" }}>
          {CATEGORIES.map(cat=>(
            <Link key={cat.slug} href={`/codes?categorie=${cat.slug}`} style={{ textDecoration:"none" }}>
              <div
                style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:16, padding:"1.125rem 1.25rem", display:"flex", alignItems:"center", justifyContent:"space-between", transition:"all 0.2s", cursor:"pointer", position:"relative", overflow:"hidden" }}
                onMouseEnter={e=>{ const el=e.currentTarget as HTMLElement; el.style.background="var(--bg-card-hover)"; el.style.borderColor=`${cat.color}40`; el.style.transform="translateY(-2px)"; }}
                onMouseLeave={e=>{ const el=e.currentTarget as HTMLElement; el.style.background="var(--bg-card)"; el.style.borderColor="var(--border)"; el.style.transform="none"; }}
              >
                <div style={{ position:"absolute", bottom:0, left:0, right:0, height:2, background:cat.color, opacity:0.5 }} />
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <span style={{ fontSize:20 }}>{cat.icon}</span>
                  <span style={{ fontWeight:600, fontSize:"0.875rem", color:"var(--text-strong)" }}>{cat.label}</span>
                </div>
                <span style={{ fontSize:"0.7rem", fontWeight:700, color:cat.color, background:`${cat.color}18`, border:`1px solid ${cat.color}30`, borderRadius:8, padding:"2px 8px" }}>{cat.count}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ══ AVIS ════════════════════════════════════════════════════════════ */}
      <section className="hp-section" style={{ position:"relative", zIndex:1, maxWidth:1200, margin:"0 auto", paddingTop:"1rem", paddingBottom:"2rem" }}>
        <div style={{ display:"flex", alignItems:"baseline", justifyContent:"space-between", marginBottom:"1.5rem" }}>
          <h2 style={{ fontFamily:"var(--font-syne),Syne,sans-serif", fontWeight:700, fontSize:"1.4rem", margin:0 }}>Ce qu&apos;ils en pensent</h2>
          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
            <span style={{ color:"#fbbf24", fontSize:"0.9rem" }}>★★★★★</span>
            <span style={{ fontSize:"0.78rem", color:"var(--text-dim)" }}>4.9 / 5 · 850+ avis</span>
          </div>
        </div>
        <div id="hp-avis-grid" style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:"1rem" }}>
          {AVIS.map(avis=>(
            <div key={avis.pseudo}
              style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:18, padding:"1.25rem 1.375rem", display:"flex", flexDirection:"column", gap:12, transition:"all 0.2s" }}
              onMouseEnter={e=>{ const el=e.currentTarget as HTMLElement; el.style.background="var(--bg-card-hover)"; el.style.borderColor="var(--border-lg)"; }}
              onMouseLeave={e=>{ const el=e.currentTarget as HTMLElement; el.style.background="var(--bg-card)"; el.style.borderColor="var(--border)"; }}
            >
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <div style={{ width:38, height:38, borderRadius:"50%", background:`linear-gradient(135deg,${avis.color},${avis.color}99)`, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:"0.9rem", color:"#fff", flexShrink:0 }}>
                  {avis.avatar}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:700, fontSize:"0.875rem", color:"var(--text-strong)" }}>{avis.pseudo}</div>
                  <div style={{ fontSize:"0.68rem", color:avis.color, fontWeight:600 }}>{avis.level}</div>
                </div>
                <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:4 }}>
                  <span style={{ color:"#fbbf24", fontSize:"0.8rem" }}>{"★".repeat(avis.stars)}</span>
                  <span style={{ fontSize:"0.65rem", color:"var(--text-faint)" }}>{avis.date}</span>
                </div>
              </div>
              <span style={{ fontSize:"0.68rem", background:"rgba(124,58,237,0.12)", border:"1px solid rgba(124,58,237,0.25)", color:"#a78bfa", padding:"2px 8px", borderRadius:100, alignSelf:"flex-start" }}>{avis.company}</span>
              <p style={{ fontSize:"0.82rem", color:"var(--text-muted)", lineHeight:1.65, margin:0, borderLeft:"2px solid rgba(124,58,237,0.3)", paddingLeft:"0.75rem" }}>
                &ldquo;{avis.text}&rdquo;
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ══ TAGS POPULAIRES ═════════════════════════════════════════════════ */}
      <section className="hp-section" style={{ position:"relative", zIndex:1, maxWidth:1200, margin:"0 auto", paddingTop:"1rem", paddingBottom:"3rem" }}>
        <div style={{ fontSize:"0.72rem", fontWeight:700, letterSpacing:"0.08em", color:"var(--text-faint)", marginBottom:"1rem", fontFamily:"var(--font-syne),Syne,sans-serif", textTransform:"uppercase" }}>
          Codes populaires
        </div>
        <div style={{ display:"flex", flexWrap:"wrap", gap:"0.5rem" }}>
          {POPULAR_TAGS.map(tag=>(
            <Link key={tag.slug} href={`/code-parrainage/${tag.slug}`}
              style={{ textDecoration:"none", fontSize:"0.8rem", padding:"0.45rem 0.875rem", borderRadius:10, background:"var(--bg-card-md)", border:"1px solid var(--border)", color:"var(--text-dim)", transition:"all 0.18s" }}
              onMouseEnter={e=>{ const el=e.currentTarget as HTMLElement; el.style.background="rgba(124,58,237,0.12)"; el.style.borderColor="rgba(124,58,237,0.3)"; el.style.color="#a78bfa"; }}
              onMouseLeave={e=>{ const el=e.currentTarget as HTMLElement; el.style.background="var(--bg-card-md)"; el.style.borderColor="var(--border)"; el.style.color="var(--text-dim)"; }}
            >{tag.label}</Link>
          ))}
        </div>
      </section>

      {/* Keyframes + Mobile */}
      <style>{`
        @keyframes fadeInUp      { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes floatCard0    { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes floatCard1    { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-14px)} }
        @keyframes particleFall  {
          0%   { transform: translateY(-20px); opacity: 0; }
          8%   { opacity: 1; }
          92%  { opacity: 1; }
          100% { transform: translateY(105vh);  opacity: 0; }
        }

        #hp-hero   { grid-template-columns: 1fr 1fr; }
        #hp-how    { grid-template-columns: repeat(3,1fr); }
        #hp-top-codes { grid-template-columns: repeat(3,1fr); }
        #hp-nav    { padding: 1.25rem 2rem; }
        #hp-hero-right { display: block; }

        .hp-section { padding-left: 2rem; padding-right: 2rem; }

        @media (max-width: 768px) {
          #hp-nav { padding: 0.875rem 1rem !important; }
          #hp-nav-links { display: none !important; }
          #hp-hero { grid-template-columns: 1fr !important; padding: 1.75rem 1rem 2.5rem !important; }
          #hp-hero-right { display: none !important; }
          #hp-how  { grid-template-columns: 1fr !important; }
          #hp-top-codes { grid-template-columns: repeat(2,1fr) !important; }
          .hp-section { padding-left: 1rem !important; padding-right: 1rem !important; }
          #hp-cat-grid { grid-template-columns: repeat(2, 1fr) !important; }
          #hp-avis-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 480px) {
          #hp-hero h1 { font-size: 2.2rem !important; }
          #hp-hero-stats { gap: 1.25rem !important; flex-wrap: wrap !important; }
          #hp-nav-logo { font-size: 0.92rem !important; }
          #hp-top-codes { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </main>
  );
}
