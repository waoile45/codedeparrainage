"use client";

import { useState, useRef, useEffect } from "react";
import Navbar from "@/components/Navbar";

// ── Types ──────────────────────────────────────────────────────────────────────
interface Message { id: string; from: "me" | "them"; text: string; time: string; }
interface Conversation {
  id: string; pseudo: string; code: string; company: string;
  lastMsg: string; lastTime: string; unread: number;
  messages: Message[];
  confirmed?: boolean;
}

// ── Mock data ──────────────────────────────────────────────────────────────────
const MOCK_CONVOS: Conversation[] = [
  {
    id:"1", pseudo:"Manou", code:"WINA100", company:"Winamax",
    lastMsg:"Merci pour le code, ça a bien marché !", lastTime:"18h50", unread:1,
    confirmed: true,
    messages:[
      { id:"1", from:"them", text:"Bonjour ! J'ai utilisé ton code Winamax mais il n'a pas été pris en compte lors de l'inscription.", time:"11h23" },
      { id:"2", from:"me",   text:"Bonjour Manou ! Désolé pour ça. Tu peux contacter le support Winamax avec ma référence.", time:"12h01" },
      { id:"3", from:"them", text:"Ils ont validé le parrainage manuellement. Merci beaucoup !", time:"18h50" },
    ],
  },
  {
    id:"2", pseudo:"AlexCrypto", code:"BINANCE10", company:"Binance",
    lastMsg:"Tu peux m'envoyer ton code ?", lastTime:"Hier", unread:0,
    messages:[
      { id:"1", from:"them", text:"Salut ! Tu as un code Binance actif ?", time:"Hier 14h" },
      { id:"2", from:"me",   text:"Oui, c'est BINANCE10 — 10% de réduction sur les frais.", time:"Hier 14h30" },
      { id:"3", from:"them", text:"Tu peux m'envoyer ton code ?", time:"Hier 15h" },
    ],
  },
];

// ── Avatar ────────────────────────────────────────────────────────────────────
function Avatar({ pseudo, size=36 }: { pseudo:string; size?:number }) {
  const colors = ["#7c3aed","#4f46e5","#0891b2","#059669","#d97706"];
  const color  = colors[pseudo.charCodeAt(0) % colors.length];
  return (
    <div style={{ width:size, height:size, borderRadius:"50%", background:`linear-gradient(135deg,${color},${color}99)`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
      <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:size*.38, color:"#fff" }}>{pseudo[0]?.toUpperCase()}</span>
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────
function EmptyState() {
  return (
    <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:"1rem", padding:"3rem" }}>
      <div style={{ width:56, height:56, borderRadius:16, background:"rgba(124,58,237,.1)", border:"1px solid rgba(124,58,237,.2)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.5rem" }}>💬</div>
      <p style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:"1rem", color:"rgba(255,255,255,.6)" }}>Aucun message</p>
      <p style={{ fontSize:".8rem", color:"rgba(255,255,255,.25)", textAlign:"center" }}>Contacte un parrain depuis la page des codes pour démarrer une conversation.</p>
      <a href="/codes" style={{ display:"inline-flex", alignItems:"center", gap:6, background:"rgba(124,58,237,.15)", border:"1px solid rgba(124,58,237,.3)", borderRadius:10, padding:".5rem 1rem", color:"#a78bfa", fontSize:".82rem", fontWeight:600, textDecoration:"none", transition:"all .2s" }}>
        Parcourir les codes
      </a>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function MessagesPage() {
  const [convos]        = useState<Conversation[]>(MOCK_CONVOS);
  const [activeId, setActiveId] = useState<string | null>(convos[0]?.id ?? null);
  const [newMsg, setNewMsg]     = useState("");
  const [filter, setFilter]     = useState<"all"|"unread">("all");
  const [mobileView, setMobileView] = useState<"list"|"chat">("list");
  const bottomRef = useRef<HTMLDivElement>(null);

  const active = convos.find(c => c.id === activeId) ?? null;
  const filtered = convos.filter(c => filter === "all" || c.unread > 0);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior:"smooth" });
  }, [activeId]);

  const totalUnread = convos.reduce((a,c) => a + c.unread, 0);

  return (
    <>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        *,*::before,*::after { box-sizing:border-box; margin:0; padding:0; }
        body { background:#0A0A0F; color:#e2e8f0; font-family:'DM Sans',sans-serif; min-height:100vh; }

        .page { display:flex; flex-direction:column; height:calc(100vh - 64px); }

        /* Split layout */
        .split { display:flex; flex:1; overflow:hidden; max-width:1100px; width:100%; margin:0 auto; padding:1.5rem; gap:1.25rem; }

        /* Left — conversation list */
        .conv-panel {
          width:300px; flex-shrink:0;
          display:flex; flex-direction:column; gap:.75rem;
        }
        .conv-panel-header { display:flex; align-items:center; justify-content:space-between; }
        .conv-title { font-family:'Syne',sans-serif; font-weight:800; font-size:1.1rem; color:#fff; letter-spacing:-.02em; }
        .unread-badge { background:#7c3aed; color:#fff; font-size:.65rem; font-weight:700; padding:2px 7px; border-radius:100px; }

        .filter-row { display:flex; gap:5px; }
        .filter-btn { padding:.3rem .75rem; background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.08); border-radius:100px; color:rgba(255,255,255,.45); font-size:.75rem; font-weight:500; cursor:pointer; transition:all .18s; font-family:'DM Sans',sans-serif; }
        .filter-btn:hover { color:#fff; }
        .filter-btn.active { background:rgba(124,58,237,.15); border-color:rgba(124,58,237,.35); color:#a78bfa; }

        .conv-list { display:flex; flex-direction:column; gap:4px; overflow-y:auto; flex:1; }
        .conv-list::-webkit-scrollbar { width:3px; }
        .conv-list::-webkit-scrollbar-thumb { background:rgba(124,58,237,.3); border-radius:3px; }

        .conv-item {
          display:flex; align-items:center; gap:10px;
          padding:.75rem .875rem; border-radius:14px;
          border:1px solid transparent;
          cursor:pointer; transition:all .18s;
          position:relative;
        }
        .conv-item:hover { background:rgba(255,255,255,.04); }
        .conv-item.active { background:rgba(124,58,237,.1); border-color:rgba(124,58,237,.25); }
        .conv-info { flex:1; min-width:0; }
        .conv-pseudo { font-weight:700; font-size:.855rem; color:#fff; margin-bottom:1px; display:flex; align-items:center; gap:6px; }
        .conv-preview { font-size:.75rem; color:rgba(255,255,255,.35); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .conv-meta { display:flex; flex-direction:column; align-items:flex-end; gap:4px; flex-shrink:0; }
        .conv-time { font-size:.68rem; color:rgba(255,255,255,.25); }
        .conv-unread { width:18px; height:18px; border-radius:50%; background:#7c3aed; display:flex; align-items:center; justify-content:center; font-size:.6rem; font-weight:700; color:#fff; }

        /* Right — chat panel */
        .chat-panel {
          flex:1; min-width:0;
          display:flex; flex-direction:column;
          background:rgba(255,255,255,.02);
          border:1px solid rgba(255,255,255,.07);
          border-radius:20px; overflow:hidden;
        }

        /* Chat header */
        .chat-header {
          display:flex; align-items:center; gap:12px;
          padding:1rem 1.25rem;
          border-bottom:1px solid rgba(255,255,255,.07);
          background:rgba(255,255,255,.02);
          flex-shrink:0;
        }
        .chat-header-info { flex:1; min-width:0; }
        .chat-header-pseudo { font-family:'Syne',sans-serif; font-weight:800; font-size:.95rem; color:#fff; }
        .chat-header-sub { font-size:.72rem; color:rgba(255,255,255,.35); margin-top:1px; display:flex; align-items:center; gap:6px; }
        .chat-company-tag { background:rgba(124,58,237,.12); border:1px solid rgba(124,58,237,.25); color:#a78bfa; font-size:.65rem; font-weight:600; padding:1px 7px; border-radius:100px; }
        .chat-confirmed { background:rgba(34,197,94,.1); border:1px solid rgba(34,197,94,.25); color:#4ade80; font-size:.65rem; font-weight:600; padding:1px 7px; border-radius:100px; display:flex; align-items:center; gap:3px; }
        .chat-actions { display:flex; gap:6px; }
        .chat-action-btn { display:flex; align-items:center; gap:5px; background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.08); border-radius:9px; padding:.35rem .75rem; color:rgba(255,255,255,.4); font-size:.75rem; font-weight:500; cursor:pointer; transition:all .18s; font-family:'DM Sans',sans-serif; }
        .chat-action-btn:hover { color:#fff; border-color:rgba(255,255,255,.18); }
        .chat-action-btn.confirm { color:#4ade80; border-color:rgba(34,197,94,.3); background:rgba(34,197,94,.08); }
        .chat-action-btn.confirm:hover { background:rgba(34,197,94,.15); }
        .chat-action-btn.report { color:#f87171; border-color:rgba(239,68,68,.25); background:rgba(239,68,68,.06); }
        .chat-action-btn.report:hover { background:rgba(239,68,68,.12); }

        /* Messages */
        .messages-area { flex:1; overflow-y:auto; padding:1.25rem; display:flex; flex-direction:column; gap:.75rem; }
        .messages-area::-webkit-scrollbar { width:3px; }
        .messages-area::-webkit-scrollbar-thumb { background:rgba(255,255,255,.1); border-radius:3px; }

        .msg-row { display:flex; gap:8px; animation:fadeUp .2s ease; }
        .msg-row.me { flex-direction:row-reverse; }

        .msg-bubble {
          max-width:72%; padding:.625rem .875rem;
          border-radius:16px; font-size:.855rem; line-height:1.5;
          position:relative;
        }
        .msg-bubble.them {
          background:rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.08);
          color:rgba(255,255,255,.85); border-radius:4px 16px 16px 16px;
        }
        .msg-bubble.me {
          background:#7c3aed; color:#fff;
          border-radius:16px 4px 16px 16px;
        }
        .msg-time { font-size:.65rem; color:rgba(255,255,255,.25); margin-top:3px; text-align:right; }
        .msg-time.them { text-align:left; }

        /* Confirmed banner */
        .confirmed-banner {
          display:flex; align-items:center; gap:8px;
          background:rgba(34,197,94,.08); border:1px solid rgba(34,197,94,.2);
          border-radius:10px; padding:.625rem 1rem;
          font-size:.78rem; color:#4ade80;
          margin:0 1.25rem;
        }

        /* Input */
        .chat-input-wrap {
          display:flex; align-items:flex-end; gap:8px;
          padding:.875rem 1.25rem;
          border-top:1px solid rgba(255,255,255,.07);
          flex-shrink:0;
        }
        .chat-input {
          flex:1; background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.08);
          border-radius:14px; padding:.65rem 1rem; color:#fff; font-size:.875rem;
          font-family:'DM Sans',sans-serif; outline:none; resize:none;
          max-height:120px; transition:all .2s; line-height:1.5;
        }
        .chat-input::placeholder { color:rgba(255,255,255,.25); }
        .chat-input:focus { border-color:rgba(124,58,237,.4); background:rgba(124,58,237,.05); }
        .send-btn {
          width:40px; height:40px; border-radius:12px;
          background:#7c3aed; border:none; cursor:pointer;
          display:flex; align-items:center; justify-content:center;
          transition:all .18s; flex-shrink:0;
        }
        .send-btn:hover { background:#6d28d9; transform:scale(1.05); }
        .send-btn:disabled { opacity:.4; cursor:not-allowed; transform:none; }

        /* Mobile back btn */
        .mobile-back { display:none; }

        @media(max-width:768px) {
          .split { padding:1rem; gap:0; }
          .conv-panel { width:100%; }
          .conv-panel.hidden { display:none; }
          .chat-panel.hidden { display:none; }
          .mobile-back { display:flex; align-items:center; gap:6px; background:none; border:none; color:rgba(255,255,255,.5); font-size:.82rem; cursor:pointer; padding:.5rem 0; font-family:'DM Sans',sans-serif; margin-bottom:.5rem; }
        }
      `}</style>

      <Navbar activePage="messages" isLoggedIn={true} pseudo="Test3" />

      <div className="page">
        <div className="split">

          {/* ── Left: conversation list ── */}
          <div className={`conv-panel ${mobileView === "chat" ? "hidden" : ""}`}>
            <div className="conv-panel-header">
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <h1 className="conv-title">Messages</h1>
                {totalUnread > 0 && <span className="unread-badge">{totalUnread}</span>}
              </div>
            </div>

            <div className="filter-row">
              <button className={`filter-btn ${filter==="all"?"active":""}`}    onClick={()=>setFilter("all")}>Tous</button>
              <button className={`filter-btn ${filter==="unread"?"active":""}`} onClick={()=>setFilter("unread")}>Non lus {totalUnread > 0 && `(${totalUnread})`}</button>
            </div>

            <div className="conv-list">
              {filtered.length === 0 ? (
                <p style={{ fontSize:".8rem", color:"rgba(255,255,255,.25)", textAlign:"center", padding:"2rem 0" }}>Aucune conversation</p>
              ) : filtered.map(c => (
                <div key={c.id} className={`conv-item ${activeId===c.id?"active":""}`}
                  onClick={()=>{ setActiveId(c.id); setMobileView("chat"); }}>
                  <Avatar pseudo={c.pseudo} size={38} />
                  <div className="conv-info">
                    <div className="conv-pseudo">
                      {c.pseudo}
                      <span style={{ fontSize:".65rem", color:"rgba(255,255,255,.3)", fontWeight:400 }}>{c.company}</span>
                    </div>
                    <p className="conv-preview">{c.lastMsg}</p>
                  </div>
                  <div className="conv-meta">
                    <span className="conv-time">{c.lastTime}</span>
                    {c.unread > 0 && <span className="conv-unread">{c.unread}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right: chat panel ── */}
          <div className={`chat-panel ${mobileView === "list" ? "hidden" : ""}`} style={{ display: mobileView === "list" && typeof window !== "undefined" && window.innerWidth <= 768 ? "none" : "flex" }}>
            {active ? (
              <>
                {/* Header */}
                <div className="chat-header">
                  <button className="mobile-back" onClick={()=>setMobileView("list")}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
                    Retour
                  </button>
                  <Avatar pseudo={active.pseudo} size={36} />
                  <div className="chat-header-info">
                    <p className="chat-header-pseudo">{active.pseudo}</p>
                    <div className="chat-header-sub">
                      <span className="chat-company-tag">📋 {active.company} · {active.code}</span>
                      {active.confirmed && <span className="chat-confirmed">✓ Parrainage confirmé</span>}
                    </div>
                  </div>
                  <div className="chat-actions">
                    {!active.confirmed && (
                      <button className="chat-action-btn confirm">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                        Confirmer
                      </button>
                    )}
                    <button className="chat-action-btn report">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>
                      Signaler
                    </button>
                  </div>
                </div>

                {/* Messages */}
                <div className="messages-area">
                  {active.messages.map(m => (
                    <div key={m.id} className={`msg-row ${m.from}`}>
                      {m.from === "them" && <Avatar pseudo={active.pseudo} size={28} />}
                      <div>
                        <div className={`msg-bubble ${m.from}`}>{m.text}</div>
                        <p className={`msg-time ${m.from}`}>{m.time}</p>
                      </div>
                    </div>
                  ))}
                  {active.confirmed && (
                    <div className="confirmed-banner">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                      {active.pseudo} a confirmé le bon déroulement du parrainage.
                    </div>
                  )}
                  <div ref={bottomRef} />
                </div>

                {/* Input */}
                <div className="chat-input-wrap">
                  <textarea
                    className="chat-input"
                    placeholder="Écrire un message..."
                    rows={1}
                    value={newMsg}
                    onChange={e=>setNewMsg(e.target.value)}
                    onKeyDown={e=>{ if(e.key==="Enter"&&!e.shiftKey){ e.preventDefault(); if(newMsg.trim()) setNewMsg(""); } }}
                  />
                  <button className="send-btn" disabled={!newMsg.trim()} onClick={()=>{ if(newMsg.trim()) setNewMsg(""); }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                  </button>
                </div>
              </>
            ) : (
              <EmptyState />
            )}
          </div>

        </div>
      </div>
    </>
  );
}