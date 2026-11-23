"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Navbar from "@/components/Navbar";
import { createClient } from "@/lib/supabase";
import type { ReactNode } from "react";
import { Bolt, Chat, Check, Crown, Cross, Flame, Gift, Handshake, Lock, Medal, Pencil, Sleep, Stamp, Star, ThumbDown, ThumbUp, Ticket, Trophy, TrendUp, Warning, Clock } from "@/components/Pictos";
import ShareCode from "@/components/ShareCode";
import Messagerie from "./Messagerie";
import AnimalAvatar from "@/components/AnimalAvatar";

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
  companies: { name: string; category: string; url_slug?: string | null; referral_bonus_description?: string | null } | null;
}

type CopyStats = { last7d: number; total: number; byAnnouncement: Record<string, { last7d: number; total: number }> };

interface Badge { id: string; label: string; icon: ReactNode; unlocked: boolean; desc: string; }

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
    <div style={{ height:mini?4:6, background:"rgba(250,248,243,.07)", borderRadius:100, overflow:"hidden" }}>
      <div style={{ height:"100%", width:`${w}%`, background:"var(--accent)", borderRadius:100, transition:"width 1.1s cubic-bezier(.4,0,.2,1)" }} />
    </div>
  );
}

// ── Avatar ─────────────────────────────────────────────────────────────────────
function AvatarUpload({ letter, avatarUrl, size=72, onUpload }: { letter:string; avatarUrl:string|null; size?:number; onUpload:(url:string)=>void }) {
  const [preview, setPreview] = useState<string|null>(avatarUrl);
  const [hover, setHover] = useState(false);
  const [uploading, setUploading] = useState(false);
  // Crop modal state
  const [cropSrc, setCropSrc] = useState<string|null>(null);
  const [cropScale, setCropScale] = useState(1);
  const [cropOffset, setCropOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement|null>(null);
  const ref = useRef<HTMLInputElement>(null);
  const supabase = createClient();
  useEffect(() => { setPreview(avatarUrl); }, [avatarUrl]);

  const CROP_SIZE = 280;

  // Draw cropped preview on canvas
  const drawCanvas = useCallback((img: HTMLImageElement, scale: number, offset: { x: number; y: number }) => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    canvas.width = CROP_SIZE; canvas.height = CROP_SIZE;
    ctx.clearRect(0, 0, CROP_SIZE, CROP_SIZE);
    // Clip to circle
    ctx.save();
    ctx.beginPath();
    ctx.arc(CROP_SIZE / 2, CROP_SIZE / 2, CROP_SIZE / 2, 0, Math.PI * 2);
    ctx.clip();
    const w = img.naturalWidth * scale;
    const h = img.naturalHeight * scale;
    const x = (CROP_SIZE - w) / 2 + offset.x;
    const y = (CROP_SIZE - h) / 2 + offset.y;
    ctx.drawImage(img, x, y, w, h);
    ctx.restore();
    // Overlay ring
    ctx.beginPath();
    ctx.arc(CROP_SIZE / 2, CROP_SIZE / 2, CROP_SIZE / 2 - 1, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(255,212,59,0.7)";
    ctx.lineWidth = 3;
    ctx.stroke();
  }, []);

  useEffect(() => {
    if (cropSrc && imgRef.current) drawCanvas(imgRef.current, cropScale, cropOffset);
  }, [cropSrc, cropScale, cropOffset, drawCanvas]);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    const url = URL.createObjectURL(f);
    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      const initScale = Math.max(CROP_SIZE / img.naturalWidth, CROP_SIZE / img.naturalHeight);
      setCropScale(initScale);
      setCropOffset({ x: 0, y: 0 });
      setCropSrc(url);
    };
    img.src = url;
    // Reset input so same file can be re-selected
    e.target.value = "";
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setDragging(true);
    setDragStart({ x: e.clientX - cropOffset.x, y: e.clientY - cropOffset.y });
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging) return;
    setCropOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };
  const handleMouseUp = () => setDragging(false);

  const confirmCrop = async () => {
    const canvas = canvasRef.current; if (!canvas) return;
    setUploading(true);
    setCropSrc(null);
    canvas.toBlob(async (blob) => {
      if (!blob) { setUploading(false); return; }
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setUploading(false); return; }
      const path = `${user.id}/avatar`;
      const { error } = await supabase.storage.from("avatars").upload(path, blob, { upsert: true, contentType: blob.type || "image/png" });
      if (error) { console.error("Avatar upload error:", error); setUploading(false); return; }
      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      const urlWithBust = `${data.publicUrl}?t=${Date.now()}`;
      await supabase.from("users").update({ avatar_url: data.publicUrl }).eq("id", user.id);
      setPreview(urlWithBust);
      onUpload(data.publicUrl);
      setUploading(false);
    }, "image/webp", 0.86); // WebP : 10 à 20 fois plus léger que le PNG (Safari retombe sur du PNG)
  };

  return (
    <>
      {/* ── Crop Modal ── */}
      {cropSrc && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.82)", zIndex:9999, display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:16 }}>
          <p style={{ fontFamily:"var(--font-display)", fontWeight:700, fontSize:"1rem", color:"var(--text-strong)", marginBottom:4 }}>Recadrer la photo</p>
          <p style={{ fontSize:".78rem", color:"var(--text-dim)", marginBottom:8 }}>Glisse pour repositionner · Molette pour zoomer</p>
          <div
            style={{ width:CROP_SIZE, height:CROP_SIZE, borderRadius:"50%", overflow:"hidden", cursor:dragging?"grabbing":"grab", userSelect:"none", border:"3px solid rgba(255,212,59,.6)" }}
            onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}
            onWheel={e => { e.preventDefault(); const delta = e.deltaY > 0 ? -0.05 : 0.05; const img = imgRef.current; if (!img) return; const minScale = Math.max(CROP_SIZE / img.naturalWidth, CROP_SIZE / img.naturalHeight); setCropScale(s => Math.max(minScale, Math.min(s + delta, 4))); }}
          >
            <canvas ref={canvasRef} width={CROP_SIZE} height={CROP_SIZE} style={{ display:"block" }} />
          </div>
          <div style={{ display:"flex", gap:12, marginTop:8 }}>
            <input type="range" min={Math.max(CROP_SIZE / (imgRef.current?.naturalWidth ?? 1), CROP_SIZE / (imgRef.current?.naturalHeight ?? 1))} max={4} step={0.01} value={cropScale} onChange={e => setCropScale(+e.target.value)} style={{ width:200, accentColor:"var(--accent)" }} />
          </div>
          <div style={{ display:"flex", gap:10 }}>
            <button onClick={confirmCrop} style={{ background:"var(--accent)", color:"var(--accent-ink)", border:"none", borderRadius:12, padding:".65rem 1.5rem", fontWeight:700, fontSize:".9rem", cursor:"pointer", fontFamily:"var(--font-text)" }}>Valider</button>
            <button onClick={() => setCropSrc(null)} style={{ background:"rgba(250,248,243,.08)", color:"var(--text-dim)", border:"1px solid rgba(250,248,243,.12)", borderRadius:12, padding:".65rem 1.25rem", fontWeight:600, fontSize:".9rem", cursor:"pointer", fontFamily:"var(--font-text)" }}>Annuler</button>
          </div>
        </div>
      )}

      <div style={{ position:"relative", width:size, height:size, flexShrink:0 }}>
        <div style={{ position:"relative", zIndex:1, width:size, height:size, borderRadius:"50%", border:"1px solid var(--border-md)", overflow:"hidden", cursor:"pointer", background:"var(--accent)", display:"flex", alignItems:"center", justifyContent:"center" }}
          onMouseEnter={()=>setHover(true)} onMouseLeave={()=>setHover(false)} onClick={()=>ref.current?.click()}>
          {preview ? <img src={preview} alt="avatar" style={{ width:"100%", height:"100%", objectFit:"cover" }} /> : <AnimalAvatar seed={letter} />}
          <div style={{ position:"absolute", inset:0, background:"rgba(0,0,0,.55)", display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:3, opacity:(hover||uploading)?1:0, transition:"opacity .2s" }}>
            {uploading ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" style={{ animation:"spin 1s linear infinite" }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
              : <><span style={{ color:"var(--text-strong)" }}><I.cam /></span><span style={{ color:"var(--text)", fontSize:"0.58rem", fontWeight:600 }}>Modifier</span></>}
          </div>
        </div>
        <input ref={ref} type="file" accept="image/*" style={{ display:"none" }} onChange={handleFile} />
      </div>
    </>
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
          style={{ background:"rgba(255,212,59,.15)", border:`1px solid ${err?"rgba(239,68,68,.5)":"rgba(255,212,59,.45)"}`, borderRadius:8, padding:"4px 10px", color:"var(--text-strong)", fontFamily:"var(--font-display)", fontWeight:800, fontSize:fs, outline:"none", width:160 }} />
        <button onClick={confirm} disabled={saving} style={{ background:"rgba(34,197,94,.15)", border:"1px solid rgba(34,197,94,.3)", borderRadius:7, padding:"5px 8px", color:"#4ade80", cursor:"pointer", display:"flex" }}>
          {saving ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation:"spin 1s linear infinite" }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg> : <I.check />}
        </button>
        <button onClick={cancel} style={{ background:"rgba(250,248,243,.05)", border:"1px solid rgba(250,248,243,.1)", borderRadius:7, padding:"5px 8px", color:"var(--text-dim)", cursor:"pointer", fontSize:"0.8rem", display:"inline-flex" }}><Cross size={13} /></button>
      </div>
      {err && <p style={{ fontSize:".75rem", color:"#f87171", marginTop:4 }}>{err}</p>}
    </div>
  );
  return (
    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
      <h2 style={{ fontFamily:"var(--font-display)", fontWeight:800, fontSize:fs, color:"var(--text-strong)", letterSpacing:"-.03em" }}>{value}</h2>
      <button onClick={()=>setEditing(true)} aria-label="Modifier le pseudo" className="pf-edit" style={{ alignItems:"center", justifyContent:"center", background:"rgba(250,248,243,.05)", border:"1px solid rgba(250,248,243,.1)", borderRadius:7, padding:0, color:"var(--text-faint)", cursor:"pointer", display:"flex" }}><I.edit /></button>
    </div>
  );
}

// ── Menu du profil ─────────────────────────────────────────────────────────────
function SidebarId({ user }: { user: UserProfile | null }) {
  if (!user) return <div className="pf-id pf-id-skel" aria-hidden="true" />;
  const { xpNext, xpNextLabel } = getXpInfo(user.xp);
  return (
    <div className="pf-id">
      <div className="pf-id-top">
        <span className="pf-id-av">
          {/* eslint-disable-next-line @next/next/no-img-element -- vignette 40 px déjà en WebP */}
          {user.avatar_url ? <img src={user.avatar_url} alt="" width={40} height={40} /> : <AnimalAvatar seed={user.pseudo} />}
        </span>
        <div className="pf-id-txt">
          <p className="pf-id-name">{user.pseudo}</p>
          <p className="pf-id-lvl">{user.level} · {user.xp} XP</p>
        </div>
      </div>
      <XPBar xp={user.xp} xpNext={xpNext} mini />
      {xpNextLabel && <p className="pf-id-next">Encore {Math.max(xpNext - user.xp, 0)} XP avant {xpNextLabel}</p>}
    </div>
  );
}

const NAV_GROUPS: { key: NavSection; label: string; icon: ReactNode }[][] = [
  [
    { key: "profil",   label: "Mon profil",   icon: <I.user /> },
    { key: "annonces", label: "Mes annonces", icon: <I.list /> },
    { key: "messages", label: "Messages",     icon: <I.msg /> },
  ],
  [
    { key: "badges", label: "Badges", icon: <I.badge /> },
    { key: "quetes", label: "Quêtes", icon: <I.target /> },
    { key: "avis",   label: "Avis",   icon: <I.star /> },
  ],
  [
    { key: "credits",    label: "Crédits et boosts", icon: <I.bolt /> },
    { key: "parametres", label: "Paramètres",        icon: <I.gear /> },
  ],
];

function Sidebar({ active, setActive, user, unread }: { active:NavSection; setActive:(s:NavSection)=>void; user:UserProfile|null; unread:number }) {
  // Mobile : le menu devient une bande d'onglets qui défile ; on garde
  // l'onglet actif visible (arrivée par ?tab=messages, par exemple).
  useEffect(() => {
    if (!window.matchMedia("(max-width: 768px)").matches) return;
    document.querySelector(".pf-item.on")?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [active]);
  return (
    <aside className="profil-sidebar">
      <SidebarId user={user} />
      <nav className="pf-nav" aria-label="Sections du profil">
        {NAV_GROUPS.map((group, gi) => (
          <div className="pf-group" key={gi}>
            {group.map(item => {
              const on = active === item.key;
              return (
                <button key={item.key} type="button" className={`pf-item${on ? " on" : ""}`}
                  aria-current={on ? "page" : undefined} onClick={() => setActive(item.key)}>
                  <span className="pf-item-ico">{item.icon}</span>
                  <span className="pf-item-label">{item.label}</span>
                  {item.key === "messages" && unread > 0 && <span className="pf-badge" aria-label={`${unread} non lus`}>{unread}</span>}
                </button>
              );
            })}
          </div>
        ))}
      </nav>
      <a href="/publier" className="pf-publish"><I.plus />Publier un code</a>
    </aside>
  );
}

// ── Section Profil ─────────────────────────────────────────────────────────────
function SectionProfil({ user, annonces, copyStats, onPseudoSave, onAvatarUpload }: { user:UserProfile; annonces:Annonce[]; copyStats:CopyStats|null; onPseudoSave:(v:string)=>Promise<string|null>; onAvatarUpload:(url:string)=>void }) {
  const { xpNext, xpNextLabel } = getXpInfo(user.xp);
  const stats = [
    {
      label: "Codes publiés", value: annonces.length,
      sub: annonces.length === 0 ? "Aucun pour l'instant" : `${annonces.length} en ligne`,
      href: "/publier", cta: "Publier un code",
    },
    {
      label: "Copies cette semaine", value: copyStats ? copyStats.last7d : "…",
      sub: copyStats ? `${copyStats.total} au total` : "Chargement…",
      href: "/profil?tab=annonces", cta: "Détail par code",
    },
    {
      label: "Série en cours", value: user.streak_days,
      sub: user.streak_days > 1 ? "jours consécutifs" : "jour",
      href: "/classement", cta: "Voir le classement",
    },
  ];
  return (
    <div className="sc">
      <div className="pf-head">
        <AvatarUpload letter={user.pseudo} avatarUrl={user.avatar_url} size={72} onUpload={onAvatarUpload} />
        <div className="pf-head-txt">
          <EditablePseudo value={user.pseudo} onSave={onPseudoSave} />
          <p className="pf-head-meta">{user.level} · membre depuis {formatDate(user.created_at)}</p>
          <div className="pf-xp">
            <div className="pf-xp-row">
              <span className="pf-xp-val">{user.xp} XP</span>
              {xpNextLabel && <span>encore {Math.max(xpNext - user.xp, 0)} XP avant {xpNextLabel}</span>}
            </div>
            <XPBar xp={user.xp} xpNext={xpNext} />
          </div>
        </div>
      </div>

      <dl className="pf-stats">
        {stats.map(s => (
          <div key={s.label} className="pf-stat">
            <dt>{s.label}</dt>
            <dd className="pf-stat-v">{s.value}</dd>
            <dd className="pf-stat-sub">{s.sub}</dd>
            <dd className="pf-stat-cta"><a href={s.href} className="pf-stat-link">{s.cta} <I.arrow /></a></dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

// ── Section Annonces ───────────────────────────────────────────────────────────
function SectionAnnonces({ annonces, copyStats, onDelete, onEdit }: {
  annonces: Annonce[];
  copyStats: CopyStats | null;
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
        <div style={{ textAlign:"center", padding:"3rem", color:"var(--text-faint)", fontSize:"0.875rem" }}>
          <div style={{ marginBottom:"0.75rem", color:"var(--text-dim)" }}><Ticket size={40} /></div>
          <p>Aucune annonce — <a href="/publier" style={{ color:"var(--accent-text)", textDecoration:"none" }}>publie ton premier code !</a></p>
        </div>
      )}
      {annonces.map(a => {
        const gainMatch = (a.description ?? "").match(/^__gain__(.+?)(\n|$)/);
        const gainLabel = gainMatch ? gainMatch[1].trim() : null;
        return (
        <div key={a.id} className="row-card" style={{ flexDirection:"column", alignItems:"stretch", gap:"0.875rem" }}>
          {/* Ligne principale */}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:8 }}>
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              <div style={{ width:8, height:8, borderRadius:"50%", background:"#22c55e", flexShrink:0 }} />
              <div>
                <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
                  <p style={{ fontWeight:700, color:"var(--text-strong)", fontSize:"0.9rem" }}>{a.companies?.name ?? "Inconnu"}</p>
                  {gainLabel && (
                    <span style={{ fontSize:"0.72rem", fontWeight:700, color:"#4ade80", background:"rgba(34,197,94,.12)", border:"1px solid rgba(34,197,94,.3)", borderRadius:7, padding:"2px 9px", whiteSpace:"nowrap" }}>
                      {gainLabel}
                    </span>
                  )}
                </div>
                <code style={{ fontFamily:"monospace", fontSize:"0.8rem", color:"var(--text-dim)", letterSpacing:"0.06em" }}>{a.code}</code>
              </div>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
              {a.companies?.category && <span className="cat-tag">{a.companies.category}</span>}
              <span style={{ fontSize:"0.78rem", color:"var(--text-faint)" }}>{a.bumps_today}/5 remontées aujourd&apos;hui</span>
              <a href="/boost" className="btn-ghost-sm"><Bolt size={14} /> Booster</a>
              {editingId !== a.id && (
                <button className="btn-ghost-sm" onClick={() => startEdit(a)}><Pencil size={14} /> Modifier</button>
              )}
              <button className="btn-ghost-sm danger" onClick={() => onDelete(a.id)}>Supprimer</button>
            </div>
          </div>

          {/* Bilan des copies et partage */}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:10 }}>
            <span style={{ fontSize:".88rem", color:"var(--text-muted)" }}>
              {(() => {
                if (!copyStats) return "…";
                const s = copyStats.byAnnouncement[a.id];
                if (!s || s.total === 0) return "Pas encore copié";
                return <>Copié <strong style={{ color:"var(--text-strong)" }}>{s.last7d}</strong> fois cette semaine, {s.total} au total</>;
              })()}
            </span>
            <ShareCode announcementId={a.id} brand={a.companies?.name ?? ""} code={a.code} urlSlug={a.companies?.url_slug} bonus={gainLabel ?? a.companies?.referral_bonus_description} />
          </div>

          {/* Formulaire de modification inline */}
          {editingId === a.id && (
            <div style={{ background:"rgba(255,212,59,.07)", border:"1px solid rgba(255,212,59,.2)", borderRadius:12, padding:"1rem", display:"flex", flexDirection:"column", gap:"0.75rem" }}>
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
                <label className="form-l">DESCRIPTION <span style={{ color:"var(--text-faint)", fontWeight:400 }}>optionnel</span></label>
                <textarea
                  className="form-i form-ta"
                  value={editDesc}
                  onChange={e => setEditDesc(e.target.value)}
                  maxLength={280}
                  placeholder="Décris ce que le filleul peut gagner..."
                  style={{ resize:"vertical", minHeight:72 }}
                />
                <p style={{ fontSize:".7rem", color:"var(--text-faint)" }}>{editDesc.length}/280</p>
              </div>
              <div style={{ display:"flex", gap:8 }}>
                <button
                  onClick={saveEdit}
                  disabled={saving || !editCode.trim()}
                  style={{ background:"var(--accent)", color:"var(--accent-ink)", fontWeight:700, fontSize:".82rem", padding:".5rem 1.25rem", borderRadius:10, border:"none", cursor:"pointer", opacity:saving||!editCode.trim()?0.6:1 }}
                >
                  {saving ? "Enregistrement…" : "Sauvegarder"}
                </button>
                <button
                  onClick={cancelEdit}
                  style={{ background:"rgba(250,248,243,.05)", color:"var(--text-dim)", fontWeight:600, fontSize:".82rem", padding:".5rem 1rem", borderRadius:10, border:"1px solid rgba(250,248,243,.1)", cursor:"pointer" }}
                >
                  Annuler
                </button>
              </div>
            </div>
          )}
        </div>
        );
      })}
    </div>
  );
}

// ── Section Badges ─────────────────────────────────────────────────────────────
function SectionBadges({ xp, annoncesCount, isTop3 }: { xp:number; annoncesCount:number; isTop3:boolean }) {
  const badges: Badge[] = [
    { id:"0", label:"Parrain du mois", icon:<Crown size={30} />, unlocked:isTop3, desc:"Top 3 des parrains avec le plus d'XP" },
    { id:"1", label:"Première annonce", icon:<Ticket size={30} />, unlocked:annoncesCount > 0, desc:"Tu as publié ton premier code" },
    { id:"2", label:"Parrain Bronze",   icon:<Medal rank={3} size={30} />, unlocked:xp>=100,  desc:"Atteins 100 XP" },
    { id:"3", label:"7 jours d'affilée", icon:<Flame size={30} />, unlocked:false,    desc:"Connecte-toi 7 jours de suite" },
    { id:"4", label:"Premier boost",    icon:<Bolt size={30} />, unlocked:false,    desc:"Booste une annonce" },
    { id:"5", label:"Parrain Argent",   icon:<Medal rank={2} size={30} />, unlocked:xp>=500,  desc:"Atteins 500 XP" },
    { id:"6", label:"Légende",          icon:<Trophy size={30} />, unlocked:xp>=2000, desc:"Atteins 2000 XP" },
  ];
  return (
    <div className="sc">
      <div className="sh"><div><h2 className="st">Badges</h2><p className="ss">{badges.filter(b=>b.unlocked).length}/{badges.length} débloqués</p></div></div>
      <div className="g3">
        {badges.map(b => (
          <div key={b.id} style={{ position:"relative", background:b.unlocked?"rgba(255,212,59,.07)":"rgba(250,248,243,.03)", border:`1px solid ${b.unlocked?"rgba(255,212,59,.3)":"rgba(250,248,243,.07)"}`, borderRadius:16, padding:"1.4rem 1rem", textAlign:"center", opacity:b.unlocked?1:.42 }}>
            {!b.unlocked && <div style={{ position:"absolute", top:10, right:10, color:"var(--text-dim)" }}><Lock size={15} /></div>}
            <div style={{ marginBottom:"0.5rem", color: b.unlocked ? "var(--accent-text)" : "var(--text-dim)" }}>{b.icon}</div>
            <p style={{ fontWeight:700, fontSize:"0.85rem", color:"var(--text-strong)", marginBottom:3 }}>{b.label}</p>
            <p style={{ fontSize:"0.72rem", color:"var(--text-faint)" }}>{b.desc}</p>
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
    { label:"Se connecter 7 jours de suite", xp:25, done:user.streak_days>=7, progress:Math.max(user.streak_days, 1), total:7 },
    { label:"Atteindre 100 XP",              xp:20, done:user.xp>=100,        progress:user.xp, total:100 },
    { label:"Publier 5 annonces",            xp:30, done:annonces.length>=5,  progress:annonces.length, total:5, link:"/publier" },
    { label:"Laisser un avis sur la plateforme", xp:15, done:hasReview, progress:hasReview?1:0, total:1, link:"/avis" },
  ];
  return (
    <div className="sc">
      <div className="sh"><div><h2 className="st">Quêtes</h2><p className="ss">Complète des quêtes pour gagner de l&apos;XP</p></div></div>
      {quetes.map((q,i) => (
        <div key={i} className={`row-card ${q.done?"done":""}`} style={{ display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ width:22, height:22, borderRadius:"50%", border:`1.5px solid ${q.done?"rgba(34,197,94,.4)":"rgba(250,248,243,.15)"}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"0.7rem", color:"#4ade80", flexShrink:0, background:q.done?"rgba(34,197,94,.1)":"none" }}>{q.done ? <Check size={13} /> : null}</div>
          <div style={{ flex:1 }}>
            <p style={{ fontSize:"0.875rem", color:"var(--text)", marginBottom:q.done?0:5 }}>{q.label}</p>
            {!q.done && (
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <div style={{ flex:1, height:4, background:"rgba(250,248,243,.07)", borderRadius:100, overflow:"hidden" }}><div style={{ height:"100%", width:`${Math.min((q.progress/q.total)*100,100)}%`, background:"var(--accent)", borderRadius:100 }} /></div>
                <span style={{ fontSize:"0.7rem", color:"var(--text-faint)", whiteSpace:"nowrap" }}>{Math.min(q.progress,q.total)}/{q.total}</span>
              </div>
            )}
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:8, flexShrink:0 }}>
            {!q.done && q.link && (
              <a href={q.link} style={{ fontSize:"0.75rem", fontWeight:600, color:"var(--accent-text)", background:"rgba(255,212,59,.15)", border:"1px solid rgba(255,212,59,.3)", borderRadius:8, padding:"3px 10px", textDecoration:"none", whiteSpace:"nowrap", transition:"all .2s" }}>
                Faire
              </a>
            )}
            <span style={{ fontSize:"0.82rem", fontWeight:700, color:q.done?"#4ade80":"var(--text-faint)", whiteSpace:"nowrap", fontFamily:"var(--font-display)" }}>+{q.xp} XP</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Section Crédits ────────────────────────────────────────────────────────────
function SectionCredits() {
  // Solde réel du membre (la section affichait un « 0 » écrit en dur).
  const [balance, setBalance] = useState<number | null>(null);
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      const { data } = await supabase.from("credits").select("balance").eq("user_id", user.id).maybeSingle();
      setBalance(Number(data?.balance ?? 0));
    });
  }, []);
  return (
    <div className="sc">
      <div className="sh">
        <div><h2 className="st">Crédits & Boosts</h2><p className="ss">Gère ton solde et booste tes annonces</p></div>
        <div style={{ display:"flex", gap:8 }}>
          <a href="/credits" className="btn-p">Acheter des crédits</a>
          <a href="/boost" className="btn-o">Booster une annonce</a>
        </div>
      </div>
      <div className="g2">
        <div style={{ position:"relative", overflow:"hidden", background:"rgba(255,212,59,.08)", border:"1px solid rgba(255,212,59,.25)", borderRadius:18, padding:"1.75rem" }}>
          <div style={{ position:"relative", zIndex:1 }}>
            <p style={{ fontSize:"0.78rem", color:"var(--text-dim)", marginBottom:4 }}>Solde actuel</p>
            <p style={{ fontFamily:"var(--font-display)", fontWeight:800, fontSize:"2.75rem", color:"var(--accent-text)", lineHeight:1, marginBottom:4 }}>{balance === null ? "…" : balance.toFixed(2).replace(".", ",")}</p>
            <p style={{ fontSize:"0.78rem", color:"var(--text-faint)" }}>crédits disponibles</p>
          </div>
          <div style={{ position:"absolute", right:"1.5rem", bottom:"1rem", color:"var(--accent-text)", opacity:.45 }}><Bolt size={56} /></div>
        </div>
        <div style={{ background:"rgba(250,248,243,.03)", border:"1px solid rgba(250,248,243,.07)", borderRadius:18, padding:"1.5rem", display:"flex", flexDirection:"column", gap:"0.875rem" }}>
          <p style={{ fontSize:"0.8rem", fontWeight:600, color:"var(--text-dim)" }}>Pourquoi booster ?</p>
          {[{ icon:<TrendUp size={16} />, text:<>En tête de l&apos;annuaire</> },{ icon:<Ticket size={16} />, text:<>Badge « Annonce boostée »</> },{ icon:<Bolt size={16} />, text:<>Actif tout de suite</>}].map((item,i) => (
            <div key={i} style={{ display:"flex", alignItems:"center", gap:8 }}><span>{item.icon}</span><p style={{ fontSize:"0.78rem", color:"var(--text-dim)" }}>{item.text}</p></div>
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
      <div style={{ background:"rgba(250,248,243,.03)", border:"1px solid rgba(250,248,243,.07)", borderRadius:16, padding:"1.25rem 1.5rem" }}>
        <p style={{ fontSize:"0.7rem", fontWeight:700, letterSpacing:"0.08em", color:"var(--text-faint)", marginBottom:"1rem" }}>Photo de profil & nom d&apos;affichage</p>
        <div style={{ display:"flex", alignItems:"center", gap:"1.5rem" }}>
          <AvatarUpload letter={user.pseudo} avatarUrl={user.avatar_url} size={60} onUpload={onAvatarUpload} />
          <div style={{ flex:1 }}>
            <EditablePseudo value={user.pseudo} onSave={onPseudoSave} size="sm" />
            <p style={{ fontSize:"0.7rem", color:"var(--text-faint)", marginTop:4 }}>Clique sur le crayon pour modifier ton pseudo, et sur l&apos;avatar pour changer la photo.</p>
          </div>
        </div>
      </div>
      <div className="form-g"><label className="form-l">Email</label><input className="form-i disabled" value={user.email} disabled /><p className="form-h">L&apos;email ne peut pas être modifié</p></div>
      <div className="form-g">
        <label className="form-l">Présentation</label>
        <textarea className="form-i form-ta" value={bio} onChange={e=>setBio(e.target.value)} placeholder="Parle un peu de toi..." rows={4} maxLength={300} />
        <p className="form-h">{bio.length}/300 caractères</p>
      </div>
      <button className={`btn-p${saved?" btn-saved":""}`} onClick={save}>{saved?"Sauvegardé":"Enregistrer"}</button>
      <div style={{ paddingTop:"1.5rem", borderTop:"1px solid rgba(250,248,243,.06)", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <p style={{ fontSize:"0.82rem", color:"var(--text-faint)" }}>Zone dangereuse</p>
        <button className="btn-danger">Supprimer mon compte</button>
      </div>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="pf-skel" aria-busy="true" aria-label="Chargement du profil">
      <i style={{ width: "36%", height: 24 }} />
      <i style={{ width: "54%", height: 12 }} />
      <div className="pf-skel-card" />
      <div className="pf-skel-card short" />
    </div>
  );
}

// ── Section Avis reçus ────────────────────────────────────────────────────────
const TAGS_INFO: Record<string, { label:string; emoji:ReactNode; positive:boolean }> = {
  code_ok:         { label:"Code fonctionnel",      emoji:<Check size={13} />, positive:true  },
  reponse_rapide:  { label:"Réponse rapide",         emoji:<Bolt size={13} />, positive:true  },
  bon_gain:        { label:"Bon gain",               emoji:<Gift size={13} />, positive:true  },
  sympa:           { label:"Parrain sympa",          emoji:<Handshake size={13} />, positive:true  },
  annonce_complete:{ label:"Annonce complète",       emoji:<Ticket size={13} />, positive:true  },
  code_expire:     { label:"Code expiré",            emoji:<Clock size={13} />, positive:false },
  code_invalide:   { label:"Code invalide",          emoji:<Cross size={13} />, positive:false },
  desc_inexacte:   { label:"Description inexacte",   emoji:<Warning size={13} />, positive:false },
  inactif:         { label:"Parrain inactif",        emoji:<Sleep size={13} />, positive:false },
};

interface ReceivedReview {
  id: string;
  raterPseudo: string;
  companyName: string;
  rating: number | null;
  tags: string[];
  comment: string | null;
  createdAt: string;
}

function ReviewStars({ value }: { value:number }) {
  return (
    <span style={{ display:"inline-flex", gap:2 }}>
      {[1,2,3,4,5].map(n => (
        <svg key={n} width="13" height="13" viewBox="0 0 24 24" fill={value>=n?"#f59e0b":"none"} stroke="#f59e0b" strokeWidth="1.5">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ))}
    </span>
  );
}

function SectionAvisRecus({ userId }: { userId:string }) {
  const supabase = createClient();
  const [reviews, setReviews] = useState<ReceivedReview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: rows } = await supabase
        .from("user_ratings")
        .select("id, rater_id, rating, tags, comment, created_at, announcement_id")
        .eq("ratee_id", userId)
        .order("created_at", { ascending: false });

      if (!rows || rows.length === 0) { setLoading(false); return; }

      const raterIds   = [...new Set(rows.map((r: any) => r.rater_id))];
      const annIds     = [...new Set(rows.map((r: any) => r.announcement_id))];

      const [{ data: users }, { data: anns }] = await Promise.all([
        supabase.from("users").select("id, pseudo").in("id", raterIds),
        supabase.from("announcements").select("id, companies(name)").in("id", annIds),
      ]);

      const userMap: Record<string,string> = {};
      (users ?? []).forEach((u:any) => { userMap[u.id] = u.pseudo; });
      const annMap: Record<string,string> = {};
      (anns ?? []).forEach((a:any) => { annMap[a.id] = a.companies?.name ?? ""; });

      setReviews(rows.map((r:any) => ({
        id:          r.id,
        raterPseudo: userMap[r.rater_id] ?? "Anonyme",
        companyName: annMap[r.announcement_id] ?? "",
        rating:      r.rating ?? null,
        tags:        r.tags ?? [],
        comment:     r.comment ?? null,
        createdAt:   r.created_at,
      })));
      setLoading(false);
    })();
  }, [userId]);

  const withRating   = reviews.filter(r => r.rating !== null);
  const avgRating    = withRating.length
    ? withRating.reduce((s, r) => s + (r.rating ?? 0), 0) / withRating.length
    : null;

  function timeAgo(dateStr: string) {
    const d = new Date(dateStr);
    const diff = Math.floor((Date.now() - d.getTime()) / 86400000);
    if (diff === 0) return "Aujourd'hui";
    if (diff === 1) return "Hier";
    if (diff < 30) return `Il y a ${diff} jour${diff>1?"s":""}`;
    const m = Math.floor(diff/30);
    if (m < 12) return `Il y a ${m} mois`;
    return d.toLocaleDateString("fr-FR", { day:"numeric", month:"short", year:"numeric" });
  }

  return (
    <div className="sc">
      <div className="sh">
        <div>
          <h2 className="st">Avis reçus</h2>
          <p className="ss">Ce que les utilisateurs pensent de tes parrainages</p>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign:"center", padding:"2rem", color:"var(--text-faint)", fontSize:".875rem" }}>Chargement…</div>
      ) : reviews.length === 0 ? (
        <div style={{ background:"rgba(250,248,243,.03)", border:"1px solid rgba(250,248,243,.07)", borderRadius:18, padding:"2.5rem", textAlign:"center" }}>
          <div style={{ marginBottom:".75rem", color:"var(--text-dim)" }}><Star size={36} /></div>
          <p style={{ fontFamily:"var(--font-display)", fontWeight:700, color:"var(--text-dim)", marginBottom:".5rem" }}>Pas encore d'avis</p>
          <p style={{ fontSize:".825rem", color:"var(--text-faint)" }}>Tes avis apparaîtront ici quand des utilisateurs noteront tes annonces.</p>
        </div>
      ) : (
        <>
          {/* Résumé */}
          <div style={{ display:"flex", gap:12, marginBottom:"1.25rem", flexWrap:"wrap" }}>
            <div style={{ flex:1, minWidth:120, background:"rgba(250,248,243,.03)", border:"1px solid rgba(250,248,243,.07)", borderRadius:14, padding:"1rem", textAlign:"center" }}>
              <p style={{ fontSize:"1.75rem", fontWeight:800, fontFamily:"var(--font-display)", color:"var(--text-strong)", lineHeight:1 }}>
                {avgRating !== null ? avgRating.toFixed(1) : "—"}
              </p>
              {avgRating !== null && <div style={{ display:"flex", justifyContent:"center", margin:"4px 0" }}><ReviewStars value={Math.round(avgRating)} /></div>}
              <p style={{ fontSize:".72rem", color:"var(--text-faint)", marginTop:2 }}>Note moyenne</p>
            </div>
            <div style={{ flex:1, minWidth:120, background:"rgba(250,248,243,.03)", border:"1px solid rgba(250,248,243,.07)", borderRadius:14, padding:"1rem", textAlign:"center" }}>
              <p style={{ fontSize:"1.75rem", fontWeight:800, fontFamily:"var(--font-display)", color:"var(--text-strong)", lineHeight:1 }}>{reviews.length}</p>
              <p style={{ fontSize:".72rem", color:"var(--text-faint)", marginTop:6 }}>Avis reçu{reviews.length>1?"s":""}</p>
            </div>
            <div style={{ flex:1, minWidth:120, background:"rgba(250,248,243,.03)", border:"1px solid rgba(250,248,243,.07)", borderRadius:14, padding:"1rem", textAlign:"center" }}>
              <p style={{ fontSize:"1.75rem", fontWeight:800, fontFamily:"var(--font-display)", color:"#4ade80", lineHeight:1 }}>
                {reviews.filter(r => r.tags.some(t => TAGS_INFO[t]?.positive)).length}
              </p>
              <p style={{ fontSize:".72rem", color:"var(--text-faint)", marginTop:6 }}>Positif{reviews.filter(r=>r.tags.some(t=>TAGS_INFO[t]?.positive)).length>1?"s":""}</p>
            </div>
          </div>

          {/* Liste */}
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {reviews.map(r => (
              <div key={r.id} style={{ background:"rgba(250,248,243,.03)", border:"1px solid rgba(250,248,243,.07)", borderRadius:14, padding:"1rem 1.25rem" }}>
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:".625rem" }}>
                  {/* Avatar */}
                  <AnimalAvatar seed={r.raterPseudo} size={32} />
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
                      <span style={{ fontWeight:700, fontSize:".875rem", color:"var(--text)" }}>{r.raterPseudo}</span>
                      {r.companyName && (
                        <span style={{ fontSize:".7rem", color:"var(--accent-text)", background:"rgba(255,212,59,.12)", border:"1px solid rgba(255,212,59,.25)", borderRadius:100, padding:"1px 8px" }}>
                          {r.companyName}
                        </span>
                      )}
                      {r.rating !== null && <ReviewStars value={r.rating} />}
                    </div>
                    <p style={{ fontSize:".7rem", color:"var(--text-faint)", marginTop:2 }}>{timeAgo(r.createdAt)}</p>
                  </div>
                </div>

                {r.tags.length > 0 && (
                  <div style={{ display:"flex", flexWrap:"wrap", gap:5, marginBottom: r.comment ? ".625rem" : 0 }}>
                    {r.tags.map(tag => {
                      const info = TAGS_INFO[tag];
                      if (!info) return null;
                      return (
                        <span key={tag} style={{ fontSize:".72rem", padding:"2px 9px", borderRadius:100, border:"1px solid", borderColor:info.positive?"rgba(34,197,94,.3)":"rgba(239,68,68,.3)", background:info.positive?"rgba(34,197,94,.08)":"rgba(239,68,68,.06)", color:info.positive?"#4ade80":"#f87171" }}>
                          {info.emoji} {info.label}
                        </span>
                      );
                    })}
                  </div>
                )}

                {r.comment && (
                  <p style={{ fontSize:".82rem", color:"var(--text-dim)", fontStyle:"italic", borderLeft:"2px solid rgba(250,248,243,.08)", paddingLeft:".75rem", marginTop: r.tags.length ? 0 : ".25rem" }}>
                    &ldquo;{r.comment}&rdquo;
                  </p>
                )}
              </div>
            ))}
          </div>
        </>
      )}
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
          <svg width="32" height="32" viewBox="0 0 24 24" fill={(hovered||value)>=n?"#f59e0b":"none"} stroke={(hovered||value)>=n?"#f59e0b":"rgba(250,248,243,.2)"} strokeWidth="1.5">
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

  const LABELS: Record<number,string> = { 1:"Très mauvais", 2:"Pas terrible", 3:"Correct", 4:"Bien", 5:"Excellent" };

  async function submitNegative() {
    setSending(true);
    try {
      // +15 XP au premier avis : versés par la base (trigger xp_avis_plateforme)
      await supabase.from("platform_reviews").insert({ user_id: userId, rating, comment: comment.trim()||null });
    } catch {}
    setSending(false);
    setStep("done");
  }

  if (!checked) return <div className="sc"><div style={{ textAlign:"center", padding:"3rem", color:"var(--text-faint)" }}>Chargement…</div></div>;

  return (
    <div className="sc">
      <div className="sh"><div><h2 className="st">Avis sur le site</h2><p className="ss">Ton retour nous aide à améliorer la plateforme</p></div></div>

      {step === "rate" && (
        <div style={{ background:"rgba(250,248,243,.03)", border:"1px solid rgba(250,248,243,.07)", borderRadius:18, padding:"2rem", textAlign:"center" }}>
          <p style={{ fontSize:"1rem", fontWeight:700, color:"var(--text)", marginBottom:"1.5rem", fontFamily:"var(--font-display)" }}>
            Apprécies-tu codedeparrainage.com ?
          </p>
          <StarsInput value={rating} onChange={setRating} />
          {rating > 0 && <p style={{ marginTop:".75rem", fontSize:".875rem", color:"var(--accent-text)", fontWeight:600 }}>{LABELS[rating]}</p>}
          <div style={{ display:"flex", gap:10, marginTop:"1.5rem" }}>
            <button type="button" style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:6, background:"rgba(239,68,68,.08)", border:"1px solid rgba(239,68,68,.25)", borderRadius:12, padding:".75rem", color:"#f87171", fontSize:".875rem", fontWeight:600, cursor:"pointer", fontFamily:"var(--font-text)", transition:"all .2s" }}
              onClick={() => { setRating(r => r||1); setStep("negative"); }}>
              <ThumbDown size={16} /> Non
            </button>
            <button type="button" style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:6, background:"rgba(34,197,94,.08)", border:"1px solid rgba(34,197,94,.25)", borderRadius:12, padding:".75rem", color:"#4ade80", fontSize:".875rem", fontWeight:600, cursor:"pointer", fontFamily:"var(--font-text)", transition:"all .2s" }}
              onClick={() => { setRating(r => r>=4?r:5); setStep("positive"); }}>
              <ThumbUp size={16} /> Oui
            </button>
          </div>
          {rating > 0 && (
            <button onClick={() => rating >= 4 ? setStep("positive") : setStep("negative")}
              style={{ marginTop:"1rem", width:"100%", background:"var(--accent)", color:"var(--accent-ink)", border:"none", borderRadius:12, padding:".8rem", fontWeight:700, fontSize:".875rem", cursor:"pointer", fontFamily:"var(--font-text)" }}>
              Continuer
            </button>
          )}
        </div>
      )}

      {step === "positive" && (
        <div style={{ background:"rgba(250,248,243,.03)", border:"1px solid rgba(250,248,243,.07)", borderRadius:18, padding:"2rem", textAlign:"center" }}>
          <div style={{ marginBottom:"1rem", color:"var(--accent-text)" }}><Stamp size={48} /></div>
          <p style={{ fontFamily:"var(--font-display)", fontWeight:800, fontSize:"1.1rem", color:"var(--text)", marginBottom:".5rem" }}>Super, merci !</p>
          <p style={{ color:"var(--text-dim)", fontSize:".875rem", marginBottom:"1.5rem" }}>Ça nous ferait vraiment plaisir si tu laissais un avis sur Google — ça prend 30 secondes.</p>
          <a href={GOOGLE_REVIEW_URL} target="_blank" rel="noopener noreferrer"
            style={{ display:"inline-flex", alignItems:"center", gap:8, background:"#4285F4", color:"#fff", textDecoration:"none", borderRadius:12, padding:".8rem 1.5rem", fontWeight:700, fontSize:".875rem", fontFamily:"var(--font-text)" }}
            onClick={async () => {
              try {
                await supabase.from("platform_reviews").insert({ user_id: userId, rating: rating||5, comment: null });
              } catch {}
              setTimeout(() => setStep("done"), 400);
            }}>
            Laisser un avis Google
          </a>
          <button onClick={() => setStep("done")} style={{ display:"block", width:"100%", marginTop:".75rem", background:"none", border:"1px solid rgba(250,248,243,.1)", borderRadius:12, padding:".7rem", color:"var(--text-faint)", fontSize:".875rem", cursor:"pointer", fontFamily:"var(--font-text)" }}>
            Plus tard
          </button>
        </div>
      )}

      {step === "negative" && (
        <div style={{ background:"rgba(250,248,243,.03)", border:"1px solid rgba(250,248,243,.07)", borderRadius:18, padding:"2rem" }}>
          <p style={{ fontFamily:"var(--font-display)", fontWeight:700, fontSize:"1rem", color:"var(--text)", marginBottom:".5rem" }}>Désolé</p>
          <p style={{ color:"var(--text-dim)", fontSize:".875rem", marginBottom:"1.25rem" }}>Dis-nous ce que tu changerais — ton retour nous aide vraiment.</p>
          <StarsInput value={rating} onChange={setRating} />
          <textarea value={comment} onChange={e=>setComment(e.target.value)} placeholder="Ce que j'améliorerais…" maxLength={600}
            style={{ marginTop:"1rem", width:"100%", background:"rgba(250,248,243,.04)", border:"1px solid rgba(250,248,243,.1)", borderRadius:12, padding:".75rem 1rem", color:"var(--text)", fontSize:".875rem", fontFamily:"var(--font-text)", resize:"vertical", minHeight:100, outline:"none" }} />
          <p style={{ fontSize:".7rem", color:"var(--text-faint)", marginTop:3 }}>{comment.length}/600</p>
          <button onClick={submitNegative} disabled={sending}
            style={{ marginTop:".875rem", width:"100%", background:"var(--accent)", color:"var(--accent-ink)", border:"none", borderRadius:12, padding:".8rem", fontWeight:700, fontSize:".875rem", cursor:"pointer", fontFamily:"var(--font-text)", opacity:sending?.5:1 }}>
            {sending ? "Envoi…" : "Envoyer mon avis"}
          </button>
          <button onClick={() => setStep("rate")} style={{ display:"block", width:"100%", marginTop:".5rem", background:"none", border:"none", color:"var(--text-faint)", fontSize:".8rem", cursor:"pointer" }}>← Retour</button>
        </div>
      )}

      {step === "done" && (
        <div style={{ background:"rgba(250,248,243,.03)", border:"1px solid rgba(250,248,243,.07)", borderRadius:18, padding:"2rem", textAlign:"center" }}>
          <div style={{ marginBottom:".75rem", color:"var(--ok)" }}><Stamp size={44} /></div>
          <p style={{ fontFamily:"var(--font-display)", fontWeight:800, fontSize:"1.1rem", color:"var(--text)", marginBottom:".5rem" }}>Merci pour ton retour !</p>
          <p style={{ color:"var(--text-dim)", fontSize:".875rem" }}>Ton avis a bien été enregistré.</p>
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
  // Bilan des copies (route serveur : la table est fermée aux clés publiques)
  const [copyStats, setCopyStats] = useState<CopyStats | null>(null);
  useEffect(() => {
    fetch("/api/me/copies").then((r) => (r.ok ? r.json() : null)).then((d) => { if (d) setCopyStats(d); }).catch(() => {});
  }, []);
  const [hasReview, setHasReview] = useState(false);
  const [isTop3, setIsTop3]       = useState(false);
  const [loading, setLoading]   = useState(true);
  const [unread, setUnread]     = useState(0);
  // La messagerie annonce le nombre de non-lus à chaque changement
  useEffect(() => {
    const on = (e: Event) => setUnread(Number((e as CustomEvent<number>).detail) || 0);
    window.addEventListener("cdp:unread", on);
    return () => window.removeEventListener("cdp:unread", on);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab") as NavSection | null;
    if (tab && VALID_TABS.includes(tab)) setActive(tab);
  }, []);

  const fetchData = useCallback(async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) {
      window.location.href = `/login?next=${encodeURIComponent(window.location.pathname + window.location.search)}`;
      return;
    }
    const [{ data: profile }, { data: userAnnonces }, { data: reviewData }, { data: top3 }, { count: unreadCount }] = await Promise.all([
      // email exclu : il n'est plus lisible via l'API publique (RLS colonne).
      // On le récupère depuis la session d'auth juste après (authUser.email).
      supabase.from("users").select("id, pseudo, avatar_url, bio, xp, level, streak_days, last_login, created_at, badge_parrain_mois").eq("id", authUser.id).single(),
      supabase.from("announcements").select("id, code, description, bumps_today, created_at, companies(name, category, url_slug, referral_bonus_description)").eq("user_id", authUser.id).order("created_at", { ascending: false }),
      supabase.from("platform_reviews").select("id").eq("user_id", authUser.id).maybeSingle(),
      supabase.from("users").select("id").order("xp", { ascending: false }).limit(3),
      supabase.from("messages").select("id", { count: "exact", head: true }).eq("receiver_id", authUser.id).eq("read", false),
    ]);
    setUnread(unreadCount ?? 0);
    if (profile) {
      // L'email vient de l'auth (source autorisée), pas de la table users
      setUser({ ...profile, email: authUser.email } as any);
    }
    if (userAnnonces) setAnnonces(userAnnonces as any);
    setHasReview(!!reviewData);
    setIsTop3((top3?.some(u => u.id === authUser.id) ?? false) || (profile?.badge_parrain_mois ?? false));
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const goTo = useCallback((s: NavSection) => {
    setActive(s);
    const params = new URLSearchParams(window.location.search);
    if (s === "profil") params.delete("tab"); else params.set("tab", s);
    params.delete("to"); params.delete("annonce");
    const q = params.toString();
    window.history.replaceState(null, "", `${window.location.pathname}${q ? `?${q}` : ""}`);
    window.scrollTo({ top: 0 });
  }, []);

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
    if (active === "messages") return (
      <div className="sc">
        <div className="sh"><div><h2 className="st">Messages</h2><p className="ss">Une conversation par membre et par code.</p></div></div>
        <Messagerie />
      </div>
    );
    if (loading || !user) return <Skeleton />;
    switch (active) {
      case "profil":     return <SectionProfil user={user} annonces={annonces} copyStats={copyStats} onPseudoSave={handlePseudoSave} onAvatarUpload={handleAvatarUpload} />;
      case "annonces":   return <SectionAnnonces annonces={annonces} copyStats={copyStats} onDelete={handleDeleteAnnonce} onEdit={handleEditAnnonce} />;
      case "badges":     return <SectionBadges xp={user.xp} annoncesCount={annonces.length} isTop3={isTop3} />;
      case "quetes":     return <SectionQuetes user={user} annonces={annonces} hasReview={hasReview} />;
      case "credits":    return <SectionCredits />;
      case "parametres": return <SectionParametres user={user} onPseudoSave={handlePseudoSave} onAvatarUpload={handleAvatarUpload} onBioSave={handleBioSave} />;
      case "avis":       return <><SectionAvisRecus userId={user.id} /><SectionAvis userId={user.id} /></>;
    }
  };

  return (
    <>
      <style>{`
        @keyframes spin    { to{transform:rotate(360deg)} }
        @keyframes shimmer { 0%,100%{opacity:.5} 50%{opacity:1} }
        @media (prefers-reduced-motion: reduce){ .pf-skel i{animation:none} }
        @keyframes float   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        body{background:var(--bg);color:var(--text);font-family:var(--font-text);min-height:100vh}
        .layout{display:flex;max-width:1100px;margin:0 auto;padding:2rem 1.5rem;gap:1.75rem}
        .main{flex:1;min-width:0}
        .sc{display:flex;flex-direction:column;gap:1.25rem}
        .sh{display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:1rem}
        .st{font-family:var(--font-display);font-weight:800;font-size:1.45rem;color:var(--text-strong);letter-spacing:-.03em}
        .ss{color:var(--text-faint);font-size:.84rem;margin-top:2px}
        .row-card{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:.75rem;background:rgba(250,248,243,.03);border:1px solid rgba(250,248,243,.07);border-radius:14px;padding:1rem 1.25rem;transition:border-color .2s}
        .row-card:hover{border-color:rgba(255,212,59,.2)}
        .row-card.done{opacity:.55}
        .cat-tag{padding:.2rem .6rem;background:rgba(255,212,59,.12);border:1px solid rgba(255,212,59,.25);border-radius:100px;font-size:.72rem;color:var(--accent-text);font-weight:600}
        .form-g{display:flex;flex-direction:column;gap:6px}
        .form-l{font-size:.78rem;font-weight:600;color:var(--text-dim);letter-spacing:.04em}
        .form-i{background:rgba(250,248,243,.04);border:1px solid rgba(250,248,243,.08);border-radius:12px;padding:.75rem 1rem;color:var(--text-strong);font-size:.9rem;font-family:var(--font-text);outline:none;transition:all .2s;width:100%}
        .form-i:focus{border-color:rgba(255,212,59,.4);background:rgba(255,212,59,.05);}
        .form-i.disabled{opacity:.4;cursor:not-allowed}
        .form-ta{resize:vertical;min-height:90px}
        .form-h{font-size:.7rem;color:var(--text-faint)}
        .btn-p{display:inline-flex;align-items:center;gap:6px;background:var(--accent);color:var(--accent-ink);border:none;border-radius:10px;padding:.5rem 1rem;font-size:.82rem;font-weight:600;cursor:pointer;transition:all .2s;text-decoration:none;font-family:var(--font-text)}
        .btn-p:hover{background:var(--accent-hover);transform:translateY(-1px)}
        .btn-p.btn-saved{background:#16a34a}
        .btn-o{display:inline-flex;align-items:center;gap:6px;background:transparent;color:var(--text-muted);border:1px solid rgba(250,248,243,.12);border-radius:10px;padding:.5rem 1rem;font-size:.82rem;font-weight:600;cursor:pointer;transition:all .2s;text-decoration:none;font-family:var(--font-text)}
        .btn-ghost-sm{background:rgba(250,248,243,.04);border:1px solid rgba(250,248,243,.08);color:var(--text-dim);border-radius:8px;padding:.3rem .625rem;font-size:.75rem;font-weight:500;cursor:pointer;transition:all .2s;font-family:var(--font-text)}
        .btn-ghost-sm:hover{color:var(--text-strong);border-color:var(--text-faint)}
        .btn-ghost-sm.danger:hover{color:#f87171;border-color:rgba(248,113,113,.3)}
        .btn-danger{background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.25);color:#f87171;border-radius:10px;padding:.5rem 1rem;font-size:.82rem;font-weight:600;cursor:pointer;font-family:var(--font-text)}
        .profil-sidebar{width:228px;flex-shrink:0;display:flex;flex-direction:column;gap:1.25rem;position:sticky;top:84px;align-self:flex-start}
        .pf-id{padding:1rem;border:1px solid var(--border);border-radius:12px;background:var(--bg-raised);display:flex;flex-direction:column;gap:.7rem}
        .pf-id-skel{height:116px}
        .pf-id-top{display:flex;align-items:center;gap:.7rem}
        .pf-id-av{width:40px;height:40px;border-radius:50%;overflow:hidden;flex-shrink:0;display:inline-flex;align-items:center;justify-content:center;background:var(--accent);color:var(--accent-ink);font-family:var(--font-display);font-weight:800}
        .pf-id-av img{width:100%;height:100%;object-fit:cover;display:block}
        .pf-id-txt{min-width:0}
        .pf-id-name{font-family:var(--font-display);font-weight:700;font-size:.95rem;color:var(--text-strong);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
        .pf-id-lvl{font-size:.75rem;color:var(--text-dim);margin-top:2px}
        .pf-id-next{font-size:.72rem;color:var(--text-faint)}
        .pf-nav{display:flex;flex-direction:column}
        .pf-group{display:flex;flex-direction:column;gap:2px;padding:.5rem 0;border-top:1px solid var(--border)}
        .pf-group:first-child{border-top:0;padding-top:0}
        .pf-item{display:flex;align-items:center;gap:.65rem;width:100%;padding:.55rem .75rem;border:0;border-radius:8px;background:transparent;color:var(--text-dim);font:inherit;font-size:.88rem;font-weight:500;text-align:left;cursor:pointer;transition:color .15s ease,background-color .15s ease}
        .pf-item:hover{color:var(--text-strong);background:var(--bg-card-md)}
        .pf-item.on{color:var(--text-strong);background:var(--bg-card-hover);box-shadow:inset 3px 0 0 var(--accent)}
        .pf-item:focus-visible{outline:2px solid var(--accent);outline-offset:-2px}
        .pf-item-ico{display:inline-flex;opacity:.7}
        .pf-item.on .pf-item-ico{opacity:1;color:var(--accent-text)}
        .pf-item-label{flex:1}
        .pf-badge{min-width:20px;height:20px;padding:0 6px;border-radius:10px;background:var(--accent);color:var(--accent-ink);font-size:.7rem;font-weight:700;display:inline-flex;align-items:center;justify-content:center;font-variant-numeric:tabular-nums}
        .pf-publish{display:inline-flex;align-items:center;justify-content:center;gap:.45rem;height:40px;border:1px solid var(--border-lg);border-radius:10px;color:var(--text-strong);font-size:.85rem;font-weight:600;text-decoration:none;transition:border-color .15s ease,background-color .15s ease}
        .pf-publish:hover{border-color:var(--accent);background:var(--accent-tint)}
        .pf-head{display:flex;align-items:center;gap:1.25rem;flex-wrap:wrap;padding:1.5rem;border:1px solid var(--border);border-radius:14px;background:var(--bg-raised)}
        .pf-head-txt{flex:1;min-width:220px}
        .pf-head-meta{margin-top:4px;font-size:.84rem;color:var(--text-dim)}
        .pf-xp{margin-top:1rem;display:flex;flex-direction:column;gap:6px;max-width:460px}
        .pf-xp-row{display:flex;justify-content:space-between;gap:1rem;font-size:.78rem;color:var(--text-dim)}
        .pf-xp-val{font-weight:700;color:var(--text-strong)}
        .pf-stats{display:grid;grid-template-columns:repeat(3,1fr);border:1px solid var(--border);border-radius:14px;background:var(--bg-raised)}
        .pf-stat{padding:1.25rem 1.4rem;display:flex;flex-direction:column;gap:2px;border-left:1px solid var(--border)}
        .pf-stat:first-child{border-left:0}
        .pf-stat dt{font-size:.8rem;color:var(--text-dim)}
        .pf-stat-v{margin-top:.35rem;font-family:var(--font-display);font-weight:800;font-size:2.1rem;line-height:1.1;color:var(--text-strong);font-variant-numeric:tabular-nums}
        .pf-stat-sub{font-size:.78rem;color:var(--text-faint)}
        .pf-stat-link{display:inline-flex;align-items:center;gap:5px;margin-top:.8rem;padding-bottom:1px;font-size:.8rem;font-weight:600;color:var(--text-muted);text-decoration:none;border-bottom:1px solid var(--border-lg);transition:color .15s ease,border-color .15s ease}
        .pf-stat-link:hover{color:var(--text-strong);border-color:var(--accent)}
        @media(max-width:640px){
          .pf-stats{grid-template-columns:1fr}
          .pf-stat{display:grid;grid-template-columns:1fr auto;grid-template-areas:"l v" "s v" "c c";column-gap:1rem;padding:1rem 1.1rem;border-left:0;border-top:1px solid var(--border)}
          .pf-stat:first-child{border-top:0}
          .pf-stat dt{grid-area:l}
          .pf-stat-v{grid-area:v;align-self:center;margin-top:0;font-size:1.9rem}
          .pf-stat-sub{grid-area:s}
          .pf-stat-cta{grid-area:c}
          .pf-stat-link{margin-top:.55rem}
        }
        @media(max-width:520px){
          .pf-head{flex-wrap:nowrap;align-items:flex-start;gap:1rem;padding:1.1rem}
          .pf-head-txt{min-width:0}
          .pf-xp-row{flex-direction:column;gap:2px}
        }
        .pf-edit{width:28px;height:28px;flex-shrink:0}
        @media (pointer: coarse){ .pf-edit{width:40px;height:40px} }
        .pf-skel{display:flex;flex-direction:column;gap:.75rem}
        .pf-skel i{display:block;border-radius:6px;background:var(--bg-card-hover);animation:shimmer 1.4s ease-in-out infinite}
        .pf-skel-card{height:190px;margin-top:.75rem;border:1px solid var(--border);border-radius:14px;background:var(--bg-card)}
        .pf-skel-card.short{height:110px;margin-top:0}
        .g2{display:grid;grid-template-columns:1fr 1fr;gap:.875rem}
        .g3{display:grid;grid-template-columns:repeat(3,1fr);gap:.875rem}
        @media(max-width:768px){
          .layout{flex-direction:column;padding:1rem;gap:1.25rem}
          .main{width:100%}
          .profil-sidebar{width:100%;position:static;gap:0}
          .pf-id,.pf-publish{display:none}
          .pf-nav{flex-direction:row;overflow-x:auto;gap:.25rem;margin:0 -1rem;padding:0 1rem .75rem;border-bottom:1px solid var(--border);scrollbar-width:none}
          .pf-nav::-webkit-scrollbar{display:none}
          .pf-group{flex-direction:row;padding:0;border:0;gap:.25rem}
          .pf-item{width:auto;white-space:nowrap;padding:.5rem .85rem;border-radius:999px;font-size:.84rem}
          .pf-item-ico{display:none}
          .pf-item.on{box-shadow:none;background:var(--accent);color:var(--accent-ink)}
          .pf-item.on .pf-badge{background:var(--accent-ink);color:var(--accent)}
          .g3{grid-template-columns:1fr 1fr}
        }
        @media(max-width:520px){
          .g2,.g3{grid-template-columns:1fr}
        }
      `}</style>

      <Navbar activePage={active === "messages" ? "messages" : "profil"} />

      <div className="layout">
        <Sidebar active={active} setActive={goTo} user={user} unread={unread} />
        <main className="main">{renderSection()}</main>
      </div>
    </>
  );
}