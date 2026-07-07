-- ─────────────────────────────────────────────────────────────────────────────
-- CORRECTIF SÉCURITÉ — Fuite des emails via la clé anon publique
-- ─────────────────────────────────────────────────────────────────────────────
-- Contexte : la table public.users a une policy SELECT permissive (lecture
-- publique du pseudo/xp/level pour l'annuaire et les profils). Mais la RLS est
-- ROW-level : elle ne peut pas masquer une COLONNE. Résultat, la colonne `email`
-- (27 emails réels au moment de l'audit) est lisible par quiconque possède la
-- clé anon publique (visible dans le bundle JS du site).
--
-- La RLS sur les ÉCRITURES est correcte (INSERT/UPDATE/DELETE bloqués pour anon,
-- vérifié) — seul le périmètre de LECTURE des colonnes est à restreindre.
--
-- ⚠️ PIÈGE POSTGRESQL : Supabase accorde par défaut `GRANT ALL ON ALL TABLES
-- ... TO anon, authenticated`, soit un SELECT au niveau TABLE (toutes colonnes).
-- Un `REVOKE SELECT (email)` au niveau COLONNE est alors un no-op. Il faut donc
-- retirer le SELECT au niveau table PUIS re-donner uniquement les colonnes
-- publiques. C'est ce que fait le script ci-dessous.
--
-- Aucun code front ne lit users.email (vérifié). Les routes serveur qui en ont
-- besoin (notifs Resend) utilisent le service_role, qui garde son propre GRANT
-- ALL → elles continuent de fonctionner. À exécuter dans Supabase → SQL Editor.
-- ─────────────────────────────────────────────────────────────────────────────

-- 1) Retirer le SELECT au niveau table (celui qui couvre TOUTES les colonnes).
REVOKE SELECT ON public.users FROM anon, authenticated;

-- 2) Re-donner la lecture des seules colonnes publiques (toutes SAUF email).
GRANT SELECT (
  id, pseudo, avatar_url, bio, xp, level,
  streak_days, last_login, created_at, badge_parrain_mois
) ON public.users TO anon, authenticated;

-- ─────────────────────────────────────────────────────────────────────────────
-- VÉRIFICATION (après exécution) :
--   SELECT email FROM ... via clé anon  → doit échouer en 401/403 (fuite fermée)
--   SELECT pseudo,xp,level              → doit toujours marcher (annuaire/profils)
-- (Le script Node verify-fix.mjs le teste automatiquement.)
-- ─────────────────────────────────────────────────────────────────────────────
