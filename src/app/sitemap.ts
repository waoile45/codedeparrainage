import type { MetadataRoute } from 'next'
import { createAnonSupabase } from '@/lib/supabase-server'
import { USE_CASE_KEYS } from '@/data/comparatifs/vpn'
import { BANQUE_CAS_KEYS } from '@/data/comparatifs/banque'
import { CATEGORIES } from '@/data/categories'

// Regénéré toutes les heures : une page marque qui gagne/perd son dernier code
// entre/sort du sitemap sans attendre le prochain déploiement.
export const revalidate = 3600

const BASE = 'https://www.codedeparrainage.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Seules les pages marque avec ≥1 code actif sont indexables (les coquilles
  // vides sont noindex) → elles seules entrent au sitemap, avec un lastmod RÉEL
  // (dernière annonce publiée/bumpée), pas un new Date() mensonger.
  const supabase = createAnonSupabase()
  const { data: anns } = await supabase
    .from('announcements')
    .select('last_bumped_at, created_at, companies (url_slug)')
    .limit(5000)

  const bySlug = new Map<string, string>() // url_slug → lastmod ISO max
  for (const a of (anns ?? []) as any[]) {
    const slug = a.companies?.url_slug
    if (!slug) continue
    const d = a.last_bumped_at ?? a.created_at
    const prev = bySlug.get(slug)
    if (d && (!prev || d > prev)) bySlug.set(slug, d)
  }

  const companyPages: MetadataRoute.Sitemap = [...bySlug.entries()].map(([slug, lastmod]) => ({
    url: `${BASE}/code-parrainage/${slug}`,
    lastModified: new Date(lastmod),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  const categoryPages: MetadataRoute.Sitemap = CATEGORIES.map((c) => ({
    url: `${BASE}/code-parrainage/categorie/${c.slug}`,
    changeFrequency: 'weekly' as const,
    priority: 0.85,
  }))

  return [
    // lastModified omis quand on n'a pas de vraie date de modification
    { url: BASE,                          changeFrequency: 'daily'   as const, priority: 1.0 },
    { url: `${BASE}/codes`,               changeFrequency: 'daily'   as const, priority: 0.9 },
    ...categoryPages,
    { url: `${BASE}/classement`,          changeFrequency: 'daily'   as const, priority: 0.5 },
    { url: `${BASE}/faq`,                 changeFrequency: 'monthly' as const, priority: 0.5 },
    { url: `${BASE}/cgu`,                 changeFrequency: 'yearly'  as const, priority: 0.1 },
    { url: `${BASE}/confidentialite`,     changeFrequency: 'yearly'  as const, priority: 0.1 },
    { url: `${BASE}/mentions-legales`,    changeFrequency: 'yearly'  as const, priority: 0.1 },
    // Comparatifs VPN
    { url: `${BASE}/meilleur-vpn`,        changeFrequency: 'weekly'  as const, priority: 0.85 },
    ...USE_CASE_KEYS.map((cas) => ({
      url: `${BASE}/meilleur-vpn/${cas}`,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
    // Comparatifs banques
    { url: `${BASE}/meilleure-banque`,    changeFrequency: 'weekly'  as const, priority: 0.85 },
    ...BANQUE_CAS_KEYS.map((cas) => ({
      url: `${BASE}/meilleure-banque/${cas}`,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
    ...companyPages,
  ]
}
