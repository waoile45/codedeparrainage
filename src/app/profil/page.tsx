"use client";

import { useState, useRef, useEffect } from "react";
import Navbar from "@/components/Navbar";

type NavSection = "profil" | "annonces" | "messages" | "badges" | "quetes" | "credits" | "parametres";
interface Badge { id: string; label: string; icon: string; unlocked: boolean; desc: string; }

const MOCK_USER = {
  pseudo: "Test3", email: "test3@gmail.com", niveau: "Débutant",
  xp: 2, xpNext: 100, xpNextLabel: "Parrain Bronze",
  annonces: 1, streak: 2, credits: 0.0, memberSince: "Mars 2025",
};
const MOCK_BADGES: Badge[] = [
  { id:"1", label:"Première annonce", icon:"🚀", unlocked:true,  desc:"Tu as publié ton premier code" },
  { id:"2", label:"Parrain Bronze",   icon:"🥉", unlocked:false, desc:"Atteins 100 XP" },
  { id:"3", label:"Streak x7",        icon:"🔥", unlocked:false, desc:"Connecte-toi 7 jours de suite" },
  { id:"4", label:"Premier boost",    icon:"⚡", unlocked:false, desc:"Booste une annonce" },
  { id:"5", label:"Parrain Argent",   icon:"🥈", unlocked:false, desc:"Atteins 500 XP" },
  { id:"6", label:"Légende",          icon:"👑", unlocked:false, desc:"Atteins 2000 XP" },
];
const MOCK_ANNONCES = [
  { id:"1", brand:"EDF", code:"EDF-TEST2024", category:"Energie", views:12, active:true },
];

// ── Icons ──────────────────────────────────────────────────────────────────────
const I = {
  user:   () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>,
  list:   () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="5" width="18" height="14" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  msg:    () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  badge:  () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="6"/><path d="M8.56 2.75c4.37 6.03 6.02 9.42 8.03 17.72m2.54-15.38c-3.72 4.35-8.94 5.66-16.88 5.85m19.5 1.9c-3.5-.93-6.63-.82-8.94 0-2.58.92-5.01 2.86-7.44 6.32"/></svg>,
  target: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
  bolt:   () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  gear:   () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  plus:   () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  out:    () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  cam:    () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>,
  edit:   () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  check:  () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>,
  eye:    () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  trend:  () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
  arrow:  () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
};

// ── XP Bar ─────────────────────────────────────────────────────────────────────
function XPBar({ xp, xpNext, mini=false }: { xp:number; xpNext:number; mini?:boolean }) {
  const pct = Math.min((xp / xpNext) * 100, 100);
  const [w, setW] = useState(0);
  useEffect(() => { const t = setTimeout(() => setW(pct), 350); return () => clearTimeout(t); }, [pct]);
  return (
    <div style={{ height: mini?4:6, background:"rgba(255,255,255,.07)", borderRadius:100, overflow:"hidden" }}>
      <div style={{ height:"100%", width:`${w}%`, background:"linear-gradient(90deg,#7c3aed,#a855f7)", borderRadius:100, transition:"width 1.1s cubic-bezier(.4,0,.2,1)", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", inset:0, background:"linear-gradient(90deg,transparent,rgba(255,255,255,.3),transparent)", animation:"shimmer 2.2s ease-in-out infinite" }} />
      </div>
    </div>
  );
}

// ── Avatar upload ──────────────────────────────────────────────────────────────
function AvatarUpload({ letter, size=72 }: { letter:string; size?:number }) {
  const [preview, setPreview] = useState<string|null>(null);
  const [hover, setHover] = useState(false);
  const ref = useRef<HTMLInputElement>(null);
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    setPreview(URL.createObjectURL(f));
    // TODO: supabase.storage.from('avatars').upload(...)
  };
  return (
    <div style={{ position:"relative", width:size, height:size, flexShrink:0 }}>
      <div style={{ position:"absolute", inset:-3, borderRadius:"50%", background:"conic-gradient(#7c3aed,#a855f7,#6366f1,#7c3aed)", animation:"spin 5s linear infinite" }} />
      <div
        style={{ position:"relative", zIndex:1, width:size, height:size, borderRadius:"50%", border:"3px solid #0A0A0F", overflow:"hidden", cursor:"pointer", background:"linear-gradient(135deg,#7c3aed,#4f46e5)", display:"flex", alignItems:"center", justifyContent:"center" }}
        onMouseEnter={()=>setHover(true)} onMouseLeave={()=>setHover(false)}
        onClick={()=>ref.current?.click()}
      >
        {preview ? <img src={preview} alt="avatar" style={{ width:"100%", height:"100%", objectFit:"cover" }} /> : <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:size*.38, color:"#fff" }}>{letter}</span>}
        <div style={{ position:"absolute", inset:0, background:"rgba(0,0,0,.55)", display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:3, opacity:hover?1:0, transition:"opacity .2s" }}>
          <span style={{ color:"#fff" }}><I.cam /></span>
          <span style={{ color:"rgba(255,255,255,.8)", fontSize:"0.58rem", fontWeight:600 }}>Modifier</span>
        </div>
      </div>
      <input ref={ref} type="file" accept="image/*" style={{ display:"none" }} onChange={handleFile} />
    </div>
  );
}

// ── Editable pseudo ────────────────────────────────────────────────────────────
function EditablePseudo({ value, onChange, size="lg" }: { value:string; onChange:(v:string)=>void; size?:"lg"|"sm" }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const iRef = useRef<HTMLInputElement>(null);
  const confirm = () => { onChange(draft.trim()||value); setEditing(false); };
  const cancel  = () => { setDraft(value); setEditing(false); };
  useEffect(() => { if (editing) iRef.current?.focus(); }, [editing]);
  const fs = size==="lg" ? "1.5rem" : "0.95rem";
  if (editing) return (
    <div style={{ display:"flex", alignItems:"center", gap:6 }}>
      <input ref={iRef} value={draft} onChange={e=>setDraft(e.target.value)}
        onKeyDown={e=>{ if(e.key==="Enter") confirm(); if(e.key==="Escape") cancel(); }}
        style={{ background:"rgba(124,58,237,.15)", border:"1px solid rgba(124,58,237,.45)", borderRadius:8, padding:"4px 10px", color:"#fff", fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:fs, outline:"none", width:160 }} />
      <button onClick={confirm} style={{ background:"rgba(34,197,94,.15)", border:"1px solid rgba(34,197,94,.3)", borderRadius:7, padding:"5px 8px", color:"#4ade80", cursor:"pointer", display:"flex" }}><I.check /></button>
      <button onClick={cancel}  style={{ background:"rgba(255,255,255,.05)", border:"1px solid rgba(255,255,255,.1)", borderRadius:7, padding:"5px 8px", color:"rgba(255,255,255,.4)", cursor:"pointer", fontSize:"0.8rem" }}>✕</button>
    </div>
  );
  return (
    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
      <h2 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:fs, color:"#fff", letterSpacing:"-.03em" }}>{value}</h2>
      <button onClick={()=>setEditing(true)} title="Modifier" style={{ background:"rgba(255,255,255,.05)", border:"1px solid rgba(255,255,255,.1)", borderRadius:7, padding:"5px 7px", color:"rgba(255,255,255,.35)", cursor:"pointer", display:"flex", transition:"all .2s" }}><I.edit /></button>
    </div>
  );
}

// ── Sidebar mini-profile ───────────────────────────────────────────────────────
function SidebarMini({ pseudo }: { pseudo:string }) {
  const pct = Math.round((MOCK_USER.xp / MOCK_USER.xpNext) * 100);
  return (
    <div style={{ padding:"1rem", background:"rgba(124,58,237,.08)", border:"1px solid rgba(124,58,237,.18)", borderRadius:16, display:"flex", flexDirection:"column", gap:"0.75rem" }}>
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        <div style={{ position:"relative", width:38, height:38, flexShrink:0 }}>
          <div style={{ position:"absolute", inset:-2, borderRadius:"50%", background:"conic-gradient(#7c3aed,#a855f7,#7c3aed)", animation:"spin 5s linear infinite" }} />
          <div style={{ position:"relative", width:38, height:38, borderRadius:"50%", background:"linear-gradient(135deg,#7c3aed,#4f46e5)", border:"2px solid #0A0A0F", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:"0.95rem", color:"#fff" }}>{pseudo[0]?.toUpperCase()}</span>
          </div>
        </div>
        <div style={{ flex:1, minWidth:0 }}>
          <p style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:"0.9rem", color:"#fff", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{pseudo}</p>
          <div style={{ display:"flex", alignItems:"center", gap:5, marginTop:1 }}>
            <span style={{ fontSize:"0.65rem", fontWeight:700, background:"rgba(124,58,237,.25)", color:"#a78bfa", padding:"1px 7px", borderRadius:100, border:"1px solid rgba(124,58,237,.3)" }}>{MOCK_USER.niveau}</span>
            <span style={{ fontSize:"0.68rem", color:"rgba(255,255,255,.3)" }}>{MOCK_USER.xp} XP</span>
          </div>
        </div>
      </div>
      <div>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
          <span style={{ fontSize:"0.65rem", color:"rgba(255,255,255,.3)" }}>Progression</span>
          <span style={{ fontSize:"0.65rem", color:"rgba(255,255,255,.3)" }}>{pct}% · {MOCK_USER.xpNext} XP</span>
        </div>
        <XPBar xp={MOCK_USER.xp} xpNext={MOCK_USER.xpNext} mini />
      </div>
    </div>
  );
}

// ── Sidebar ────────────────────────────────────────────────────────────────────
const NAV_GROUPS = [
  { label:"Mon compte",   items:[{key:"profil" as NavSection, label:"Mon profil", icon:<I.user/>},{key:"annonces" as NavSection, label:"Mes annonces", icon:<I.list/>},{key:"messages" as NavSection, label:"Messages", icon:<I.msg/>}] },
  { label:"Progression",  items:[{key:"badges" as NavSection, label:"Badges", icon:<I.badge/>},{key:"quetes" as NavSection, label:"Quêtes", icon:<I.target/>}] },
  { label:"Monétisation", items:[{key:"credits" as NavSection, label:"Crédits & Boosts", icon:<I.bolt/>},{key:"parametres" as NavSection, label:"Paramètres", icon:<I.gear/>}] },
];

function Sidebar({ active, setActive, pseudo }: { active:NavSection; setActive:(s:NavSection)=>void; pseudo:string }) {
  return (
    <aside style={{ width:220, flexShrink:0, display:"flex", flexDirection:"column", gap:"1.5rem", position:"sticky", top:80, alignSelf:"flex-start" }}>
      <div style={{ display:"flex", flexDirection:"column", gap:"1.5rem" }}>
        {NAV_GROUPS.map(group => (
          <div key={group.label}>
            <p style={{ fontSize:"0.63rem", fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", color:"rgba(255,255,255,.2)", marginBottom:"0.5rem", paddingLeft:"0.875rem" }}>{group.label}</p>
            <div style={{ display:"flex", flexDirection:"column", gap:2 }}>
              {group.items.map(item => {
                const on = active===item.key;
                return (
                  <button key={item.key} onClick={()=>setActive(item.key)}
                    style={{ display:"flex", alignItems:"center", gap:9, padding:"0.55rem 0.875rem", borderRadius:11, background:on?"rgba(124,58,237,.15)":"transparent", border:on?"1px solid rgba(124,58,237,.28)":"1px solid transparent", color:on?"#fff":"rgba(255,255,255,.42)", fontSize:"0.855rem", fontWeight:on?600:500, cursor:"pointer", transition:"all .18s", fontFamily:"'DM Sans',sans-serif", textAlign:"left", width:"100%" }}
                    onMouseEnter={e=>{ if(!on){(e.currentTarget as HTMLElement).style.color="rgba(255,255,255,.75)";(e.currentTarget as HTMLElement).style.background="rgba(255,255,255,.04)";} }}
                    onMouseLeave={e=>{ if(!on){(e.currentTarget as HTMLElement).style.color="rgba(255,255,255,.42)";(e.currentTarget as HTMLElement).style.background="transparent";} }}
                  >
                    <span style={{ opacity:on?1:.6, flexShrink:0 }}>{item.icon}</span>
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <a href="/publier" style={{ textDecoration:"none" }}>
        <button style={{ display:"flex", alignItems:"center", gap:8, width:"100%", padding:"0.6rem 0.875rem", background:"rgba(124,58,237,.1)", border:"1px dashed rgba(124,58,237,.35)", borderRadius:11, color:"#a78bfa", fontSize:"0.855rem", fontWeight:600, cursor:"pointer", transition:"all .18s", fontFamily:"'DM Sans',sans-serif" }}>
          <I.plus />Publier un code
        </button>
      </a>
      <SidebarMini pseudo={pseudo} />
    </aside>
  );
}

// ── Section Profil — hero compact + 3 action cards ─────────────────────────────
function SectionProfil({ pseudo, setPseudo }: { pseudo:string; setPseudo:(v:string)=>void }) {
  return (
    <div className="sc">

      {/* ── Hero compact ── */}
      <div style={{ position:"relative", overflow:"hidden", background:"rgba(255,255,255,.03)", border:"1px solid rgba(255,255,255,.07)", borderRadius:20, padding:"1.5rem" }}>
        <div style={{ position:"absolute", top:-50, left:-50, width:200, height:200, background:"radial-gradient(circle,rgba(124,58,237,.12),transparent 70%)", pointerEvents:"none" }} />
        <div style={{ display:"flex", alignItems:"center", gap:"1.25rem", flexWrap:"wrap" }}>
          <AvatarUpload letter={pseudo[0]?.toUpperCase()??"?"} size={72} />
          <div style={{ flex:1 }}>
            <EditablePseudo value={pseudo} onChange={setPseudo} />
            <div style={{ display:"flex", alignItems:"center", gap:8, marginTop:5, flexWrap:"wrap" }}>
              <span style={{ fontSize:"0.72rem", fontWeight:700, background:"rgba(124,58,237,.2)", color:"#a78bfa", padding:"3px 10px", borderRadius:100, border:"1px solid rgba(124,58,237,.35)" }}>{MOCK_USER.niveau}</span>
              <span style={{ fontSize:"0.8rem", color:"#a78bfa", fontWeight:700 }}>{MOCK_USER.xp} XP</span>
              <span style={{ color:"rgba(255,255,255,.2)" }}>·</span>
              <span style={{ fontSize:"0.78rem", color:"rgba(255,255,255,.3)" }}>{MOCK_USER.xpNextLabel} à {MOCK_USER.xpNext} XP</span>
              <span style={{ color:"rgba(255,255,255,.2)" }}>·</span>
              <span style={{ fontSize:"0.78rem", color:"rgba(255,255,255,.3)" }}>Membre depuis {MOCK_USER.memberSince}</span>
            </div>
            <div style={{ marginTop:"0.875rem" }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5, fontSize:"0.72rem", color:"rgba(255,255,255,.3)" }}>
                <span>{MOCK_USER.xp} XP</span><span>{MOCK_USER.xpNextLabel} — {MOCK_USER.xpNext} XP</span>
              </div>
              <XPBar xp={MOCK_USER.xp} xpNext={MOCK_USER.xpNext} />
            </div>
          </div>
          <div style={{ textAlign:"right", flexShrink:0 }}>
            <p style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:"2.5rem", color:"#fff", lineHeight:1 }}>{MOCK_USER.xp}</p>
            <p style={{ color:"rgba(255,255,255,.3)", fontSize:"0.72rem", marginTop:2 }}>XP total</p>
          </div>
        </div>
      </div>

      {/* ── 3 Action cards ── */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"0.875rem" }}>

        {/* Card 1 — Annonces */}
        <div className="action-card">
          <div className="action-card-top">
            <div className="action-icon-wrap" style={{ background:"rgba(99,102,241,.12)", border:"1px solid rgba(99,102,241,.25)" }}>
              <I.list />
            </div>
            <span className="action-label">Annonces publiées</span>
          </div>
          <p className="action-value">{MOCK_USER.annonces}</p>
          <p className="action-sub">
            {MOCK_USER.annonces === 0 ? "Publie ton premier code !" : `${MOCK_ANNONCES[0]?.views ?? 0} vues au total`}
          </p>
          <a href="/publier" className="action-btn">
            Gérer mes annonces <I.arrow />
          </a>
        </div>

        {/* Card 2 — Crédits Boost (highlighted) */}
        <div className="action-card action-card-boost">
          <div style={{ position:"absolute", inset:0, background:"radial-gradient(circle at 50% 0%,rgba(124,58,237,.18),transparent 65%)", pointerEvents:"none", borderRadius:"inherit" }} />
          <div style={{ position:"absolute", top:0, left:0, right:0, height:1, background:"linear-gradient(90deg,transparent,#7c3aed,transparent)" }} />
          <div className="action-card-top" style={{ position:"relative", zIndex:1 }}>
            <div className="action-icon-wrap" style={{ background:"rgba(124,58,237,.2)", border:"1px solid rgba(124,58,237,.4)" }}>
              <I.bolt />
            </div>
            <span className="action-label">Crédits Boost</span>
          </div>
          <p className="action-value" style={{ color:"#a78bfa", position:"relative", zIndex:1 }}>{MOCK_USER.credits.toFixed(0)}</p>

          {/* bienveillant message */}
          <div style={{ position:"relative", zIndex:1, background:"rgba(124,58,237,.1)", border:"1px solid rgba(124,58,237,.2)", borderRadius:10, padding:"0.6rem 0.75rem", marginBottom:"0.75rem" }}>
            <div style={{ display:"flex", alignItems:"flex-start", gap:6 }}>
              <span style={{ fontSize:"0.9rem", flexShrink:0 }}>📈</span>
              <p style={{ fontSize:"0.72rem", color:"rgba(255,255,255,.65)", lineHeight:1.5 }}>
                Les annonces boostées reçoivent en moyenne <strong style={{ color:"#a78bfa" }}>3× plus de vues</strong>. Un boost, c'est plus de parrainages.
              </p>
            </div>
          </div>

          <a href="/credits" className="action-btn action-btn-boost" style={{ position:"relative", zIndex:1 }}>
            Acheter des crédits <I.arrow />
          </a>
        </div>

        {/* Card 3 — Messages */}
        <div className="action-card">
          <div className="action-card-top">
            <div className="action-icon-wrap" style={{ background:"rgba(34,197,94,.1)", border:"1px solid rgba(34,197,94,.22)" }}>
              <I.msg />
            </div>
            <span className="action-label">Messages</span>
          </div>
          <p className="action-value">0</p>
          <p className="action-sub">0 non lu</p>
          <a href="/messages" className="action-btn">
            Accéder à la messagerie <I.arrow />
          </a>
        </div>

      </div>

      {/* ── Quick stats row ── */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"0.75rem" }}>
        {[
          { v:MOCK_USER.annonces,                          l:"Annonces",  e:"📋" },
          { v:`${MOCK_USER.streak} 🔥`,                    l:"Streak",    e:"" },
          { v:MOCK_BADGES.filter(b=>b.unlocked).length,    l:"Badges",    e:"🏅" },
          { v:MOCK_USER.credits.toFixed(0),                l:"Crédits ⚡", e:"", acc:true },
        ].map((s,i)=>(
          <div key={i} style={{ background:s.acc?"rgba(124,58,237,.07)":"rgba(255,255,255,.03)", border:`1px solid ${s.acc?"rgba(124,58,237,.2)":"rgba(255,255,255,.07)"}`, borderRadius:14, padding:"0.9rem 0.75rem", display:"flex", flexDirection:"column", alignItems:"center", gap:3, textAlign:"center", transition:"all .2s", cursor:"default" }}
            onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.transform="translateY(-2px)";(e.currentTarget as HTMLElement).style.borderColor="rgba(124,58,237,.28)";}}
            onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.transform="translateY(0)";(e.currentTarget as HTMLElement).style.borderColor=s.acc?"rgba(124,58,237,.2)":"rgba(255,255,255,.07)";}}>
            <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:"1.35rem", color:"#fff" }}>{s.v}</span>
            <span style={{ color:"rgba(255,255,255,.35)", fontSize:"0.72rem" }}>{s.l}</span>
          </div>
        ))}
      </div>

    </div>
  );
}

// ── Section Annonces ───────────────────────────────────────────────────────────
function SectionAnnonces() {
  return (
    <div className="sc">
      <div className="sh">
        <div><h2 className="st">Mes annonces</h2><p className="ss">{MOCK_ANNONCES.length} annonce publiée</p></div>
        <a href="/publier" className="btn-p"><I.plus />Nouvelle annonce</a>
      </div>
      {MOCK_ANNONCES.map(a=>(
        <div key={a.id} className="row-card">
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ width:8, height:8, borderRadius:"50%", background:a.active?"#22c55e":"#6b7280", boxShadow:`0 0 6px ${a.active?"#22c55e":"#6b7280"}` }} />
            <div>
              <p style={{ fontWeight:700, color:"#fff", fontSize:"0.9rem" }}>{a.brand}</p>
              <code style={{ fontFamily:"monospace", fontSize:"0.8rem", color:"rgba(255,255,255,.4)", letterSpacing:"0.06em" }}>{a.code}</code>
            </div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
            <span className="cat-tag">{a.category}</span>
            <span style={{ fontSize:"0.78rem", color:"rgba(255,255,255,.3)", display:"flex", alignItems:"center", gap:4 }}><I.eye />{a.views}</span>
            <button className="btn-ghost-sm">Booster ⚡</button>
            <button className="btn-ghost-sm danger">Supprimer</button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Section Badges ─────────────────────────────────────────────────────────────
function SectionBadges() {
  return (
    <div className="sc">
      <div className="sh"><div><h2 className="st">Badges</h2><p className="ss">{MOCK_BADGES.filter(b=>b.unlocked).length}/{MOCK_BADGES.length} débloqués</p></div></div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"0.875rem" }}>
        {MOCK_BADGES.map(b=>(
          <div key={b.id} style={{ position:"relative", background:b.unlocked?"rgba(124,58,237,.07)":"rgba(255,255,255,.03)", border:`1px solid ${b.unlocked?"rgba(124,58,237,.3)":"rgba(255,255,255,.07)"}`, borderRadius:16, padding:"1.4rem 1rem", textAlign:"center", transition:"all .2s", opacity:b.unlocked?1:.42 }}>
            {!b.unlocked&&<div style={{ position:"absolute", top:10, right:10, fontSize:"0.75rem" }}>🔒</div>}
            <div style={{ fontSize:"2rem", marginBottom:"0.5rem" }}>{b.icon}</div>
            <p style={{ fontWeight:700, fontSize:"0.85rem", color:"#fff", marginBottom:3 }}>{b.label}</p>
            <p style={{ fontSize:"0.72rem", color:"rgba(255,255,255,.35)" }}>{b.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Section Quêtes ─────────────────────────────────────────────────────────────
function SectionQuetes() {
  const quetes = [
    { label:"Publier ton premier code", xp:10, done:true },
    { label:"Atteindre 5 vues sur une annonce", xp:15, done:false, progress:12, total:5 },
    { label:"Se connecter 7 jours de suite", xp:25, done:false, progress:2, total:7 },
    { label:"Recevoir ton premier avis", xp:20, done:false, progress:0, total:1 },
  ];
  return (
    <div className="sc">
      <div className="sh"><div><h2 className="st">Quêtes</h2><p className="ss">Complète des quêtes pour gagner de l'XP</p></div></div>
      {quetes.map((q,i)=>(
        <div key={i} className={`row-card ${q.done?"done":""}`} style={{ display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ width:22, height:22, borderRadius:"50%", border:`1.5px solid ${q.done?"rgba(34,197,94,.4)":"rgba(255,255,255,.15)"}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"0.7rem", color:"#4ade80", flexShrink:0, background:q.done?"rgba(34,197,94,.1)":"none" }}>{q.done?"✓":""}</div>
          <div style={{ flex:1 }}>
            <p style={{ fontSize:"0.875rem", color:"rgba(255,255,255,.8)", marginBottom:q.done?0:5 }}>{q.label}</p>
            {!q.done&&q.progress!==undefined&&(
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <div style={{ flex:1, height:4, background:"rgba(255,255,255,.07)", borderRadius:100, overflow:"hidden" }}><div style={{ height:"100%", width:`${Math.min((q.progress/q.total!)*100,100)}%`, background:"#7c3aed", borderRadius:100 }} /></div>
                <span style={{ fontSize:"0.7rem", color:"rgba(255,255,255,.3)", whiteSpace:"nowrap" }}>{q.progress}/{q.total}</span>
              </div>
            )}
          </div>
          <span style={{ fontSize:"0.82rem", fontWeight:700, color:q.done?"#4ade80":"rgba(255,255,255,.3)", whiteSpace:"nowrap", fontFamily:"'Syne',sans-serif" }}>+{q.xp} XP</span>
        </div>
      ))}
    </div>
  );
}

// ── Section Crédits ────────────────────────────────────────────────────────────
function SectionCredits() {
  return (
    <div className="sc">
      <div className="sh">
        <div><h2 className="st">Crédits & Boosts</h2><p className="ss">Gère ton solde et booste tes annonces</p></div>
        <div style={{ display:"flex", gap:8 }}>
          <a href="/credits" className="btn-p">Acheter des crédits</a>
          <a href="/boost" className="btn-o">Booster une annonce</a>
        </div>
      </div>

      {/* Solde + message bienveillant */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0.875rem" }}>
        <div style={{ position:"relative", overflow:"hidden", background:"rgba(124,58,237,.08)", border:"1px solid rgba(124,58,237,.25)", borderRadius:18, padding:"1.75rem" }}>
          <div style={{ position:"absolute", inset:0, background:"radial-gradient(circle at 80% 50%,rgba(124,58,237,.15),transparent 60%)", pointerEvents:"none" }} />
          <div style={{ position:"relative", zIndex:1 }}>
            <p style={{ fontSize:"0.78rem", color:"rgba(255,255,255,.4)", marginBottom:4 }}>Solde actuel</p>
            <p style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:"2.75rem", color:"#a78bfa", lineHeight:1, marginBottom:4 }}>{MOCK_USER.credits.toFixed(2)}</p>
            <p style={{ fontSize:"0.78rem", color:"rgba(255,255,255,.3)" }}>crédits disponibles</p>
          </div>
          <div style={{ position:"absolute", right:"1.5rem", bottom:"1rem", fontSize:"3rem", animation:"float 3s ease-in-out infinite", zIndex:1 }}>⚡</div>
        </div>

        <div style={{ background:"rgba(255,255,255,.03)", border:"1px solid rgba(255,255,255,.07)", borderRadius:18, padding:"1.5rem", display:"flex", flexDirection:"column", gap:"0.875rem" }}>
          <p style={{ fontSize:"0.8rem", fontWeight:600, color:"rgba(255,255,255,.5)" }}>Pourquoi booster ?</p>
          {[
            { icon:"📈", text:<>Les annonces boostées reçoivent <strong style={{ color:"#a78bfa" }}>3× plus de vues</strong></> },
            { icon:"🏆", text:<>Tu remontes en <strong style={{ color:"#fff" }}>tête du classement</strong></> },
            { icon:"⚡", text:<>Chaque boost débloque des <strong style={{ color:"#fbbf24" }}>XP bonus</strong></> },
          ].map((item,i)=>(
            <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:8 }}>
              <span style={{ fontSize:"0.95rem", flexShrink:0 }}>{item.icon}</span>
              <p style={{ fontSize:"0.78rem", color:"rgba(255,255,255,.55)", lineHeight:1.5 }}>{item.text}</p>
            </div>
          ))}
        </div>
      </div>

      <div style={{ textAlign:"center", padding:"1.5rem", color:"rgba(255,255,255,.2)", fontSize:"0.85rem" }}>
        Aucun boost actif — <a href="/boost" style={{ color:"#a78bfa", textDecoration:"none" }}>booste une annonce !</a>
      </div>
    </div>
  );
}

// ── Section Paramètres ─────────────────────────────────────────────────────────
function SectionParametres({ pseudo, setPseudo }: { pseudo:string; setPseudo:(v:string)=>void }) {
  const [bio, setBio] = useState("");
  const [saved, setSaved] = useState(false);
  const save = () => { setSaved(true); setTimeout(()=>setSaved(false), 2000); };
  return (
    <div className="sc">
      <div className="sh"><div><h2 className="st">Paramètres du compte</h2><p className="ss">Modifie tes informations personnelles</p></div></div>
      <div style={{ background:"rgba(255,255,255,.03)", border:"1px solid rgba(255,255,255,.07)", borderRadius:16, padding:"1.25rem 1.5rem" }}>
        <p style={{ fontSize:"0.7rem", fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase", color:"rgba(255,255,255,.3)", marginBottom:"1rem" }}>Photo de profil & nom d'affichage</p>
        <div style={{ display:"flex", alignItems:"center", gap:"1.5rem" }}>
          <AvatarUpload letter={pseudo[0]?.toUpperCase()??"?"} size={60} />
          <div style={{ flex:1 }}>
            <EditablePseudo value={pseudo} onChange={setPseudo} size="sm" />
            <p style={{ fontSize:"0.7rem", color:"rgba(255,255,255,.25)", marginTop:4 }}>Clique sur ✏️ pour modifier le pseudo · sur l'avatar pour changer la photo</p>
          </div>
        </div>
      </div>
      <div className="form-g"><label className="form-l">Email</label><input className="form-i disabled" value={MOCK_USER.email} disabled /><p className="form-h">L'email ne peut pas être modifié</p></div>
      <div className="form-g"><label className="form-l">Présentation</label><textarea className="form-i form-ta" value={bio} onChange={e=>setBio(e.target.value)} placeholder="Parle un peu de toi..." rows={4} /></div>
      <div style={{ display:"flex", gap:8 }}>
        <button className={`btn-p${saved?" btn-saved":""}`} onClick={save}>{saved?"✓ Sauvegardé":"Enregistrer"}</button>
      </div>
      <div style={{ paddingTop:"1.5rem", borderTop:"1px solid rgba(255,255,255,.06)", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <p style={{ fontSize:"0.82rem", color:"rgba(255,255,255,.3)" }}>Zone dangereuse</p>
        <button className="btn-danger">Supprimer mon compte</button>
      </div>
    </div>
  );
}

function SectionMessages() {
  return (
    <div className="sc">
      <h2 className="st">Messages</h2>
      <div style={{ textAlign:"center", padding:"3rem", color:"rgba(255,255,255,.25)", fontSize:"0.875rem" }}>
        <div style={{ fontSize:"2.5rem", marginBottom:"0.75rem" }}>💬</div>
        <p>Aucun message pour l'instant</p>
      </div>
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────────
export default function ProfilPage() {
  const [active, setActive] = useState<NavSection>("profil");
  const [pseudo, setPseudo] = useState(MOCK_USER.pseudo);

  const renderSection = () => {
    switch (active) {
      case "profil":      return <SectionProfil pseudo={pseudo} setPseudo={setPseudo} />;
      case "annonces":    return <SectionAnnonces />;
      case "messages":    return <SectionMessages />;
      case "badges":      return <SectionBadges />;
      case "quetes":      return <SectionQuetes />;
      case "credits":     return <SectionCredits />;
      case "parametres":  return <SectionParametres pseudo={pseudo} setPseudo={setPseudo} />;
    }
  };

  return (
    <>
      <style>{`
        @keyframes spin    { to { transform:rotate(360deg); } }
        @keyframes shimmer { to { left:200%; } }
        @keyframes float   { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-6px);} }
        *,*::before,*::after { box-sizing:border-box; margin:0; padding:0; }
        body { background:#0A0A0F; color:#e2e8f0; font-family:'DM Sans',sans-serif; min-height:100vh; }

        .navbar { position:sticky; top:0; z-index:100; display:flex; align-items:center; justify-content:space-between; padding:0 2rem; height:64px; background:rgba(10,10,15,.88); backdrop-filter:blur(20px); border-bottom:1px solid rgba(124,58,237,.12); }
        .nav-logo { font-family:'Syne',sans-serif; font-weight:800; font-size:1.05rem; color:#fff; text-decoration:none; letter-spacing:-.02em; }
        .nav-logo span { color:#7c3aed; }
        .nav-right { display:flex; align-items:center; gap:.5rem; }
        .nav-link { color:rgba(255,255,255,.5); text-decoration:none; font-size:.85rem; padding:.4rem .75rem; border-radius:8px; transition:all .2s; }
        .nav-link:hover { color:#fff; background:rgba(255,255,255,.06); }
        .nav-signout { display:flex; align-items:center; gap:6px; color:rgba(255,255,255,.4); background:none; border:1px solid rgba(255,255,255,.08); padding:.4rem .875rem; border-radius:10px; font-size:.82rem; cursor:pointer; transition:all .2s; font-family:'DM Sans',sans-serif; }
        .nav-signout:hover { color:#fff; border-color:rgba(255,255,255,.18); }

        .layout { display:flex; max-width:1100px; margin:0 auto; padding:2rem 1.5rem; gap:1.75rem; }
        .main   { flex:1; min-width:0; }

        .sc { display:flex; flex-direction:column; gap:1.25rem; }
        .sh { display:flex; align-items:flex-start; justify-content:space-between; flex-wrap:wrap; gap:1rem; }
        .st { font-family:'Syne',sans-serif; font-weight:800; font-size:1.45rem; color:#fff; letter-spacing:-.03em; }
        .ss { color:rgba(255,255,255,.35); font-size:.84rem; margin-top:2px; }

        /* Action cards */
        .action-card { position:relative; overflow:hidden; background:rgba(255,255,255,.03); border:1px solid rgba(255,255,255,.07); border-radius:18px; padding:1.25rem; display:flex; flex-direction:column; gap:.6rem; transition:border-color .2s, transform .2s; }
        .action-card:hover { border-color:rgba(124,58,237,.25); transform:translateY(-2px); }
        .action-card-boost { background:rgba(124,58,237,.05); border-color:rgba(124,58,237,.25); }
        .action-card-boost:hover { border-color:rgba(124,58,237,.45); box-shadow:0 8px 32px rgba(124,58,237,.15); }
        .action-card-top { display:flex; align-items:center; gap:9px; }
        .action-icon-wrap { width:32px; height:32px; border-radius:9px; display:flex; align-items:center; justify-content:center; flex-shrink:0; color:rgba(255,255,255,.7); }
        .action-label { font-size:.78rem; font-weight:600; color:rgba(255,255,255,.5); letter-spacing:.02em; }
        .action-value { font-family:'Syne',sans-serif; font-weight:800; font-size:2rem; color:#fff; line-height:1; }
        .action-sub { font-size:.75rem; color:rgba(255,255,255,.3); margin-bottom:.2rem; }
        .action-btn { display:inline-flex; align-items:center; gap:5px; margin-top:auto; padding:.45rem .875rem; background:rgba(255,255,255,.05); border:1px solid rgba(255,255,255,.1); border-radius:9px; color:rgba(255,255,255,.55); font-size:.76rem; font-weight:600; cursor:pointer; transition:all .2s; text-decoration:none; font-family:'DM Sans',sans-serif; justify-content:center; }
        .action-btn:hover { color:#fff; border-color:rgba(255,255,255,.22); background:rgba(255,255,255,.08); }
        .action-btn-boost { background:rgba(124,58,237,.18); border-color:rgba(124,58,237,.4); color:#c4b5fd; }
        .action-btn-boost:hover { background:rgba(124,58,237,.28); color:#fff; }

        .row-card { display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:.75rem; background:rgba(255,255,255,.03); border:1px solid rgba(255,255,255,.07); border-radius:14px; padding:1rem 1.25rem; transition:border-color .2s; }
        .row-card:hover { border-color:rgba(124,58,237,.2); }
        .row-card.done { opacity:.55; }

        .cat-tag { padding:.2rem .6rem; background:rgba(124,58,237,.12); border:1px solid rgba(124,58,237,.25); border-radius:100px; font-size:.72rem; color:#a78bfa; font-weight:600; }

        .form-g { display:flex; flex-direction:column; gap:6px; }
        .form-l { font-size:.78rem; font-weight:600; color:rgba(255,255,255,.45); letter-spacing:.04em; }
        .form-i { background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.08); border-radius:12px; padding:.75rem 1rem; color:#fff; font-size:.9rem; font-family:'DM Sans',sans-serif; outline:none; transition:all .2s; width:100%; }
        .form-i:focus { border-color:rgba(124,58,237,.4); background:rgba(124,58,237,.05); box-shadow:0 0 0 3px rgba(124,58,237,.1); }
        .form-i.disabled { opacity:.4; cursor:not-allowed; }
        .form-ta { resize:vertical; min-height:90px; }
        .form-h { font-size:.7rem; color:rgba(255,255,255,.22); }

        .btn-p { display:inline-flex; align-items:center; gap:6px; background:#7c3aed; color:#fff; border:none; border-radius:10px; padding:.5rem 1rem; font-size:.82rem; font-weight:600; cursor:pointer; transition:all .2s; text-decoration:none; font-family:'DM Sans',sans-serif; }
        .btn-p:hover { background:#6d28d9; transform:translateY(-1px); box-shadow:0 4px 16px rgba(124,58,237,.35); }
        .btn-p.btn-saved { background:#16a34a; }
        .btn-o { display:inline-flex; align-items:center; gap:6px; background:transparent; color:rgba(255,255,255,.7); border:1px solid rgba(255,255,255,.12); border-radius:10px; padding:.5rem 1rem; font-size:.82rem; font-weight:600; cursor:pointer; transition:all .2s; text-decoration:none; font-family:'DM Sans',sans-serif; }
        .btn-o:hover { color:#fff; border-color:rgba(255,255,255,.25); }
        .btn-ghost-sm { background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.08); color:rgba(255,255,255,.5); border-radius:8px; padding:.3rem .625rem; font-size:.75rem; font-weight:500; cursor:pointer; transition:all .2s; font-family:'DM Sans',sans-serif; }
        .btn-ghost-sm:hover { color:#fff; border-color:rgba(255,255,255,.18); }
        .btn-ghost-sm.danger:hover { color:#f87171; border-color:rgba(248,113,113,.3); }
        .btn-danger { background:rgba(239,68,68,.1); border:1px solid rgba(239,68,68,.25); color:#f87171; border-radius:10px; padding:.5rem 1rem; font-size:.82rem; font-weight:600; cursor:pointer; transition:all .2s; font-family:'DM Sans',sans-serif; }
        .btn-danger:hover { background:rgba(239,68,68,.18); }

        @media(max-width:768px){
          .layout { flex-direction:column; padding:1rem; }
          .main { width:100%; }
        }
      `}</style>


        // profil
        <Navbar activePage="profil" isLoggedIn={true} pseudo="Test3" />

      <div className="layout">
        <Sidebar active={active} setActive={setActive} pseudo={pseudo} />
        <main className="main">{renderSection()}</main>
      </div>
    </>
  );
}