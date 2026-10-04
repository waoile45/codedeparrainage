/**
 * Badge de fraîcheur d'un code : « Testé il y a 3 h · 94 % sur 120 essais ».
 *
 * C'est le seul contenu du site qu'un moteur génératif ne peut ni connaître ni
 * inventer : il périme. Un code, l'IA le restitue de mémoire ; son état actuel,
 * non. D'où un affichage volontairement factuel et daté.
 *
 * Affiché même sans aucun test — « pas encore testé » est une information
 * utile, et c'est ce qui donne envie d'être le premier à signaler.
 *
 * Styles en ligne sur les variables du thème : le reste du site n'utilise pas
 * les classes utilitaires, des `text-muted-foreground` ne s'appliqueraient pas.
 */

export type StatsTest = {
  tests_ok?: number | null
  tests_ko?: number | null
  last_tested_at?: string | null
}

/** « il y a 3 h », « il y a 2 jours »… null si aucune date exploitable. */
export function depuis(iso: string | null | undefined): string | null {
  if (!iso) return null
  const t = new Date(iso).getTime()
  if (Number.isNaN(t)) return null
  const minutes = Math.floor((Date.now() - t) / 60000)
  if (minutes < 0) return null
  if (minutes < 2) return "à l'instant"
  if (minutes < 60) return `il y a ${minutes} min`
  const heures = Math.floor(minutes / 60)
  if (heures < 24) return `il y a ${heures} h`
  const jours = Math.floor(heures / 24)
  if (jours < 31) return `il y a ${jours} jour${jours > 1 ? 's' : ''}`
  return `il y a ${Math.floor(jours / 30)} mois`
}

/** Taux de réussite, ou null si personne n'a encore testé. */
export function tauxReussite(stats: StatsTest): { taux: number; total: number } | null {
  const ok = stats.tests_ok ?? 0
  const ko = stats.tests_ko ?? 0
  const total = ok + ko
  if (total === 0) return null
  return { taux: Math.round((ok / total) * 100), total }
}

export function FraicheurCode({
  stats,
  compact = false,
}: {
  stats: StatsTest
  compact?: boolean
}) {
  const quand = depuis(stats.last_tested_at)
  const reussite = tauxReussite(stats)

  const base: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '.4rem',
    fontSize: '.75rem',
    lineHeight: 1.3,
  }
  const pastille = (couleur: string): React.CSSProperties => ({
    width: 6,
    height: 6,
    borderRadius: '50%',
    background: couleur,
    flexShrink: 0,
  })

  if (!reussite || !quand) {
    return (
      <span style={{ ...base, color: 'var(--text-faint)' }}>
        <span style={pastille('var(--text-faint)')} aria-hidden="true" />
        Pas encore testé
      </span>
    )
  }

  // Trois états. Le seuil bas est volontairement sévère : un code qui échoue
  // une fois sur trois ne doit pas paraître vert.
  const couleur =
    reussite.taux >= 80 ? '#10b981' : reussite.taux >= 50 ? '#f59e0b' : '#ef4444'

  return (
    <span style={{ ...base, flexWrap: 'wrap', gap: '.15rem .45rem' }}>
      <span style={{ ...base, color: 'var(--text-muted)', fontWeight: 600 }}>
        <span style={pastille(couleur)} aria-hidden="true" />
        Testé {quand}
      </span>
      {!compact && (
        <span style={{ color: 'var(--text-faint)' }}>
          · {reussite.taux} % de réussite sur {reussite.total} essai
          {reussite.total > 1 ? 's' : ''}
        </span>
      )}
    </span>
  )
}
