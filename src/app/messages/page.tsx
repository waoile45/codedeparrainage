"use client";

import { useState, useRef, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { createClient } from "@/lib/supabase";

// ── Types ──────────────────────────────────────────────────────────────────────
interface ConversationData {
  key: string; // `${otherId}__${announcementId}`
  otherId: string;
  otherPseudo: string;
  announcementId: string;
  companyName: string;
  code: string;
  lastMsg: string;
  lastTime: string;
  unread: number;
}

interface MsgData {
  id: string;
  senderId: string;
  content: string;
  createdAt: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatTime(dateStr: string): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const now = new Date();
  const diffMins = Math.floor((now.getTime() - date.getTime()) / 60000);
  const diffDays = Math.floor(diffMins / 1440);
  if (diffMins < 1) return "À l'instant";
  if (diffMins < 60) return `${diffMins}min`;
  if (diffDays === 0) return `${date.getHours()}h${String(date.getMinutes()).padStart(2, "0")}`;
  if (diffDays === 1) return "Hier";
  if (diffDays < 7) return `Il y a ${diffDays}j`;
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

// ── Avatar ────────────────────────────────────────────────────────────────────
function Avatar({ pseudo, size = 36 }: { pseudo: string; size?: number }) {
  const colors = ["#7c3aed", "#4f46e5", "#0891b2", "#059669", "#d97706"];
  const color = colors[pseudo.charCodeAt(0) % colors.length];
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: `linear-gradient(135deg,${color},${color}99)`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: size * 0.38, color: "#fff" }}>{pseudo[0]?.toUpperCase()}</span>
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────
function EmptyState() {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1rem", padding: "3rem" }}>
      <div style={{ width: 56, height: 56, borderRadius: 16, background: "rgba(124,58,237,.1)", border: "1px solid rgba(124,58,237,.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem" }}>💬</div>
      <p style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: "1rem", color: "rgba(255,255,255,.6)" }}>Aucun message</p>
      <p style={{ fontSize: ".8rem", color: "rgba(255,255,255,.25)", textAlign: "center" }}>Contacte un parrain depuis la page des codes pour démarrer une conversation.</p>
      <a href="/codes" style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(124,58,237,.15)", border: "1px solid rgba(124,58,237,.3)", borderRadius: 10, padding: ".5rem 1rem", color: "#a78bfa", fontSize: ".82rem", fontWeight: 600, textDecoration: "none" }}>
        Parcourir les codes
      </a>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function MessagesPage() {
  const supabase = createClient();
  const [me, setMe] = useState<{ id: string; pseudo: string } | null>(null);
  const [convs, setConvs] = useState<ConversationData[]>([]);
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [msgs, setMsgs] = useState<MsgData[]>([]);
  const [newMsg, setNewMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [mobileView, setMobileView] = useState<"list" | "chat">("list");
  const bottomRef = useRef<HTMLDivElement>(null);

  const activeConv = convs.find(c => c.key === activeKey) ?? null;
  const totalUnread = convs.reduce((s, c) => s + c.unread, 0);
  const filtered = convs.filter(c => filter === "all" || c.unread > 0);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

  useEffect(() => { init(); }, []);

  async function init() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const { data: userData } = await supabase.from("users").select("pseudo").eq("id", user.id).single();
    const meData = { id: user.id, pseudo: (userData as any)?.pseudo ?? "Moi" };
    setMe(meData);

    const loadedConvs = await fetchConversations(user.id);
    setConvs(loadedConvs);
    setLoading(false);

    const params = new URLSearchParams(window.location.search);
    const toId = params.get("to");
    const annId = params.get("annonce");
    if (toId && annId) {
      await handleContactRedirect(meData, toId, annId, loadedConvs);
    } else if (loadedConvs.length > 0) {
      const first = loadedConvs[0];
      setActiveKey(first.key);
      await loadMessages(meData, first);
    }
  }

  async function fetchConversations(userId: string): Promise<ConversationData[]> {
    const { data } = await supabase
      .from("messages")
      .select("id, sender_id, receiver_id, announcement_id, content, read, created_at")
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order("created_at", { ascending: false });

    if (!data || data.length === 0) return [];

    const map = new Map<string, { msgs: any[]; otherId: string; announcementId: string }>();
    for (const m of data) {
      const otherId = m.sender_id === userId ? m.receiver_id : m.sender_id;
      const key = `${otherId}__${m.announcement_id}`;
      if (!map.has(key)) map.set(key, { msgs: [], otherId, announcementId: m.announcement_id });
      map.get(key)!.msgs.push(m);
    }

    const otherIds = [...new Set([...map.values()].map(v => v.otherId))];
    const annIds = [...new Set([...map.values()].map(v => v.announcementId))];

    const [{ data: users }, { data: anns }] = await Promise.all([
      supabase.from("users").select("id, pseudo").in("id", otherIds),
      supabase.from("announcements").select("id, code, companies(name)").in("id", annIds),
    ]);

    const userMap: Record<string, string> = {};
    (users ?? []).forEach((u: any) => { userMap[u.id] = u.pseudo; });
    const annMap: Record<string, { code: string; company: string }> = {};
    (anns ?? []).forEach((a: any) => { annMap[a.id] = { code: a.code, company: a.companies?.name ?? "" }; });

    const result: ConversationData[] = [];
    for (const [key, { msgs: mList, otherId, announcementId }] of map) {
      const last = mList[0];
      const unread = mList.filter((m: any) => m.receiver_id === userId && !m.read).length;
      result.push({
        key, otherId,
        otherPseudo: userMap[otherId] ?? "Inconnu",
        announcementId,
        companyName: annMap[announcementId]?.company ?? "",
        code: annMap[announcementId]?.code ?? "",
        lastMsg: last.content,
        lastTime: formatTime(last.created_at),
        unread,
      });
    }
    return result;
  }

  async function loadMessages(meData: { id: string; pseudo: string }, conv: ConversationData) {
    const { data } = await supabase
      .from("messages")
      .select("id, sender_id, content, read, created_at")
      .eq("announcement_id", conv.announcementId)
      .in("sender_id", [meData.id, conv.otherId])
      .in("receiver_id", [meData.id, conv.otherId])
      .order("created_at", { ascending: true });

    setMsgs((data ?? []).map((m: any) => ({
      id: m.id,
      senderId: m.sender_id,
      content: m.content,
      createdAt: m.created_at,
    })));

    // Mark received messages as read
    await supabase.from("messages")
      .update({ read: true })
      .eq("announcement_id", conv.announcementId)
      .eq("sender_id", conv.otherId)
      .eq("receiver_id", meData.id)
      .eq("read", false);

    setConvs(prev => prev.map(c => c.key === conv.key ? { ...c, unread: 0 } : c));
  }

  async function handleContactRedirect(meData: { id: string; pseudo: string }, otherId: string, announcementId: string, existingConvs: ConversationData[]) {
    if (meData.id === otherId) return;
    const key = `${otherId}__${announcementId}`;
    const existing = existingConvs.find(c => c.key === key);
    if (existing) {
      setActiveKey(key);
      await loadMessages(meData, existing);
      return;
    }
    const [{ data: other }, { data: ann }] = await Promise.all([
      supabase.from("users").select("pseudo").eq("id", otherId).single(),
      supabase.from("announcements").select("code, companies(name)").eq("id", announcementId).single(),
    ]);
    const newConv: ConversationData = {
      key, otherId,
      otherPseudo: (other as any)?.pseudo ?? "Inconnu",
      announcementId,
      companyName: (ann as any)?.companies?.name ?? "",
      code: (ann as any)?.code ?? "",
      lastMsg: "", lastTime: "", unread: 0,
    };
    setConvs(prev => [newConv, ...prev]);
    setActiveKey(key);
    setMsgs([]);
  }

  async function openConversation(conv: ConversationData) {
    setActiveKey(conv.key);
    setMobileView("chat");
    if (me) await loadMessages(me, conv);
  }

  async function sendMessage() {
    if (!newMsg.trim() || !me || !activeConv || sending) return;
    setSending(true);
    const content = newMsg.trim();
    setNewMsg("");

    const { data } = await supabase.from("messages").insert({
      sender_id: me.id,
      receiver_id: activeConv.otherId,
      announcement_id: activeConv.announcementId,
      content,
      read: false,
    }).select("id, sender_id, content, created_at").single();

    if (data) {
      setMsgs(prev => [...prev, {
        id: (data as any).id,
        senderId: (data as any).sender_id,
        content: (data as any).content,
        createdAt: (data as any).created_at,
      }]);
      setConvs(prev => prev.map(c =>
        c.key === activeKey ? { ...c, lastMsg: content, lastTime: "À l'instant" } : c
      ));
    }
    setSending(false);
  }

  return (
    <>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        *,*::before,*::after { box-sizing:border-box; margin:0; padding:0; }
        body { background:var(--bg); color:var(--text); font-family:'DM Sans',sans-serif; min-height:100vh; }

        .page { display:flex; flex-direction:column; height:calc(100vh - 64px); }

        .split { display:flex; flex:1; overflow:hidden; max-width:1100px; width:100%; margin:0 auto; padding:1.5rem; gap:1.25rem; }

        .conv-panel { width:300px; flex-shrink:0; display:flex; flex-direction:column; gap:.75rem; }
        .conv-panel-header { display:flex; align-items:center; justify-content:space-between; }
        .conv-title { font-family:'Syne',sans-serif; font-weight:800; font-size:1.1rem; color:var(--text-strong); letter-spacing:-.02em; }
        .unread-badge { background:#7c3aed; color:#fff; font-size:.65rem; font-weight:700; padding:2px 7px; border-radius:100px; }

        .filter-row { display:flex; gap:5px; }
        .filter-btn { padding:.3rem .75rem; background:var(--bg-card-md); border:1px solid var(--border-md); border-radius:100px; color:var(--text-muted); font-size:.75rem; font-weight:500; cursor:pointer; transition:all .18s; font-family:'DM Sans',sans-serif; }
        .filter-btn:hover { color:var(--text-strong); }
        .filter-btn.active { background:rgba(124,58,237,.15); border-color:rgba(124,58,237,.35); color:#a78bfa; }

        .conv-list { display:flex; flex-direction:column; gap:4px; overflow-y:auto; flex:1; }
        .conv-list::-webkit-scrollbar { width:3px; }
        .conv-list::-webkit-scrollbar-thumb { background:rgba(124,58,237,.3); border-radius:3px; }

        .conv-item { display:flex; align-items:center; gap:10px; padding:.75rem .875rem; border-radius:14px; border:1px solid transparent; cursor:pointer; transition:all .18s; position:relative; }
        .conv-item:hover { background:var(--bg-card-md); }
        .conv-item.active { background:rgba(124,58,237,.1); border-color:rgba(124,58,237,.25); }
        .conv-info { flex:1; min-width:0; }
        .conv-pseudo { font-weight:700; font-size:.855rem; color:var(--text-strong); margin-bottom:1px; display:flex; align-items:center; gap:6px; }
        .conv-preview { font-size:.75rem; color:var(--text-dim); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .conv-meta { display:flex; flex-direction:column; align-items:flex-end; gap:4px; flex-shrink:0; }
        .conv-time { font-size:.68rem; color:var(--text-faint); }
        .conv-unread { width:18px; height:18px; border-radius:50%; background:#7c3aed; display:flex; align-items:center; justify-content:center; font-size:.6rem; font-weight:700; color:#fff; }

        .chat-panel { flex:1; min-width:0; display:flex; flex-direction:column; background:var(--bg-card); border:1px solid var(--border); border-radius:20px; overflow:hidden; }

        .chat-header { display:flex; align-items:center; gap:12px; padding:1rem 1.25rem; border-bottom:1px solid var(--border); background:var(--bg-card-md); flex-shrink:0; }
        .chat-header-info { flex:1; min-width:0; }
        .chat-header-pseudo { font-family:'Syne',sans-serif; font-weight:800; font-size:.95rem; color:var(--text-strong); }
        .chat-header-sub { font-size:.72rem; color:var(--text-dim); margin-top:1px; display:flex; align-items:center; gap:6px; }
        .chat-company-tag { background:rgba(124,58,237,.12); border:1px solid rgba(124,58,237,.25); color:#a78bfa; font-size:.65rem; font-weight:600; padding:1px 7px; border-radius:100px; }
        .chat-actions { display:flex; gap:6px; }
        .chat-action-btn { display:flex; align-items:center; gap:5px; background:var(--bg-card-md); border:1px solid var(--border-md); border-radius:9px; padding:.35rem .75rem; color:var(--text-muted); font-size:.75rem; font-weight:500; cursor:pointer; transition:all .18s; font-family:'DM Sans',sans-serif; }
        .chat-action-btn:hover { color:var(--text-strong); border-color:var(--border-lg); }
        .chat-action-btn.report { color:#f87171; border-color:rgba(239,68,68,.25); background:rgba(239,68,68,.06); }
        .chat-action-btn.report:hover { background:rgba(239,68,68,.12); }

        .messages-area { flex:1; overflow-y:auto; padding:1.25rem; display:flex; flex-direction:column; gap:.75rem; }
        .messages-area::-webkit-scrollbar { width:3px; }
        .messages-area::-webkit-scrollbar-thumb { background:var(--border-lg); border-radius:3px; }

        .msg-row { display:flex; gap:8px; animation:fadeUp .2s ease; }
        .msg-row.me { flex-direction:row-reverse; }

        .msg-bubble { max-width:72%; padding:.625rem .875rem; border-radius:16px; font-size:.855rem; line-height:1.5; }
        .msg-bubble.them { background:var(--bg-card-md); border:1px solid var(--border); color:var(--text-strong); border-radius:4px 16px 16px 16px; }
        .msg-bubble.me { background:#7c3aed; color:#fff; border-radius:16px 4px 16px 16px; }
        .msg-time { font-size:.65rem; color:var(--text-faint); margin-top:3px; text-align:right; }
        .msg-time.them { text-align:left; }

        .chat-input-wrap { display:flex; align-items:flex-end; gap:8px; padding:.875rem 1.25rem; border-top:1px solid var(--border); flex-shrink:0; }
        .chat-input { flex:1; background:var(--bg-input); border:1px solid var(--border-md); border-radius:14px; padding:.65rem 1rem; color:var(--text-strong); font-size:.875rem; font-family:'DM Sans',sans-serif; outline:none; resize:none; max-height:120px; transition:all .2s; line-height:1.5; }
        .chat-input::placeholder { color:var(--text-faint); }
        .chat-input:focus { border-color:rgba(124,58,237,.4); background:rgba(124,58,237,.05); }
        .send-btn { width:40px; height:40px; border-radius:12px; background:#7c3aed; border:none; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all .18s; flex-shrink:0; }
        .send-btn:hover { background:#6d28d9; transform:scale(1.05); }
        .send-btn:disabled { opacity:.4; cursor:not-allowed; transform:none; }

        .mobile-back { display:none; }

        .loading-shimmer { flex:1; display:flex; align-items:center; justify-content:center; color:var(--text-faint); font-size:.875rem; }

        @media(max-width:768px) {
          .split { padding:1rem; gap:0; }
          .conv-panel { width:100%; }
          .conv-panel.hidden { display:none; }
          .chat-panel.hidden { display:none; }
          .mobile-back { display:flex; align-items:center; gap:6px; background:none; border:none; color:var(--text-muted); font-size:.82rem; cursor:pointer; padding:.5rem 0; font-family:'DM Sans',sans-serif; margin-bottom:.5rem; }
        }
      `}</style>

      <Navbar activePage="messages" />

      <div className="page">
        <div className="split">

          {/* ── Left: conversation list ── */}
          <div className={`conv-panel ${mobileView === "chat" ? "hidden" : ""}`}>
            <div className="conv-panel-header">
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <h1 className="conv-title">Messages</h1>
                {totalUnread > 0 && <span className="unread-badge">{totalUnread}</span>}
              </div>
            </div>

            <div className="filter-row">
              <button className={`filter-btn ${filter === "all" ? "active" : ""}`} onClick={() => setFilter("all")}>Tous</button>
              <button className={`filter-btn ${filter === "unread" ? "active" : ""}`} onClick={() => setFilter("unread")}>Non lus {totalUnread > 0 && `(${totalUnread})`}</button>
            </div>

            <div className="conv-list">
              {loading ? (
                <p style={{ fontSize: ".8rem", color: "rgba(255,255,255,.25)", textAlign: "center", padding: "2rem 0" }}>Chargement…</p>
              ) : filtered.length === 0 ? (
                <p style={{ fontSize: ".8rem", color: "rgba(255,255,255,.25)", textAlign: "center", padding: "2rem 0" }}>Aucune conversation</p>
              ) : filtered.map(c => (
                <div key={c.key} className={`conv-item ${activeKey === c.key ? "active" : ""}`}
                  onClick={() => openConversation(c)}>
                  <Avatar pseudo={c.otherPseudo} size={38} />
                  <div className="conv-info">
                    <div className="conv-pseudo">
                      {c.otherPseudo}
                      <span style={{ fontSize: ".65rem", color: "rgba(255,255,255,.3)", fontWeight: 400 }}>{c.companyName}</span>
                    </div>
                    <p className="conv-preview">{c.lastMsg || "Nouvelle conversation"}</p>
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
            {activeConv ? (
              <>
                <div className="chat-header">
                  <button className="mobile-back" onClick={() => setMobileView("list")}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
                    Retour
                  </button>
                  <Avatar pseudo={activeConv.otherPseudo} size={36} />
                  <div className="chat-header-info">
                    <p className="chat-header-pseudo">{activeConv.otherPseudo}</p>
                    <div className="chat-header-sub">
                      <span className="chat-company-tag">📋 {activeConv.companyName}{activeConv.code ? ` · ${activeConv.code}` : ""}</span>
                    </div>
                  </div>
                  <div className="chat-actions">
                    <button className="chat-action-btn report">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" /><line x1="4" y1="22" x2="4" y2="15" /></svg>
                      Signaler
                    </button>
                  </div>
                </div>

                <div className="messages-area">
                  {msgs.length === 0 && (
                    <div style={{ textAlign: "center", padding: "2rem", color: "rgba(255,255,255,.25)", fontSize: ".82rem" }}>
                      Démarrez la conversation avec {activeConv.otherPseudo} !
                    </div>
                  )}
                  {msgs.map(m => {
                    const isMe = me && m.senderId === me.id;
                    return (
                      <div key={m.id} className={`msg-row ${isMe ? "me" : ""}`}>
                        {!isMe && <Avatar pseudo={activeConv.otherPseudo} size={28} />}
                        <div>
                          <div className={`msg-bubble ${isMe ? "me" : "them"}`}>{m.content}</div>
                          <p className={`msg-time ${isMe ? "me" : "them"}`}>{formatTime(m.createdAt)}</p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={bottomRef} />
                </div>

                <div className="chat-input-wrap">
                  <textarea
                    className="chat-input"
                    placeholder="Écrire un message..."
                    rows={1}
                    value={newMsg}
                    onChange={e => setNewMsg(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                  />
                  <button className="send-btn" disabled={!newMsg.trim() || sending} onClick={sendMessage}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
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
