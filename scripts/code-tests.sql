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

-- 6. Verrou des compteurs (ajouté le 18 nov. 2026).
--    Les compteurs vivent sur la ligne de l'annonce, que son propriétaire a le
--    droit de modifier (bouton « Modifier », ou appel direct à l'API avec la
--    clé anon). Sans ce verrou, un parrain pourrait s'écrire « 500 réussites ».
--    Seul le recalcul ci-dessus peut les changer : il s'exécute depuis le
--    trigger de code_tests, donc à une profondeur de trigger > 1.
create or replace function public.proteger_compteurs_tests()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if pg_trigger_depth() > 1 then
    return new;  -- écriture venue du recalcul
  end if;
  if tg_op = 'INSERT' then
    new.tests_ok := 0;
    new.tests_ko := 0;
    new.last_tested_at := null;
  else
    new.tests_ok := old.tests_ok;
    new.tests_ko := old.tests_ko;
    new.last_tested_at := old.last_tested_at;
  end if;
  return new;
end;
$$;

drop trigger if exists announcements_proteger_compteurs on public.announcements;
create trigger announcements_proteger_compteurs
  before insert or update on public.announcements
  for each row execute function public.proteger_compteurs_tests();

-- Les fonctions ci-dessus renvoient « trigger » : PostgREST ne peut pas les
-- appeler en RPC, elles ne s'exécutent que comme triggers.

-- 7. Vérification (seul ce résultat s'affiche) : 3 lignes attendues.
select t.tgname as declencheur, t.tgrelid::regclass as table_
from pg_trigger t
where t.tgname in ('code_tests_counters', 'code_tests_pas_autotest', 'announcements_proteger_compteurs')
order by 1;
