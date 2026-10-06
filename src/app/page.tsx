import HomeClient, { type HomeData } from './HomeClient'
import { createAnonSupabase } from '@/lib/supabase-server'

export const revalidate = 1800 // 30 min : compteurs rafraîchis sans recharger à chaque visite

// Couleur + libellé par catégorie (slug stocké dans companies.category)
const CAT_META: Record<string, { label: string; color: string }> = {
  banque:     { label: 'Banque',         color: '#3b82f6' },
  crypto:     { label: 'Crypto',         color: '#f59e0b' },
  paris:      { label: 'Paris sportifs', color: '#10b981' },
  cashback:   { label: 'Cashback',       color: '#6366f1' },
  energie:    { label: 'Énergie',        color: '#ec4899' },
  telephonie: { label: 'Téléphonie',     color: '#8b5cf6' },
  shopping:   { label: 'Shopping',       color: '#14b8a6' },
  assurance:  { label: 'Assurance',      color: '#f97316' },
  bourse:     { label: 'Bourse',         color: '#6366f1' },
}

type CompanyRow = {
  name: string
  slug: string | null
  url_slug: string | null
  category: string | null
  referral_bonus_description: string | null
}
type AnnouncementRow = { company_id: string | null; companies: CompanyRow | null }

async function getHomeData(): Promise<HomeData> {
  const empty: HomeData = { codesCount: 0, parrainsCount: 0, entreprisesCount: 0, catCounts: {}, topCodes: [], topParrain: null }
  try {
    const supabase = createAnonSupabase()
    const [codesRes, parrainsRes, entreprisesRes, annRes, topUserRes] = await Promise.all([
      supabase.from('announcements').select('id', { count: 'exact', head: true }),
      supabase.from('users').select('id', { count: 'exact', head: true }),
      supabase.from('companies').select('id', { count: 'exact', head: true }),
      supabase.from('announcements').select('company_id, companies(name, slug, url_slug, category, referral_bonus_description)').limit(1000),
      supabase.from('users').select('pseudo, level').order('xp', { ascending: false }).limit(1).maybeSingle(),
    ])

    const anns = (annRes.data ?? []) as unknown as AnnouncementRow[]
    const catCounts: Record<string, number> = {}
    const compMap = new Map<string, { count: number; company: CompanyRow }>()
    for (const a of anns) {
      const c = a.companies
      if (c?.category) catCounts[c.category] = (catCounts[c.category] ?? 0) + 1
      if (a.company_id && c) {
        const e = compMap.get(a.company_id) ?? { count: 0, company: c }
        e.count++
        compMap.set(a.company_id, e)
      }
    }

    const topCodes = [...compMap.values()]
      .sort((a, b) => b.count - a.count)
      .filter(({ company }) => company.url_slug || company.slug)
      .slice(0, 6)
      .map(({ count, company }) => {
        const meta = CAT_META[company.category ?? ''] ?? { label: company.category ?? '', color: '#7c3aed' }
        const domain = String(company.slug ?? '').includes('.') ? company.slug : `${company.slug}.com`
        return {
          slug: company.url_slug ?? company.slug ?? '',
          logo: `https://www.google.com/s2/favicons?domain=${domain}&sz=128`,
          name: company.name,
          category: meta.label,
          catColor: meta.color,
          gain: null,
          gainSub: null,
          // Offre réelle si renseignée en base, sinon formulation neutre — jamais de montant inventé
          desc: company.referral_bonus_description ?? 'Codes partagés par des clients de la marque.',
          nbCodes: count,
          rating: null,
        }
      })

    return {
      codesCount: codesRes.count ?? 0,
      parrainsCount: parrainsRes.count ?? 0,
      entreprisesCount: entreprisesRes.count ?? 0,
      catCounts,
      topCodes,
      topParrain: topUserRes.data ?? null,
    }
  } catch {
    return empty
  }
}

export const metadata = {
  // absolute : sans le template « %s | codedeparrainage.com » qui dupliquait la marque
  title: { absolute: 'Code de parrainage 2026 : codes partagés par la communauté' },
  description:
    'Codes de parrainage publiés par de vrais clients et notés par ceux qui les utilisent : Boursobank, Revolut, Winamax, Trade Republic, iGraal… Copie le code, inscris-toi, touche la prime.',
  alternates: {
    canonical: 'https://www.codedeparrainage.com',
  },
  openGraph: {
    title: 'Code de parrainage 2026 : codes partagés par la communauté',
    description:
      'Codes de parrainage publiés par de vrais clients et notés par ceux qui les utilisent. Banque, paris sportifs, crypto, cashback, télécom.',
    url: 'https://www.codedeparrainage.com',
    type: 'website',
    siteName: 'codedeparrainage.com',
    locale: 'fr_FR',
  },
}

/**
 * La page d'accueil est entièrement rendue côté serveur par Next (HomeClient
 * est un client component mais son HTML est pré-rendu) : titre, liens vers
 * les marques et catégories, FAQ sont dans le HTML initial. Plus besoin du
 * bloc « SEO » positionné hors écran qui doublait ce contenu — Google classe
 * le texte et les liens cachés parmi les techniques de spam.
 */
export default async function HomePage() {
  const data = await getHomeData()
  return <HomeClient data={data} />
}
