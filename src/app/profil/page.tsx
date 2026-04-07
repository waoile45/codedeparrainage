"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Navbar from "@/components/Navbar";
import { createClient } from "@/lib/supabase";

type NavSection = "profil" | "annonces" | "messages" | "badges" | "quetes" | "credits" | "parametres" | "avis";

interface UserProfile {
  id: string;
  email: string;
  pseudo: string;
  avatar_url: string | null;
  bio: string | null;
  xp: number;
  level: string;
  streak_days: number;
  created_at: string;
}

interface Annonce {
  id: string;
  code: string;
  description: string | null;
  bumps_today: number;
  created_at: string;
  companies: { name: string; category: string } | null;
}

interface Badge { id: string; label: string; icon: string; unlocked: boolean; desc: string; }

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
  return { xpNext: t.max, xpNextLabel: t.next };
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
}

// ── Icons ──────────────────────────────────────────────────────────────────────
const I = {
  user:   () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>,
  list:   () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="5" width="18" height="14" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  msg:    () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  badge:  () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="6"/><path d="M8.56 2.75c4.37 6.03 6.02 9.42 8.03 17.72m2.54-15.38c-3.72 4.35-8.94 5.66-16.88 5.85m19.5 1.9c-3.5-.93-6.63-.82-8.94 0-2.58.92-5.01 2.86-7.44 6.32"/></svg>,
  target: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
  bolt:   () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  gear:   () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  star:   () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  plus:   () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  cam:    () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>,
  edit:   () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  check:  () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>,
  arrow:  () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
};

// ── XP Bar ─────────────────────────────────────────────────────────────────────
function XPBar({ xp, xpNext, mini=false }: { xp:number; xpNext:number; mini?:boolean }) {
  const pct = Math.min((xp / xpNext) * 100, 100);
  const [w, setW] = useState(0);
  useEffect(() => { const t = setTimeout(() => setW(pct), 350); return () => clearTimeout(t); }, [pct]);
  return (
    <div style={{ height:mini?4:6, background:"rgba(255,255,255,.07)", borderRadius:100, overflow:"hidden" }}>
      <div style={{ height:"100%", width:`${w}%`, background:"linear-gradient(90deg,#7c3aed,#a855f7)", borderRadius:100, transition:"width 1.1s cubic-bezier(.4,0,.2,1)" }} />
    </div>
  );
}

// ── Avatar ─────────────────────────────────────────────────────────────────────
function AvatarUpload({ letter, avatarUrl, size=72, onUpload }: { letter:string; avatarUrl:string|null; size?:number; onUpload:(url:string)=>void }) {
  const [preview, setPreview] = useState<string|null>(avatarUrl);
  const [hover, setHover] = useState(false);
  const [uploading, setUploading] = useState(false);
  const ref = useRef<HTMLInputElement>(null);
  const supabase = createClient();
  useEffect(() => { setPreview(avatarUrl); }, [avatarUrl]);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    setUploading(true);
    const localPreview = URL.createObjectURL(f);
    setPreview(localPreview);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setUploading(false); return; }
    // Toujours utiliser avatar.webp pour écraser la version précédente
    const path = `${user.id}/avatar`;
    const { error } = await supabase.storage.from("avatars").upload(path, f, { upsert: true, contentType: f.type });
    if (error) {
      console.error("Avatar upload error:", error);
      setUploading(false);
      return;
    }
    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    // Ajoute un timestamp pour forcer le rechargement de l'image
    const urlWithBust = `${data.publicUrl}?t=${Date.now()}`;
    await supabase.from("users").update({ avatar_url: data.publicUrl }).eq("id", user.id);
    setPreview(urlWithBust);
    onUpload(data.publicUrl);
    setUploading(false);
  };

  return (
    <div style={{ position:"relative", width:size, height:size, flexShrink:0 }}>
      <div style={{ position:"absolute", inset:-3, borderRadius:"50%", background:"conic-gradient(#7c3aed,#a855f7,#6366f1,#7c3aed)", animation:"spin 5s linear infinite" }} />
      <div style={{ position:"relative", zIndex:1, width:size, height:size, borderRadius:"50%", border:"3px solid #0A0A0F", overflow:"hidden", cursor:"pointer", background:"linear-gradient(135deg,#7c3aed,#4f46e5)", display:"flex", alignItems:"center", justifyContent:"center" }}
        onMouseEnter={()=>setHover(true)} onMouseLeave={()=>setHover(false)} onClick={()=>ref.current?.click()}>
        {preview ? <img src={preview} alt="avatar" style={{ width:"100%", height:"100%", objectFit:"cover" }} /> : <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:size*.38, color:"#fff" }}>{letter}</span>}
        <div style={{ position:"absolute", inset:0, background:"rgba(0,0,0,.55)", display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:3, opacity:(hover||uploading)?1:0, transition:"opacity .2s" }}>
          {uploading ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" style={{ animation:"spin 1s linear infinite" }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
            : <><span style={{ color:"#fff" }}><I.cam /></span><span style={{ color:"rgba(255,255,255,.8)", fontSize:"0.58rem", fontWeight:600 }}>Modifier</span></>}
        </div>
      </div>
      <input ref={ref} type="file" accept="image/*" style={{ display:"none" }} onChange={handleFile} />
    </div>
  );
}

// ── Editable pseudo ────────────────────────────────────────────────────────────
function EditablePseudo({ value, onSave, size="lg" }: { value:string; onSave:(v:string)=>Promise<string|null>; size?:"lg"|"sm" }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const iRef = useRef<HTMLInputElement>(null);
  useEffect(() => { setDraft(value); }, [value]);
  useEffect(() => { if (editing) iRef.current?.focus(); }, [editing]);
  const confirm = async () => {
    if (!draft.trim()) return;
    setSaving(true); setErr("");
    const error = await onSave(draft.trim());
    setSaving(false);
    if (error) { setErr(error); } else { setEditing(false); }
  };
  const cancel = () => { setDraft(value); setEditing(false); setErr(""); };
  const fs = size==="lg" ? "1.5rem" : "0.95rem";
  if (editing) return (
    <div>
      <div style={{ display:"flex", alignItems:"center", gap:6 }}>
        <input ref={iRef} value={draft} onChange={e=>{ setDraft(e.target.value); setErr(""); }} onKeyDown={e=>{ if(e.key==="Enter") confirm(); if(e.key==="Escape") cancel(); }}
          style={{ background:"rgba(124,58,237,.15)", border:`1px solid ${err?"rgba(239,68,68,.5)":"rgba(124,58,237,.45)"}`, borderRadius:8, padding:"4px 10px", color:"#fff", fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:fs, outline:"none", width:160 }} />
        <button onClick={confirm} disabled={saving} style={{ background:"rgba(34,197,94,.15)", border:"1px solid rgba(34,197,94,.3)", borderRadius:7, padding:"5px 8px", color:"#4ade80", cursor:"pointer", display:"flex" }}>
          {saving ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation:"spin 1s linear infinite" }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg> : <I.check />}
        </button>
        <button onClick={cancel} style={{ background:"rgba(255,255,255,.05)", border:"1px solid rgba(255,255,255,.1)", borderRadius:7, padding:"5px 8px", color:"rgba(255,255,255,.4)", cursor:"pointer", fontSize:"0.8rem" }}>✕</button>
      </div>
      {err && <p style={{ fontSize:".75rem", color:"#f87171", marginTop:4 }}>{err}</p>}
    </div>
  );
  return (
    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
      <h2 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:fs, color:"#fff", letterSpacing:"-.03em" }}>{value}</h2>
      <button onClick={()=>setEditing(true)} style={{ background:"rgba(255,255,255,.05)", border:"1px solid rgba(255,255,255,.1)", borderRadius:7, padding:"5px 7px", color:"rgba(255,255,255,.35)", cursor:"pointer", display:"flex" }}><I.edit /></button>
    </div>
  );
}

// ── Sidebar mini ───────────────────────────────────────────────────────────────
function SidebarMini({ user }: { user: UserProfile | null }) {
  if (!user) return null;
  const { xpNext } = getXpInfo(user.xp);
  return (
    <div style={{ padding:"1rem", background:"rgba(124,58,237,.08)", border:"1px solid rgba(124,58,237,.18)", borderRadius:16, display:"flex", flexDirection:"column", gap:"0.75rem" }}>
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        <div style={{ position:"relative", width:38, height:38, flexShrink:0 }}>
          <div style={{ position:"absolute", inset:-2, borderRadius:"50%", background:"conic-gradient(#7c3aed,#a855f7,#7c3aed)", animation:"spin 5s linear infinite" }} />
          <div style={{ position:"relative", width:38, height:38, borderRadius:"50%", background:"linear-gradient(135deg,#7c3aed,#4f46e5)", border:"2px solid #0A0A0F", display:"flex", alignItems:"center", justifyContent:"center", overflow:"hidden" }}>
            {user.avatar_url ? <img src={user.avatar_url} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} /> : <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:"0.95rem", color:"#fff" }}>{user.pseudo[0]?.toUpperCase()}</span>}
          </div>
        </div>
        <div style={{ flex:1, minWidth:0 }}>
          <p style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:"0.9rem", color:"#fff", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{user.pseudo}</p>
          <div style={{ display:"flex", alignItems:"center", gap:5, marginTop:1 }}>
            <span style={{ fontSize:"0.65rem", fontWeight:700, background:"rgba(124,58,237,.25)", color:"#a78bfa", padding:"1px 7px", borderRadius:100, border:"1px solid rgba(124,58,237,.3)" }}>{user.level}</span>
            <span style={{ fontSize:"0.68rem", color:"rgba(255,255,255,.3)" }}>{user.xp} XP</span>
          </div>
        </div>
      </div>
      <XPBar xp={user.xp} xpNext={xpNext} mini />
    </div>
  );
}

// ── Sidebar ────────────────────────────────────────────────────────────────────
const NAV_GROUPS = [
  { label:"Mon compte",   items:[{key:"profil" as NavSection, label:"Mon profil", icon:<I.user/>},{key:"annonces" as NavSection, label:"Mes annonces", icon:<I.list/>},{key:"messages" as NavSection, label:"Messages", icon:<I.msg/>}] },
  { label:"Progression",  items:[{key:"badges" as NavSection, label:"Badges", icon:<I.badge/>},{key:"quetes" as NavSection, label:"Quêtes", icon:<I.target/>},{key:"avis" as NavSection, label:"Avis", icon:<I.star/>}] },
  { label:"Monétisation", items:[{key:"credits" as NavSection, label:"Crédits & Boosts", icon:<I.bolt/>},{key:"parametres" as NavSection, label:"Paramètres", icon:<I.gear/>}] },
];

function Sidebar({ active, setActive, user }: { active:NavSection; setActive:(s:NavSection)=>void; user:UserProfile|null }) {
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
        <button style={{ display:"flex", alignItems:"center", gap:8, width:"100%", padding:"0.6rem 0.875rem", background:"rgba(124,58,237,.1)", border:"1px dashed rgba(124,58,237,.35)", borderRadius:11, color:"#a78bfa", fontSize:"0.855rem", fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
          <I.plus />Publier un code
        </button>
      </a>
      <SidebarMini user={user} />
    </aside>
  );
}

// ── Section Profil ─────────────────────────────────────────────────────────────
function SectionProfil({ user, annonces, onPseudoSave, onAvatarUpload }: { user:UserProfile; annonces:Annonce[]; onPseudoSave:(v:string)=>Promise<string|null>; onAvatarUpload:(url:string)=>void }) {
  const { xpNext, xpNextLabel } = getXpInfo(user.xp);
  return (
    <div className="sc">
      <div style={{ position:"relative", overflow:"hidden", background:"rgba(255,255,255,.03)", border:"1px solid rgba(255,255,255,.07)", borderRadius:20, padding:"1.5rem" }}>
        <div style={{ position:"absolute", top:-50, left:-50, width:200, height:200, background:"radial-gradient(circle,rgba(124,58,237,.12),transparent 70%)", pointerEvents:"none" }} />
        <div style={{ display:"flex", alignItems:"center", gap:"1.25rem", flexWrap:"wrap" }}>
          <AvatarUpload letter={user.pseudo[0]?.toUpperCase()??"?"} avatarUrl={user.avatar_url} size={72} onUpload={onAvatarUpload} />
          <div style={{ flex:1 }}>
            <EditablePseudo value={user.pseudo} onSave={onPseudoSave} />
            <div style={{ display:"flex", alignItems:"center", gap:8, marginTop:5, flexWrap:"wrap" }}>
              <span style={{ fontSize:"0.72rem", fontWeight:700, background:"rgba(124,58,237,.2)", color:"#a78bfa", padding:"3px 10px", borderRadius:100, border:"1px solid rgba(124,58,237,.35)" }}>{user.level}</span>
              <span style={{ fontSize:"0.8rem", color:"#a78bfa", fontWeight:700 }}>{user.xp} XP</span>
              <span style={{ color:"rgba(255,255,255,.2)" }}>·</span>
              <span style={{ fontSize:"0.78rem", color:"rgba(255,255,255,.3)" }}>{xpNextLabel} à {xpNext} XP</span>
              <span style={{ color:"rgba(255,255,255,.2)" }}>·</span>
              <span style={{ fontSize:"0.78rem", color:"rgba(255,255,255,.3)" }}>Membre depuis {formatDate(user.created_at)}</span>
            </div>
            <div style={{ marginTop:"0.875rem" }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5, fontSize:"0.72rem", color:"rgba(255,255,255,.3)" }}>
                <span>{user.xp} XP</span><span>{xpNextLabel} — {xpNext} XP</span>
              </div>
              <XPBar xp={user.xp} xpNext={xpNext} />
            </div>
          </div>
          <div style={{ textAlign:"right", flexShrink:0 }}>
            <p style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:"2.5rem", color:"#fff", lineHeight:1 }}>{user.xp}</p>
            <p style={{ color:"rgba(255,255,255,.3)", fontSize:"0.72rem", marginTop:2 }}>XP total</p>
          </div>
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"0.875rem" }}>
        <div className="action-card">
          <div className="action-card-top"><div className="action-icon-wrap" style={{ background:"rgba(99,102,241,.12)", border:"1px solid rgba(99,102,241,.25)" }}><I.list /></div><span className="action-label">Annonces publiées</span></div>
          <p className="action-value">{annonces.length}</p>
          <p className="action-sub">{annonces.length === 0 ? "Publie ton premier code !" : `${annonces.length} code${annonces.length>1?"s":""} actif${annonces.length>1?"s":""}`}</p>
          <a href="/publier" className="action-btn">Nouvelle annonce <I.arrow /></a>
        </div>
        <div className="action-card action-card-boost">
          <div style={{ position:"absolute", inset:0, background:"radial-gradient(circle at 50% 0%,rgba(124,58,237,.18),transparent 65%)", pointerEvents:"none", borderRadius:"inherit" }} />
          <div style={{ position:"absolute", top:0, left:0, right:0, height:1, background:"linear-gradient(90deg,transparent,#7c3aed,transparent)" }} />
          <div className="action-card-top" style={{ position:"relative", zIndex:1 }}><div className="action-icon-wrap" style={{ background:"rgba(124,58,237,.2)", border:"1px solid rgba(124,58,237,.4)" }}><I.bolt /></div><span className="action-label">Streak</span></div>
          <p className="action-value" style={{ color:"#a78bfa", position:"relative", zIndex:1 }}>{user.streak_days} 🔥</p>
          <p className="action-sub" style={{ position:"relative", zIndex:1 }}>jours consécutifs</p>
          <a href="/classement" className="action-btn action-btn-boost" style={{ position:"relative", zIndex:1 }}>Voir le classement <I.arrow /></a>
        </div>
        <div className="action-card">
          <div className="action-card-top"><div className="action-icon-wrap" style={{ background:"rgba(34,197,94,.1)", border:"1px solid rgba(34,197,94,.22)" }}><I.msg /></div><span className="action-label">Messages</span></div>
          <p className="action-value">0</p>
          <p className="action-sub">0 non lu</p>
          <a href="/messages" className="action-btn">Messagerie <I.arrow /></a>
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"0.75rem" }}>
        {[
          { v: annonces.length,       l:"Annonces" },
          { v: `${user.streak_days} 🔥`, l:"Streak" },
          { v: user.xp,               l:"XP total" },
          { v: user.level,            l:"Niveau", small:true },
        ].map((s,i) => (
          <div key={i} style={{ background:"rgba(255,255,255,.03)", border:"1px solid rgba(255,255,255,.07)", borderRadius:14, padding:"0.9rem 0.75rem", display:"flex", flexDirection:"column", alignItems:"center", gap:3, textAlign:"center" }}>
            <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:(s as any).small?"0.8rem":"1.35rem", color:"#fff" }}>{s.v}</span>
            <span style={{ color:"rgba(255,255,255,.35)", fontSize:"0.72rem" }}>{s.l}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Section Annonces ───────────────────────────────────────────────────────────
function SectionAnnonces({ annonces, onDelete, onEdit }: {
  annonces: Annonce[];
  onDelete: (id: string) => void;
  onEdit:   (id: string, code: string, description: string) => Promise<void>;
}) {
  const [editingId, setEditingId]     = useState<string | null>(null);
  const [editCode, setEditCode]       = useState("");
  const [editDesc, setEditDesc]       = useState("");
  const [saving, setSaving]           = useState(false);

  const startEdit = (a: Annonce) => {
    setEditingId(a.id);
    setEditCode(a.code);
    setEditDesc(a.description ?? "");
  };

  const cancelEdit = () => { setEditingId(null); };

  const saveEdit = async () => {
    if (!editingId || !editCode.trim()) return;
    setSaving(true);
    await onEdit(editingId, editCode.trim(), editDesc.trim());
    setSaving(false);
    setEditingId(null);
  };

  return (
    <div className="sc">
      <div className="sh">
        <div><h2 className="st">Mes annonces</h2><p className="ss">{annonces.length} annonce{annonces.length>1?"s":""} publiée{annonces.length>1?"s":""}</p></div>
        <a href="/publier" className="btn-p"><I.plus />Nouvelle annonce</a>
      </div>
      {annonces.length === 0 && (
        <div style={{ textAlign:"center", padding:"3rem", color:"rgba(255,255,255,.25)", fontSize:"0.875rem" }}>
          <div style={{ fontSize:"2rem", marginBottom:"0.75rem" }}>📋</div>
          <p>Aucune annonce — <a href="/publier" style={{ color:"#a78bfa", textDecoration:"none" }}>publie ton premier code !</a></p>
        </div>
      )}
      {annonces.map(a => (
        <div key={a.id} className="row-card" style={{ flexDirection:"column", alignItems:"stretch", gap:"0.875rem" }}>
          {/* Ligne principale */}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:8 }}>
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              <div style={{ width:8, height:8, borderRadius:"50%", background:"#22c55e", boxShadow:"0 0 6px #22c55e", flexShrink:0 }} />
              <div>
                <p style={{ fontWeight:700, color:"#fff", fontSize:"0.9rem" }}>{a.companies?.name ?? "Inconnu"}</p>
                <code style={{ fontFamily:"monospace", fontSize:"0.8rem", color:"rgba(255,255,255,.4)", letterSpacing:"0.06em" }}>{a.code}</code>
              </div>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
              {a.companies?.category && <span className="cat-tag">{a.companies.category}</span>}
              <span style={{ fontSize:"0.78rem", color:"rgba(255,255,255,.3)" }}>⚡ {a.bumps_today} boosts</span>
              <a href="/boost" className="btn-ghost-sm">Booster ⚡</a>
              {editingId !== a.id && (
                <button className="btn-ghost-sm" onClick={() => startEdit(a)}>✏️ Modifier</button>
              )}
              <button className="btn-ghost-sm danger" onClick={() => onDelete(a.id)}>Supprimer</button>
            </div>
          </div>

          {/* Formulaire de modification inline */}
          {editingId === a.id && (
            <div style={{ background:"rgba(124,58,237,.07)", border:"1px solid rgba(124,58,237,.2)", borderRadius:12, padding:"1rem", display:"flex", flexDirection:"column", gap:"0.75rem" }}>
              <div className="form-g">
                <label className="form-l">CODE DE PARRAINAGE</label>
                <input
                  className="form-i"
                  value={editCode}
                  onChange={e => {
                    const v = e.target.value;
                    setEditCode(v.startsWith("http") ? v : v.toUpperCase());
                  }}
                  maxLength={500}
                  placeholder="Ton code ou lien"
                />
              </div>
              <div className="form-g">
                <label className="form-l">DESCRIPTION <span style={{ color:"rgba(255,255,255,.2)", fontWeight:400 }}>optionnel</span></label>
                <textarea
                  className="form-i form-ta"
                  value={editDesc}
                  onChange={e => setEditDesc(e.target.value)}
                  maxLength={280}
                  placeholder="Décris ce que le filleul peut gagner..."
                  style={{ resize:"vertical", minHeight:72 }}
                />
                <p style={{ fontSize:".7rem", color:"rgba(255,255,255,.25)" }}>{editDesc.length}/280</p>
              </div>
              <div style={{ display:"flex", gap:8 }}>
                <button
                  onClick={saveEdit}
                  disabled={saving || !editCode.trim()}
                  style={{ background:"#7c3aed", color:"#fff", fontWeight:700, fontSize:".82rem", padding:".5rem 1.25rem", borderRadius:10, border:"none", cursor:"pointer", opacity:saving||!editCode.trim()?0.6:1 }}
                >
                  {saving ? "Enregistrement…" : "✓ Sauvegarder"}
                </button>
                <button
                  onClick={cancelEdit}
                  style={{ background:"rgba(255,255,255,.05)", color:"rgba(255,255,255,.5)", fontWeight:600, fontSize:".82rem", padding:".5rem 1rem", borderRadius:10, border:"1px solid rgba(255,255,255,.1)", cursor:"pointer" }}
                >
                  Annuler
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Section Badges ─────────────────────────────────────────────────────────────
function SectionBadges({ xp, annoncesCount }: { xp:number; annoncesCount:number }) {
  const badges: Badge[] = [
    { id:"1", label:"Première annonce", icon:"🚀", unlocked:annoncesCount > 0, desc:"Tu as publié ton premier code" },
    { id:"2", label:"Parrain Bronze",   icon:"🥉", unlocked:xp>=100,  desc:"Atteins 100 XP" },
    { id:"3", label:"Streak x7",        icon:"🔥", unlocked:false,    desc:"Connecte-toi 7 jours de suite" },
    { id:"4", label:"Premier boost",    icon:"⚡", unlocked:false,    desc:"Booste une annonce" },
    { id:"5", label:"Parrain Argent",   icon:"🥈", unlocked:xp>=500,  desc:"Atteins 500 XP" },
    { id:"6", label:"Légende",          icon:"👑", unlocked:xp>=2000, desc:"Atteins 2000 XP" },
  ];
  return (
    <div className="sc">
      <div className="sh"><div><h2 className="st">Badges</h2><p className="ss">{badges.filter(b=>b.unlocked).length}/{badges.length} débloqués</p></div></div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"0.875rem" }}>
        {badges.map(b => (
          <div key={b.id} style={{ position:"relative", background:b.unlocked?"rgba(124,58,237,.07)":"rgba(255,255,255,.03)", border:`1px solid ${b.unlocked?"rgba(124,58,237,.3)":"rgba(255,255,255,.07)"}`, borderRadius:16, padding:"1.4rem 1rem", textAlign:"center", opacity:b.unlocked?1:.42 }}>
            {!b.unlocked && <div style={{ position:"absolute", top:10, right:10, fontSize:"0.75rem" }}>🔒</div>}
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
function SectionQuetes({ user, annonces, hasReview }: { user:UserProfile; annonces:Annonce[]; hasReview:boolean }) {
  const quetes: { label:string; xp:number; done:boolean; progress:number; total:number; link?:string }[] = [
    { label:"Publier ton premier code",      xp:10, done:annonces.length>0,   progress:Math.min(annonces.length,1), total:1, link:"/publier" },
    { label:"Se connecter 7 jours de suite", xp:25, done:user.streak_days>=7, progress:user.streak_days, total:7 },
    { label:"Atteindre 100 XP",              xp:20, done:user.xp>=100,        progress:user.xp, total:100 },
    { label:"Publier 5 annonces",            xp:30, done:annonces.length>=5,  progress:annonces.length, total:5, link:"/publier" },
    { label:"Laisser un avis sur la plateforme", xp:15, done:hasReview, progress:hasReview?1:0, total:1, link:"/avis" },
  ];
  return (
    <div className="sc">
      <div className="sh"><div><h2 className="st">Quêtes</h2><p className="ss">Complète des quêtes pour gagner de l&apos;XP</p></div></div>
      {quetes.map((q,i) => (
        <div key={i} className={`row-card ${q.done?"done":""}`} style={{ display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ width:22, height:22, borderRadius:"50%", border:`1.5px solid ${q.done?"rgba(34,197,94,.4)":"rgba(255,255,255,.15)"}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"0.7rem", color:"#4ade80", flexShrink:0, background:q.done?"rgba(34,197,94,.1)":"none" }}>{q.done?"✓":""}</div>
          <div style={{ flex:1 }}>
            <p style={{ fontSize:"0.875rem", color:"rgba(255,255,255,.8)", marginBottom:q.done?0:5 }}>{q.label}</p>
            {!q.done && (
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <div style={{ flex:1, height:4, background:"rgba(255,255,255,.07)", borderRadius:100, overflow:"hidden" }}><div style={{ height:"100%", width:`${Math.min((q.progress/q.total)*100,100)}%`, background:"#7c3aed", borderRadius:100 }} /></div>
                <span style={{ fontSize:"0.7rem", color:"rgba(255,255,255,.3)", whiteSpace:"nowrap" }}>{Math.min(q.progress,q.total)}/{q.total}</span>
              </div>
            )}
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:8, flexShrink:0 }}>
            {!q.done && q.link && (
              <a href={q.link} style={{ fontSize:"0.75rem", fontWeight:600, color:"#a78bfa", background:"rgba(124,58,237,.15)", border:"1px solid rgba(124,58,237,.3)", borderRadius:8, padding:"3px 10px", textDecoration:"none", whiteSpace:"nowrap", transition:"all .2s" }}>
                Faire →
              </a>
            )}
            <span style={{ fontSize:"0.82rem", fontWeight:700, color:q.done?"#4ade80":"rgba(255,255,255,.3)", whiteSpace:"nowrap", fontFamily:"'Syne',sans-serif" }}>+{q.xp} XP</span>
          </div>
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
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0.875rem" }}>
        <div style={{ position:"relative", overflow:"hidden", background:"rgba(124,58,237,.08)", border:"1px solid rgba(124,58,237,.25)", borderRadius:18, padding:"1.75rem" }}>
          <div style={{ position:"relative", zIndex:1 }}>
            <p style={{ fontSize:"0.78rem", color:"rgba(255,255,255,.4)", marginBottom:4 }}>Solde actuel</p>
            <p style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:"2.75rem", color:"#a78bfa", lineHeight:1, marginBottom:4 }}>0</p>
            <p style={{ fontSize:"0.78rem", color:"rgba(255,255,255,.3)" }}>crédits disponibles</p>
          </div>
          <div style={{ position:"absolute", right:"1.5rem", bottom:"1rem", fontSize:"3rem", animation:"float 3s ease-in-out infinite" }}>⚡</div>
        </div>
        <div style={{ background:"rgba(255,255,255,.03)", border:"1px solid rgba(255,255,255,.07)", borderRadius:18, padding:"1.5rem", display:"flex", flexDirection:"column", gap:"0.875rem" }}>
          <p style={{ fontSize:"0.8rem", fontWeight:600, color:"rgba(255,255,255,.5)" }}>Pourquoi booster ?</p>
          {[{ icon:"📈", text:<>3× plus de vues</> },{ icon:"🏆", text:<>Tête du classement</> },{ icon:"⚡", text:<>XP bonus</>}].map((item,i) => (
            <div key={i} style={{ display:"flex", alignItems:"center", gap:8 }}><span>{item.icon}</span><p style={{ fontSize:"0.78rem", color:"rgba(255,255,255,.55)" }}>{item.text}</p></div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Section Paramètres ─────────────────────────────────────────────────────────
function SectionParametres({ user, onPseudoSave, onAvatarUpload, onBioSave }: { user:UserProfile; onPseudoSave:(v:string)=>Promise<string|null>; onAvatarUpload:(url:string)=>void; onBioSave:(bio:string)=>Promise<void> }) {
  const [bio, setBio] = useState(user.bio ?? "");
  const [saved, setSaved] = useState(false);
  const save = async () => { await onBioSave(bio); setSaved(true); setTimeout(()=>setSaved(false), 2000); };
  return (
    <div className="sc">
      <div className="sh"><div><h2 className="st">Paramètres du compte</h2><p className="ss">Modifie tes informations personnelles</p></div></div>
      <div style={{ background:"rgba(255,255,255,.03)", border:"1px solid rgba(255,255,255,.07)", borderRadius:16, padding:"1.25rem 1.5rem" }}>
        <p style={{ fontSize:"0.7rem", fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase", color:"rgba(255,255,255,.3)", marginBottom:"1rem" }}>Photo de profil & nom d&apos;affichage</p>
        <div style={{ display:"flex", alignItems:"center", gap:"1.5rem" }}>
          <AvatarUpload letter={user.pseudo[0]?.toUpperCase()??"?"} avatarUrl={user.avatar_url} size={60} onUpload={onAvatarUpload} />
          <div style={{ flex:1 }}>
            <EditablePseudo value={user.pseudo} onSave={onPseudoSave} size="sm" />
            <p style={{ fontSize:"0.7rem", color:"rgba(255,255,255,.25)", marginTop:4 }}>Clique sur ✏️ pour modifier le pseudo · sur l&apos;avatar pour changer la photo</p>
          </div>
        </div>
      </div>
      <div className="form-g"><label className="form-l">Email</label><input className="form-i disabled" value={user.email} disabled /><p className="form-h">L&apos;email ne peut pas être modifié</p></div>
      <div className="form-g">
        <label className="form-l">Présentation</label>
        <textarea className="form-i form-ta" value={bio} onChange={e=>setBio(e.target.value)} placeholder="Parle un peu de toi..." rows={4} maxLength={300} />
        <p className="form-h">{bio.length}/300 caractères</p>
      </div>
      <button className={`btn-p${saved?" btn-saved":""}`} onClick={save}>{saved?"✓ Sauvegardé":"Enregistrer"}</button>
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
        <p>Aucun message pour l&apos;instant</p>
      </div>
    </div>
  );
}

function Skeleton() {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:"1.25rem" }}>
      {[1,2,3].map(i => (
        <div key={i} style={{ background:"rgba(255,255,255,.03)", border:"1px solid rgba(255,255,255,.07)", borderRadius:20, padding:"1.5rem" }}>
          <div style={{ height:16, width:"40%", background:"rgba(255,255,255,.06)", borderRadius:8, marginBottom:12, animation:"shimmer 1.5s ease-in-out infinite" }} />
          <div style={{ height:12, width:"60%", background:"rgba(255,255,255,.04)", borderRadius:8, animation:"shimmer 1.5s ease-in-out infinite" }} />
        </div>
      ))}
    </div>
  );
}

// ── Section Avis (noter le site) ──────────────────────────────────────────────
const GOOGLE_REVIEW_URL = "https://g.page/r/CWGFDaSeMPebEAE/review";

function StarsInput({ value, onChange }: { value:number; onChange:(n:number)=>void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div style={{ display:"flex", gap:6, justifyContent:"center" }}>
      {[1,2,3,4,5].map(n => (
        <button key={n} type="button" onClick={() => onChange(n)} onMouseEnter={() => setHovered(n)} onMouseLeave={() => setHovered(0)}
          style={{ background:"none", border:"none", cursor:"pointer", padding:2, transition:"transform .15s", transform:(hovered||value)>=n?"scale(1.2)":"scale(1)" }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill={(hovered||value)>=n?"#f59e0b":"none"} stroke={(hovered||value)>=n?"#f59e0b":"rgba(255,255,255,.2)"} strokeWidth="1.5">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
        </button>
      ))}
    </div>
  );
}

function SectionAvis({ userId }: { userId:string }) {
  const supabase = createClient();
  type AvisStep = "rate"|"positive"|"negative"|"done";
  const [step, setStep]       = useState<AvisStep>("rate");
  const [rating, setRating]   = useState(0);
  const [comment, setComment] = useState("");
  const [sending, setSending] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    supabase.from("platform_reviews").select("rating").eq("user_id", userId).maybeSingle()
      .then(({ data }) => { if (data) { setRating(data.rating); setStep("done"); } setChecked(true); });
  }, [userId]);

  const LABELS: Record<number,string> = { 1:"Très mauvais 😤", 2:"Pas terrible 😕", 3:"Correct 😐", 4:"Bien 😊", 5:"Excellent ! 🤩" };

  async function submitNegative() {
    setSending(true);
    try { await supabase.from("platform_reviews").insert({ user_id: userId, rating, comment: comment.trim()||null }); } catch {}
    setSending(false);
    setStep("done");
  }

  if (!checked) return <div className="sc"><div style={{ textAlign:"center", padding:"3rem", color:"rgba(255,255,255,.25)" }}>Chargement…</div></div>;

  return (
    <div className="sc">
      <div className="sh"><div><h2 className="st">Avis sur le site</h2><p className="ss">Ton retour nous aide à améliorer la plateforme</p></div></div>

      {step === "rate" && (
        <div style={{ background:"rgba(255,255,255,.03)", border:"1px solid rgba(255,255,255,.07)", borderRadius:18, padding:"2rem", textAlign:"center" }}>
          <p style={{ fontSize:"1rem", fontWeight:700, color:"rgba(255,255,255,.85)", marginBottom:"1.5rem", fontFamily:"'Syne',sans-serif" }}>
            Appréciez-vous codedeparrainage.com ?
          </p>
          <StarsInput value={rating} onChange={setRating} />
          {rating > 0 && <p style={{ marginTop:".75rem", fontSize:".875rem", color:"#a78bfa", fontWeight:600 }}>{LABELS[rating]}</p>}
          <div style={{ display:"flex", gap:10, marginTop:"1.5rem" }}>
            <button type="button" style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:6, background:"rgba(239,68,68,.08)", border:"1px solid rgba(239,68,68,.25)", borderRadius:12, padding:".75rem", color:"#f87171", fontSize:".875rem", fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", transition:"all .2s" }}
              onClick={() => { setRating(r => r||1); setStep("negative"); }}>
              👎 Non
            </button>
            <button type="button" style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:6, background:"rgba(34,197,94,.08)", border:"1px solid rgba(34,197,94,.25)", borderRadius:12, padding:".75rem", color:"#4ade80", fontSize:".875rem", fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", transition:"all .2s" }}
              onClick={() => { setRating(r => r>=4?r:5); setStep("positive"); }}>
              👍 Oui
            </button>
          </div>
          {rating > 0 && (
            <button onClick={() => rating >= 4 ? setStep("positive") : setStep("negative")}
              style={{ marginTop:"1rem", width:"100%", background:"#7c3aed", color:"#fff", border:"none", borderRadius:12, padding:".8rem", fontWeight:700, fontSize:".875rem", cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
              Continuer →
            </button>
          )}
        </div>
      )}

      {step === "positive" && (
        <div style={{ background:"rgba(255,255,255,.03)", border:"1px solid rgba(255,255,255,.07)", borderRadius:18, padding:"2rem", textAlign:"center" }}>
          <div style={{ fontSize:"2.5rem", marginBottom:"1rem" }}>🎉</div>
          <p style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:"1.1rem", color:"rgba(255,255,255,.9)", marginBottom:".5rem" }}>Super, merci !</p>
          <p style={{ color:"rgba(255,255,255,.45)", fontSize:".875rem", marginBottom:"1.5rem" }}>Ça nous ferait vraiment plaisir si tu laissais un avis sur Google — ça prend 30 secondes 🙏</p>
          <a href={GOOGLE_REVIEW_URL} target="_blank" rel="noopener noreferrer"
            style={{ display:"inline-flex", alignItems:"center", gap:8, background:"#4285F4", color:"#fff", textDecoration:"none", borderRadius:12, padding:".8rem 1.5rem", fontWeight:700, fontSize:".875rem", fontFamily:"'DM Sans',sans-serif" }}
            onClick={() => setTimeout(() => setStep("done"), 400)}>
            Laisser un avis Google
          </a>
          <button onClick={() => setStep("done")} style={{ display:"block", width:"100%", marginTop:".75rem", background:"none", border:"1px solid rgba(255,255,255,.1)", borderRadius:12, padding:".7rem", color:"rgba(255,255,255,.35)", fontSize:".875rem", cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
            Plus tard
          </button>
        </div>
      )}

      {step === "negative" && (
        <div style={{ background:"rgba(255,255,255,.03)", border:"1px solid rgba(255,255,255,.07)", borderRadius:18, padding:"2rem" }}>
          <p style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:"1rem", color:"rgba(255,255,255,.85)", marginBottom:".5rem" }}>Désolé 😕</p>
          <p style={{ color:"rgba(255,255,255,.4)", fontSize:".875rem", marginBottom:"1.25rem" }}>Dis-nous ce que tu changerais — ton retour nous aide vraiment.</p>
          <StarsInput value={rating} onChange={setRating} />
          <textarea value={comment} onChange={e=>setComment(e.target.value)} placeholder="Ce que j'améliorerais…" maxLength={600}
            style={{ marginTop:"1rem", width:"100%", background:"rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.1)", borderRadius:12, padding:".75rem 1rem", color:"rgba(255,255,255,.8)", fontSize:".875rem", fontFamily:"'DM Sans',sans-serif", resize:"vertical", minHeight:100, outline:"none" }} />
          <p style={{ fontSize:".7rem", color:"rgba(255,255,255,.2)", marginTop:3 }}>{comment.length}/600</p>
          <button onClick={submitNegative} disabled={sending}
            style={{ marginTop:".875rem", width:"100%", background:"#7c3aed", color:"#fff", border:"none", borderRadius:12, padding:".8rem", fontWeight:700, fontSize:".875rem", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", opacity:sending?.5:1 }}>
            {sending ? "Envoi…" : "Envoyer mon avis"}
          </button>
          <button onClick={() => setStep("rate")} style={{ display:"block", width:"100%", marginTop:".5rem", background:"none", border:"none", color:"rgba(255,255,255,.3)", fontSize:".8rem", cursor:"pointer" }}>← Retour</button>
        </div>
      )}

      {step === "done" && (
        <div style={{ background:"rgba(255,255,255,.03)", border:"1px solid rgba(255,255,255,.07)", borderRadius:18, padding:"2rem", textAlign:"center" }}>
          <div style={{ fontSize:"2.5rem", marginBottom:".75rem" }}>✅</div>
          <p style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:"1.1rem", color:"rgba(255,255,255,.9)", marginBottom:".5rem" }}>Merci pour ton retour !</p>
          <p style={{ color:"rgba(255,255,255,.4)", fontSize:".875rem" }}>Ton avis a bien été enregistré.</p>
        </div>
      )}
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────────
const VALID_TABS: NavSection[] = ["profil","annonces","messages","badges","quetes","credits","parametres","avis"];

export default function ProfilPage() {
  const supabase = createClient();
  const [active, setActive]     = useState<NavSection>("profil");
  const [user, setUser]         = useState<UserProfile | null>(null);
  const [annonces, setAnnonces] = useState<Annonce[]>([]);
  const [hasReview, setHasReview] = useState(false);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab") as NavSection | null;
    if (tab && VALID_TABS.includes(tab)) setActive(tab);
  }, []);

  const fetchData = useCallback(async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) { window.location.href = "/login"; return; }
    const [{ data: profile }, { data: userAnnonces }, { data: reviewData }] = await Promise.all([
      supabase.from("users").select("*").eq("id", authUser.id).single(),
      supabase.from("announcements").select("id, code, description, bumps_today, created_at, companies(name, category)").eq("user_id", authUser.id).order("created_at", { ascending: false }),
      supabase.from("platform_reviews").select("id").eq("user_id", authUser.id).maybeSingle(),
    ]);
    if (profile) setUser(profile);
    if (userAnnonces) setAnnonces(userAnnonces as any);
    setHasReview(!!reviewData);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handlePseudoSave = async (pseudo: string): Promise<string|null> => {
    if (!user) return null;
    const { error } = await supabase.from("users").update({ pseudo }).eq("id", user.id);
    if (error) {
      if (error.code === "23505") return "Ce pseudo est déjà utilisé.";
      return "Erreur lors de la sauvegarde.";
    }
    setUser(prev => prev ? { ...prev, pseudo } : null);
    return null;
  };

  const handleAvatarUpload = (avatar_url: string) => {
    setUser(prev => prev ? { ...prev, avatar_url } : null);
  };

  const handleBioSave = async (bio: string) => {
    if (!user) return;
    await supabase.from("users").update({ bio }).eq("id", user.id);
    setUser(prev => prev ? { ...prev, bio } : null);
  };

  const handleDeleteAnnonce = async (id: string) => {
    await supabase.from("announcements").delete().eq("id", id);
    setAnnonces(prev => prev.filter(a => a.id !== id));
  };

  const handleEditAnnonce = async (id: string, code: string, description: string) => {
    // On ne met à jour QUE code et description — jamais created_at ni d'autres champs
    // afin d'éviter tout remontée artificielle dans le classement
    const { error } = await supabase
      .from("announcements")
      .update({ code, description: description || null })
      .eq("id", id);
    if (!error) {
      setAnnonces(prev => prev.map(a => a.id === id ? { ...a, code, description: description || null } : a));
    }
  };

  const renderSection = () => {
    if (loading || !user) return <Skeleton />;
    switch (active) {
      case "profil":     return <SectionProfil user={user} annonces={annonces} onPseudoSave={handlePseudoSave} onAvatarUpload={handleAvatarUpload} />;
      case "annonces":   return <SectionAnnonces annonces={annonces} onDelete={handleDeleteAnnonce} onEdit={handleEditAnnonce} />;
      case "messages":   return <SectionMessages />;
      case "badges":     return <SectionBadges xp={user.xp} annoncesCount={annonces.length} />;
      case "quetes":     return <SectionQuetes user={user} annonces={annonces} hasReview={hasReview} />;
      case "credits":    return <SectionCredits />;
      case "parametres": return <SectionParametres user={user} onPseudoSave={handlePseudoSave} onAvatarUpload={handleAvatarUpload} onBioSave={handleBioSave} />;
      case "avis":       return <SectionAvis userId={user.id} />;
    }
  };

  return (
    <>
      <style>{`
        @keyframes spin    { to{transform:rotate(360deg)} }
        @keyframes shimmer { 0%,100%{opacity:.5} 50%{opacity:1} }
        @keyframes float   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        body{background:#0A0A0F;color:#e2e8f0;font-family:'DM Sans',sans-serif;min-height:100vh}
        .layout{display:flex;max-width:1100px;margin:0 auto;padding:2rem 1.5rem;gap:1.75rem}
        .main{flex:1;min-width:0}
        .sc{display:flex;flex-direction:column;gap:1.25rem}
        .sh{display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:1rem}
        .st{font-family:'Syne',sans-serif;font-weight:800;font-size:1.45rem;color:#fff;letter-spacing:-.03em}
        .ss{color:rgba(255,255,255,.35);font-size:.84rem;margin-top:2px}
        .action-card{position:relative;overflow:hidden;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.07);border-radius:18px;padding:1.25rem;display:flex;flex-direction:column;gap:.6rem;transition:border-color .2s,transform .2s}
        .action-card:hover{border-color:rgba(124,58,237,.25);transform:translateY(-2px)}
        .action-card-boost{background:rgba(124,58,237,.05);border-color:rgba(124,58,237,.25)}
        .action-card-top{display:flex;align-items:center;gap:9px}
        .action-icon-wrap{width:32px;height:32px;border-radius:9px;display:flex;align-items:center;justify-content:center;flex-shrink:0;color:rgba(255,255,255,.7)}
        .action-label{font-size:.78rem;font-weight:600;color:rgba(255,255,255,.5)}
        .action-value{font-family:'Syne',sans-serif;font-weight:800;font-size:2rem;color:#fff;line-height:1}
        .action-sub{font-size:.75rem;color:rgba(255,255,255,.3)}
        .action-btn{display:inline-flex;align-items:center;gap:5px;margin-top:auto;padding:.45rem .875rem;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:9px;color:rgba(255,255,255,.55);font-size:.76rem;font-weight:600;cursor:pointer;transition:all .2s;text-decoration:none;font-family:'DM Sans',sans-serif;justify-content:center}
        .action-btn:hover{color:#fff;border-color:rgba(255,255,255,.22)}
        .action-btn-boost{background:rgba(124,58,237,.18);border-color:rgba(124,58,237,.4);color:#c4b5fd}
        .row-card{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:.75rem;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.07);border-radius:14px;padding:1rem 1.25rem;transition:border-color .2s}
        .row-card:hover{border-color:rgba(124,58,237,.2)}
        .row-card.done{opacity:.55}
        .cat-tag{padding:.2rem .6rem;background:rgba(124,58,237,.12);border:1px solid rgba(124,58,237,.25);border-radius:100px;font-size:.72rem;color:#a78bfa;font-weight:600}
        .form-g{display:flex;flex-direction:column;gap:6px}
        .form-l{font-size:.78rem;font-weight:600;color:rgba(255,255,255,.45);letter-spacing:.04em}
        .form-i{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:.75rem 1rem;color:#fff;font-size:.9rem;font-family:'DM Sans',sans-serif;outline:none;transition:all .2s;width:100%}
        .form-i:focus{border-color:rgba(124,58,237,.4);background:rgba(124,58,237,.05);box-shadow:0 0 0 3px rgba(124,58,237,.1)}
        .form-i.disabled{opacity:.4;cursor:not-allowed}
        .form-ta{resize:vertical;min-height:90px}
        .form-h{font-size:.7rem;color:rgba(255,255,255,.22)}
        .btn-p{display:inline-flex;align-items:center;gap:6px;background:#7c3aed;color:#fff;border:none;border-radius:10px;padding:.5rem 1rem;font-size:.82rem;font-weight:600;cursor:pointer;transition:all .2s;text-decoration:none;font-family:'DM Sans',sans-serif}
        .btn-p:hover{background:#6d28d9;transform:translateY(-1px)}
        .btn-p.btn-saved{background:#16a34a}
        .btn-o{display:inline-flex;align-items:center;gap:6px;background:transparent;color:rgba(255,255,255,.7);border:1px solid rgba(255,255,255,.12);border-radius:10px;padding:.5rem 1rem;font-size:.82rem;font-weight:600;cursor:pointer;transition:all .2s;text-decoration:none;font-family:'DM Sans',sans-serif}
        .btn-ghost-sm{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);color:rgba(255,255,255,.5);border-radius:8px;padding:.3rem .625rem;font-size:.75rem;font-weight:500;cursor:pointer;transition:all .2s;font-family:'DM Sans',sans-serif}
        .btn-ghost-sm:hover{color:#fff;border-color:rgba(255,255,255,.18)}
        .btn-ghost-sm.danger:hover{color:#f87171;border-color:rgba(248,113,113,.3)}
        .btn-danger{background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.25);color:#f87171;border-radius:10px;padding:.5rem 1rem;font-size:.82rem;font-weight:600;cursor:pointer;font-family:'DM Sans',sans-serif}
        @media(max-width:768px){.layout{flex-direction:column;padding:1rem}.main{width:100%}}
      `}</style>

      <Navbar activePage="profil" />

      <div className="layout">
        <Sidebar active={active} setActive={setActive} user={user} />
        <main className="main">{renderSection()}</main>
      </div>
    </>
  );
}