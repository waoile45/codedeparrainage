-- ─────────────────────────────────────────────────────────────────────────────
-- Tests de codes : « ce code a-t-il fonctionné ? »
--
-- POURQUOI. Un code de parrainage est une donnée courte, que les moteurs
-- génératifs restituent directement : être cité pour « code parrainage X » ne
-- rapporte plus de visite, puisque la réponse EST le produit. La seule chose
-- qu'un modèle ne peut ni connaître ni inventer, c'est l'état ACTUEL d'un code
-- — testé il y a trois heures, 94 % de réussite sur 120 essais. Cette donnée
-- périme, donc elle oblige à revenir à la source.
--
-- CONCEPTION. Les compteurs sont dénormalisés sur `announcements` et tenus à
-- jour par trigger : les pages de listing affichent des centaines de codes, un
-- COUNT() par code à chaque rendu serait intenable.
--
-- À exécuter dans le SQL Editor Supabase.
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Compteurs dénormalisés sur la table des codes
alter table public.announcements
  add column if not exists tests_ok       integer     not null default 0 check (tests_ok >= 0),
  add column if not exists tests_ko       integer     not null default 0 check (tests_ko >= 0),
  add column if not exists last_tested_at timestamptz;

-- 2. Un test par utilisateur et par code. Un nouvel essai écrase le précédent
--    (upsert) : on veut l'état courant, pas un historique de votes.
create table if not exists public.code_tests (
  announcement_id uuid        not null references public.announcements (id) on delete cascade,
  user_id         uuid        not null references auth.users (id) on delete cascade,
  worked          boolean     not null,
  created_at      timestamptz not null default now(),
  primary key (announcement_id, user_id)
);

create index if not exists code_tests_announcement_idx
  on public.code_tests (announcement_id);

-- 3. Recalcul des compteurs à chaque écriture.
create or replace function public.refresh_code_test_counters()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  cible uuid := coalesce(new.announcement_id, old.announcement_id);
begin
  update public.announcements a
  set tests_ok = sub.ok,
      tests_ko = sub.ko,
      last_tested_at = sub.dernier
  from (
    select
      count(*) filter (where worked)       as ok,
      count(*) filter (where not worked)   as ko,
      max(created_at)                      as dernier
    from public.code_tests
    where announcement_id = cible
  ) sub
  where a.id = cible;
  return null;
end;
$$;

drop trigger if exists code_tests_counters on public.code_tests;
create trigger code_tests_counters
  after insert or update or delete on public.code_tests
  for each row execute function public.refresh_code_test_counters();

-- 4. RLS. Lecture publique (les compteurs sont l'argument commercial),
--    écriture réservée au propriétaire de la ligne.
alter table public.code_tests enable row level security;

drop policy if exists "code_tests lecture publique" on public.code_tests;
create policy "code_tests lecture publique"
  on public.code_tests for select
  using (true);

drop policy if exists "code_tests ecriture par son auteur" on public.code_tests;
create policy "code_tests ecriture par son auteur"
  on public.code_tests for insert
  with check (auth.uid() = user_id);

drop policy if exists "code_tests maj par son auteur" on public.code_tests;
create policy "code_tests maj par son auteur"
  on public.code_tests for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "code_tests suppression par son auteur" on public.code_tests;
create policy "code_tests suppression par son auteur"
  on public.code_tests for delete
  using (auth.uid() = user_id);

-- 5. Empêcher de tester son propre code. La règle vit aussi dans la route API,
--    mais la base doit la faire respecter : un client peut parler à Supabase
--    directement avec la clé anon.
create or replace function public.refuse_autotest()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if exists (
    select 1 from public.announcements
    where id = new.announcement_id and user_id = new.user_id
  ) then
    raise exception 'On ne teste pas son propre code.';
  end if;
  return new;
end;
$$;

drop trigger if exists code_tests_pas_autotest on public.code_tests;
create trigger code_tests_pas_autotest
  before insert or update on public.code_tests
  for each row execute function public.refuse_autotest();
