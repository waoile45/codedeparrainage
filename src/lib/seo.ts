/**
 * Helpers SEO pour les pages programmatiques /code-parrainage/[slug].
 *
 * Règle d'or : ne JAMAIS interpoler un champ potentiellement null
 * (referral_bonus_description, description) directement dans une chaîne —
 * c'est la cause du bug historique « … vérifiés par notre communauté. null. ».
 * Tout passe par ces builders qui dégradent proprement quand la donnée manque.
 */

export const SITE_URL = 'https://www.codedeparrainage.com'

/**
 * Normalise la casse d'affichage d'un nom de marque.
 * « raisin » → « Raisin », « american express » → « American Express ».
 * Ne touche pas aux casses volontaires (« PMU Turf », « NordVPN », « iGraal »).
 */
export function formatBrandName(name: string | null | undefined): string {
  const trimmed = (name ?? '').trim()
  if (!trimmed) return ''
  if (trimmed !== trimmed.toLowerCase()) return trimmed
  return trimmed
    .split(' ')
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(' ')
}

/** Hash déterministe d'un slug — stable entre builds, pour varier les formulations sans casser l'ISR. */
export function slugHash(slug: string): number {
  let h = 0
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) >>> 0
  return h
}

/** Choisit une variante de formulation, déterministe par slug (salt = varier par section). */
export function pickVariant<T>(slug: string, variants: readonly T[], salt = 0): T {
  return variants[(slugHash(slug) + salt) % variants.length]
}

/**
 * announcements.description peut contenir le gain custom en préfixe « __gain__xxx\n »
 * (convention posée par /publier). À parser AVANT tout affichage.
 */
export function parseAnnouncementDescription(raw: string | null | undefined): {
  gain: string | null
  description: string
} {
  const desc = raw ?? ''
  if (!desc.startsWith('__gain__')) return { gain: null, description: desc.trim() }
  const firstLine = desc.split('\n')[0]
  return {
    gain: firstLine.replace('__gain__', '').trim() || null,
    description: desc.split('\n').slice(1).join('\n').trim(),
  }
}

/**
 * Version courte du bonus pour le <title> (≤ 34 caractères).
 * N'extrait que des mots déjà présents dans la donnée (aucune invention) ;
 * retourne null si rien d'assez court n'est extractible.
 */
export function shortBonus(bonus: string | null | undefined): string | null {
  const b = (bonus ?? '').trim()
  if (!b) return null
  if (b.length <= 34) return b
  const m = b.match(
    /(jusqu'à\s+)?\d+\s*[€$%](\s*(offerts?|remboursés?|de réduction|d'actions?|en actions?|en bitcoin|en cashback))?/i
  )
  return m ? m[0].trim() : null
}

export function formatDateFr(iso: string | null | undefined): string | null {
  if (!iso) return null
  const d = new Date(iso)
  if (isNaN(d.getTime())) return null
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

interface BrandMetaInput {
  slug: string
  name: string // déjà passé par formatBrandName
  bonus: string | null
  codesCount: number
  lastDateIso: string | null // max(last_bumped_at) des annonces
}

/** <title> unique, < ~60 caractères, mot-clé cible + hook bonus si dispo. Zéro null. */
export function buildBrandTitle({ slug, name, bonus, codesCount }: BrandMetaInput): string {
  const year = new Date().getFullYear()
  const base = `Code parrainage ${name} ${year}`
  const sb = shortBonus(bonus)
  if (sb) {
    const sep = pickVariant(slug, [' : ', ' — '], 1)
    const t = `${base}${sep}${sb}`
    if (t.length <= 62) return t
  }
  if (codesCount > 0) {
    const t = `${base} : ${codesCount} code${codesCount > 1 ? 's' : ''} vérifié${codesCount > 1 ? 's' : ''}`
    if (t.length <= 62) return t
  }
  return base
}

/** Meta description unique ~150-155 caractères, bonus réel si dispo. Zéro null. */
export function buildBrandDescription({ slug, name, bonus, codesCount, lastDateIso }: BrandMetaInput): string {
  const year = new Date().getFullYear()
  const date = formatDateFr(lastDateIso)
  const parts: string[] = []

  if (bonus) {
    parts.push(
      pickVariant(slug, [
        `${bonus} avec un code parrainage ${name} vérifié.`,
        `Profite de l'offre ${name} : ${bonus.charAt(0).toLowerCase()}${bonus.slice(1)}.`,
        `Code parrainage ${name} ${year} : ${bonus.charAt(0).toLowerCase()}${bonus.slice(1)}.`,
      ], 2)
    )
  } else {
    parts.push(
      pickVariant(slug, [
        `Trouve un code parrainage ${name} valide en ${year}.`,
        `Code parrainage ${name} ${year} : profite de l'offre de bienvenue en t'inscrivant avec un code de la communauté.`,
        `Tous les codes de parrainage ${name} actifs en ${year}.`,
      ], 3)
    )
  }

  if (codesCount > 0) {
    parts.push(
      date
        ? `${codesCount} code${codesCount > 1 ? 's' : ''} partagé${codesCount > 1 ? 's' : ''} par nos parrains, dernière mise à jour le ${date}.`
        : `${codesCount} code${codesCount > 1 ? 's' : ''} partagé${codesCount > 1 ? 's' : ''} par nos parrains.`
    )
    parts.push(pickVariant(slug, ['Copie le code en un clic.', 'Gratuit et sans inscription.'], 4))
  } else {
    parts.push(
      pickVariant(slug, [
        `Sois le premier à publier ton code ${name} et deviens parrain.`,
        `Aucun code actif pour l'instant : publie le tien et gagne des filleuls.`,
      ], 5)
    )
  }

  // Assemblage glouton : on n'ajoute une phrase que si elle tient en entier
  // (~155c max) — pas de coupe en plein milieu d'une phrase.
  let out = parts[0]
  for (const p of parts.slice(1)) {
    if (out.length + 1 + p.length <= 158) out = `${out} ${p}`
  }
  if (out.length > 158) {
    out = out.slice(0, 158)
    const lastSpace = out.lastIndexOf(' ')
    out = out.slice(0, lastSpace).replace(/[,;:\s]+$/, '') + '…'
  }
  return out
}
