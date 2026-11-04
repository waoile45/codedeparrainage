-- Limite de publication : 10 annonces par compte sur 24 h glissantes.
--
-- POURQUOI EN BASE : /publier insère directement depuis le navigateur avec la
-- clé anon. Une limite dans le code client ne protège rien (le dépôt est public,
-- n'importe qui peut appeler l'API Supabase). Seul un trigger fait foi.
--
-- DÉCLENCHEUR : le 25 oct. 2026, le compte « Wobani » (créé la veille) a publié
-- 138 annonces en une heure, toutes avec la même description type, dont des
-- marques disparues (Luko) et un lien contenant l'email d'un tiers. Effet de
-- bord : +1 380 XP et des titres « N codes vérifiés » qui ne le sont pas.
--
-- À EXÉCUTER dans le SQL Editor Supabase. Idempotent.

create index if not exists announcements_user_created_idx
  on public.announcements (user_id, created_at desc);

create or replace function public.limite_publications()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (
    select count(*) from public.announcements
    where user_id = new.user_id
      and created_at > now() - interval '24 hours'
  ) >= 10 then
    -- Message court et stable : le client le reconnaît pour afficher un texte
    -- propre, sans renvoyer le détail interne de l'erreur.
    raise exception 'limite_publications' using errcode = 'P0001';
  end if;
  return new;
end;
$$;

drop trigger if exists limite_publications on public.announcements;
create trigger limite_publications
  before insert on public.announcements
  for each row execute function public.limite_publications();

-- ─────────────────────────────────────────────────────────────────────────────
-- NETTOYAGE DU LOT DU 25 OCTOBRE (à relire avant d'exécuter)
-- 1. Voir ce qui a été publié :
--
-- select a.id, c.name, a.code, a.created_at
-- from public.announcements a
-- join public.users u on u.id = a.user_id
-- join public.companies c on c.id = a.company_id
-- where u.pseudo = 'Wobani'
-- order by a.created_at;
--
-- 2. Retirer au minimum le lien Luko qui contient l'email d'un tiers
--    (donnée personnelle publiée sans consentement) :
--
-- delete from public.announcements
-- where user_id = (select id from public.users where pseudo = 'Wobani')
--   and code ilike '%40gmail.com%';
--
-- 3. Si le lot est jugé copié d'ailleurs, tout retirer et remettre l'XP à zéro :
--
-- delete from public.announcements
-- where user_id = (select id from public.users where pseudo = 'Wobani');
-- update public.users set xp = 0, level = 'Débutant' where pseudo = 'Wobani';
