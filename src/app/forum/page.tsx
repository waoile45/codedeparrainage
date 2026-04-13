"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { createClient } from "@/lib/supabase";

interface Post {
  id: string;
  title: string;
  content: string;
  category: string;
  likes: number;
  created_at: string;
  users: { pseudo: string; level: string } | null;
  user_id: string;
  liked?: boolean;
}

const CATS = ["Tout", "Général", "Banque", "Paris Sportifs", "Crypto", "Cashback", "Téléphonie", "Astuce"];
const CAT_ICONS: Record<string, string> = {
  Tout: "✦", Général: "💬", Banque: "🏦", "Paris Sportifs": "⚽",
  Crypto: "₿", Cashback: "💸", Téléphonie: "📱", Astuce: "💡",
};
const CAT_COLORS: Record<string, string> = {
  Général: "#6366f1", Banque: "#3b82f6", "Paris Sportifs": "#10b981",
  Crypto: "#f59e0b", Cashback: "#ec4899", Téléphonie: "#8b5cf6", Astuce: "#14b8a6",
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

export default function ForumPage() {
  const [posts, setPosts]         = useState<Post[]>([]);
  const [cat, setCat]             = useState("Tout");
  const [loading, setLoading]     = useState(true);
  const [userId, setUserId]       = useState<string | null>(null);
  const [pseudo, setPseudo]       = useState("");
  const [showForm, setShowForm]   = useState(false);
  const [title, setTitle]         = useState("");
  const [content, setContent]     = useState("");
  const [newCat, setNewCat]       = useState("Général");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]         = useState("");

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      setUserId(user.id);
      const { data: p } = await supabase.from("users").select("pseudo").eq("id", user.id).single();
      setPseudo(p?.pseudo ?? "");
    });
    fetchPosts();
  }, []);

  async function fetchPosts() {
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("forum_posts")
      .select("*, users(pseudo, level)")
      .order("created_at", { ascending: false })
      .limit(100);

    const { data: { user } } = await supabase.auth.getUser();
    if (user && data) {
      const { data: liked } = await supabase
        .from("forum_likes")
        .select("post_id")
        .eq("user_id", user.id);
      const likedSet = new Set((liked ?? []).map((l: { post_id: string }) => l.post_id));
      setPosts((data ?? []).map((p: Post) => ({ ...p, liked: likedSet.has(p.id) })));
    } else {
      setPosts(data ?? []);
    }
    setLoading(false);
  }

  async function handleLike(post: Post) {
    if (!userId) return;
    const supabase = createClient();
    if (post.liked) {
      await supabase.from("forum_likes").delete().eq("post_id", post.id).eq("user_id", userId);
      await supabase.from("forum_posts").update({ likes: Math.max(0, post.likes - 1) }).eq("id", post.id);
    } else {
      await supabase.from("forum_likes").insert({ post_id: post.id, user_id: userId });
      await supabase.from("forum_posts").update({ likes: post.likes + 1 }).eq("id", post.id);
    }
    setPosts(prev => prev.map(p => p.id === post.id
      ? { ...p, liked: !post.liked, likes: post.liked ? p.likes - 1 : p.likes + 1 }
      : p
    ));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!userId || !title.trim() || !content.trim()) return;
    setSubmitting(true);
    setError("");
    const supabase = createClient();
    const { error: err } = await supabase.from("forum_posts").insert({
      user_id: userId,
      title: title.trim(),
      content: content.trim(),
      category: newCat,
      likes: 0,
    });
    if (err) { setError("Erreur lors de la publication."); setSubmitting(false); return; }
    setTitle(""); setContent(""); setShowForm(false);
    fetchPosts();
    setSubmitting(false);
  }

  const filtered = cat === "Tout" ? posts : posts.filter(p => p.category === cat);

  return (
    <>
      <style>{`
        .forum-wrap{max-width:860px;margin:0 auto;padding:2rem 1.5rem 4rem}
        .forum-header{margin-bottom:2rem}
        .forum-cats{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:1.75rem}
        .forum-cat-btn{display:inline-flex;align-items:center;gap:5px;padding:.35rem .75rem;border-radius:10px;border:1px solid var(--border-md);background:var(--bg-card-md);color:var(--text-muted);font-size:.8rem;font-weight:500;cursor:pointer;transition:all .18s;font-family:'DM Sans',sans-serif}
        .forum-cat-btn:hover,.forum-cat-btn.active{background:rgba(124,58,237,.15);border-color:rgba(124,58,237,.35);color:#c4b5fd}
        .forum-card{background:var(--bg-card);border:1px solid var(--border);border-radius:16px;padding:1.25rem 1.5rem;margin-bottom:.75rem;transition:border-color .18s,box-shadow .18s;cursor:pointer}
        .forum-card:hover{border-color:rgba(124,58,237,.3);box-shadow:0 4px 24px rgba(0,0,0,.15)}
        .forum-cat-tag{display:inline-flex;align-items:center;gap:4px;font-size:.72rem;font-weight:700;padding:2px 8px;border-radius:6px;margin-bottom:.5rem}
        .forum-title{font-family:'Syne',sans-serif;font-weight:700;font-size:1.05rem;color:var(--text-strong);margin-bottom:.4rem;line-height:1.3}
        .forum-content{color:var(--text-muted);font-size:.875rem;line-height:1.6;margin-bottom:.875rem;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
        .forum-meta{display:flex;align-items:center;gap:12px;font-size:.78rem;color:var(--text-dim)}
        .forum-like-btn{display:inline-flex;align-items:center;gap:4px;background:none;border:1px solid var(--border-md);border-radius:8px;padding:3px 10px;cursor:pointer;color:var(--text-dim);font-size:.78rem;transition:all .18s;font-family:'DM Sans',sans-serif}
        .forum-like-btn:hover,.forum-like-btn.liked{background:rgba(124,58,237,.12);border-color:rgba(124,58,237,.35);color:#a78bfa}
        .forum-new-btn{display:inline-flex;align-items:center;gap:6px;background:#7c3aed;color:#fff;border:none;border-radius:12px;padding:.55rem 1.25rem;font-size:.875rem;font-weight:600;cursor:pointer;transition:all .2s;font-family:'DM Sans',sans-serif}
        .forum-new-btn:hover{background:#6d28d9;transform:translateY(-1px);box-shadow:0 4px 16px rgba(124,58,237,.4)}
        .forum-form{background:var(--bg-card);border:1px solid rgba(124,58,237,.25);border-radius:18px;padding:1.5rem;margin-bottom:1.5rem}
        .forum-input{width:100%;background:var(--bg-card-md);border:1px solid var(--border-md);border-radius:10px;padding:.65rem .875rem;color:var(--text-strong);font-family:'DM Sans',sans-serif;font-size:.9rem;outline:none;transition:border-color .18s;box-sizing:border-box}
        .forum-input:focus{border-color:rgba(124,58,237,.5)}
        .forum-textarea{min-height:100px;resize:vertical;line-height:1.6}
        .forum-empty{text-align:center;padding:3rem 1rem;color:var(--text-dim);font-size:.95rem}
        .level-badge{font-size:.65rem;font-weight:700;background:rgba(124,58,237,.2);color:#a78bfa;padding:1px 7px;border-radius:100px;border:1px solid rgba(124,58,237,.3)}
      `}</style>

      <Navbar activePage="home" />

      <div className="forum-wrap">
        {/* Header */}
        <div className="forum-header" style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", flexWrap:"wrap", gap:12 }}>
          <div>
            <h1 style={{ fontFamily:"var(--font-syne),Syne,sans-serif", fontWeight:800, fontSize:"1.75rem", color:"var(--text-strong)", margin:0, marginBottom:6 }}>
              Communauté 💬
            </h1>
            <p style={{ color:"var(--text-muted)", fontSize:".9rem", margin:0 }}>
              Partagez vos astuces, posez vos questions sur les codes de parrainage.
            </p>
          </div>
          {userId && (
            <button className="forum-new-btn" onClick={() => setShowForm(v => !v)}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Nouveau post
            </button>
          )}
        </div>

        {/* New post form */}
        {showForm && userId && (
          <form className="forum-form" onSubmit={handleSubmit}>
            <div style={{ marginBottom:".75rem", fontFamily:"var(--font-syne),Syne,sans-serif", fontWeight:700, fontSize:"1rem", color:"var(--text-strong)" }}>Nouveau post</div>
            <div style={{ display:"flex", gap:8, marginBottom:".75rem", flexWrap:"wrap" }}>
              {CATS.filter(c => c !== "Tout").map(c => (
                <button key={c} type="button"
                  onClick={() => setNewCat(c)}
                  style={{ padding:".3rem .7rem", borderRadius:9, border:`1px solid ${newCat===c ? "rgba(124,58,237,.5)" : "var(--border-md)"}`, background:newCat===c ? "rgba(124,58,237,.15)" : "var(--bg-card-md)", color:newCat===c ? "#c4b5fd" : "var(--text-muted)", fontSize:".78rem", fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
                  {CAT_ICONS[c]} {c}
                </button>
              ))}
            </div>
            <input className="forum-input" style={{ marginBottom:".75rem" }} placeholder="Titre de votre post..." value={title} onChange={e => setTitle(e.target.value)} maxLength={120} required />
            <textarea className="forum-input forum-textarea" style={{ marginBottom:".75rem" }} placeholder="Votre question ou astuce..." value={content} onChange={e => setContent(e.target.value)} maxLength={2000} required />
            {error && <div style={{ color:"#f87171", fontSize:".82rem", marginBottom:".5rem" }}>{error}</div>}
            <div style={{ display:"flex", gap:8 }}>
              <button type="submit" disabled={submitting} className="forum-new-btn" style={{ opacity:submitting?.5:1 }}>
                {submitting ? "Publication..." : "Publier"}
              </button>
              <button type="button" onClick={() => setShowForm(false)} style={{ padding:".55rem 1rem", borderRadius:12, border:"1px solid var(--border-md)", background:"none", color:"var(--text-muted)", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontSize:".875rem" }}>
                Annuler
              </button>
            </div>
          </form>
        )}

        {!userId && (
          <div style={{ background:"rgba(124,58,237,.05)", border:"1px solid rgba(124,58,237,.2)", borderRadius:14, padding:"1rem 1.25rem", marginBottom:"1.5rem", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:10 }}>
            <span style={{ color:"var(--text-muted)", fontSize:".875rem" }}>Connectez-vous pour participer à la communauté</span>
            <a href="/login" style={{ background:"#7c3aed", color:"#fff", borderRadius:10, padding:".4rem .875rem", fontSize:".82rem", fontWeight:600, textDecoration:"none" }}>Se connecter</a>
          </div>
        )}

        {/* Category filter */}
        <div className="forum-cats">
          {CATS.map(c => (
            <button key={c} className={`forum-cat-btn ${cat===c?"active":""}`} onClick={() => setCat(c)}>
              {CAT_ICONS[c]} {c}
            </button>
          ))}
        </div>

        {/* Posts */}
        {loading ? (
          <div className="forum-empty">Chargement...</div>
        ) : filtered.length === 0 ? (
          <div className="forum-empty">
            <div style={{ fontSize:"2rem", marginBottom:8 }}>💬</div>
            <div>Aucun post dans cette catégorie. Soyez le premier !</div>
          </div>
        ) : (
          filtered.map(post => {
            const color = CAT_COLORS[post.category] ?? "#6366f1";
            return (
              <div key={post.id} className="forum-card">
                <div className="forum-cat-tag" style={{ background:`${color}18`, color, border:`1px solid ${color}30` }}>
                  {CAT_ICONS[post.category] ?? "💬"} {post.category}
                </div>
                <div className="forum-title">{post.title}</div>
                <div className="forum-content">{post.content}</div>
                <div className="forum-meta">
                  <span style={{ display:"flex", alignItems:"center", gap:5 }}>
                    <span style={{ width:22, height:22, borderRadius:"50%", background:"linear-gradient(135deg,#7c3aed,#4f46e5)", display:"inline-flex", alignItems:"center", justifyContent:"center", fontSize:".7rem", color:"#fff", fontWeight:800, flexShrink:0 }}>
                      {(post.users?.pseudo?.[0] ?? "?").toUpperCase()}
                    </span>
                    <span style={{ color:"var(--text-muted)", fontWeight:500 }}>{post.users?.pseudo ?? "Utilisateur"}</span>
                    {post.users?.level && <span className="level-badge">{post.users.level}</span>}
                  </span>
                  <span>{timeAgo(post.created_at)}</span>
                  <button
                    className={`forum-like-btn ${post.liked ? "liked" : ""}`}
                    onClick={() => handleLike(post)}
                    disabled={!userId}
                  >
                    ♥ {post.likes}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </>
  );
}
