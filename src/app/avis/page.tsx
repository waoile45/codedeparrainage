"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import { createClient } from "@/lib/supabase";

// ⚠️ Remplace par ton URL Google Business / Google Maps review
const GOOGLE_REVIEW_URL = "https://g.page/r/CWGFDaSeMPebEAE/review";

// ── Types ──────────────────────────────────────────────────────────────────────
type Step = "rate" | "positive" | "negative" | "done";

// ── Star rating ───────────────────────────────────────────────────────────────
function Stars({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div style={{ display:"flex", gap:8, justifyContent:"center" }}>
      {[1,2,3,4,5].map(n => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          style={{ background:"none", border:"none", cursor:"pointer", padding:4, transition:"transform .15s", transform:(hovered||value) >= n ? "scale(1.15)" : "scale(1)" }}
        >
          <svg width="36" height="36" viewBox="0 0 24 24" fill={(hovered||value) >= n ? "#f59e0b" : "none"} stroke={(hovered||value) >= n ? "#f59e0b" : "rgba(255,255,255,.2)"} strokeWidth="1.5">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
        </button>
      ))}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function AvisPage() {
  const [step, setStep]       = useState<Step>("rate");
  const [rating, setRating]   = useState(0);
  const [comment, setComment] = useState("");
  const [sending, setSending] = useState(false);

  const isPositive = rating >= 4;

  async function handleRate() {
    if (!rating) return;
    if (isPositive) {
      setStep("positive");
    } else {
      setStep("negative");
    }
  }

  async function handleSubmitNegative() {
    setSending(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from("platform_reviews").insert({
        user_id: user?.id ?? null,
        rating,
        comment: comment.trim() || null,
      });
    } catch { /* silencieux */ }
    setSending(false);
    setStep("done");
  }

  const LABELS: Record<number,string> = {
    1:"Très mauvais 😤",
    2:"Pas terrible 😕",
    3:"Correct 😐",
    4:"Bien 😊",
    5:"Excellent ! 🤩",
  };

  return (
    <>
      <style>{`
        @keyframes fadeIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pop    { 0%{transform:scale(.8);opacity:0} 60%{transform:scale(1.1)} 100%{transform:scale(1);opacity:1} }
        @keyframes spin   { to{transform:rotate(360deg)} }
        *,*::before,*::after { box-sizing:border-box; margin:0; padding:0; }
        body { background:var(--bg); color:var(--text); font-family:'DM Sans',sans-serif; min-height:100vh; }
        .page { max-width:560px; margin:0 auto; padding:3rem 1.5rem 6rem; }
        .page-header { text-align:center; margin-bottom:2.5rem; }
        .header-label { display:inline-flex; align-items:center; gap:6px; font-size:.72rem; font-weight:600; letter-spacing:.1em; text-transform:uppercase; color:#7c3aed; margin-bottom:.75rem; }
        .header-label::before,.header-label::after { content:''; display:block; width:18px; height:1px; background:#7c3aed; }
        .page-title { font-family:'Syne',sans-serif; font-weight:800; font-size:clamp(1.5rem,4vw,2rem); color:var(--text-strong); letter-spacing:-.03em; margin-bottom:.5rem; }
        .page-sub { color:var(--text-dim); font-size:.875rem; }
        .card { background:var(--bg-card); border:1px solid var(--border); border-radius:24px; padding:2.5rem 2rem; animation:fadeIn .35s ease; }
        .btn-primary { display:flex; align-items:center; justify-content:center; gap:7px; width:100%; background:#7c3aed; color:#fff; border:none; border-radius:13px; padding:.875rem; font-size:.9rem; font-weight:700; cursor:pointer; transition:all .2s; font-family:'DM Sans',sans-serif; margin-top:1.5rem; }
        .btn-primary:hover:not(:disabled) { background:#6d28d9; transform:translateY(-1px); box-shadow:0 6px 24px rgba(124,58,237,.4); }
        .btn-primary:disabled { opacity:.4; cursor:not-allowed; transform:none; }
        .btn-ghost { display:flex; align-items:center; justify-content:center; gap:6px; width:100%; background:none; color:var(--text-muted); border:1px solid var(--border-btn-ghost); border-radius:13px; padding:.8rem; font-size:.875rem; font-weight:600; cursor:pointer; transition:all .2s; font-family:'DM Sans',sans-serif; margin-top:.75rem; }
        .btn-ghost:hover { color:var(--text-strong); border-color:var(--border-lg); }
        .form-input { background:var(--bg-input); border:1px solid var(--border-md); border-radius:12px; padding:.75rem 1rem; color:var(--text-strong); font-size:.875rem; font-family:'DM Sans',sans-serif; outline:none; transition:all .2s; width:100%; resize:vertical; min-height:120px; }
        .form-input:focus { border-color:rgba(124,58,237,.4); background:rgba(124,58,237,.05); box-shadow:0 0 0 3px rgba(124,58,237,.1); }
        .form-input::placeholder { color:var(--text-faint); }
        @media(max-width:600px) { .page{padding:2rem 1rem 5rem;} }
      `}</style>

      <Navbar />

      <main className="page">
        <div className="page-header">
          <div className="header-label">Ton avis</div>
          <h1 className="page-title">Que penses-tu de notre site ?</h1>
          <p className="page-sub">Ton avis nous aide à nous améliorer</p>
        </div>

        <div className="card">

          {/* ── Step 1 : choix de la note ── */}
          {step === "rate" && (
            <div style={{ textAlign:"center" }}>
              <p style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:"1.1rem", color:"var(--text-strong)", marginBottom:"1.75rem" }}>
                Appréciez-vous codedeparrainage.com ?
              </p>
              <Stars value={rating} onChange={setRating} />
              {rating > 0 && (
                <p style={{ marginTop:"0.875rem", fontSize:".9rem", color:"#a78bfa", fontWeight:600, animation:"fadeIn .2s ease" }}>
                  {LABELS[rating]}
                </p>
              )}
              <div style={{ display:"flex", gap:10, marginTop:"1.5rem", justifyContent:"center" }}>
                <button
                  type="button"
                  style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:6, background:"rgba(239,68,68,.08)", border:"1px solid rgba(239,68,68,.25)", borderRadius:13, padding:".8rem", color:"#f87171", fontSize:".875rem", fontWeight:600, cursor:"pointer", transition:"all .2s", fontFamily:"'DM Sans',sans-serif" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "rgba(239,68,68,.15)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "rgba(239,68,68,.08)")}
                  onClick={() => { setRating(r => r || 1); setStep("negative"); }}
                >
                  👎 Non
                </button>
                <button
                  type="button"
                  style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:6, background:"rgba(34,197,94,.08)", border:"1px solid rgba(34,197,94,.25)", borderRadius:13, padding:".8rem", color:"#4ade80", fontSize:".875rem", fontWeight:600, cursor:"pointer", transition:"all .2s", fontFamily:"'DM Sans',sans-serif" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "rgba(34,197,94,.15)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "rgba(34,197,94,.08)")}
                  onClick={() => { setRating(r => r >= 4 ? r : 5); setStep("positive"); }}
                >
                  👍 Oui
                </button>
              </div>
              {rating > 0 && (
                <button className="btn-primary" onClick={handleRate}>
                  Continuer →
                </button>
              )}
            </div>
          )}

          {/* ── Step 2a : avis positif → Google ── */}
          {step === "positive" && (
            <div style={{ textAlign:"center", animation:"fadeIn .3s ease" }}>
              <div style={{ fontSize:"3rem", marginBottom:"1rem", display:"inline-block", animation:"pop .4s ease" }}>🎉</div>
              <p style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:"1.25rem", color:"var(--text-strong)", marginBottom:".5rem" }}>
                Super, merci !
              </p>
              <p style={{ color:"var(--text-muted)", fontSize:".875rem", lineHeight:1.6, marginBottom:"1.75rem" }}>
                Ça nous ferait vraiment plaisir si tu pouvais laisser un avis sur Google. Ça prend 30 secondes et ça nous aide énormément 🙏
              </p>
              {!GOOGLE_REVIEW_URL && (
                <p style={{ fontSize:".8rem", color:"var(--text-faint)", marginBottom:"1rem" }}>
                  (Lien Google review non configuré)
                </p>
              )}
              <a
                href={GOOGLE_REVIEW_URL || "#"}
                target={GOOGLE_REVIEW_URL ? "_blank" : undefined}
                rel="noopener noreferrer"
                style={{ display:"inline-flex", alignItems:"center", gap:8, background: GOOGLE_REVIEW_URL ? "#4285F4" : "rgba(255,255,255,.1)", color:"#fff", textDecoration:"none", borderRadius:13, padding:".875rem 1.75rem", fontWeight:700, fontSize:".9rem", fontFamily:"'DM Sans',sans-serif", transition:"all .2s", opacity: GOOGLE_REVIEW_URL ? 1 : 0.4, cursor: GOOGLE_REVIEW_URL ? "pointer" : "default" }}
                onClick={() => { if (GOOGLE_REVIEW_URL) setTimeout(() => setStep("done"), 500); }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#fff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#fff" fillOpacity=".7" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#fff" fillOpacity=".5" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#fff" fillOpacity=".3" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                Laisser un avis Google
              </a>
              <button className="btn-ghost" onClick={() => setStep("done")}>
                Plus tard
              </button>
            </div>
          )}

          {/* ── Step 2b : avis négatif → formulaire interne ── */}
          {step === "negative" && (
            <div style={{ animation:"fadeIn .3s ease" }}>
              <p style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:"1.05rem", color:"var(--text-strong)", marginBottom:".5rem" }}>
                Désolé que tu n&rsquo;aies pas aimé 😕
              </p>
              <p style={{ color:"var(--text-muted)", fontSize:".875rem", marginBottom:"1.25rem" }}>
                Dis-nous ce que tu changerais — ton retour nous aide vraiment à progresser.
              </p>
              <Stars value={rating} onChange={setRating} />
              <div style={{ marginTop:"1.25rem" }}>
                <textarea
                  className="form-input"
                  placeholder="Ce que j'améliorerais..."
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  maxLength={600}
                />
                <p style={{ fontSize:".7rem", color:"var(--text-faint)", marginTop:4 }}>{comment.length}/600</p>
              </div>
              <button className="btn-primary" disabled={sending} onClick={handleSubmitNegative}>
                {sending
                  ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation:"spin 1s linear infinite" }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                  : "Envoyer mon avis"
                }
              </button>
              <button className="btn-ghost" onClick={() => setStep("rate")}>← Retour</button>
            </div>
          )}

          {/* ── Step 3 : fin ── */}
          {step === "done" && (
            <div style={{ textAlign:"center", animation:"fadeIn .35s ease" }}>
              <div style={{ fontSize:"3.5rem", marginBottom:"1rem", display:"inline-block", animation:"pop .5s ease" }}>✅</div>
              <p style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:"1.25rem", color:"var(--text-strong)", marginBottom:".5rem" }}>
                Merci pour ton retour !
              </p>
              <p style={{ color:"var(--text-muted)", fontSize:".875rem", marginBottom:"2rem" }}>
                Ton avis a bien été enregistré.
              </p>
              <a href="/" style={{ display:"inline-flex", alignItems:"center", gap:6, background:"#7c3aed", color:"#fff", textDecoration:"none", borderRadius:12, padding:".7rem 1.5rem", fontWeight:700, fontSize:".875rem", fontFamily:"'DM Sans',sans-serif" }}>
                Retour à l&rsquo;accueil
              </a>
            </div>
          )}

        </div>
      </main>
    </>
  );
}
