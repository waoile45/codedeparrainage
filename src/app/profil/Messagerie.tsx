"use client";

// Messagerie du profil : liste des conversations à gauche, fil à droite.
// Une conversation = un membre + une annonce (on parle toujours d'un code
// précis). Sur mobile, la liste puis le fil, avec un bouton retour.
//
// Lecture : directement dans Supabase (RLS : on ne voit que ses messages).
// Envoi : par /api/messages, qui valide côté serveur et prévient le
// destinataire par e-mail.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { Chat } from "@/components/Pictos";
import "./messagerie.css";

type Row = {
  id: string;
  sender_id: string;
  receiver_id: string;
  announcement_id: string | null;
  content: string;
  read: boolean;
  created_at: string;
};
type Person = { pseudo: string; avatarUrl: string | null };
type Ann = { code: string; company: string; slug: string | null };
type Conv = {
  key: string;
  otherId: string;
  announcementId: string | null;
  msgs: Row[]; // du plus ancien au plus récent
  unread: number;
  lastAt: string;
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_LEN = 2000;
const convKey = (otherId: string, annId: string | null) => `${otherId}__${annId ?? "-"}`;

// ── Dates ────────────────────────────────────────────────────────────────────
function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
function hhmm(d: Date) {
  return `${d.getHours()}h${String(d.getMinutes()).padStart(2, "0")}`;
}
function listTime(iso: string) {
  if (!iso) return "";
  const d = new Date(iso);
  const now = new Date();
  if (sameDay(d, now)) return hhmm(d);
  const hier = new Date(now); hier.setDate(now.getDate() - 1);
  if (sameDay(d, hier)) return "Hier";
  if (now.getTime() - d.getTime() < 6 * 86400000) return d.toLocaleDateString("fr-FR", { weekday: "short" });
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}
function dayLabel(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  if (sameDay(d, now)) return "Aujourd'hui";
  const hier = new Date(now); hier.setDate(now.getDate() - 1);
  if (sameDay(d, hier)) return "Hier";
  return d.toLocaleDateString("fr-FR", {
    weekday: "long", day: "numeric", month: "long",
    ...(d.getFullYear() !== now.getFullYear() ? { year: "numeric" } : {}),
  });
}

// ── Avatar ───────────────────────────────────────────────────────────────────
function Avatar({ person, size = 36 }: { person: Person | undefined; size?: number }) {
  const [broken, setBroken] = useState(false);
  const pseudo = person?.pseudo ?? "?";
  return (
    <span className="ib-av" style={{ width: size, height: size, fontSize: size * 0.4 }} aria-hidden="true">
      {person?.avatarUrl && !broken
        // eslint-disable-next-line @next/next/no-img-element -- petites vignettes, déjà en WebP
        ? <img src={person.avatarUrl} alt="" width={size} height={size} loading="lazy" onError={() => setBroken(true)} />
        : pseudo[0]?.toUpperCase()}
    </span>
  );
}

export default function Messagerie() {
  const supabase = useMemo(() => createClient(), []);
  const [me, setMe] = useState<string | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [people, setPeople] = useState<Record<string, Person>>({});
  const [anns, setAnns] = useState<Record<string, Ann>>({});
  // Conversation ouverte depuis « Contacter », pas encore de message
  const [pending, setPending] = useState<{ otherId: string; announcementId: string } | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [view, setView] = useState<"list" | "thread">("list");
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const threadRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const booted = useRef(false);

  // ── Conversations, de la plus récente à la plus ancienne ────────────────────
  const convs = useMemo<Conv[]>(() => {
    if (!me) return [];
    const map = new Map<string, Conv>();
    // rows est trié du plus récent au plus ancien
    for (const r of rows) {
      const otherId = r.sender_id === me ? r.receiver_id : r.sender_id;
      const key = convKey(otherId, r.announcement_id);
      let c = map.get(key);
      if (!c) {
        c = { key, otherId, announcementId: r.announcement_id, msgs: [], unread: 0, lastAt: r.created_at };
        map.set(key, c);
      }
      c.msgs.push(r);
      if (r.receiver_id === me && !r.read) c.unread++;
    }
    const list = [...map.values()];
    list.forEach((c) => c.msgs.reverse());
    if (pending) {
      const key = convKey(pending.otherId, pending.announcementId);
      if (!map.has(key)) {
        list.unshift({ key, otherId: pending.otherId, announcementId: pending.announcementId, msgs: [], unread: 0, lastAt: "" });
      }
    }
    return list;
  }, [rows, me, pending]);

  const active = convs.find((c) => c.key === activeKey) ?? null;
  const lastId = active?.msgs[active.msgs.length - 1]?.id;
  const totalUnread = convs.reduce((s, c) => s + c.unread, 0);

  // Le bandeau du haut et le menu du profil affichent le nombre de non-lus
  useEffect(() => {
    if (status === "ready") window.dispatchEvent(new CustomEvent("cdp:unread", { detail: totalUnread }));
  }, [totalUnread, status]);

  // ── Pseudos, avatars et annonces manquants ──────────────────────────────────
  const fillRefs = useCallback(async (otherIds: string[], annIds: string[]) => {
    const [u, a] = await Promise.all([
      otherIds.length
        ? supabase.from("users").select("id, pseudo, avatar_url").in("id", otherIds)
        : Promise.resolve({ data: [] as { id: string; pseudo: string; avatar_url: string | null }[] }),
      annIds.length
        ? supabase.from("announcements").select("id, code, companies(name, url_slug)").in("id", annIds)
        : Promise.resolve({ data: [] as unknown[] }),
    ]);
    const p: Record<string, Person> = {};
    for (const x of (u.data ?? []) as { id: string; pseudo: string; avatar_url: string | null }[]) {
      p[x.id] = { pseudo: x.pseudo, avatarUrl: x.avatar_url };
    }
    const n: Record<string, Ann> = {};
    for (const x of (a.data ?? []) as { id: string; code: string; companies: { name: string; url_slug: string | null } | null }[]) {
      n[x.id] = { code: x.code, company: x.companies?.name ?? "", slug: x.companies?.url_slug ?? null };
    }
    setPeople((prev) => ({ ...prev, ...p }));
    setAnns((prev) => ({ ...prev, ...n }));
  }, [supabase]);

  // ── Chargement ──────────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const uid = session?.user?.id;
    if (!uid) { setStatus("error"); return null; }
    setMe(uid);
    const { data, error } = await supabase
      .from("messages")
      .select("id, sender_id, receiver_id, announcement_id, content, read, created_at")
      .or(`sender_id.eq.${uid},receiver_id.eq.${uid}`)
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) { setStatus("error"); return null; }
    const list = (data ?? []) as Row[];
    setRows(list);
    const others = [...new Set(list.map((r) => (r.sender_id === uid ? r.receiver_id : r.sender_id)))];
    const annIds = [...new Set(list.map((r) => r.announcement_id).filter((x): x is string => !!x))];
    await fillRefs(others, annIds);
    setStatus("ready");
    return { uid, list };
  }, [supabase, fillRefs]);

  async function markRead(conv: Conv) {
    if (!me) return;
    const ids = conv.msgs.filter((m) => m.receiver_id === me && !m.read).map((m) => m.id);
    if (!ids.length) return;
    setRows((rs) => rs.map((r) => (ids.includes(r.id) ? { ...r, read: true } : r)));
    await supabase.from("messages").update({ read: true }).in("id", ids).eq("receiver_id", me);
  }

  function open(conv: Conv) {
    setActiveKey(conv.key);
    setView("thread");
    setSendError(null);
    markRead(conv);
  }

  // Premier chargement : conversation demandée par « Contacter » (?to=&annonce=),
  // sinon, sur grand écran, la plus récente.
  useEffect(() => {
    if (booted.current) return;
    booted.current = true;
    (async () => {
      const res = await load();
      if (!res) return;
      const params = new URLSearchParams(window.location.search);
      const to = params.get("to") ?? "";
      const annonce = params.get("annonce") ?? "";
      if (UUID.test(to) && UUID.test(annonce) && to !== res.uid) {
        const key = convKey(to, annonce);
        const exists = res.list.some((r) => convKey(r.sender_id === res.uid ? r.receiver_id : r.sender_id, r.announcement_id) === key);
        if (!exists) {
          setPending({ otherId: to, announcementId: annonce });
          await fillRefs([to], [annonce]);
        }
        setActiveKey(key);
        setView("thread");
        // On retire to/annonce de l'adresse : un rechargement ne rouvre pas le brouillon
        params.delete("to"); params.delete("annonce");
        window.history.replaceState(null, "", `${window.location.pathname}?${params}`);
        setTimeout(() => inputRef.current?.focus(), 50);
      } else if (window.matchMedia("(min-width: 761px)").matches && res.list.length) {
        const r = res.list[0];
        const other = r.sender_id === res.uid ? r.receiver_id : r.sender_id;
        setActiveKey(convKey(other, r.announcement_id));
        setView("thread");
      }
    })();
  }, [load, fillRefs]);

  // Conversation ouverte automatiquement : ses messages reçus passent en lus
  useEffect(() => {
    if (active && active.unread > 0 && view === "thread") markRead(active);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- au changement de conversation ou de dernier message
  }, [activeKey, lastId]);

  // Retour sur l'onglet : on recharge (nouveaux messages)
  useEffect(() => {
    const onVis = () => { if (document.visibilityState === "visible" && status === "ready") load(); };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [load, status]);

  // Fil : on se place sur le dernier message
  useEffect(() => {
    const el = threadRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [activeKey, lastId]);

  function autoGrow(el: HTMLTextAreaElement) {
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 144)}px`;
  }

  async function send() {
    const text = draft.trim();
    if (!text || !active || sending) return;
    if (text.length > MAX_LEN) { setSendError(`${MAX_LEN} caractères au maximum.`); return; }
    setSending(true);
    setSendError(null);
    let msg = "Le message n'est pas parti. Réessaie dans un instant.";
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiverId: active.otherId, announcementId: active.announcementId, content: text }),
      });
      const json = await res.json().catch(() => null);
      if (res.ok && json?.message) {
        setRows((rs) => [json.message as Row, ...rs]);
        setDraft("");
        if (inputRef.current) inputRef.current.style.height = "";
        setSending(false);
        return;
      }
      if (res.status === 429) msg = "Trop de messages d'affilée : attends une minute.";
      else if (res.status === 401) msg = "Ta session a expiré : reconnecte-toi.";
      else if (res.status === 400 && typeof json?.error === "string") msg = json.error;
    } catch { /* réseau : message générique */ }
    setSendError(msg);
    setSending(false);
  }

  // ── États particuliers ──────────────────────────────────────────────────────
  if (status === "error") {
    return (
      <div className="ib-empty">
        <p className="ib-empty-t">Tes messages n&apos;ont pas pu être chargés.</p>
        <button className="ib-btn" onClick={() => { setStatus("loading"); load(); }}>Réessayer</button>
      </div>
    );
  }

  if (status === "ready" && convs.length === 0) {
    return (
      <div className="ib-empty">
        <span className="ib-empty-ico"><Chat size={28} /></span>
        <p className="ib-empty-t">Aucune conversation pour l&apos;instant.</p>
        <p className="ib-empty-s">
          Pour écrire à un parrain, ouvre l&apos;annuaire et clique sur {"« Contacter »"} sous son code.
          Quand quelqu&apos;un t&apos;écrit, la conversation arrive ici et un e-mail te prévient.
        </p>
        <Link href="/codes" className="ib-btn">Voir les codes</Link>
      </div>
    );
  }

  const other = active ? people[active.otherId] : undefined;
  const ann = active?.announcementId ? anns[active.announcementId] : undefined;

  return (
    <div className="ib" data-view={view}>
      {/* ── Liste ── */}
      <div className="ib-list" aria-label="Conversations">
        <div className="ib-list-head">
          <span>{convs.length} conversation{convs.length > 1 ? "s" : ""}</span>
          {totalUnread > 0 && <span className="ib-count">{totalUnread} non lu{totalUnread > 1 ? "s" : ""}</span>}
        </div>
        <ul className="ib-convs">
          {status === "loading"
            ? [0, 1, 2].map((i) => (
                <li key={i} className="ib-conv ib-conv-skel" aria-hidden="true">
                  <span className="ib-av" /><span className="ib-skel-lines"><i /><i /></span>
                </li>
              ))
            : convs.map((c) => {
                const p = people[c.otherId];
                const a = c.announcementId ? anns[c.announcementId] : undefined;
                const last = c.msgs[c.msgs.length - 1];
                const preview = last ? `${last.sender_id === me ? "Toi : " : ""}${last.content}` : "Nouvelle conversation";
                return (
                  <li key={c.key}>
                    <button
                      className={`ib-conv${c.key === activeKey ? " on" : ""}${c.unread ? " unread" : ""}`}
                      onClick={() => open(c)}
                      aria-current={c.key === activeKey ? "true" : undefined}
                    >
                      <Avatar person={p} />
                      <span className="ib-conv-body">
                        <span className="ib-conv-top">
                          <span className="ib-conv-name">{p?.pseudo ?? "Membre"}</span>
                          <span className="ib-conv-time">{listTime(c.lastAt)}</span>
                        </span>
                        {a?.company && <span className="ib-conv-brand">{a.company}</span>}
                        <span className="ib-conv-prev">{preview}</span>
                      </span>
                      {c.unread > 0 && <span className="ib-dot" aria-label={`${c.unread} non lu${c.unread > 1 ? "s" : ""}`} />}
                    </button>
                  </li>
                );
              })}
        </ul>
      </div>

      {/* ── Fil ── */}
      <section className="ib-thread" aria-label="Conversation">
        {!active ? (
          <p className="ib-thread-none">{status === "loading" ? "" : "Choisis une conversation."}</p>
        ) : (
          <>
            <header className="ib-thread-head">
              <button className="ib-back" onClick={() => setView("list")} aria-label="Retour aux conversations">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6" /></svg>
              </button>
              <Avatar person={other} size={38} />
              <div className="ib-head-txt">
                {other?.pseudo
                  ? <Link href={`/u/${encodeURIComponent(other.pseudo)}`} className="ib-head-name">{other.pseudo}</Link>
                  : <span className="ib-head-name">Membre</span>}
                {ann && (
                  <span className="ib-head-ann">
                    {ann.slug && active.announcementId
                      ? <Link href={`/code-parrainage/${ann.slug}#code-${active.announcementId}`}>{ann.company}</Link>
                      : ann.company}
                    <code>{ann.code}</code>
                  </span>
                )}
              </div>
            </header>

            <div className="ib-msgs" ref={threadRef}>
              {active.msgs.length === 0 && (
                <p className="ib-first">
                  Premier message à {other?.pseudo ?? "ce membre"}
                  {ann?.company ? <> au sujet de son code {ann.company}</> : null}.
                  Précise ce que tu comptes ouvrir, la réponse sera plus utile.
                </p>
              )}
              {active.msgs.map((m, i) => {
                const mine = m.sender_id === me;
                const prev = active.msgs[i - 1];
                const newDay = !prev || !sameDay(new Date(prev.created_at), new Date(m.created_at));
                return (
                  <div key={m.id} className="ib-msg-wrap">
                    {newDay && <p className="ib-day">{dayLabel(m.created_at)}</p>}
                    <div className={`ib-msg ${mine ? "me" : "them"}`}>
                      <p className="ib-bubble">{m.content}</p>
                      <time className="ib-time" dateTime={m.created_at}>{hhmm(new Date(m.created_at))}</time>
                    </div>
                  </div>
                );
              })}
            </div>

            <form className="ib-compose" onSubmit={(e) => { e.preventDefault(); send(); }}>
              <textarea
                ref={inputRef}
                className="ib-input"
                rows={1}
                maxLength={MAX_LEN}
                placeholder={`Écrire à ${other?.pseudo ?? "ce membre"}…`}
                aria-label="Ton message"
                value={draft}
                onChange={(e) => { setDraft(e.target.value); autoGrow(e.currentTarget); if (sendError) setSendError(null); }}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
              />
              <button type="submit" className="ib-send" disabled={!draft.trim() || sending}>
                {sending ? "Envoi…" : "Envoyer"}
              </button>
              {(sendError || draft.length > MAX_LEN - 200) && (
                <p className={`ib-compose-note${sendError ? " err" : ""}`} role={sendError ? "alert" : undefined}>
                  {sendError ?? `${MAX_LEN - draft.length} caractères restants`}
                </p>
              )}
            </form>
          </>
        )}
      </section>
    </div>
  );
}
