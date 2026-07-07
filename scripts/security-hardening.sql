-- ─────────────────────────────────────────────────────────────────────────────
-- DURCISSEMENT COMPLÉMENTAIRE — findings de l'audit du 5 juillet 2026
-- À exécuter dans Supabase → SQL Editor. Chaque bloc est indépendant.
-- ─────────────────────────────────────────────────────────────────────────────

-- ═══ 0) NETTOYAGE — retirer la ligne de test insérée pendant l'audit ═══════════
-- (Un sondage a inséré {rating:5, comment:'zzprobe'} pour prouver que l'INSERT
--  anon était ouvert. À supprimer.)
DELETE FROM public.platform_reviews WHERE comment = 'zzprobe';

-- Combien d'avis existent déjà, et combien sont anonymes (spam potentiel) ?
-- SELECT count(*) AS total, count(*) FILTER (WHERE user_id IS NULL) AS anonymes
-- FROM public.platform_reviews;


-- ═══ 1) platform_reviews : anon peut INSÉRER des avis (spam / faux avis) ════════
-- Constat : POST anon → 201 (réussi). La page /avis autorise les avis anonymes
-- par design, mais sans auth ni rate-limit c'est un vecteur de spam qui manipule
-- la note affichée. DÉCISION PRODUIT :
--
--   Option A (recommandée) — exiger un compte pour laisser un avis :
--     (adapte le code /avis pour rediriger vers /login si non connecté)
--
--   Vérifie d'abord les policies existantes :
--     SELECT policyname, cmd, roles, qual, with_check
--     FROM pg_policies WHERE tablename = 'platform_reviews';
--
--   Puis remplace la policy INSERT permissive par une réservée aux connectés
--   qui écrivent SOUS LEUR PROPRE identité (empêche aussi l'usurpation user_id) :
--
--     DROP POLICY IF EXISTS "<nom_policy_insert_actuelle>" ON public.platform_reviews;
--     CREATE POLICY "insert_own_review" ON public.platform_reviews
--       FOR INSERT TO authenticated
--       WITH CHECK (auth.uid() = user_id);
--
--   Option B — garder l'anonyme mais brider l'abus : passer l'insertion par une
--   route serveur /api/reviews-plateforme avec Turnstile + rate-limit (comme
--   proposer-entreprise), et fermer l'INSERT direct côté table.


-- ═══ 2) users : INSERT anon permissif (intégrité de la gamification) ════════════
-- Constat : POST anon sur users → 409 FK (et non 401) = la RLS laisse passer,
-- seule la contrainte FK vers auth.users bloque. Un compte peut donc, à la
-- CRÉATION de sa ligne, fixer xp/level/badge_parrain_mois arbitraires.
-- (Les UPDATE anon sont déjà bloqués — vérifié.)
--
--   Vérifie la policy INSERT de users :
--     SELECT policyname, cmd, roles, qual, with_check
--     FROM pg_policies WHERE tablename = 'users';
--
--   Restreins l'INSERT à « je crée MA ligne » :
--     DROP POLICY IF EXISTS "<nom_policy_insert_users>" ON public.users;
--     CREATE POLICY "insert_self" ON public.users
--       FOR INSERT TO authenticated
--       WITH CHECK (auth.uid() = id);
--
-- NB intégrité XP : xp/level sont écrits CÔTÉ CLIENT (avis/profil). Même avec la
-- policy ci-dessus, un utilisateur connecté peut mettre à jour SA propre ligne
-- et donc gonfler son XP via l'API. Correctif durable = déplacer l'attribution
-- d'XP dans des routes serveur (service_role) ou un trigger, et retirer le droit
-- UPDATE(xp, level) à `authenticated`. (Chantier séparé, non bloquant.)
