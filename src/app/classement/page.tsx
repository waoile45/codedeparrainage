"use client";

import { useState, useEffect, useRef } from "react";
import Navbar from "@/components/Navbar";
import Image from "next/image";
import { createClient } from "@/lib/supabase";
import { Medal, Ticket, Flame } from "@/components/Pictos";
import "./classement.css";

// Classement des parrains. Une idée par écran : le podium dessiné (les marches
// montent à l'arrivée), les récompenses du mois, puis tout le classement avec
// une barre d'XP proportionnelle au premier, qui se remplit au défilement.
// Animations en transform/opacity uniquement.

interface Parrain {
  id: string;
  pseudo: string;
  level: string;
  xp: number;
  annonces: number;
  streak: number;
  avatarUrl?: string | null;
  isMe?: boolean;
}

const nf = (n: number) => n.toLocaleString("fr-FR");

// ── Compteur qui défile jusqu'à sa valeur (requestAnimationFrame) ─────────────
function Counter({ target, duration = 900 }: { target: number; duration?: number }) {
  const [v, setV] = useState(target);
  const done = useRef(false);
  useEffect(() => {
    if (done.current || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    done.current = true;
    const t0 = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const k = Math.min(1, (t - t0) / duration);
      setV(Math.round(target * (1 - Math.pow(1 - k, 3))));
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return <>{nf(v)}</>;
}

// ── Avatar : photo du membre, sinon son initiale sur le jaune ─────────────────
function Avatar({ pseudo, size = 44, avatarUrl }: { pseudo: string; size?: number; avatarUrl?: string | null }) {
  const [imgErr, setImgErr] = useState(false);
  return (
    <span className="cl-avatar" style={{ width: size, height: size, fontSize: size * 0.4 }}>
      {avatarUrl && !imgErr
        ? <Image src={avatarUrl} alt="" width={size} height={size} sizes={`${size}px`} onError={() => setImgErr(true)} />
        : pseudo[0]?.toUpperCase()}
    </span>
  );
}

// ── Podium : 2e, 1er, 3e ──────────────────────────────────────────────────────
function Podium({ top3 }: { top3: Parrain[] }) {
  // Deux images d'attente : le navigateur peint d'abord les marches en bas,
  // puis la classe déclenche la montée.
  const [up, setUp] = useState(false);
  useEffect(() => {
    let r2 = 0;
    const r1 = requestAnimationFrame(() => { r2 = requestAnimationFrame(() => setUp(true)); });
    return () => { cancelAnimationFrame(r1); cancelAnimationFrame(r2); };
  }, []);
  const order = [
    { p: top3[1], rank: 2 },
    { p: top3[0], rank: 1 },
    { p: top3[2], rank: 3 },
  ];
  return (
    <div className={`cl-podium${up ? " is-up" : ""}`}>
      {order.map(({ p, rank }) => p && (
        <div key={p.id} className={`cl-step cl-step-${rank}`}>
          <a href={`/u/${encodeURIComponent(p.pseudo)}`} className="cl-step-who">
            <Avatar pseudo={p.pseudo} size={rank === 1 ? 72 : 56} avatarUrl={p.avatarUrl} />
            <span className="cl-step-pseudo">{p.pseudo}{p.isMe && <span className="cl-me">toi</span>}</span>
            <span className="cl-step-xp tnum"><Counter target={p.xp} /> XP</span>
          </a>
          <div className="cl-block-clip">
            <div className="cl-block">
              <span className="cl-block-num" aria-label={`${rank}e`}>{rank}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Ligne du classement ───────────────────────────────────────────────────────
function RankRow({ parrain, rank, max }: { parrain: Parrain; rank: number; max: number }) {
  const ratio = max > 0 ? Math.max(0.015, parrain.xp / max) : 0;
  return (
    <li data-rank={rank} className={`cl-row reveal${parrain.isMe ? " is-me" : ""}`}>
      <span className="cl-rank tnum">{rank}</span>
      <Avatar pseudo={parrain.pseudo} size={40} avatarUrl={parrain.avatarUrl} />
      <span className="cl-who">
        <a href={`/u/${encodeURIComponent(parrain.pseudo)}`} className="cl-pseudo">{parrain.pseudo}</a>
        {parrain.isMe && <span className="cl-me">toi</span>}
        <span className="cl-level">{parrain.level}</span>
      </span>
      <span className="cl-stats">
        <span title="Codes publiés"><Ticket size={16} /> <span className="tnum">{parrain.annonces}</span></span>
        {parrain.streak > 1 && <span title="Jours de connexion d'affilée"><Flame size={16} /> <span className="tnum">{parrain.streak}</span></span>}
      </span>
      <span className="cl-xp">
        <span className="cl-xp-num tnum">{nf(parrain.xp)} <small>XP</small></span>
        <span className="cl-bar" aria-hidden="true"><span className="cl-bar-fill" style={{ ["--v" as string]: ratio }} /></span>
      </span>
    </li>
  );
}

function SkeletonRow() {
  return (
    <li className="cl-row cl-skel" aria-hidden="true">
      <span className="cl-rank" /><span className="cl-avatar" style={{ width: 40, height: 40 }} /><span className="cl-who"><span /></span>
    </li>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function ClassementPage() {
  const [parrains, setParrains] = useState<Parrain[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    async function fetchClassement() {
      const supabase = createClient();

      // Tous les membres, triés par XP. Plus de limite à 50 : les suivants
      // n'apparaissaient jamais (ni leur rang). La base renvoie au plus 1 000
      // lignes par requête, d'où le chargement par paquets.
      const PAGE = 1000;
      async function fetchAll<T>(build: (from: number, to: number) => PromiseLike<{ data: T[] | null }>): Promise<T[]> {
        const all: T[] = [];
        for (let from = 0; ; from += PAGE) {
          const { data } = await build(from, from + PAGE - 1);
          all.push(...(data ?? []));
          if (!data || data.length < PAGE) break;
        }
        return all;
      }

      // Les trois lectures partent en même temps (avant : l'une après l'autre).
      // La session est lue localement, sans aller-retour réseau : elle sert
      // seulement à surligner la ligne du membre connecté.
      const [{ data: { session } }, users, countRows] = await Promise.all([
        supabase.auth.getSession(),
        fetchAll<{ id: string; pseudo: string | null; xp: number | null; level: string | null; streak_days: number | null; avatar_url: string | null }>(
          (from, to) => supabase
            .from("users")
            .select("id, pseudo, xp, level, streak_days, avatar_url")
            .order("xp", { ascending: false })
            .order("id", { ascending: true })
            .range(from, to)
        ),
        // Compter les annonces par membre (même plafond de 1 000 lignes par requête)
        fetchAll<{ user_id: string }>(
          (from, to) => supabase
            .from("announcements")
            .select("user_id")
            .order("id", { ascending: true })
            .range(from, to)
        ),
      ]);
      const user = session?.user ?? null;

      if (users.length === 0) { setLoading(false); return; }

      const annonceCount: Record<string, number> = {};
      for (const row of countRows ?? []) {
        annonceCount[row.user_id] = (annonceCount[row.user_id] ?? 0) + 1;
      }

      const data: Parrain[] = users.map(u => ({
        id:       u.id,
        pseudo:   u.pseudo ?? "Anonyme",
        level:    u.level  ?? "Débutant",
        xp:       u.xp     ?? 0,
        annonces: annonceCount[u.id] ?? 0,
        avatarUrl: u.avatar_url ?? null,
        streak:  u.streak_days ?? 0,
        isMe:    user?.id === u.id,
      }));

      setParrains(data);
      setLoading(false);
    }

    fetchClassement();
  }, []);

  const sorted = [...parrains].sort((a, b) => b.xp - a.xp || b.annonces - a.annonces);
  const top3   = sorted.slice(0, 3);
  const rest   = sorted.slice(3);
  const meRank = sorted.findIndex((p) => p.isMe) + 1;
  const me     = sorted.find((p) => p.isMe);
  const maxXp  = sorted[0]?.xp ?? 0;
  const totalAnnonces = parrains.reduce((a, p) => a + p.annonces, 0);
  const publishers    = parrains.filter((p) => p.annonces > 0).length;

  const REWARDS = [
    { rank: 1, items: ["Badge « Top 1 » permanent sur ton profil", "Mention « Parrain du mois » pendant 30 jours", "5 crédits de boost"] },
    { rank: 2, items: ["Badge « Top 2 » permanent", "3 crédits de boost"] },
    { rank: 3, items: ["Badge « Top 3 » permanent", "1 crédit de boost"] },
  ];

  return (
    <div className="cl">
      <Navbar activePage="classement" />

      <main>
        {/* ── En-tête + podium ── */}
        <section className="cl-hero">
          <div className="wrap">
            <h1 className="cl-title">Classement des parrains</h1>
            <p className="cl-lede">
              {loading
                ? "Les membres classés par XP. Chaque code publié rapporte 10 XP."
                : <>{nf(sorted.length)} membres classés par XP, dont {nf(publishers)} qui ont publié au moins un code ({nf(totalAnnonces)} codes en tout). Chaque code publié rapporte 10 XP.</>}
            </p>

            {loading ? (
              <div className="cl-podium cl-podium-skel" aria-hidden="true">
                <div className="cl-step cl-step-2"><div className="cl-block-clip"><div className="cl-block" /></div></div>
                <div className="cl-step cl-step-1"><div className="cl-block-clip"><div className="cl-block" /></div></div>
                <div className="cl-step cl-step-3"><div className="cl-block-clip"><div className="cl-block" /></div></div>
              </div>
            ) : top3.length >= 3 ? (
              <Podium top3={top3} />
            ) : null}
          </div>
        </section>

        {/* ── Récompenses du mois ── */}
        <section className="band-paper cl-rewards">
          <div className="wrap cl-rewards-grid">
            <div>
              <h2 className="reveal">Ce que gagnent les trois premiers</h2>
              <p className="cl-rewards-lede reveal" data-delay="1">Remis le 1er de chaque mois, d&apos;après le classement de la veille.</p>
            </div>
            <ol className="cl-rewards-list">
              {REWARDS.map((r) => (
                <li key={r.rank} className="reveal" data-delay={String(r.rank)}>
                  <Medal rank={r.rank} size={34} />
                  <span>
                    <strong>{r.rank === 1 ? "1er" : `${r.rank}e`}</strong>
                    {r.items.join(", ")}.
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ── Tout le classement ── */}
        <section className="cl-list-section">
          <div className="wrap">
            <div className="cl-list-head">
              <h2>Tout le classement</h2>
              {!loading && <span className="cl-count tnum">{nf(sorted.length)} membres</span>}
            </div>
            <ol className="cl-list">
              {loading
                ? Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
                : rest.map((p, i) => <RankRow key={p.id} parrain={p} rank={i + 4} max={maxXp} />)}
            </ol>
          </div>
        </section>

        {/* ── Ma position (si hors podium) ── */}
        {!loading && me && meRank > 3 && (
          <div className="cl-mine">
            <Avatar pseudo={me.pseudo} size={34} avatarUrl={me.avatarUrl} />
            <span className="cl-mine-txt">
              Tu es <strong className="tnum">{meRank}e</strong> sur {nf(sorted.length)}
              {sorted[meRank - 2] && <> ; il te manque <strong className="tnum">{nf(sorted[meRank - 2].xp - me.xp + 1)} XP</strong> pour passer devant {sorted[meRank - 2].pseudo}</>}
            </span>
            <a href="/publier" className="btn btn-accent">Publier un code</a>
          </div>
        )}

        {/* ── Dernier écran ── */}
        <section className="cl-final">
          <div className="wrap">
            <h2 className="display-wide reveal">Un code publié, c&apos;est 10 XP de plus.</h2>
            <a href="/publier" className="btn btn-ink reveal" data-delay="1">Publier mon code</a>
          </div>
        </section>
      </main>
    </div>
  );
}
