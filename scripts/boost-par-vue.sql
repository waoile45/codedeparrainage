-- ═══════════════════════════════════════════════════════════════════════════
-- Boost au réel (facturation par vue) — migration
-- À exécuter dans le SQL Editor Supabase AVANT de déployer le code correspondant.
-- Rétro-compatible : l'ancien code (boosts à durée) continue de fonctionner
-- après cette migration, le nouveau code en a besoin.
--
-- Variable d'environnement requise sur Vercel avant le déploiement :
--   BOOST_VIEW_PEPPER = chaîne aléatoire longue, gardée secrète.
--   Sans elle, /api/boost-view répond 503 et ne compte aucune vue (fail-closed).
--   Ce dépôt est public : un pepper connu rendrait les IP hachées
--   ré-identifiables par recherche exhaustive sur l'espace IPv4.
-- ═══════════════════════════════════════════════════════════════════════════

-- 1. Nouveau modèle sur la table boosts
--    cost_per_view : prix débité par vue (0.10) — NULL pour les anciens boosts à durée
--    views_charged : compteur de vues effectivement facturées
alter table public.boosts
  add column if not exists cost_per_view numeric(6,2),
  add column if not exists views_charged integer not null default 0;

-- Les boosts par vue n'ont ni durée ni date de fin
alter table public.boosts alter column days drop not null;
alter table public.boosts alter column ends_at drop not null;

-- 2. Déduplication des vues : 1 vue max par visiteur (IP hachée) / annonce / jour
create table if not exists public.boost_views (
  boost_id   uuid not null references public.boosts(id) on delete cascade,
  ip_hash    text not null,
  seen_on    date not null default current_date,
  created_at timestamptz not null default now(),
  primary key (boost_id, ip_hash, seen_on)
);

-- RLS activée SANS policy : la table n'est accessible qu'au service_role
-- (le comptage passe exclusivement par la route serveur /api/boost-view)
alter table public.boost_views enable row level security;
revoke all on public.boost_views from anon, authenticated;

-- 3. Index pour la recherche des boosts actifs par annonce (route boost-view)
create index if not exists boosts_announcement_active_idx
  on public.boosts (announcement_id) where active;

-- 4. Facturation atomique d'une vue
--    Tout se joue dans une seule transaction. Le débit s'écrit
--    `balance = balance - cost WHERE balance >= cost` : Postgres verrouille la
--    ligne, donc deux vues simultanées se sérialisent au lieu de partir toutes
--    les deux du même solde lu à l'avance (sinon une vue passe gratuite).
create or replace function public.charge_boost_views(
  p_announcement_ids uuid[],
  p_ip_hash          text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  b record;
begin
  for b in
    select id, user_id, cost_per_view
      from public.boosts
     where announcement_id = any(p_announcement_ids)
       and active
       and cost_per_view is not null
  loop
    -- 1 vue max par visiteur / annonce / jour
    insert into public.boost_views (boost_id, ip_hash)
    values (b.id, p_ip_hash)
    on conflict do nothing;

    if not found then
      continue;  -- déjà comptée aujourd'hui
    end if;

    update public.credits
       set balance    = balance - b.cost_per_view,
           updated_at = now()
     where user_id = b.user_id
       and balance >= b.cost_per_view;

    if not found then
      -- Solde épuisé : on annule la vue (elle sera facturable après recharge)
      -- et on met le boost en pause. Le webhook Stripe le réactive.
      delete from public.boost_views
       where boost_id = b.id and ip_hash = p_ip_hash and seen_on = current_date;
      update public.boosts set active = false where id = b.id;
      continue;
    end if;

    update public.boosts
       set views_charged = views_charged + 1
     where id = b.id;
  end loop;
end;
$$;

-- Le comptage passe exclusivement par la route serveur (service_role)
revoke all on function public.charge_boost_views(uuid[], text) from public, anon, authenticated;
grant execute on function public.charge_boost_views(uuid[], text) to service_role;

-- ── Vérifications après exécution ────────────────────────────────────────────
-- select column_name, is_nullable from information_schema.columns
--   where table_name = 'boosts' and column_name in ('days','ends_at','cost_per_view','views_charged');
-- select * from public.boost_views limit 1;  -- doit répondre (vide), pas d'erreur
-- select proname from pg_proc where proname = 'charge_boost_views';
