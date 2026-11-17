-- Catégorie « autre » pour companies.category + ajout de Nous Portal.
--
-- POURQUOI : la contrainte companies_category_check n'accepte qu'une liste
-- fermée de secteurs. Le 17 nov. 2026, l'ajout de Nous Portal (plateforme
-- d'IA, hors des 8 secteurs) depuis l'admin a échoué en 23514. Le code
-- (admin, route /api/admin/companies, /publier) propose « autre » depuis b4060dc.
--
-- La nouvelle liste reprend les 8 secteurs du code, « bourse » (présent dans
-- l'accueil, au cas où l'ancienne règle l'autorisait) et « autre ».
-- Les lignes existantes n'utilisent que banque, paris, energie, telephonie
-- et shopping : la recréation de la contrainte ne rejette aucune ligne.
--
-- À EXÉCUTER dans le SQL Editor Supabase. Idempotent (relançable sans effet).

begin;

alter table public.companies drop constraint if exists companies_category_check;
alter table public.companies add constraint companies_category_check
  check (category in ('banque', 'paris', 'cashback', 'energie', 'telephonie',
                      'crypto', 'assurance', 'shopping', 'bourse', 'autre'));

-- slug = domaine : c'est la clé que /publier utilise pour retrouver la marque.
-- url_slug = adresse de la page /code-parrainage/nous-portal.
insert into public.companies (name, slug, url_slug, category, logo_url)
select 'Nous Portal', 'portal.nousresearch.com', 'nous-portal', 'autre',
       'https://www.google.com/s2/favicons?domain=portal.nousresearch.com&sz=64'
where not exists (
  select 1 from public.companies where slug = 'portal.nousresearch.com'
);

commit;

-- Vérification (seul ce dernier résultat s'affiche dans le SQL Editor) :
-- une ligne attendue, catégorie « autre ».
select id, name, slug, url_slug, category
from public.companies
where slug = 'portal.nousresearch.com';
