/**
 * Valide une destination de retour après connexion (`?next=`).
 *
 * N'accepte qu'un chemin interne : commence par un seul « / », sans « // »
 * ni « /\ » (que les navigateurs lisent comme une URL vers un autre domaine),
 * sans caractère de contrôle. Tout le reste retombe sur `fallback`.
 *
 * Sans ce contrôle, /auth/callback?next=//site-externe.com renvoyait le
 * visiteur hors du site après connexion (open redirect, exploitable en
 * phishing sous le nom de domaine du site).
 */
export function safeNext(raw: string | null | undefined, fallback = '/profil'): string {
  if (!raw) return fallback
  if (!raw.startsWith('/')) return fallback
  if (raw.startsWith('//') || raw.startsWith('/\\')) return fallback
  if (/[\u0000-\u001f\u007f]/.test(raw)) return fallback
  return raw
}
