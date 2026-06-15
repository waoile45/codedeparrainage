# Sécurité — codedeparrainage.com

État du durcissement sécurité au 12 juin 2026.

## 0. Audit du 15 juin 2026 — correctifs appliqués

Suite à un audit complet, corrections livrées côté code :

- **CRITIQUE — `/api/boost`** : le coût d'un boost était fourni par le client
  (`total_cost`, `cost_per_day`), permettant des boosts gratuits ou un solde
  négatif exploité. Désormais recalculé serveur (`COST_PER_DAY = 0.10`, 1–30 j),
  avec `getUser()` et vérification que l'annonce appartient à l'utilisateur.
- **ÉLEVÉ — XSS stocké via JSON-LD** : le `code` d'annonce (saisi par l'utilisateur)
  était injecté via `JSON.stringify` + `dangerouslySetInnerHTML`, sans échapper
  `</script>`. Nouveau helper `src/lib/sanitize.ts` → `safeJsonLd()` (échappe
  `<`, `>`, `&` en `\uXXXX`), appliqué aux pages `/code-parrainage/[slug]`,
  `meilleur-vpn`, `meilleure-banque`.
- **ÉLEVÉ — webhook Stripe** : ajout de l'idempotence (dédup sur
  `stripe_session_id`) → plus de double-crédit sur les retries Stripe.
- **ÉLEVÉ — auth serveur** : `getSession()` → `getUser()` sur `/api/stripe/checkout`
  et `/api/announcements/[id]` (le JWT est revalidé, plus de confiance aveugle au cookie).
- **MOYEN — `/api/bump`** : vérification de propriété (anti-IDOR) + correction du
  bug XP (`ann.xp` → undefined → NaN ; on lit désormais l'XP de l'utilisateur).
- **MOYEN — `/api/messages`** : échappement HTML du pseudo et du contenu dans
  l'email (anti-phishing) + limite de longueur (2000 car.).
- **FAIBLE** : messages d'erreur Supabase génériques (plus de fuite de schéma),
  cohérence de la variable admin, validation de longueur (reviews, annonces).

**Reste à faire côté Supabase (non auditable dans le code, cf. point critique RLS)** :
vérifier que la RLS est activée et restrictive sur `credits`, `boosts`,
`credit_purchases`, `users`, `announcements`, `messages`, `reviews` ; ajouter une
contrainte UNIQUE sur `credit_purchases.stripe_session_id`.

## 1. Headers HTTP de sécurité

Définis dans `next.config.ts` → `headers()`, appliqués à **toutes** les réponses
(y compris les assets statiques, contrairement à l'ancien emplacement dans `proxy.ts`).

| Header | Valeur |
|---|---|
| `Content-Security-Policy` | `default-src 'self'` ; images limitées aux favicons Google/DuckDuckGo/gstatic + Supabase Storage ; scripts `'self'` + Turnstile ; `frame-ancestors 'none'` |
| `X-Frame-Options` | `DENY` |
| `X-Content-Type-Options` | `nosniff` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` |

Notes CSP :
- `script-src 'unsafe-inline'` est requis par Next.js (scripts d'hydratation inline).
  Pour le supprimer, il faudrait passer à une CSP par nonce (rendu dynamique partout).
- `'unsafe-eval'` est ajouté **uniquement en dev** (HMR Turbopack), absent en production.
- Le site n'utilise pas `images.unsplash.com` : seuls les domaines réellement utilisés
  sont autorisés (favicons d'entreprises + avatars Supabase).

## 2. API formulaire public : `/api/proposer-entreprise`

Seul endpoint public non authentifié qui envoie un email (équivalent « réservation »).
Protections dans `src/app/api/proposer-entreprise/route.ts` :

- **Validation Zod stricte** côté serveur : `nomEntreprise` 1–100 car., `note` ≤ 500,
  `userEmail` format email ≤ 200. Tout le reste → 400.
- **Rate limiting : 3 soumissions / IP / 10 minutes** (Map en mémoire).
  ⚠️ Sur Vercel la limite est *par instance serverless* ; si le trafic augmente,
  passer à `@upstash/ratelimit` + Redis (commentaire dans le code).
- **Honeypot** : champ caché `website` dans le formulaire (`/publier`). S'il est
  rempli → réponse `200 {success:true}` **sans envoi d'email** (le bot ne sait pas
  qu'il est détecté).
- **Limite de taille du body : 10 Ko** (Content-Length + longueur réelle) → 413.
- **Neutralisation du contenu utilisateur** dans l'email : `escapeHtml()` sur
  `nomEntreprise`, `note`, `userEmail` ; sujet débarrassé des `\r\n` (anti-injection
  de headers) et tronqué à 150 caractères.

Un rate limiting global (30 req/min/IP) s'applique en plus via `src/proxy.ts` aux
routes sensibles : messages, reviews, boost, bump, checkout, proposer-entreprise,
verify-turnstile.

## 3. Protection admin

`src/proxy.ts` : accès `/admin` et `/api/admin/*` réservé à l'email `ADMIN_EMAIL`.
**Fail-closed** : si la variable n'est pas configurée, l'accès est refusé à tout le
monde (avant : tout utilisateur connecté passait). Les routes `/api/admin/*` font
en plus leur propre vérification serveur.

## 4. Secrets

- Secrets serveur uniquement : `RESEND_API_KEY`, `STRIPE_SECRET_KEY`,
  `STRIPE_WEBHOOK_SECRET` — jamais préfixés `NEXT_PUBLIC_`.
- Variables `NEXT_PUBLIC_` présentes : URL Supabase, clé *anon* Supabase (publique
  par design, protégée par RLS), clé *publishable* Stripe, site key Turnstile,
  URL du site. Aucune n'est sensible.
- Vérifié après build : aucun pattern `sk_live|sk_test|whsec_|RESEND_API_KEY`
  dans `.next/static/`.
- Recommandation : définir `ADMIN_EMAIL` (sans `NEXT_PUBLIC_`) dans les variables
  d'environnement Vercel.

## 5. Données personnelles (RGPD)

- Aucune donnée de soumission stockée côté client (`localStorage` n'est utilisé
  que pour purger une ancienne clé de thème).
- Mention RGPD courte sous le formulaire de proposition d'entreprise, avec lien
  vers `/confidentialite`.

## 6. Dépendances (`npm audit` du 12 juin 2026)

- `npm audit fix` appliqué + Next.js mis à jour `16.2.1 → 16.2.9` (corrige
  notamment un **contournement du proxy/middleware** high — critique ici car la
  protection admin vit dans le proxy — et deux DoS Server Components).
- **0 vulnérabilité high/critical restante.**
- Risque résiduel accepté : 2 × moderate sur `postcss` embarqué dans Next
  (fix uniquement en canary). À réévaluer à la prochaine release stable de Next.

## Vérification (3 commandes)

```bash
# 1. Headers de sécurité (sur le site en prod ou npm start local)
curl -sI https://www.codedeparrainage.com | grep -iE "content-security|x-frame|nosniff|strict-transport|referrer"

# 2. Honeypot : doit répondre 200 sans envoyer d'email
curl -s -w " -> %{http_code}\n" -X POST https://www.codedeparrainage.com/api/proposer-entreprise \
  -H "Content-Type: application/json" -d '{"nomEntreprise":"Bot","website":"x"}'

# 3. Rate limit : la 4e requête en 10 min doit répondre 429
for i in 1 2 3 4; do curl -s -o /dev/null -w "req $i: %{http_code}\n" \
  -X POST https://www.codedeparrainage.com/api/proposer-entreprise \
  -H "Content-Type: application/json" -d '{"nomEntreprise":"Test ratelimit - ignorer"}'; done
```

Et en local : `npm audit --audit-level=high` doit sortir sans findings.
