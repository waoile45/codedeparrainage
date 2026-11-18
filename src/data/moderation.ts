/**
 * Comptes qui ont publié en masse un texte identique d'une marque à l'autre.
 *
 * Wobani, le 25 oct. 2026 : 138 codes en une heure, jusqu'à 22 par minute,
 * avec la même phrase « Parrainage X : utilisez mon lien ci-dessus. ». Ses
 * codes restent publiés et visibles (8 codes morts ont été retirés le 18 nov.),
 * mais une page marque qui n'a QUE des codes de ces comptes est du contenu
 * dupliqué aux yeux de Google : elle sort du sitemap et passe en noindex, et
 * redevient indexable dès qu'un autre membre y publie.
 *
 * Les identifiants de membres sont déjà publics (table users lisible).
 */
export const MASS_PUBLISHERS: ReadonlySet<string> = new Set([
  '64a61d7b-8298-4825-840b-2aea7d376fb7', // Wobani
])

/** Une page marque mérite d'être indexée si au moins un code vient d'un autre membre. */
export function hasIndexableCode(userIds: Iterable<string | null | undefined>): boolean {
  for (const id of userIds) {
    if (id && !MASS_PUBLISHERS.has(id)) return true
  }
  return false
}
