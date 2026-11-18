-- ════════════════════════════════════════════════════════════════════════════
--  Traçage des copies de codes de parrainage
--
--  Objectif : savoir combien de visiteurs copient réellement un code, donnée
--  qui n'existait nulle part (on ne mesurait que les vues de page).
--
--  CHOIX DE CONCEPTION — aucune donnée personnelle n'est stockée.
--  Pas d'IP, pas de hash d'IP, pas d'identifiant de visiteur, pas de cookie :
--  uniquement « une copie a eu lieu sur cette annonce, à cet instant ». Il n'y
--  a donc rien à déclarer au RGPD et rien à purger. En contrepartie le chiffre
--  est approximatif : il compte des copies, pas des personnes. Deux garde-fous
--  limitent le gonflage — une garde par session côté navigateur et un rate
--  limit par IP côté serveur (voir /api/code-copy).
--
--  À exécuter dans le SQL Editor Supabase du projet codedeparrainage.
-- ════════════════════════════════════════════════════════════════════════════

create table if not exists public.code_copies (
  id              bigserial primary key,
  announcement_id uuid not null references public.announcements (id) on delete cascade,
  copied_at       timestamptz not null default now()
);

create index if not exists code_copies_ann_idx  on public.code_copies (announcement_id);
create index if not exists code_copies_date_idx on public.code_copies (copied_at desc);

-- Personne ne lit ni n'écrit cette table directement depuis le navigateur.
-- L'insertion passe par /api/code-copy (clé service_role, rate limitée) et la
-- lecture par /api/admin/code-copies. RLS activée sans aucune policy = tout
-- est refusé aux clés anon et authenticated ; service_role n'est pas soumis
-- à la RLS et reste donc le seul chemin.
alter table public.code_copies enable row level security;

-- ── Vue d'agrégation pour l'admin ───────────────────────────────────────────
-- Agréger côté base évite de rapatrier toutes les lignes pour les compter.
create or replace view public.code_copy_stats as
  select
    announcement_id,
    count(*)                                                            as total,
    count(*) filter (where copied_at > now() - interval '7 days')       as last_7d,
    count(*) filter (where copied_at > now() - interval '24 hours')     as last_24h,
    max(copied_at)                                                      as last_copy_at
  from public.code_copies
  group by announcement_id;

-- Une vue n'a pas de RLS propre : on la ferme par les droits.
revoke all on public.code_copy_stats from anon, authenticated;
grant select on public.code_copy_stats to service_role;
