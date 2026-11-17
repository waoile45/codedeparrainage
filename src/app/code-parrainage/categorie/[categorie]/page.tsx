import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createAnonSupabase } from '@/lib/supabase-server'
import Navbar from '@/components/Navbar'
import CompanyLogo from '@/components/CompanyLogo'
import '../../../home.css'
import '../../[slug]/brand.css'
import './cat.css'
import { safeJsonLd } from '@/lib/sanitize'
import { SITE_URL, formatBrandName, formatDateFr } from '@/lib/seo'
import { CATEGORIES, CATEGORY_BY_SLUG } from '@/data/categories'

// Hubs catégorie : statiques + ISR 1h (les compteurs de codes bougent avec les annonces)
export const revalidate = 3600
export const dynamicParams = false

type Props = { params: Promise<{ categorie: string }> }

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ categorie: c.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { categorie } = await params
  const cat = CATEGORY_BY_SLUG[categorie]
  if (!cat) return { title: 'Catégorie introuvable', robots: { index: false, follow: false } }

  const url = `${SITE_URL}/code-parrainage/categorie/${cat.slug}`
  return {
    title: { absolute: cat.title },
    description: cat.metaDescription,
    alternates: { canonical: url },
    openGraph: {
      title: cat.title,
      description: cat.metaDescription,
      url,
      type: 'website',
      siteName: 'codedeparrainage.com',
      locale: 'fr_FR',
    },
    twitter: { card: 'summary_large_image', title: cat.title, description: cat.metaDescription },
  }
}

interface BrandCard {
  slug: string
  name: string
  domain: string
  bonus: string | null
  codesCount: number
  lastDateIso: string | null
}

async function getBrands(catSlugs: string[]): Promise<BrandCard[]> {
  const supabase = createAnonSupabase()
  const [{ data: companies }, { data: anns }] = await Promise.all([
    supabase
      .from('companies')
      .select('id, name, slug, url_slug, referral_bonus_description')
      .in('url_slug', catSlugs),
    supabase
      .from('announcements')
      .select('company_id, last_bumped_at, created_at, companies!inner (url_slug)')
      .in('companies.url_slug', catSlugs),
  ])

  const stats = new Map<string, { n: number; last: string | null }>()
  for (const a of (anns ?? []) as any[]) {
    const s = a.companies?.url_slug
    if (!s) continue
    const e = stats.get(s) ?? { n: 0, last: null }
    e.n++
    const d = a.last_bumped_at ?? a.created_at
    if (d && (!e.last || d > e.last)) e.last = d
    stats.set(s, e)
  }

  // Dédoublonnage par url_slug (doublons possibles en base) — la ligne avec offre fait foi
  const uniq = new Map<string, any>()
  for (const c of (companies ?? []) as any[]) {
    const prev = uniq.get(c.url_slug)
    if (!prev || (!prev.referral_bonus_description && c.referral_bonus_description)) uniq.set(c.url_slug, c)
  }

  const cards: BrandCard[] = [...uniq.values()].map((c) => ({
    slug: c.url_slug,
    name: formatBrandName(c.name),
    domain: String(c.slug ?? `${c.url_slug}.com`).replace(/^(https?:\/\/)?(www\.)?/, ''),
    bonus: c.referral_bonus_description ?? null,
    codesCount: stats.get(c.url_slug)?.n ?? 0,
    lastDateIso: stats.get(c.url_slug)?.last ?? null,
  }))

  // Marques avec codes d'abord (pages « argent »), puis avec offre renseignée
  cards.sort((a, b) => b.codesCount - a.codesCount || Number(!!b.bonus) - Number(!!a.bonus) || a.name.localeCompare(b.name))
  return cards
}

export default async function CategoryPage({ params }: Props) {
  const { categorie } = await params
  const cat = CATEGORY_BY_SLUG[categorie]
  if (!cat) notFound()

  const brands = await getBrands(cat.brands)
  const totalCodes = brands.reduce((s, b) => s + b.codesCount, 0)
  const url = `${SITE_URL}/code-parrainage/categorie/${cat.slug}`
  const otherCats = CATEGORIES.filter((c) => c.slug !== cat.slug)

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Accueil', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: cat.label, item: url },
    ],
  }

  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: cat.h1,
    numberOfItems: brands.length,
    itemListElement: brands.map((b, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: `Code parrainage ${b.name}`,
      url: `${SITE_URL}/code-parrainage/${b.slug}`,
    })),
  }

  return (
    <div className="cp">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(itemListJsonLd) }} />

      <Navbar />

      <main>
        <section className="cp-hero">
          <div className="wrap">
            <nav aria-label="Fil d'Ariane" className="bp-crumbs">
              <a href="/">Accueil</a>
              <span aria-hidden="true">/</span>
              <span>{cat.label}</span>
            </nav>
            <h1 className="cp-title">{cat.h1}</h1>
            {totalCodes > 0 && (
              <p className="cp-count tnum">
                {totalCodes} code{totalCodes > 1 ? 's' : ''} partagé{totalCodes > 1 ? 's' : ''} par la communauté, pour {brands.filter((b) => b.codesCount > 0).length} marque{brands.filter((b) => b.codesCount > 0).length > 1 ? 's' : ''}
              </p>
            )}
            <div className="cp-intro">
              {cat.intro.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </div>
        </section>

        <section className="band-paper cp-brands">
          <div className="wrap">
            <ol className="hp-brand-list">
              {brands.map((b, i) => (
                <li key={b.slug} className="reveal" data-delay={String(i % 4)}>
                  <a href={`/code-parrainage/${b.slug}`} className="hp-brand-row">
                    <span className="cp-logo"><CompanyLogo domain={b.domain} name={b.name} /></span>
                    <span className="hp-brand-name">{b.name}</span>
                    <span className="hp-brand-bonus">
                      {b.bonus ?? 'Prime selon les conditions de la marque'}
                      {formatDateFr(b.lastDateIso) && <span className="cp-date">Mis à jour le {formatDateFr(b.lastDateIso)}</span>}
                    </span>
                    <span className="hp-brand-count tnum">
                      {b.codesCount > 0 ? `${b.codesCount} code${b.codesCount > 1 ? 's' : ''}` : 'Aucun code'}
                    </span>
                  </a>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="cp-faq">
          <div className="wrap hp-faq-grid">
            <h2>Questions sur le parrainage {cat.short.toLowerCase()}</h2>
            <div>
              {cat.faq.map((item, i) => (
                <details key={i} className="hp-qa">
                  <summary><h3>{item.q}</h3></summary>
                  <p>{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="cp-others">
          <div className="wrap">
            <h2>Autres catégories</h2>
            <ul className="bp-related-list">
              {otherCats.map((c) => (
                <li key={c.slug}>
                  <a href={`/code-parrainage/categorie/${c.slug}`}>{c.label}</a>
                </li>
              ))}
            </ul>
            <div className="bp-related-foot">
              <a href="/codes" className="btn btn-ghost">Toutes les marques</a>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
