import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createAnonSupabase } from '@/lib/supabase-server'
import Navbar from '@/components/Navbar'
import CompanyLogo from '@/components/CompanyLogo'
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
    <div style={{ background: 'var(--bg)', minHeight: '100vh', fontFamily: "var(--font-dm-sans),'DM Sans',sans-serif", color: 'var(--text-strong)' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(itemListJsonLd) }} />

      <Navbar />

      <div style={{ maxWidth: 860, margin: '0 auto', padding: '2rem 1.5rem 6rem' }}>

        {/* ── Fil d'Ariane ── */}
        <nav aria-label="Fil d'Ariane" style={{ fontSize: '.78rem', color: 'var(--text-faint)', marginBottom: '1rem', display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
          <a href="/" style={{ color: 'var(--text-dim)', textDecoration: 'none' }}>Accueil</a>
          <span aria-hidden="true">›</span>
          <span style={{ color: 'var(--text-muted)' }}>{cat.label}</span>
        </nav>

        {/* ── En-tête ── */}
        <h1 style={{ fontFamily: "var(--font-syne),Syne,sans-serif", fontWeight: 800, fontSize: 'clamp(1.5rem,3.5vw,2.1rem)', margin: '0 0 .75rem', letterSpacing: '-0.02em', lineHeight: 1.15 }}>
          {cat.h1}
        </h1>
        {totalCodes > 0 && (
          <p style={{ fontSize: '.8rem', color: 'var(--text-faint)', margin: '0 0 1rem' }}>
            {totalCodes} code{totalCodes > 1 ? 's' : ''} actif{totalCodes > 1 ? 's' : ''} partagé{totalCodes > 1 ? 's' : ''} par la communauté dans cette catégorie
          </p>
        )}
        {cat.intro.map((p, i) => (
          <p key={i} style={{ fontSize: '.9rem', color: 'var(--text-muted)', lineHeight: 1.65, margin: '0 0 .875rem', maxWidth: 720 }}>{p}</p>
        ))}

        {/* ── Cartes marques ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', marginTop: '1.75rem' }}>
          {brands.map((b) => (
            <a
              key={b.slug}
              href={`/code-parrainage/${b.slug}`}
              style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 18, padding: '1rem 1.125rem', textDecoration: 'none', color: 'var(--text-strong)', minWidth: 0 }}
            >
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(124,58,237,.12)', border: '1px solid rgba(124,58,237,.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                <CompanyLogo domain={b.domain} name={b.name} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: "var(--font-syne),Syne,sans-serif", fontWeight: 700, fontSize: '.95rem' }}>
                  Code parrainage {b.name}
                </div>
                <div style={{ fontSize: '.8rem', color: 'var(--text-muted)', marginTop: 2 }}>
                  {b.bonus ?? `Codes partagés par la communauté`}
                </div>
                <div style={{ fontSize: '.72rem', color: 'var(--text-faint)', marginTop: 4, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  {b.codesCount > 0 ? (
                    <>
                      <span>{b.codesCount} code{b.codesCount > 1 ? 's' : ''} actif{b.codesCount > 1 ? 's' : ''}</span>
                      {formatDateFr(b.lastDateIso) && <span>Mis à jour le {formatDateFr(b.lastDateIso)}</span>}
                    </>
                  ) : (
                    <span>Sois le premier à publier un code</span>
                  )}
                </div>
              </div>
              <span style={{ color: '#a78bfa', fontSize: '.875rem', flexShrink: 0 }} aria-hidden="true">→</span>
            </a>
          ))}
        </div>

        {/* ── FAQ catégorie (même source que le JSON-LD) ── */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 20, padding: '1.5rem', marginTop: '2rem' }}>
          <h2 style={{ fontFamily: "var(--font-syne),Syne,sans-serif", fontWeight: 700, fontSize: '1rem', margin: '0 0 .875rem', color: 'var(--text-strong)' }}>
            Questions fréquentes — {cat.label}
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {cat.faq.map((item, i, arr) => (
              <details key={i} style={{ borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none', padding: '0.75rem 0' }}>
                <summary style={{ fontSize: '.875rem', fontWeight: 600, color: 'var(--text-strong)', cursor: 'pointer', listStyle: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                  <h3 style={{ fontSize: '.875rem', fontWeight: 600, margin: 0, fontFamily: 'inherit' }}>{item.q}</h3>
                  <span className="faq-arrow" style={{ color: 'var(--text-faint)', fontSize: '.75rem', flexShrink: 0, transition: 'transform .2s' }} aria-hidden="true">▼</span>
                </summary>
                <p style={{ fontSize: '.85rem', color: 'var(--text-muted)', margin: '.625rem 0 0', lineHeight: 1.6 }}>{item.a}</p>
              </details>
            ))}
          </div>
        </div>

        {/* ── Autres catégories ── */}
        <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
          <div style={{ fontSize: '.72rem', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text-faint)', marginBottom: '0.875rem', fontFamily: "var(--font-syne),Syne,sans-serif" }}>
            Autres catégories
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {otherCats.map((c) => (
              <a key={c.slug} href={`/code-parrainage/categorie/${c.slug}`} style={{ fontSize: '.8rem', padding: '.4rem .875rem', borderRadius: 10, background: 'var(--bg-card-md)', border: '1px solid var(--border)', color: 'var(--text-dim)', textDecoration: 'none' }}>
                {c.label}
              </a>
            ))}
            <a href="/codes" style={{ fontSize: '.8rem', padding: '.4rem .875rem', borderRadius: 10, background: 'rgba(124,58,237,.1)', border: '1px solid rgba(124,58,237,.25)', color: '#a78bfa', textDecoration: 'none', fontWeight: 600 }}>
              Tous les codes →
            </a>
          </div>
        </div>

      </div>

      <style>{`
        details summary::-webkit-details-marker { display: none; }
        details[open] .faq-arrow { transform: rotate(180deg); }
      `}</style>
    </div>
  )
}
