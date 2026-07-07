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

    const anns = (annRes.data ?? []) as any[]
    const catCounts: Record<string, number> = {}
    const compMap = new Map<string, { count: number; company: any }>()
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
      .slice(0, 6)
      .map(({ count, company }) => {
        const meta = CAT_META[company.category] ?? { label: company.category ?? '', color: '#7c3aed' }
        const domain = String(company.slug ?? '').includes('.') ? company.slug : `${company.slug}.com`
        return {
          slug: company.url_slug ?? company.slug,
          logo: `https://www.google.com/s2/favicons?domain=${domain}&sz=128`,
          name: company.name,
          category: meta.label,
          catColor: meta.color,
          gain: null,
          gainSub: null,
          desc: company.referral_bonus_description ?? 'Offre de bienvenue partagée par la communauté.',
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
  title: { absolute: 'Code de parrainage 2026 : codes vérifiés par la communauté' },
  description: 'Trouve les meilleurs codes de parrainage français : Betclic, Revolut, iGraal, Fortuneo… Codes vérifiés par la communauté et mis à jour en temps réel.',
  alternates: {
    canonical: 'https://www.codedeparrainage.com',
  },
  openGraph: {
    title: 'Code de parrainage 2026 : codes vérifiés par la communauté',
    description: 'Trouve les meilleurs codes de parrainage français : Betclic, Revolut, iGraal, Fortuneo… Codes vérifiés et mis à jour en temps réel.',
    url: 'https://www.codedeparrainage.com',
    type: 'website',
    siteName: 'codedeparrainage.com',
    locale: 'fr_FR',
    images: [{ url: '/logo.png', width: 400, height: 400, alt: 'codedeparrainage.com' }],
  },
}

// Données statiques — visibles par Google sans JS.
// ⚠️ Les gains ci-dessous reprennent EXACTEMENT les offres renseignées en base
// (companies.referral_bonus_description) — ne jamais inventer un montant ici.
const SEO_COMPANIES = [
  { slug: 'boursobank',     name: 'BoursoBank',     gain: 'jusqu\'à 130€ offerts',        category: 'Banque' },
  { slug: 'winamax',        name: 'Winamax',         gain: '100€ remboursés si 1er pari perdant', category: 'Paris sportifs' },
  { slug: 'betclic',        name: 'Betclic',         gain: '30€ offerts',                  category: 'Paris sportifs' },
  { slug: 'revolut',        name: 'Revolut',         gain: 'jusqu\'à 200€ offerts',        category: 'Banque' },
  { slug: 'trade-republic', name: 'Trade Republic',  gain: 'jusqu\'à 200€ d\'actions',     category: 'Bourse' },
  { slug: 'fortuneo',       name: 'Fortuneo',        gain: '80€ offerts',                  category: 'Banque' },
  { slug: 'unibet',         name: 'Unibet',          gain: '10€ offerts',                  category: 'Paris sportifs' },
  { slug: 'binance',        name: 'Binance',         gain: '10% de réduction sur les frais', category: 'Crypto' },
]

// Hubs catégorie (pages /code-parrainage/categorie/[categorie])
const SEO_CATEGORIES = [
  { slug: 'banque',         label: 'Banque & néobanques' },
  { slug: 'paris-sportifs', label: 'Paris sportifs' },
  { slug: 'crypto',         label: 'Crypto' },
  { slug: 'cashback',       label: 'Cashback' },
  { slug: 'energie',        label: 'Énergie' },
  { slug: 'telephonie',     label: 'Téléphonie' },
  { slug: 'shopping',       label: 'Shopping' },
  { slug: 'mobilite',       label: 'Covoiturage & mobilité' },
]

export default async function HomePage() {
  const data = await getHomeData()
  return (
    <>
      {/*
        Contenu server-rendu visible par Google.
        Positionné hors écran — pas de cloaking car le contenu est identique
        à ce que voit l'utilisateur via HomeClient, juste pré-rendu.
      */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: '-9999px',
          width: '1px',
          overflow: 'hidden',
        }}
      >
        {/* h2 (pas h1) : le H1 unique de la home est dans le hero de HomeClient */}
        <h2>Les meilleurs codes de parrainage 2026 — codedeparrainage.com</h2>
        <p>
          Trouvez et partagez les meilleurs codes de parrainage français.
          BoursoBank, Winamax, Betclic, Revolut, Trade Republic et bien d'autres.
          Codes vérifiés par la communauté, mis à jour en temps réel.
        </p>

        {/* Maillage interne — liens crawlables vers chaque page entreprise */}
        <nav aria-label="Codes de parrainage par entreprise">
          <h2>Codes de parrainage populaires</h2>
          {SEO_COMPANIES.map((c) => (
            <a key={c.slug} href={`/code-parrainage/${c.slug}`}>
              Code parrainage {c.name} — {c.gain} ({c.category})
            </a>
          ))}
        </nav>

        {/* Liens par catégorie — vers les hubs éditoriaux */}
        <nav aria-label="Catégories de parrainage">
          <h2>Parcourir par catégorie</h2>
          {SEO_CATEGORIES.map((cat) => (
            <a key={cat.slug} href={`/code-parrainage/categorie/${cat.slug}`}>
              Codes de parrainage {cat.label}
            </a>
          ))}
        </nav>

        <p>
          Comment utiliser un code parrainage ? Choisissez un code dans notre annuaire,
          copie-le, et entre-le lors de ton inscription sur le site de l'entreprise.
          Tu recevras automatiquement ta récompense après validation.
        </p>
      </div>

      {/* Interface complète avec animations et thème */}
      <HomeClient data={data} />
    </>
  )
}
