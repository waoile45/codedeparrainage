-- ════════════════════════════════════════════════════════════════════════════
--  Correctifs de l'audit de sécurité du 23 novembre 2026
--
--  À exécuter UNE FOIS dans le SQL Editor Supabase du projet codedeparrainage,
--  JUSTE AVANT de déployer le code qui va avec (même commit). Script
--  rejouable : chaque bloc remplace ce qu'il crée.
--
--  Principe : le navigateur ne peut plus écrire que ce qu'un membre a le droit
--  de choisir (pseudo, bio, avatar, code, description, contenu d'un message).
--  Tout le reste (XP, niveau, série, remontées, compteurs) est calculé par la
--  base, dans des fonctions qu'un client ne peut pas contourner.
-- ════════════════════════════════════════════════════════════════════════════

begin;

-- ── 0. Outils : niveau et ajout d'XP ─────────────────────────────────────────
create or replace function public.niveau_pour_xp(p_xp integer)
returns text
language sql
immutable
as $$
  select case
    when p_xp >= 10000 then 'Parrain Légendaire'
    when p_xp >= 5000  then 'Super Parrain'
    when p_xp >= 2000  then 'Parrain Or'
    when p_xp >= 500   then 'Parrain Argent'
    when p_xp >= 100   then 'Parrain Bronze'
    else 'Débutant'
  end
$$;

create or replace function public.ajouter_xp(p_user uuid, p_xp integer)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.users
     set xp    = greatest(coalesce(xp, 0)::integer + p_xp, 0),
         level = public.niveau_pour_xp(greatest(coalesce(xp, 0)::integer + p_xp, 0))
   where id = p_user;
end;
$$;
-- Réservée aux triggers et fonctions ci-dessous : aucun client ne l'appelle.
revoke execute on function public.ajouter_xp(uuid, integer) from public, anon, authenticated;

-- ── 1. Règle 8 — profils : plus d'XP, de niveau ni de badge écrits par le client
-- 1a. Création du profil par la base, à l'inscription (email ou Google)
create or replace function public._creer_profil(p_id uuid, p_email text, p_meta jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  base     text;
  candidat text;
  i        integer := 0;
begin
  if exists (select 1 from public.users where id = p_id) then
    return;
  end if;
  base := left(coalesce(
    nullif(trim(p_meta->>'pseudo'), ''),
    nullif(trim(p_meta->>'full_name'), ''),
    nullif(trim(p_meta->>'name'), ''),
    nullif(split_part(coalesce(p_email, ''), '@', 1), ''),
    'Membre'), 30);
  candidat := base;
  while exists (select 1 from public.users where lower(pseudo) = lower(candidat)) loop
    i := i + 1;
    candidat := left(base, 26) || i::text;
  end loop;
  insert into public.users (id, email, pseudo) values (p_id, p_email, candidat)
  on conflict (id) do nothing;
end;
$$;
revoke execute on function public._creer_profil(uuid, text, jsonb) from public, anon, authenticated;

create or replace function public.creer_profil_inscription()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public._creer_profil(new.id, new.email, new.raw_user_meta_data);
  return new;
exception when others then
  return new;  -- un souci de profil ne doit jamais bloquer l'inscription
end;
$$;

drop trigger if exists creer_profil_inscription on auth.users;
create trigger creer_profil_inscription
  after insert on auth.users
  for each row execute function public.creer_profil_inscription();

-- Filet de sécurité appelé après connexion : crée le profil s'il manque.
create or replace function public.assurer_profil()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  u record;
begin
  if auth.uid() is null then
    return;
  end if;
  select id, email, raw_user_meta_data into u from auth.users where id = auth.uid();
  if found then
    perform public._creer_profil(u.id, u.email, u.raw_user_meta_data);
  end if;
end;
$$;
revoke execute on function public.assurer_profil() from public, anon;
grant execute on function public.assurer_profil() to authenticated;

-- 1b. Connexion du jour : série et +2 XP, une fois par jour (heure de Paris)
create or replace function public.enregistrer_connexion()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  u        record;
  aujourd  date := (now() at time zone 'Europe/Paris')::date;
  derniere date;
begin
  if auth.uid() is null then
    return;
  end if;
  select streak_days, last_login into u from public.users where id = auth.uid() for update;
  if not found then
    return;
  end if;
  derniere := (u.last_login at time zone 'Europe/Paris')::date;
  if derniere = aujourd then
    return;
  end if;
  update public.users
     set streak_days = case when derniere = aujourd - 1 then coalesce(u.streak_days, 0) + 1 else 1 end,
         last_login  = now()
   where id = auth.uid();
  perform public.ajouter_xp(auth.uid(), 2);
end;
$$;
revoke execute on function public.enregistrer_connexion() from public, anon;
grant execute on function public.enregistrer_connexion() to authenticated;

-- 1c. Droits : le membre ne modifie que pseudo, bio et avatar ; il ne crée plus sa ligne
drop policy if exists "Utilisateur peut créer son profil" on public.users;
revoke insert, update, delete on public.users from anon, authenticated;
grant update (pseudo, bio, avatar_url) on public.users to authenticated;

-- 1d. XP de publication : +10 à la création, −10 à la suppression (sinon
-- publier puis supprimer en boucle rapporterait de l'XP sans fin)
create or replace function public.xp_annonce()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    perform public.ajouter_xp(new.user_id, 10);
    return new;
  end if;
  perform public.ajouter_xp(old.user_id, -10);
  return old;
end;
$$;

drop trigger if exists xp_annonce on public.announcements;
create trigger xp_annonce
  after insert or delete on public.announcements
  for each row execute function public.xp_annonce();

-- ── 2. Règle 7 — annonces : plus de remontée ni de date écrites par le client
-- 2a. Limite de 10 publications par 24 h (script limite-publications.sql,
-- jamais appliqué jusqu'ici). created_at n'est plus modifiable par le client,
-- la limite ne se contourne donc plus.
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
    raise exception 'limite_publications' using errcode = 'P0001';
  end if;
  return new;
end;
$$;

drop trigger if exists limite_publications on public.announcements;
create trigger limite_publications
  before insert on public.announcements
  for each row execute function public.limite_publications();

-- 2b. Droits : création (à son nom, imposé par la règle existante) et
-- modification du code et de la description uniquement
revoke insert, update on public.announcements from anon, authenticated;
grant insert (user_id, company_id, code, description) on public.announcements to authenticated;
grant update (code, description) on public.announcements to authenticated;

-- 2c. Remontée atomique : 5 par jour (heure de Paris), +5 XP, ligne verrouillée
create or replace function public.remonter_annonce(p_announcement_id uuid)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  a       record;
  aujourd date := (now() at time zone 'Europe/Paris')::date;
  n       integer;
begin
  if auth.uid() is null then
    raise exception 'non_connecte' using errcode = 'P0001';
  end if;
  select user_id, bumps_today, last_bumped_at into a
    from public.announcements where id = p_announcement_id for update;
  if not found or a.user_id <> auth.uid() then
    raise exception 'annonce_introuvable' using errcode = 'P0001';
  end if;
  n := case
         when a.last_bumped_at is null
           or (a.last_bumped_at at time zone 'Europe/Paris')::date <> aujourd then 0
         else coalesce(a.bumps_today, 0)
       end;
  if n >= 5 then
    raise exception 'limite_remontees' using errcode = 'P0001';
  end if;
  update public.announcements
     set bumps_today = n + 1, last_bumped_at = now(), updated_at = now()
   where id = p_announcement_id;
  perform public.ajouter_xp(auth.uid(), 5);
  return 4 - n;  -- remontées restantes aujourd'hui
end;
$$;
revoke execute on function public.remonter_annonce(uuid) from public, anon;
grant execute on function public.remonter_annonce(uuid) to authenticated;

-- ── 3. Règle 14 — avis sur la plateforme : plus d'avis au nom d'un autre ────
-- Reste permis : un avis à son nom, ou un avis anonyme (user_id vide), comme
-- le prévoit la page /avis. Ces avis ne sont affichés nulle part.
drop policy if exists "allow insert" on public.platform_reviews;

-- +15 XP au premier avis seulement
create or replace function public.xp_avis_plateforme()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.user_id is not null
     and (select count(*) from public.platform_reviews where user_id = new.user_id) = 1 then
    perform public.ajouter_xp(new.user_id, 15);
  end if;
  return new;
end;
$$;

drop trigger if exists xp_avis_plateforme on public.platform_reviews;
create trigger xp_avis_plateforme
  after insert on public.platform_reviews
  for each row execute function public.xp_avis_plateforme();

-- ── 4. Règle 12 — avatars : images uniquement, 512 Ko maximum ───────────────
update storage.buckets
   set allowed_mime_types = array['image/webp', 'image/png', 'image/jpeg'],
       file_size_limit    = 524288
 where id = 'avatars';

drop policy if exists "delete own avatar" on storage.objects;
create policy "delete own avatar" on storage.objects
  for delete using (bucket_id = 'avatars' and (auth.uid())::text = (storage.foldername(name))[1]);

-- ── 5. Règle 7 — avis sur les annonces : un par membre et par annonce ───────
-- Doublons existants : on garde le plus ancien.
delete from public.reviews r
 using public.reviews r2
 where r.announcement_id = r2.announcement_id
   and r.reviewer_id = r2.reviewer_id
   and r.ctid > r2.ctid;

create unique index if not exists reviews_un_par_annonce
  on public.reviews (announcement_id, reviewer_id);

-- Le parrain noté est celui de l'annonce (plus de note envoyée à un tiers),
-- et on ne note pas sa propre annonce.
create or replace function public.avis_controle()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  proprio uuid;
begin
  select user_id into proprio from public.announcements where id = new.announcement_id;
  if proprio is null then
    raise exception 'annonce_introuvable' using errcode = 'P0001';
  end if;
  if proprio = new.reviewer_id then
    raise exception 'avis_sur_sa_propre_annonce' using errcode = 'P0001';
  end if;
  new.reviewed_user_id := proprio;
  return new;
end;
$$;

drop trigger if exists avis_controle on public.reviews;
create trigger avis_controle
  before insert on public.reviews
  for each row execute function public.avis_controle();

-- +20 XP au parrain pour un avis de 4 ou 5 (jamais versé jusqu'ici : la
-- route essayait de modifier la ligne d'un autre membre, refusé par la base)
create or replace function public.xp_avis_recu()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.rating >= 4 then
    perform public.ajouter_xp(new.reviewed_user_id, 20);
  end if;
  return new;
end;
$$;

drop trigger if exists xp_avis_recu on public.reviews;
create trigger xp_avis_recu
  after insert on public.reviews
  for each row execute function public.xp_avis_recu();

revoke insert, update on public.reviews from anon, authenticated;
grant insert (announcement_id, reviewer_id, reviewed_user_id, rating, comment) on public.reviews to authenticated;
grant update (rating, comment) on public.reviews to authenticated;

-- ── 6. Règle 14 — messages : expéditeur imposé, contenu non modifiable ──────
drop policy if exists "Utilisateur gère ses messages" on public.messages;
drop policy if exists messages_lecture on public.messages;
drop policy if exists messages_envoi on public.messages;
drop policy if exists messages_lu on public.messages;

create policy messages_lecture on public.messages
  for select using (auth.uid() = sender_id or auth.uid() = receiver_id);
create policy messages_envoi on public.messages
  for insert with check (auth.uid() = sender_id and receiver_id <> sender_id);
create policy messages_lu on public.messages
  for update using (auth.uid() = receiver_id) with check (auth.uid() = receiver_id);

revoke insert, update, delete on public.messages from anon, authenticated;
grant insert (sender_id, receiver_id, announcement_id, content) on public.messages to authenticated;
grant update (read) on public.messages to authenticated;

-- ── 7. Crédits : défense en profondeur (aucune règle d'écriture n'existait,
-- mais les droits de colonnes étaient ouverts) ────────────────────────────────
revoke insert, update, delete on public.credits from anon, authenticated;

commit;

-- ── Vérification (seul ce résultat s'affiche) ───────────────────────────────
select 'droits_colonnes' as type, table_name || ' ' || grantee || ' ' || privilege_type as objet,
       string_agg(column_name, ',' order by column_name) as detail
  from information_schema.column_privileges
 where table_schema = 'public'
   and table_name in ('users', 'credits', 'announcements', 'messages', 'reviews')
   and grantee in ('anon', 'authenticated') and privilege_type in ('INSERT', 'UPDATE')
 group by table_name, grantee, privilege_type
union all
select 'bucket', name, coalesce(array_to_string(allowed_mime_types, ','), 'TOUS') || ' / ' || coalesce(file_size_limit::text, 'AUCUNE')
  from storage.buckets where id = 'avatars'
union all
select 'trigger', event_object_table, string_agg(distinct trigger_name, ', ')
  from information_schema.triggers
 where trigger_schema in ('public', 'auth')
 group by event_object_table
order by 1, 2;
