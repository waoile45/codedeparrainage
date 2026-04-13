"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { createClient } from "@/lib/supabase";

interface Reply {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  likes: number;
  liked?: boolean;
  users?: { pseudo: string; level: string } | null;
}

interface Post {
  id: string;
  title: string;
  content: string;
  category: string;
  likes: number;
  created_at: string;
  user_id: string;
  liked?: boolean;
  users?: { pseudo: string; level: string } | null;
}

const CAT_COLORS: Record<string, string> = {
  Général: "#6366f1", Banque: "#3b82f6", "Paris Sportifs": "#10b981",
  Crypto: "#f59e0b", Cashback: "#ec4899", Téléphonie: "#8b5cf6", Astuce: "#14b8a6",
};
const CAT_ICONS: Record<string, string> = {
  Général: "💬", Banque: "🏦", "Paris Sportifs": "⚽",
  Crypto: "₿", Cashback: "💸", Téléphonie: "📱", Astuce: "💡",
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "à l'instant";
  if (m < 60) return `il y a ${m}min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `il y a ${h}h`;
  return `il y a ${Math.floor(h / 24)}j`;
}

function Avatar({ pseudo, size = 32 }: { pseudo: string; size?: number }) {
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: "linear-gradient(135deg,#7c3aed,#4f46e5)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.35, fontWeight: 800, color: "#fff", flexShrink: 0, fontFamily: "var(--font-syne),Syne,sans-serif" }}>
      {(pseudo?.[0] ?? "?").toUpperCase()}
    </div>
  );
}

export default function ForumPostPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [post, setPost]           = useState<Post | null>(null);
  const [replies, setReplies]     = useState<Reply[]>([]);
  const [loading, setLoading]     = useState(true);
  const [userId, setUserId]       = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id);
    });
    fetchAll();
  }, [id]);

  async function fetchAll() {
    setLoading(true);
    const supabase = createClient();

    const { data: rawPost } = await supabase
      .from("forum_posts")
      .select("*")
      .eq("id", id)
      .single();

    if (!rawPost) { setLoading(false); return; }

    const { data: rawReplies } = await supabase
      .from("forum_replies")
      .select("*")
      .eq("post_id", id)
      .order("created_at", { ascending: true });

    // Récupérer pseudos
    const userIds = [...new Set([rawPost.user_id, ...(rawReplies ?? []).map((r: Reply) => r.user_id)])];
    const { data: usersData } = await supabase
      .from("users")
      .select("id, pseudo, level")
      .in("id", userIds);
    const usersMap = Object.fromEntries((usersData ?? []).map((u: { id: string; pseudo: string; level: string }) => [u.id, u]));

    // Likes
    const { data: { user } } = await supabase.auth.getUser();
    let likedPosts = new Set<string>();
    let likedReplies = new Set<string>();
    if (user) {
      const [{ data: lp }, { data: lr }] = await Promise.all([
        supabase.from("forum_likes").select("post_id").eq("user_id", user.id),
        supabase.from("forum_reply_likes").select("reply_id").eq("user_id", user.id),
      ]);
      likedPosts = new Set((lp ?? []).map((l: { post_id: string }) => l.post_id));
      likedReplies = new Set((lr ?? []).map((l: { reply_id: string }) => l.reply_id));
    }

    setPost({ ...rawPost, users: usersMap[rawPost.user_id] ?? null, liked: likedPosts.has(rawPost.id) });
    setReplies((rawReplies ?? []).map((r: Reply) => ({ ...r, users: usersMap[r.user_id] ?? null, liked: likedReplies.has(r.id) })));
    setLoading(false);
  }

  async function handleLikePost() {
    if (!userId || !post) return;
    const supabase = createClient();
    if (post.liked) {
      await supabase.from("forum_likes").delete().eq("post_id", post.id).eq("user_id", userId);
      await supabase.from("forum_posts").update({ likes: Math.max(0, post.likes - 1) }).eq("id", post.id);
      setPost(p => p ? { ...p, liked: false, likes: p.likes - 1 } : p);
    } else {
      await supabase.from("forum_likes").insert({ post_id: post.id, user_id: userId });
      await supabase.from("forum_posts").update({ likes: post.likes + 1 }).eq("id", post.id);
      setPost(p => p ? { ...p, liked: true, likes: p.likes + 1 } : p);
    }
  }

  async function handleLikeReply(reply: Reply) {
    if (!userId) return;
    const supabase = createClient();
    if (reply.liked) {
      await supabase.from("forum_reply_likes").delete().eq("reply_id", reply.id).eq("user_id", userId);
      await supabase.from("forum_replies").update({ likes: Math.max(0, reply.likes - 1) }).eq("id", reply.id);
      setReplies(prev => prev.map(r => r.id === reply.id ? { ...r, liked: false, likes: r.likes - 1 } : r));
    } else {
      await supabase.from("forum_reply_likes").insert({ reply_id: reply.id, user_id: userId });
      await supabase.from("forum_replies").update({ likes: reply.likes + 1 }).eq("id", reply.id);
      setReplies(prev => prev.map(r => r.id === reply.id ? { ...r, liked: true, likes: r.likes + 1 } : r));
    }
  }

  async function handleReply(e: React.FormEvent) {
    e.preventDefault();
    if (!userId || !replyText.trim()) return;
    setSubmitting(true);
    const supabase = createClient();
    const { error } = await supabase.from("forum_replies").insert({
      post_id: id,
      user_id: userId,
      content: replyText.trim(),
      likes: 0,
    });
    if (!error) { setReplyText(""); fetchAll(); }
    setSubmitting(false);
  }

  if (loading) {
    return (
      <>
        <Navbar activePage="forum" />
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "4rem 1.5rem", textAlign: "center", color: "var(--text-dim)" }}>Chargement...</div>
      </>
    );
  }

  if (!post) {
    return (
      <>
        <Navbar activePage="forum" />
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "4rem 1.5rem", textAlign: "center" }}>
          <div style={{ fontSize: "2rem", marginBottom: 12 }}>😕</div>
          <div style={{ color: "var(--text-muted)" }}>Post introuvable</div>
          <a href="/forum" style={{ color: "#a78bfa", fontSize: ".875rem", display: "block", marginTop: 12 }}>← Retour au forum</a>
        </div>
      </>
    );
  }

  const color = CAT_COLORS[post.category] ?? "#6366f1";

  return (
    <>
      <style>{`
        .reply-card{background:var(--bg-card);border:1px solid var(--border);border-radius:14px;padding:1rem 1.25rem;margin-bottom:.625rem}
        .like-btn{display:inline-flex;align-items:center;gap:4px;background:none;border:1px solid var(--border-md);border-radius:8px;padding:3px 10px;cursor:pointer;color:var(--text-dim);font-size:.78rem;transition:all .18s;font-family:'DM Sans',sans-serif}
        .like-btn:hover,.like-btn.liked{background:rgba(124,58,237,.12);border-color:rgba(124,58,237,.35);color:#a78bfa}
        .level-badge{font-size:.65rem;font-weight:700;background:rgba(124,58,237,.2);color:#a78bfa;padding:1px 7px;border-radius:100px;border:1px solid rgba(124,58,237,.3)}
        .reply-input{width:100%;background:var(--bg-card-md);border:1px solid var(--border-md);border-radius:12px;padding:.75rem 1rem;color:var(--text-strong);font-family:'DM Sans',sans-serif;font-size:.9rem;outline:none;transition:border-color .18s;resize:vertical;min-height:80px;box-sizing:border-box;line-height:1.6}
        .reply-input:focus{border-color:rgba(124,58,237,.5)}
        .submit-btn{background:#7c3aed;color:#fff;border:none;border-radius:10px;padding:.5rem 1.25rem;font-size:.875rem;font-weight:600;cursor:pointer;transition:all .2s;font-family:'DM Sans',sans-serif}
        .submit-btn:hover{background:#6d28d9;transform:translateY(-1px)}
        .submit-btn:disabled{opacity:.5;cursor:not-allowed;transform:none}
      `}</style>

      <Navbar activePage="forum" />

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "2rem 1.5rem 5rem" }}>

        {/* Retour */}
        <a href="/forum" style={{ display: "inline-flex", alignItems: "center", gap: 5, color: "var(--text-dim)", fontSize: ".82rem", textDecoration: "none", marginBottom: "1.25rem", fontFamily: "'DM Sans',sans-serif" }}>
          ← Retour au forum
        </a>

        {/* Post principal */}
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 18, padding: "1.5rem", marginBottom: "1.5rem" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: ".72rem", fontWeight: 700, padding: "2px 8px", borderRadius: 6, background: `${color}18`, color, border: `1px solid ${color}30`, marginBottom: ".75rem" }}>
            {CAT_ICONS[post.category] ?? "💬"} {post.category}
          </div>
          <h1 style={{ fontFamily: "var(--font-syne),Syne,sans-serif", fontWeight: 800, fontSize: "1.35rem", color: "var(--text-strong)", margin: "0 0 .875rem", lineHeight: 1.3 }}>
            {post.title}
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: ".9rem", lineHeight: 1.7, margin: "0 0 1.25rem", whiteSpace: "pre-wrap" }}>
            {post.content}
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <Avatar pseudo={post.users?.pseudo ?? "?"} size={28} />
            <span style={{ fontSize: ".82rem", color: "var(--text-muted)", fontWeight: 500 }}>{post.users?.pseudo ?? "Utilisateur"}</span>
            {post.users?.level && <span className="level-badge">{post.users.level}</span>}
            <span style={{ fontSize: ".78rem", color: "var(--text-faint)" }}>{timeAgo(post.created_at)}</span>
            <button className={`like-btn ${post.liked ? "liked" : ""}`} onClick={handleLikePost} disabled={!userId}>
              ♥ {post.likes}
            </button>
          </div>
        </div>

        {/* Réponses */}
        <div style={{ marginBottom: "1rem" }}>
          <div style={{ fontSize: ".82rem", fontWeight: 700, color: "var(--text-dim)", marginBottom: ".875rem", fontFamily: "var(--font-syne),Syne,sans-serif" }}>
            {replies.length} réponse{replies.length !== 1 ? "s" : ""}
          </div>

          {replies.length === 0 && (
            <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 14, padding: "2rem", textAlign: "center", color: "var(--text-dim)", fontSize: ".875rem", marginBottom: "1rem" }}>
              Aucune réponse pour l'instant. Soyez le premier à répondre !
            </div>
          )}

          {replies.map(reply => (
            <div key={reply.id} className="reply-card">
              <p style={{ color: "var(--text-muted)", fontSize: ".875rem", lineHeight: 1.7, margin: "0 0 .875rem", whiteSpace: "pre-wrap" }}>
                {reply.content}
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <Avatar pseudo={reply.users?.pseudo ?? "?"} size={24} />
                <span style={{ fontSize: ".78rem", color: "var(--text-muted)", fontWeight: 500 }}>{reply.users?.pseudo ?? "Utilisateur"}</span>
                {reply.users?.level && <span className="level-badge">{reply.users.level}</span>}
                <span style={{ fontSize: ".75rem", color: "var(--text-faint)" }}>{timeAgo(reply.created_at)}</span>
                <button className={`like-btn ${reply.liked ? "liked" : ""}`} onClick={() => handleLikeReply(reply)} disabled={!userId}>
                  ♥ {reply.likes}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Formulaire de réponse */}
        {userId ? (
          <form onSubmit={handleReply} style={{ background: "var(--bg-card)", border: "1px solid rgba(124,58,237,.2)", borderRadius: 16, padding: "1.25rem" }}>
            <div style={{ fontSize: ".82rem", fontWeight: 700, color: "var(--text-strong)", marginBottom: ".75rem", fontFamily: "var(--font-syne),Syne,sans-serif" }}>
              Votre réponse
            </div>
            <textarea
              ref={textareaRef}
              className="reply-input"
              placeholder="Écrivez votre réponse..."
              value={replyText}
              onChange={e => setReplyText(e.target.value)}
              maxLength={2000}
              required
              style={{ marginBottom: ".75rem" }}
            />
            <button type="submit" className="submit-btn" disabled={submitting || !replyText.trim()}>
              {submitting ? "Publication..." : "Répondre"}
            </button>
          </form>
        ) : (
          <div style={{ background: "rgba(124,58,237,.05)", border: "1px solid rgba(124,58,237,.2)", borderRadius: 14, padding: "1rem 1.25rem", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
            <span style={{ color: "var(--text-muted)", fontSize: ".875rem" }}>Connectez-vous pour répondre</span>
            <a href="/login" style={{ background: "#7c3aed", color: "#fff", borderRadius: 10, padding: ".4rem .875rem", fontSize: ".82rem", fontWeight: 600, textDecoration: "none" }}>Se connecter</a>
          </div>
        )}
      </div>
    </>
  );
}
