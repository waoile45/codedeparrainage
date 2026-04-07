"use client";

import { useState, useMemo } from "react";
import Navbar from "@/components/Navbar";
import { createClient } from "@/lib/supabase";
import { ENTREPRISES, type Entreprise } from "@/data/entreprises";

// ── Entreprises recommandées (prioritaires) ────────────────────────────────────
const RECOMMENDED: Entreprise[] = [
  { nom:"BoursoBank",    domain:"boursobank.com",  logo:`https://www.google.com/s2/favicons?domain=boursobank.com&sz=64` },
  { nom:"Fortuneo",      domain:"fortuneo.fr",     logo:`https://www.google.com/s2/favicons?domain=fortuneo.fr&sz=64` },
  { nom:"Hello bank!",   domain:"hellobank.fr",    logo:`https://www.google.com/s2/favicons?domain=hellobank.fr&sz=64` },
  { nom:"Monabanq",      domain:"monabanq.com",    logo:`https://www.google.com/s2/favicons?domain=monabanq.com&sz=64` },
  { nom:"Revolut",       domain:"revolut.com",     logo:`https://www.google.com/s2/favicons?domain=revolut.com&sz=64` },
  { nom:"N26",           domain:"n26.com",         logo:`https://www.google.com/s2/favicons?domain=n26.com&sz=64` },
  { nom:"Lydia",         domain:"lydia-app.com",   logo:`https://www.google.com/s2/favicons?domain=lydia-app.com&sz=64` },
  { nom:"iGraal",        domain:"igraal.com",      logo:`https://www.google.com/s2/favicons?domain=igraal.com&sz=64` },
  { nom:"Poulpeo",       domain:"poulpeo.com",     logo:`https://www.google.com/s2/favicons?domain=poulpeo.com&sz=64` },
  { nom:"TopCashback",   domain:"topcashback.fr",  logo:`https://www.google.com/s2/favicons?domain=topcashback.fr&sz=64` },
  { nom:"PayPal",        domain:"paypal.com",      logo:`https://www.google.com/s2/favicons?domain=paypal.com&sz=64` },
  { nom:"Uber",          domain:"uber.com",        logo:`https://www.google.com/s2/favicons?domain=uber.com&sz=64` },
  { nom:"Veepee",        domain:"veepee.fr",       logo:`https://www.google.com/s2/favicons?domain=veepee.fr&sz=64` },
  { nom:"WeWard",        domain:"weward.fr",       logo:`https://www.google.com/s2/favicons?domain=weward.fr&sz=64` },
  { nom:"Macadam",       domain:"macadam.fr",      logo:`https://www.google.com/s2/favicons?domain=macadam.fr&sz=64` },
];

// ── Constantes ─────────────────────────────────────────────────────────────────
const CATEGORIES = ["banque","crypto","energie","cashback","telephonie","paris","assurance","shopping"];
const CAT_LABELS: Record<string,string> = { banque:"Banque", crypto:"Crypto", energie:"Énergie", cashback:"Cashback", telephonie:"Téléphonie", paris:"Paris", assurance:"Assurance", shopping:"Shopping" };
const CAT_ICONS: Record<string,string> = { banque:"🏦", crypto:"₿", energie:"⚡", cashback:"💸", telephonie:"📱", paris:"⚽", assurance:"🛡️", shopping:"🛍️" };
const XP_GAIN = 10;
const MAX_DISPLAY = 80;

// ── Logo avec fallback ─────────────────────────────────────────────────────────
function CompanyLogo({ domain, name, size = 34 }: { domain: string; name: string; size?: number }) {
  const [error, setError] = useState(false);
  if (error) {
    return (
      <div style={{ width:size, height:size, borderRadius:size*0.28, background:"rgba(124,58,237,0.15)", border:"1px solid rgba(124,58,237,0.2)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:size*0.45, flexShrink:0, color:"#a78bfa", fontWeight:800, fontFamily:"'Syne',sans-serif" }}>
        {name[0].toUpperCase()}
      </div>
    );
  }
  return (
    <img
      src={`https://www.google.com/s2/favicons?domain=${domain}&sz=64`}
      alt={name}
      onError={() => setError(true)}
      style={{ width:size, height:size, borderRadius:size*0.28, objectFit:"contain", background:"rgba(124,58,237,0.08)", border:"1px solid rgba(124,58,237,0.2)", flexShrink:0, padding:2 }}
    />
  );
}

// ── Step indicator ─────────────────────────────────────────────────────────────
function Steps({ current }: { current: 1|2|3 }) {
  const steps = [{ n:1, label:"Entreprise" }, { n:2, label:"Ton code" }, { n:3, label:"Confirmation" }];
  return (
    <div style={{ display:"flex", alignItems:"center", gap:0, marginBottom:"2.5rem" }}>
      {steps.map((s, i) => {
        const done = current > s.n;
        const active = current === s.n;
        return (
          <div key={s.n} style={{ display:"flex", alignItems:"center", flex: i < steps.length-1 ? 1 : "none" }}>
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:5 }}>
              <div style={{ width:32, height:32, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", background: done?"#7c3aed": active?"rgba(124,58,237,.2)":"var(--bg-btn)", border:`2px solid ${done||active?"#7c3aed":"var(--border-lg)"}`, transition:"all .3s", flexShrink:0 }}>
                {done
                  ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  : <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:"0.78rem", color:active?"#a78bfa":"var(--text-dim)" }}>{s.n}</span>
                }
              </div>
              <span style={{ fontSize:"0.68rem", fontWeight:600, color:active?"var(--text-strong)":done?"var(--text-muted)":"var(--text-faint)", whiteSpace:"nowrap" }}>{s.label}</span>
            </div>
            {i < steps.length-1 && <div style={{ flex:1, height:1, background:done?"#7c3aed":"var(--border)", margin:"0 8px", marginBottom:20, transition:"background .3s" }} />}
          </div>
        );
      })}
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────────
export default function PublierPage() {
  const [step, setStep]                         = useState<1|2|3>(1);
  const [selectedEntreprise, setSelectedEntreprise] = useState<Entreprise|null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [search, setSearch]                     = useState("");
  const [code, setCode]                         = useState("");
  const [desc, setDesc]                         = useState("");
  const [submitting, setSubmitting]             = useState(false);
  const [error, setError]                       = useState("");
  const [showProposal, setShowProposal]         = useState(false);
  const [proposalName, setProposalName]         = useState("");
  const [proposalNote, setProposalNote]         = useState("");
  const [proposalSending, setProposalSending]   = useState(false);
  const [proposalSent, setProposalSent]         = useState(false);

  // Filtre sur les données locales (max MAX_DISPLAY affichés)
  const filtered = useMemo(() => {
    if (!search.trim()) return ENTREPRISES.slice(0, MAX_DISPLAY);
    const q = search.toLowerCase();
    return ENTREPRISES.filter(e => e.nom.toLowerCase().includes(q)).slice(0, MAX_DISPLAY);
  }, [search]);

  const totalMatches = useMemo(() => {
    if (!search.trim()) return ENTREPRISES.length;
    const q = search.toLowerCase();
    return ENTREPRISES.filter(e => e.nom.toLowerCase().includes(q)).length;
  }, [search]);

  // ── Proposer une entreprise ──
  const handleProposal = async () => {
    if (!proposalName.trim()) return;
    setProposalSending(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      await fetch("/api/proposer-entreprise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nomEntreprise: proposalName.trim(),
          note: proposalNote.trim() || undefined,
          userEmail: user?.email,
        }),
      });
    } catch { /* silencieux */ }
    setProposalSent(true);
    setProposalSending(false);
  };

  // ── Publier le code ──
  const handleSubmit = async () => {
    if (!code.trim() || !selectedEntreprise || !selectedCategory) return;
    setSubmitting(true);
    setError("");

    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError("Tu dois être connecté pour publier un code.");
      setSubmitting(false);
      return;
    }

    // Trouver la company dans Supabase (pas de création automatique)
    const slug = selectedEntreprise.domain;
    let companyId: string;

    const { data: existing } = await supabase
      .from("companies")
      .select("id")
      .eq("slug", slug)
      .single();

    if (!existing) {
      const subject = encodeURIComponent(`Demande d'ajout d'entreprise : ${selectedEntreprise.nom}`);
      const body = encodeURIComponent(`Bonjour,\n\nJe souhaite publier un code de parrainage pour l'entreprise suivante :\n\n- Nom : ${selectedEntreprise.nom}\n- Domaine : ${selectedEntreprise.domain}\n- Catégorie : ${selectedCategory}\n\nMerci de l'ajouter à la base de données.\n\nCordialement`);
      setError(`__NOT_FOUND__subject=${subject}&body=${body}`);
      setSubmitting(false);
      return;
    }

    companyId = existing.id;

    // Insérer l'annonce
    const { error: insertError } = await supabase
      .from("announcements")
      .insert({
        user_id:    user.id,
        company_id: companyId,
        code:       code.trim(),
        description: desc.trim() || null,
      });

    if (insertError) {
      setError("Erreur lors de la publication : " + insertError.message);
      setSubmitting(false);
      return;
    }

    // Mettre à jour les XP
    const { data: profile } = await supabase
      .from("users")
      .select("xp")
      .eq("id", user.id)
      .single();

    if (profile) {
      const newXp = (profile.xp ?? 0) + XP_GAIN;
      const newLevel =
        newXp >= 10000 ? "Parrain Légendaire" :
        newXp >= 5000  ? "Super Parrain" :
        newXp >= 2000  ? "Parrain Or" :
        newXp >= 500   ? "Parrain Argent" :
        newXp >= 100   ? "Parrain Bronze" : "Débutant";

      await supabase
        .from("users")
        .update({ xp: newXp, level: newLevel })
        .eq("id", user.id);
    }

    setStep(3);
    setSubmitting(false);
  };

  return (
    <>
      <style>{`
        @keyframes spin   { to { transform:rotate(360deg); } }
        @keyframes fadeIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pop    { 0%{transform:scale(.8);opacity:0} 60%{transform:scale(1.1)} 100%{transform:scale(1);opacity:1} }
        *,*::before,*::after { box-sizing:border-box; margin:0; padding:0; }
        body { background:var(--bg); color:var(--text); font-family:'DM Sans',sans-serif; min-height:100vh; }

        .page { max-width:680px; margin:0 auto; padding:3rem 1.5rem 6rem; }
        .page-header { margin-bottom:2rem; }
        .header-label { display:inline-flex; align-items:center; gap:6px; font-size:.72rem; font-weight:600; letter-spacing:.1em; text-transform:uppercase; color:#7c3aed; margin-bottom:.75rem; }
        .header-label::before { content:''; width:18px; height:1px; background:#7c3aed; display:block; }
        .page-title { font-family:'Syne',sans-serif; font-weight:800; font-size:clamp(1.5rem,3.5vw,2rem); color:var(--text-strong); letter-spacing:-.03em; margin-bottom:.35rem; }
        .page-sub { color:var(--text-dim); font-size:.875rem; }
        .xp-badge { display:inline-flex; align-items:center; gap:5px; background:rgba(124,58,237,.15); border:1px solid rgba(124,58,237,.3); color:#a78bfa; font-size:.75rem; font-weight:700; padding:3px 10px; border-radius:100px; margin-left:8px; }

        .form-card { background:var(--bg-card); border:1px solid var(--border); border-radius:20px; padding:2rem; animation:fadeIn .3s ease; }

        .search-wrap { position:relative; margin-bottom:1rem; }
        .search-icon { position:absolute; left:1rem; top:50%; transform:translateY(-50%); color:var(--text-faint); pointer-events:none; }
        .search-input { width:100%; background:var(--bg-input); border:1px solid var(--border-md); border-radius:12px; padding:.75rem 1rem .75rem 2.75rem; color:var(--text-strong); font-size:.875rem; font-family:'DM Sans',sans-serif; outline:none; transition:all .2s; }
        .search-input::placeholder { color:var(--text-faint); }
        .search-input:focus { border-color:rgba(124,58,237,.4); background:rgba(124,58,237,.05); box-shadow:0 0 0 3px rgba(124,58,237,.1); }

        .results-hint { font-size:.72rem; color:var(--text-faint); margin-bottom:.75rem; }

        .company-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:.625rem; max-height:380px; overflow-y:auto; padding-right:4px; }
        .company-grid::-webkit-scrollbar { width:4px; }
        .company-grid::-webkit-scrollbar-track { background:var(--bg-card); border-radius:4px; }
        .company-grid::-webkit-scrollbar-thumb { background:rgba(124,58,237,.4); border-radius:4px; }
        .company-card { display:flex; align-items:center; gap:10px; background:var(--bg-card); border:1px solid var(--border); border-radius:12px; padding:.75rem 1rem; cursor:pointer; transition:all .18s; }
        .company-card:hover { border-color:rgba(124,58,237,.3); background:rgba(124,58,237,.06); }
        .company-card.selected { border-color:rgba(124,58,237,.5); background:rgba(124,58,237,.12); box-shadow:0 0 16px rgba(124,58,237,.15); }
        .company-name { font-weight:600; font-size:.855rem; color:var(--text-strong); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }

        .form-group { display:flex; flex-direction:column; gap:7px; }
        .form-label { font-size:.78rem; font-weight:600; color:var(--text-muted); letter-spacing:.04em; display:flex; align-items:center; gap:8px; }
        .form-label-opt { font-size:.7rem; color:var(--text-faint); font-weight:400; }
        .form-input { background:var(--bg-input); border:1px solid var(--border-md); border-radius:12px; padding:.75rem 1rem; color:var(--text-strong); font-size:.9rem; font-family:'DM Sans',sans-serif; outline:none; transition:all .2s; width:100%; }
        .form-input:focus { border-color:rgba(124,58,237,.4); background:rgba(124,58,237,.05); box-shadow:0 0 0 3px rgba(124,58,237,.1); }
        .form-input::placeholder { color:var(--text-faint); }
        .form-textarea { resize:vertical; min-height:100px; }
        .form-hint { font-size:.7rem; color:var(--text-faint); }

        .form-error { display:flex; align-items:center; gap:8px; background:rgba(239,68,68,.1); border:1px solid rgba(239,68,68,.25); border-radius:10px; padding:.7rem .875rem; font-size:.8rem; color:#f87171; margin-bottom:1rem; }

        .selected-display { display:flex; align-items:center; gap:12px; background:rgba(124,58,237,.1); border:1px solid rgba(124,58,237,.3); border-radius:12px; padding:.75rem 1rem; margin-bottom:1.5rem; }
        .selected-change { margin-left:auto; background:none; border:1px solid var(--border-btn-ghost); border-radius:8px; color:var(--text-dim); font-size:.75rem; padding:.3rem .625rem; cursor:pointer; transition:all .18s; font-family:'DM Sans',sans-serif; }
        .selected-change:hover { color:var(--text-strong); border-color:var(--border-lg); }

        .cats { display:flex; flex-wrap:wrap; gap:6px; }
        .cat-pill { padding:.3rem .75rem; background:var(--bg-card-md); border:1px solid var(--border-md); border-radius:100px; color:var(--text-link); font-size:.75rem; font-weight:500; cursor:pointer; transition:all .18s; font-family:'DM Sans',sans-serif; }
        .cat-pill:hover { color:var(--text-strong); border-color:rgba(124,58,237,.3); }
        .cat-pill.active { background:#7c3aed; border-color:#7c3aed; color:#fff; box-shadow:0 0 14px rgba(124,58,237,.3); }

        .code-input { font-family:'Courier New',monospace !important; font-size:1rem !important; font-weight:700 !important; letter-spacing:.08em; text-transform:uppercase; }
        .code-preview { display:flex; align-items:center; gap:8px; background:var(--bg-code); border:1px solid var(--border); border-radius:10px; padding:.6rem .875rem; margin-top:6px; }
        .code-dot { width:6px; height:6px; border-radius:50%; background:#7c3aed; box-shadow:0 0 6px #7c3aed; }

        .btn-next { display:flex; align-items:center; justify-content:center; gap:7px; width:100%; background:#7c3aed; color:#fff; border:none; border-radius:13px; padding:.875rem; font-size:.9rem; font-weight:700; cursor:pointer; transition:all .2s; font-family:'DM Sans',sans-serif; margin-top:1.5rem; }
        .btn-next:hover { background:#6d28d9; transform:translateY(-1px); box-shadow:0 6px 24px rgba(124,58,237,.4); }
        .btn-next:disabled { opacity:.4; cursor:not-allowed; transform:none; box-shadow:none; }
        .btn-back { display:flex; align-items:center; gap:6px; background:none; border:1px solid var(--border-btn-ghost); border-radius:10px; padding:.5rem .875rem; color:var(--text-muted); font-size:.82rem; cursor:pointer; transition:all .18s; font-family:'DM Sans',sans-serif; margin-bottom:1.25rem; }
        .btn-back:hover { color:var(--text-strong); border-color:var(--border-lg); }

        .success-wrap { text-align:center; padding:2rem 1rem; animation:fadeIn .4s ease; }
        .success-icon { font-size:3.5rem; animation:pop .5s ease forwards; display:inline-block; margin-bottom:1rem; }
        .success-title { font-family:'Syne',sans-serif; font-weight:800; font-size:1.5rem; color:var(--text-strong); letter-spacing:-.03em; margin-bottom:.5rem; }
        .success-sub { color:var(--text-muted); font-size:.875rem; margin-bottom:2rem; }
        .success-xp { display:inline-flex; align-items:center; gap:8px; background:rgba(124,58,237,.15); border:1px solid rgba(124,58,237,.3); border-radius:100px; padding:.5rem 1.25rem; color:#a78bfa; font-family:'Syne',sans-serif; font-weight:800; font-size:1.1rem; margin-bottom:2rem; }
        .success-actions { display:flex; gap:10px; justify-content:center; flex-wrap:wrap; }

        .proposal-box { margin-top:1.25rem; background:var(--bg-card-md); border:1px solid var(--border-md); border-radius:14px; padding:1.25rem; animation:fadeIn .25s ease; }
        .proposal-title { font-family:'Syne',sans-serif; font-weight:700; font-size:.875rem; color:var(--text-strong); margin-bottom:.25rem; }
        .proposal-sub { font-size:.75rem; color:var(--text-dim); margin-bottom:1rem; }
        .proposal-sent { display:flex; align-items:center; gap:8px; font-size:.82rem; color:#4ade80; font-weight:600; }
        .btn-propose { margin-top:.5rem; font-size:.75rem; color:var(--text-link); background:none; border:none; cursor:pointer; text-decoration:underline; font-family:'DM Sans',sans-serif; padding:0; }
        .btn-propose:hover { color:var(--text-strong); }
        .btn-success-primary { display:inline-flex; align-items:center; gap:6px; background:#7c3aed; color:#fff; border:none; border-radius:11px; padding:.65rem 1.25rem; font-size:.875rem; font-weight:600; cursor:pointer; text-decoration:none; font-family:'DM Sans',sans-serif; transition:all .2s; }
        .btn-success-primary:hover { background:#6d28d9; }
        .btn-success-ghost { display:inline-flex; align-items:center; gap:6px; background:none; color:var(--text-muted); border:1px solid var(--border-btn-ghost); border-radius:11px; padding:.65rem 1.25rem; font-size:.875rem; font-weight:600; cursor:pointer; text-decoration:none; font-family:'DM Sans',sans-serif; transition:all .2s; }
        .btn-success-ghost:hover { color:var(--text-strong); border-color:var(--border-lg); }

        @media(max-width:600px) {
          .page { padding:2rem 1rem 4rem; }
          .company-grid { grid-template-columns:1fr; }
        }
      `}</style>

      <Navbar activePage="publier" />

      <main className="page">
        <div className="page-header">
          <div className="header-label">Publication</div>
          <h1 className="page-title">
            Publier mon code
            <span className="xp-badge">+{XP_GAIN} XP</span>
          </h1>
          <p className="page-sub">Partage ton code de parrainage et gagne des points XP</p>
        </div>

        {step < 3 && <Steps current={step} />}

        <div className="form-card">

          {/* ── Step 1 : choisir l'entreprise ── */}
          {step === 1 && (
            <div>
              {/* Recommandées */}
              {!search.trim() && (
                <div style={{ marginBottom:"1.25rem" }}>
                  <p style={{ fontSize:".72rem", fontWeight:600, color:"#a78bfa", letterSpacing:".06em", textTransform:"uppercase", marginBottom:".625rem" }}>⭐ Recommandées</p>
                  <div className="company-grid" style={{ maxHeight:"none", overflow:"visible" }}>
                    {RECOMMENDED.map(e => (
                      <div
                        key={e.domain}
                        className={`company-card ${selectedEntreprise?.domain === e.domain ? "selected" : ""}`}
                        onClick={() => setSelectedEntreprise(e)}
                      >
                        <CompanyLogo domain={e.domain} name={e.nom} size={34} />
                        <div style={{ flex:1, minWidth:0 }}>
                          <p className="company-name">{e.nom}</p>
                        </div>
                        {selectedEntreprise?.domain === e.domain && (
                          <div style={{ width:18, height:18, borderRadius:"50%", background:"#7c3aed", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, marginLeft:"auto" }}>
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <div style={{ height:1, background:"var(--border)", margin:"1.25rem 0" }} />
                  <p style={{ fontSize:".72rem", fontWeight:600, color:"var(--text-faint)", letterSpacing:".06em", textTransform:"uppercase", marginBottom:".625rem" }}>Toutes les entreprises</p>
                </div>
              )}

              <div className="search-wrap">
                <svg className="search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <input className="search-input" placeholder="Rechercher une entreprise..." value={search} onChange={e => setSearch(e.target.value)} autoFocus />
              </div>

              <p className="results-hint">
                {totalMatches > MAX_DISPLAY
                  ? `${MAX_DISPLAY} affichées sur ${totalMatches} — affinez la recherche`
                  : `${totalMatches} entreprise${totalMatches > 1 ? "s" : ""}${search ? ` pour "${search}"` : ""}`
                }
              </p>

              <div className="company-grid">
                {filtered.map(e => (
                  <div
                    key={e.domain}
                    className={`company-card ${selectedEntreprise?.domain === e.domain ? "selected" : ""}`}
                    onClick={() => setSelectedEntreprise(e)}
                  >
                    <CompanyLogo domain={e.domain} name={e.nom} size={34} />
                    <div style={{ flex:1, minWidth:0 }}>
                      <p className="company-name">{e.nom}</p>
                    </div>
                    {selectedEntreprise?.domain === e.domain && (
                      <div style={{ width:18, height:18, borderRadius:"50%", background:"#7c3aed", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, marginLeft:"auto" }}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                      </div>
                    )}
                  </div>
                ))}
                {filtered.length === 0 && (
                  <div style={{ gridColumn:"1/-1", textAlign:"center", padding:"2rem", color:"var(--text-faint)", fontSize:".875rem" }}>
                    Aucune entreprise trouvée pour &ldquo;{search}&rdquo;
                  </div>
                )}
              </div>

              <button className="btn-next" disabled={!selectedEntreprise} onClick={() => setStep(2)}>
                Continuer
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </button>

              {/* ── Proposer une entreprise ── */}
              {search.trim() && !showProposal && !proposalSent && (
                <div style={{ textAlign:"center", marginTop:"1rem" }}>
                  <button className="btn-propose" onClick={() => { setShowProposal(true); setProposalName(search.trim()); }}>
                    Vous ne trouvez pas votre entreprise ? Proposez-la →
                  </button>
                </div>
              )}

              {(showProposal || proposalSent) && (
                <div className="proposal-box">
                  {proposalSent ? (
                    <p className="proposal-sent">✅ Merci ! Votre proposition a été envoyée à l&rsquo;équipe.</p>
                  ) : (
                    <>
                      <p className="proposal-title">🏢 Proposer une entreprise</p>
                      <p className="proposal-sub">Si l&rsquo;entreprise n&rsquo;est pas encore dans notre base, indiquez son nom et nous l&rsquo;ajouterons.</p>
                      <div className="form-group" style={{ marginBottom:"0.75rem" }}>
                        <label className="form-label">Nom de l&rsquo;entreprise</label>
                        <input
                          className="form-input"
                          placeholder="Ex : Boursorama, Free, Binance..."
                          value={proposalName}
                          onChange={e => setProposalName(e.target.value)}
                          maxLength={80}
                        />
                      </div>
                      <div className="form-group" style={{ marginBottom:"0.875rem" }}>
                        <label className="form-label">
                          Informations complémentaires
                          <span className="form-label-opt">optionnel</span>
                        </label>
                        <textarea
                          className="form-input form-textarea"
                          style={{ minHeight:70 }}
                          placeholder="URL du programme, catégorie suggérée..."
                          value={proposalNote}
                          onChange={e => setProposalNote(e.target.value)}
                          maxLength={300}
                        />
                      </div>
                      <button
                        className="btn-next"
                        style={{ marginTop:0 }}
                        disabled={!proposalName.trim() || proposalSending}
                        onClick={handleProposal}
                      >
                        {proposalSending ? "Envoi en cours..." : "Envoyer la proposition"}
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── Step 2 : saisir le code ── */}
          {step === 2 && (
            <div>
              <button className="btn-back" onClick={() => setStep(1)}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
                Retour
              </button>

              {selectedEntreprise && (
                <div className="selected-display">
                  <CompanyLogo domain={selectedEntreprise.domain} name={selectedEntreprise.nom} size={38} />
                  <div>
                    <p style={{ fontWeight:700, color:"var(--text-strong)", fontSize:".9rem" }}>{selectedEntreprise.nom}</p>
                    <p style={{ fontSize:".72rem", color:"var(--text-dim)" }}>{selectedEntreprise.domain}</p>
                  </div>
                  <button className="selected-change" onClick={() => setStep(1)}>Changer</button>
                </div>
              )}

              {error && (
                error.startsWith("__NOT_FOUND__") ? (
                  <div style={{ background:"rgba(124,58,237,.1)", border:"1px solid rgba(124,58,237,.3)", borderRadius:12, padding:"1rem 1.125rem", marginBottom:"1rem" }}>
                    <div style={{ fontWeight:700, fontSize:".875rem", color:"#a78bfa", marginBottom:6 }}>
                      🏢 Cette entreprise n&apos;est pas encore dans notre base
                    </div>
                    <p style={{ fontSize:".8rem", color:"var(--text-muted)", margin:"0 0 .75rem" }}>
                      Envoie-nous une demande et nous l&apos;ajouterons manuellement sous 24h.
                    </p>
                    <a
                      href={`mailto:waoile45@gmail.com?${error.replace("__NOT_FOUND__","")}`}
                      style={{ display:"inline-flex", alignItems:"center", gap:6, background:"#7c3aed", color:"#fff", fontWeight:700, fontSize:".8rem", padding:".45rem 1rem", borderRadius:9, textDecoration:"none" }}
                    >
                      ✉️ Demander l&apos;ajout par email
                    </a>
                  </div>
                ) : (
                  <div className="form-error">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    {error}
                  </div>
                )
              )}

              <div style={{ display:"flex", flexDirection:"column", gap:"1.25rem" }}>

                {/* Catégorie */}
                <div className="form-group">
                  <label className="form-label">
                    Catégorie
                    <span style={{ fontSize:".7rem", color:"var(--text-faint)", fontWeight:400 }}>obligatoire</span>
                  </label>
                  <div className="cats">
                    {CATEGORIES.map(c => (
                      <button
                        key={c}
                        className={`cat-pill ${selectedCategory === c ? "active" : ""}`}
                        onClick={() => setSelectedCategory(c)}
                        type="button"
                      >
                        {CAT_ICONS[c]} {CAT_LABELS[c]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Code */}
                <div className="form-group">
                  <label className="form-label">
                    Ton code de parrainage
                    <span style={{ fontSize:".7rem", color:"var(--text-faint)", fontWeight:400 }}>obligatoire</span>
                  </label>
                  <input
                    className="form-input code-input"
                    placeholder="Ex : VOTRE CODE"
                    value={code}
                    onChange={e => {
                      const v = e.target.value;
                      setCode(v.startsWith("http") ? v : v.toUpperCase());
                    }}
                    maxLength={500}
                  />
                  {code && (
                    <div className="code-preview">
                      <span className="code-dot" />
                      <code style={{ fontFamily:"'Courier New',monospace", fontWeight:700, fontSize:".9rem", color:"#e2e8f0", letterSpacing:".08em" }}>{code}</code>
                    </div>
                  )}
                  <p className="form-hint">Tel qu&rsquo;il apparaîtra sur la page des codes</p>
                </div>

                {/* Description */}
                <div className="form-group">
                  <label className="form-label">
                    Description
                    <span className="form-label-opt">optionnel</span>
                  </label>
                  <textarea
                    className="form-input form-textarea"
                    placeholder="Ex : Profite de 80€ offerts à l'ouverture de ton compte..."
                    value={desc}
                    onChange={e => setDesc(e.target.value)}
                    maxLength={280}
                  />
                  <p className="form-hint">{desc.length}/280 caractères</p>
                </div>
              </div>

              {code.trim() && !selectedCategory && (
                <p style={{ fontSize:".75rem", color:"#f59e0b", display:"flex", alignItems:"center", gap:5, marginTop:"0.875rem" }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  Sélectionne une catégorie pour continuer
                </p>
              )}

              <button className="btn-next" disabled={!code.trim() || !selectedCategory || submitting} onClick={handleSubmit}>
                {submitting ? (
                  <>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation:"spin 1s linear infinite" }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                    Publication...
                  </>
                ) : (
                  <>
                    Publier mon annonce
                    <span style={{ background:"rgba(255,255,255,.2)", borderRadius:100, padding:"1px 8px", fontSize:".75rem" }}>+{XP_GAIN} XP</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* ── Step 3 : succès ── */}
          {step === 3 && (
            <div className="success-wrap">
              <div className="success-icon">🎉</div>
              <h2 className="success-title">Annonce publiée !</h2>
              <p className="success-sub">Ton code {selectedEntreprise?.nom} est maintenant visible par toute la communauté.</p>
              <div className="success-xp">+{XP_GAIN} XP gagnés ⚡</div>
              <div className="success-actions">
                <a href="/codes" className="btn-success-primary">Voir les codes</a>
                <button className="btn-success-ghost" onClick={() => { setStep(1); setSelectedEntreprise(null); setSelectedCategory(""); setCode(""); setDesc(""); setError(""); }}>
                  Publier un autre code
                </button>
                <a href="/profil" className="btn-success-ghost">Mon profil</a>
              </div>
            </div>
          )}

        </div>

        {step < 3 && (
          <div style={{ marginTop:"1.25rem", background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:14, padding:"1rem 1.25rem", display:"flex", alignItems:"flex-start", gap:10 }}>
            <span style={{ fontSize:"1rem", flexShrink:0 }}>💡</span>
            <p style={{ fontSize:".78rem", color:"var(--text-dim)", lineHeight:1.6 }}>
              Les annonces avec une description claire reçoivent <strong style={{ color:"var(--text-muted)" }}>2× plus de clics</strong>.
              Précise le montant offert et les conditions pour maximiser tes parrainages.
            </p>
          </div>
        )}
      </main>
    </>
  );
}
