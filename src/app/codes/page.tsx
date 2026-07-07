import CodesClient from './CodesClient'
import { createAnonSupabase } from '@/lib/supabase-server'
import { formatBrandName } from '@/lib/seo'
import { CATEGORIES } from '@/data/categories'

// ISR 30 min : l'annuaire crawlable suit les publications de codes
export const revalidate = 1800

export const metadata = {
  title: 'Codes de parrainage — Annuaire complet',
  description: 'Parcours tous les codes de parrainage disponibles : banque, paris sportifs, crypto, cashback. Codes vérifiés par la communauté et mis à jour en temps réel.',
  alternates: {
    canonical: 'https://www.codedeparrainage.com/codes',
  },
}

/**
 * Annuaire crawlable server-rendered : chaque marque avec ≥1 code actif est
 * liée ici → aucune page « argent » orpheline, sans dépendre du JS client.
 */
async function getActiveBrands(): Promise<{ slug: string; name: string }[]> {
  const supabase = createAnonSupabase()
  const { data } = await supabase
    .from('announcements')
    .select('companies (name, url_slug)')
  const seen = new Map<string, string>()
  for (const row of (data ?? []) as any[]) {
    const c = row.companies
    if (c?.url_slug && !seen.has(c.url_slug)) seen.set(c.url_slug, formatBrandName(c.name))
  }
  return [...seen.entries()]
    .map(([slug, name]) => ({ slug, name }))
    .sort((a, b) => a.name.localeCompare(b.name, 'fr'))
}

export default async function CodesPage() {
  const brands = await getActiveBrands()

  return (
    <>
      {/* Interface interactive — même comportement qu'avant.
          (Le H1 de la page est rendu par CodesClient, côté serveur aussi.) */}
      <CodesClient />

      {/* ── Annuaire crawlable : marques avec codes actifs + hubs catégorie ── */}
      <section
        aria-label="Toutes les marques avec codes actifs"
        style={{ position: 'relative', zIndex: 1, maxWidth: 860, margin: '0 auto', padding: '0 1.5rem 5rem', fontFamily: "var(--font-dm-sans),'DM Sans',sans-serif" }}
      >
        <h2 style={{ fontFamily: "var(--font-syne),Syne,sans-serif", fontWeight: 700, fontSize: '1rem', color: 'var(--text-strong)', margin: '0 0 1rem' }}>
          Toutes les marques avec codes actifs
        </h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: '2rem' }}>
          {brands.map((b) => (
            <a
              key={b.slug}
              href={`/code-parrainage/${b.slug}`}
              style={{ fontSize: '.8rem', padding: '.4rem .875rem', borderRadius: 10, background: 'var(--bg-card-md)', border: '1px solid var(--border)', color: 'var(--text-dim)', textDecoration: 'none' }}
            >
              {b.name}
            </a>
          ))}
        </div>

        <h2 style={{ fontFamily: "var(--font-syne),Syne,sans-serif", fontWeight: 700, fontSize: '1rem', color: 'var(--text-strong)', margin: '0 0 1rem' }}>
          Parcourir par catégorie
        </h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {CATEGORIES.map((c) => (
            <a
              key={c.slug}
              href={`/code-parrainage/categorie/${c.slug}`}
              style={{ fontSize: '.8rem', padding: '.4rem .875rem', borderRadius: 10, background: 'rgba(124,58,237,.1)', border: '1px solid rgba(124,58,237,.25)', color: '#a78bfa', textDecoration: 'none', fontWeight: 600 }}
            >
              {c.label}
            </a>
          ))}
        </div>
      </section>
    </>
  )
}
