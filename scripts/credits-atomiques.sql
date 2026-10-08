-- ════════════════════════════════════════════════════════════════════════════
--  Crédits : rendre le débit et le crédit atomiques
--
--  PROBLÈME CORRIGÉ (signalé en juillet 2026, resté ouvert)
--  Les deux flux qui touchent au solde le lisaient puis le réécrivaient en
--  deux temps :
--      select balance  →  update balance = (valeur lue) ± montant
--  Deux requêtes simultanées partent donc du même solde lu et la seconde
--  écrase la première. Conséquences réelles : deux boosts lancés en même
--  temps n'en débitent qu'un seul (boost gratuit), et deux paiements Stripe
--  qui arrivent ensemble perdent un crédit (au détriment du client).
--
--  La correction ne consiste pas à relire le solde « plus vite » : tant que
--  la lecture et l'écriture sont deux requêtes distinctes, il y a une fenêtre
--  entre les deux. On déplace l'opération dans une seule instruction SQL où
--  Postgres verrouille la ligne, à l'intérieur d'une fonction qui forme une
--  transaction unique.
--
--  SECOND PROBLÈME CORRIGÉ — l'ordre des écritures
--  La route boost insérait le boost AVANT de débiter. Si le débit échouait,
--  le boost existait sans avoir été payé. Ici tout est dans une fonction :
--  si une seule instruction échoue, l'ensemble est annulé. L'ordre cesse
--  d'être un risque.
--
--  À EXÉCUTER DANS LE SQL EDITOR SUPABASE (projet codedeparrainage).
-- ════════════════════════════════════════════════════════════════════════════


-- ── 1. Contraintes d'unicité ────────────────────────────────────────────────
-- Indispensables : sans elles, « on conflict » ne peut pas servir de verrou,
-- et rien n'empêche deux lignes de solde pour le même utilisateur.
--
-- ⚠️ Si l'une de ces deux commandes échoue, c'est qu'il existe déjà des
-- doublons. Les repérer avant de réessayer :
--
--   select user_id, count(*) from public.credits
--     group by user_id having count(*) > 1;
--
--   select stripe_session_id, count(*) from public.credit_purchases
--     group by stripe_session_id having count(*) > 1;

create unique index if not exists credits_user_uidx
  on public.credits (user_id);

create unique index if not exists credit_purchases_session_uidx
  on public.credit_purchases (stripe_session_id);


-- ── 2. place_boost — débit atomique d'un boost ──────────────────────────────
-- Appelée avec la session de l'utilisateur (pas la clé service_role) : la
-- base vérifie elle-même l'identité, la propriété de l'annonce et le prix.
-- Même appelée directement en RPC, elle ne peut pas être détournée.
--
-- ⚠️ Le tarif vit ici ET dans COST_PER_DAY de src/app/api/boost/route.ts et
-- de src/app/boost/page.tsx. Les trois doivent rester synchronisés.
create or replace function public.place_boost(p_announcement_id uuid, p_days int)
returns public.boosts
language plpgsql
security definer
set search_path = public
as $$
declare
  v_cost_per_day constant numeric := 0.10;
  v_max_days     constant int     := 30;
  v_user     uuid := auth.uid();
  v_owner    uuid;
  v_cost     numeric;
  v_debited  int;
  v_boost    public.boosts;
begin
  if v_user is null then
    raise exception 'Non authentifié' using errcode = '28000';
  end if;

  if p_days is null or p_days < 1 or p_days > v_max_days then
    raise exception 'Durée invalide';
  end if;

  v_cost := round(p_days * v_cost_per_day, 2);

  -- L'annonce doit exister et appartenir à l'appelant (anti-IDOR).
  select user_id into v_owner
    from public.announcements
    where id = p_announcement_id;

  if not found then
    raise exception 'Annonce introuvable';
  end if;
  if v_owner <> v_user then
    raise exception 'Annonce non autorisée' using errcode = '42501';
  end if;

  -- LE POINT CLÉ : lecture et écriture dans une seule instruction. Postgres
  -- verrouille la ligne pendant l'update, donc deux appels simultanés sont
  -- sérialisés ; la clause `balance >= v_cost` rend le solde négatif
  -- impossible. Si la condition n'est pas remplie, aucune ligne n'est
  -- touchée et row_count vaut 0.
  update public.credits
     set balance    = balance - v_cost,
         updated_at = now()
   where user_id = v_user
     and balance >= v_cost;

  get diagnostics v_debited = row_count;
  if v_debited = 0 then
    raise exception 'Solde insuffisant';
  end if;

  -- Si cette insertion échoue, le débit ci-dessus est annulé avec elle.
  insert into public.boosts
    (user_id, announcement_id, days, cost_per_day, total_cost, ends_at, active)
  values
    (v_user, p_announcement_id, p_days, v_cost_per_day, v_cost,
     now() + (p_days || ' days')::interval, true)
  returning * into v_boost;

  return v_boost;
end;
$$;

revoke all on function public.place_boost(uuid, int) from public;
grant execute on function public.place_boost(uuid, int) to authenticated;


-- ── 3. grant_purchased_credits — crédit atomique d'un paiement ──────────────
-- Appelée par le webhook Stripe, qui n'a pas de session utilisateur : elle
-- reçoit donc l'identifiant en paramètre et n'est exécutable que par
-- service_role.
--
-- Renvoie true si le paiement vient d'être crédité, false s'il l'avait déjà
-- été (Stripe rejoue régulièrement le même événement).
create or replace function public.grant_purchased_credits(
  p_user_id    uuid,
  p_credits    numeric,
  p_session_id text,
  p_amount     bigint
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_inserted int;
begin
  if p_user_id is null or p_session_id is null or p_credits is null or p_credits <= 0 then
    raise exception 'Paramètres invalides';
  end if;

  -- L'anti-rejeu repose sur l'index unique, pas sur un select préalable :
  -- deux livraisons simultanées du même événement ne peuvent pas passer
  -- toutes les deux.
  insert into public.credit_purchases
    (user_id, stripe_session_id, credits_bought, amount_paid, status)
  values
    (p_user_id, p_session_id, p_credits, p_amount, 'completed')
  on conflict (stripe_session_id) do nothing;

  get diagnostics v_inserted = row_count;
  if v_inserted = 0 then
    return false;  -- déjà traité
  end if;

  -- Incrément relatif, jamais « valeur lue + montant ».
  insert into public.credits (user_id, balance)
  values (p_user_id, p_credits)
  on conflict (user_id) do update
    set balance    = public.credits.balance + excluded.balance,
        updated_at = now();

  return true;
end;
$$;

revoke all on function public.grant_purchased_credits(uuid, numeric, text, bigint) from public;
grant execute on function public.grant_purchased_credits(uuid, numeric, text, bigint) to service_role;
