"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";

// ── Packs ──────────────────────────────────────────────────────────────────────
const PACKS = [
  { id:"starter",   label:"Starter",   credits:5,   price:5,  perCredit:1.00, popular:false, color:"rgba(99,102,241,.8)" },
  { id:"standard",  label:"Standard",  credits:20,  price:19, perCredit:0.95, popular:false, color:"rgba(124,58,237,.8)" },
  { id:"pro",       label:"Pro",       credits:50,  price:45, perCredit:0.90, popular:true,  color:"rgba(139,92,246,.9)" },
  { id:"expert",    label:"Expert",    credits:100, price:80, perCredit:0.80, popular:false, color:"rgba(168,85,247,.8)" },
  { id:"legendaire",label:"Légendaire",credits:300, price:210,perCredit:0.70, popular:false, color:"rgba(217,70,239,.8)" },
];

const FEATURES = [
  "Annonce en tête de /codes",
  "Badge ⚡ Boosté visible",
  "Crédits sans expiration",
  "Activation immédiate",
];

const FAQ = [
  { q:"Les crédits expirent-ils ?",           a:"Non, tes crédits sont valables à vie. Tu les utilises quand tu veux." },
  { q:"Combien coûte un boost par jour ?",     a:"0.10 crédit par jour et par annonce. Avec 5 crédits tu peux booster une annonce 50 jours." },
  { q:"Puis-je booster plusieurs annonces ?",  a:"Oui, tu peux répartir tes crédits sur autant d'annonces que tu veux." },
  { q:"Le paiement est-il sécurisé ?",         a:"Oui, le paiement est géré par Stripe — aucune donnée bancaire n'est stockée sur nos serveurs." },
];

export default function CreditsPage() {
  const [credits]    = useState(0.00);
  const [openFaq, setOpenFaq] = useState<number|null>(null);
  const [loading, setLoading] = useState<string|null>(null);

  const handleBuy = async (packId: string) => {
    setLoading(packId);
    // TODO: appel Stripe — window.location.href = stripeCheckoutUrl
    await new Promise(r => setTimeout(r, 800));
    setLoading(null);
  };

  return (
    <>
      <style>{`
        @keyframes float   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
        @keyframes shimmer { 0%{opacity:.5}50%{opacity:1}100%{opacity:.5} }
        @keyframes fadeIn  { from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)} }
        @keyframes spin    { to{transform:rotate(360deg)} }
        *,*::before,*::after { box-sizing:border-box; margin:0; padding:0; }
        body { background:#0A0A0F; color:#e2e8f0; font-family:'DM Sans',sans-serif; min-height:100vh; }

        .page { max-width:900px; margin:0 auto; padding:3rem 1.5rem 6rem; }

        /* Header */
        .page-header { text-align:center; margin-bottom:3rem; }
        .header-label { display:inline-flex; align-items:center; gap:6px; font-size:.72rem; font-weight:600; letter-spacing:.1em; text-transform:uppercase; color:#7c3aed; margin-bottom:.75rem; }
        .header-label::before,.header-label::after { content:''; width:18px; height:1px; background:#7c3aed; display:block; }
        .page-title { font-family:'Syne',sans-serif; font-weight:800; font-size:clamp(1.75rem,4vw,2.5rem); color:#fff; letter-spacing:-.03em; margin-bottom:.5rem; }
        .page-sub { color:rgba(255,255,255,.35); font-size:.9rem; margin-bottom:1.5rem; }

        /* Solde pill */
        .solde-pill {
          display:inline-flex; align-items:center; gap:8px;
          background:rgba(124,58,237,.1); border:1px solid rgba(124,58,237,.25);
          border-radius:100px; padding:.5rem 1.25rem;
          font-size:.875rem; color:rgba(255,255,255,.7);
        }
        .solde-val { font-family:'Syne',sans-serif; font-weight:800; color:#a78bfa; }
        .solde-icon { animation:float 3s ease-in-out infinite; }

        /* Grid */
        .packs-grid {
          display:grid;
          grid-template-columns:repeat(3,1fr);
          gap:.875rem;
          margin-bottom:1rem;
        }
        .packs-grid-bottom {
          display:grid;
          grid-template-columns:repeat(2,1fr);
          gap:.875rem;
          max-width:600px;
          margin:0 auto 3rem;
        }

        /* Pack card */
        .pack-card {
          position:relative; overflow:hidden;
          background:rgba(255,255,255,.03);
          border:1px solid rgba(255,255,255,.08);
          border-radius:20px; padding:1.5rem;
          display:flex; flex-direction:column; gap:1rem;
          transition:all .2s; animation:fadeIn .3s ease;
          cursor:default;
        }
        .pack-card:hover { transform:translateY(-3px); border-color:rgba(124,58,237,.3); box-shadow:0 12px 32px rgba(0,0,0,.3); }
        .pack-card.popular {
          background:rgba(124,58,237,.08);
          border-color:rgba(124,58,237,.4);
          box-shadow:0 0 40px rgba(124,58,237,.12);
        }
        .pack-card.popular::before { content:''; position:absolute; top:0; left:0; right:0; height:1px; background:linear-gradient(90deg,transparent,#7c3aed,transparent); }

        /* Popular badge */
        .popular-badge {
          position:absolute; top:-1px; left:50%; transform:translateX(-50%);
          background:#7c3aed; color:#fff;
          font-size:.65rem; font-weight:700; letter-spacing:.05em;
          padding:3px 12px; border-radius:0 0 10px 10px;
          display:flex; align-items:center; gap:4px;
          white-space:nowrap;
        }

        /* Card top */
        .pack-label { font-size:.7rem; font-weight:700; letter-spacing:.1em; text-transform:uppercase; color:rgba(255,255,255,.4); margin-top:.5rem; }
        .pack-credits { display:flex; align-items:baseline; gap:4px; }
        .pack-credits-num { font-family:'Syne',sans-serif; font-weight:800; font-size:2.5rem; color:#fff; line-height:1; }
        .pack-credits-lbl { font-size:.85rem; color:rgba(255,255,255,.4); }
        .pack-per-credit { font-size:.72rem; color:rgba(255,255,255,.3); margin-top:2px; }

        /* Price */
        .pack-price-row { display:flex; align-items:baseline; gap:5px; padding-top:.75rem; border-top:1px solid rgba(255,255,255,.06); }
        .pack-price { font-family:'Syne',sans-serif; font-weight:800; font-size:1.5rem; color:#fff; }
        .pack-price-ttc { font-size:.75rem; color:rgba(255,255,255,.3); }
        .pack-savings {
          margin-left:auto;
          background:rgba(34,197,94,.1); border:1px solid rgba(34,197,94,.2);
          color:#4ade80; font-size:.65rem; font-weight:700;
          padding:2px 7px; border-radius:100px;
        }

        /* Features */
        .pack-features { display:flex; flex-direction:column; gap:6px; flex:1; }
        .pack-feature { display:flex; align-items:center; gap:7px; font-size:.78rem; color:rgba(255,255,255,.55); }
        .pack-feature-check { width:16px; height:16px; border-radius:50%; background:rgba(124,58,237,.2); border:1px solid rgba(124,58,237,.35); display:flex; align-items:center; justify-content:center; flex-shrink:0; }

        /* Buy button */
        .buy-btn {
          display:flex; align-items:center; justify-content:center; gap:7px;
          width:100%; background:rgba(255,255,255,.06);
          border:1px solid rgba(255,255,255,.1);
          border-radius:12px; padding:.65rem;
          color:#fff; font-size:.855rem; font-weight:600;
          cursor:pointer; transition:all .2s; font-family:'DM Sans',sans-serif;
          margin-top:auto;
        }
        .buy-btn:hover { background:rgba(255,255,255,.1); border-color:rgba(255,255,255,.2); }
        .buy-btn.popular-btn { background:#7c3aed; border-color:#7c3aed; }
        .buy-btn.popular-btn:hover { background:#6d28d9; box-shadow:0 4px 20px rgba(124,58,237,.4); }
        .buy-btn:disabled { opacity:.5; cursor:not-allowed; }

        /* How it works */
        .how-section { margin-bottom:3rem; }
        .section-title { font-family:'Syne',sans-serif; font-weight:800; font-size:1.1rem; color:#fff; margin-bottom:1.25rem; text-align:center; }
        .how-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:.875rem; }
        .how-card { background:rgba(255,255,255,.02); border:1px solid rgba(255,255,255,.06); border-radius:16px; padding:1.25rem; text-align:center; }
        .how-step { width:28px; height:28px; border-radius:50%; background:rgba(124,58,237,.15); border:1px solid rgba(124,58,237,.3); color:#a78bfa; font-family:'Syne',sans-serif; font-weight:800; font-size:.82rem; display:flex; align-items:center; justify-content:center; margin:0 auto .75rem; }
        .how-title { font-weight:700; font-size:.855rem; color:#fff; margin-bottom:4px; }
        .how-desc { font-size:.75rem; color:rgba(255,255,255,.35); line-height:1.5; }

        /* FAQ */
        .faq-section { margin-bottom:3rem; }
        .faq-item { border-bottom:1px solid rgba(255,255,255,.06); }
        .faq-q {
          display:flex; align-items:center; justify-content:space-between;
          padding:.875rem 0; cursor:pointer;
          font-weight:600; font-size:.875rem; color:rgba(255,255,255,.75);
          transition:color .18s;
        }
        .faq-q:hover { color:#fff; }
        .faq-chevron { color:rgba(255,255,255,.3); transition:transform .2s; flex-shrink:0; }
        .faq-chevron.open { transform:rotate(180deg); }
        .faq-a { font-size:.82rem; color:rgba(255,255,255,.4); line-height:1.6; padding-bottom:.875rem; }

        /* Security */
        .security-row { display:flex; align-items:center; justify-content:center; gap:1.5rem; flex-wrap:wrap; padding:1.5rem; background:rgba(255,255,255,.02); border:1px solid rgba(255,255,255,.06); border-radius:16px; }
        .security-item { display:flex; align-items:center; gap:6px; font-size:.78rem; color:rgba(255,255,255,.35); }

        @media(max-width:768px) {
          .packs-grid { grid-template-columns:1fr; }
          .packs-grid-bottom { grid-template-columns:1fr; max-width:100%; }
          .how-grid { grid-template-columns:1fr; }
          .page { padding:2rem 1rem 5rem; }
        }
      `}</style>

      <Navbar activePage="profil" isLoggedIn={true} pseudo="Test3" />

      <main className="page">

        {/* Header */}
        <div className="page-header">
          <div className="header-label">Recharge</div>
          <h1 className="page-title">Crédits Boost ⚡</h1>
          <p className="page-sub">Booste tes annonces et multiplie tes parrainages</p>
          <div className="solde-pill">
            <span className="solde-icon">⚡</span>
            Solde actuel :&nbsp;<span className="solde-val">{credits.toFixed(2)}</span>&nbsp;crédits
          </div>
        </div>

        {/* Packs — top 3 */}
        <div className="packs-grid">
          {PACKS.slice(0,3).map(pack => (
            <div key={pack.id} className={`pack-card ${pack.popular?"popular":""}`}>
              {pack.popular && <div className="popular-badge">⭐ Le plus populaire</div>}
              <div>
                <p className="pack-label">{pack.label}</p>
                <div className="pack-credits">
                  <span className="pack-credits-num">{pack.credits}</span>
                  <span className="pack-credits-lbl">crédits</span>
                </div>
                <p className="pack-per-credit">soit {pack.perCredit.toFixed(2)}€ / crédit</p>
              </div>
              <div className="pack-price-row">
                <span className="pack-price">{pack.price}€</span>
                <span className="pack-price-ttc">TTC</span>
                {pack.id !== "starter" && (
                  <span className="pack-savings">
                    -{Math.round((1 - pack.perCredit)*100)}%
                  </span>
                )}
              </div>
              <div className="pack-features">
                {FEATURES.map((f,i) => (
                  <div key={i} className="pack-feature">
                    <div className="pack-feature-check">
                      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                    </div>
                    {f}
                  </div>
                ))}
              </div>
              <button
                className={`buy-btn ${pack.popular?"popular-btn":""}`}
                onClick={()=>handleBuy(pack.id)}
                disabled={loading === pack.id}
              >
                {loading === pack.id ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation:"spin 1s linear infinite" }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                ) : (
                  <>Acheter — {pack.price}€</>
                )}
              </button>
            </div>
          ))}
        </div>

        {/* Packs — bottom 2 */}
        <div className="packs-grid-bottom">
          {PACKS.slice(3).map(pack => (
            <div key={pack.id} className="pack-card">
              <div>
                <p className="pack-label">{pack.label}</p>
                <div className="pack-credits">
                  <span className="pack-credits-num">{pack.credits}</span>
                  <span className="pack-credits-lbl">crédits</span>
                </div>
                <p className="pack-per-credit">soit {pack.perCredit.toFixed(2)}€ / crédit</p>
              </div>
              <div className="pack-price-row">
                <span className="pack-price">{pack.price}€</span>
                <span className="pack-price-ttc">TTC</span>
                <span className="pack-savings">-{Math.round((1-pack.perCredit)*100)}%</span>
              </div>
              <div className="pack-features">
                {FEATURES.map((f,i) => (
                  <div key={i} className="pack-feature">
                    <div className="pack-feature-check">
                      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                    </div>
                    {f}
                  </div>
                ))}
              </div>
              <button className="buy-btn" onClick={()=>handleBuy(pack.id)} disabled={loading===pack.id}>
                {loading===pack.id
                  ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation:"spin 1s linear infinite" }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                  : <>Acheter — {pack.price}€</>
                }
              </button>
            </div>
          ))}
        </div>

        {/* How it works */}
        <div className="how-section">
          <p className="section-title">Comment ça marche ?</p>
          <div className="how-grid">
            {[
              { n:1, title:"Achète des crédits", desc:"Choisis ton pack et paie en toute sécurité via Stripe." },
              { n:2, title:"Booste tes annonces", desc:"Va sur /boost, sélectionne une annonce et active le boost en 1 clic." },
              { n:3, title:"Gagne plus de parrainages", desc:"Ton annonce passe en tête de liste — 3× plus de vues garanties." },
            ].map(s => (
              <div key={s.n} className="how-card">
                <div className="how-step">{s.n}</div>
                <p className="how-title">{s.title}</p>
                <p className="how-desc">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="faq-section">
          <p className="section-title">Questions fréquentes</p>
          {FAQ.map((item,i) => (
            <div key={i} className="faq-item">
              <div className="faq-q" onClick={()=>setOpenFaq(openFaq===i?null:i)}>
                {item.q}
                <svg className={`faq-chevron ${openFaq===i?"open":""}`} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
              </div>
              {openFaq===i && <p className="faq-a">{item.a}</p>}
            </div>
          ))}
        </div>

        {/* Security */}
        <div className="security-row">
          {[
            { icon:"🔒", label:"Paiement sécurisé Stripe" },
            { icon:"♾️", label:"Crédits sans expiration" },
            { icon:"⚡", label:"Activation immédiate" },
            { icon:"🇫🇷", label:"Support en français" },
          ].map((s,i) => (
            <div key={i} className="security-item">
              <span>{s.icon}</span>
              <span>{s.label}</span>
            </div>
          ))}
        </div>

      </main>
    </>
  );
}