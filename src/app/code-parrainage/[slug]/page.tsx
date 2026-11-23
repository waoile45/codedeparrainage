import { cache } from 'react'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createAnonSupabase } from '@/lib/supabase-server'
import Navbar from '@/components/Navbar'
import CopyButton from '@/components/CopyButton'
import TestCode from '@/components/TestCode'
import CompanyLogo from '@/components/CompanyLogo'
import './brand.css'
import { safeJsonLd } from '@/lib/sanitize'
import {
  SITE_URL,
  formatBrandName,
  parseAnnouncementDescription,
  pickVariant,
  formatDateFr,
  buildBrandTitle,
  buildBrandDescription,
} from '@/lib/seo'
import { CATEGORIES, getCategoryForBrand } from '@/data/categories'
import { hasIndexableCode } from '@/data/moderation'

// ISR 4h — pages 100% statiques (client anon : PAS de cookies(), sinon la route
// bascule en rendu dynamique à chaque requête et n'est plus pré-générée).
export const revalidate = 14400
export const dynamicParams = true

/** Date de la dernière remontée ou publication, sur tous les codes (le premier peut être un code boosté plus ancien). */
function dateLaPlusRecente(announcements: any[]): string | null {
  let max: string | null = null
  for (const a of announcements) {
    const d = a.last_bumped_at ?? a.created_at ?? null
    if (d && (!max || new Date(d) > new Date(max))) max = d
  }
  return max
}

type Props = { params: Promise<{ slug: string }> }

/**
 * On ne pré-génère QUE les marques avec au moins un code actif (~90 pages
 * « argent »). Les ~2700 autres sont rendues à la demande puis mises en cache
 * ISR — inutile de builder 2764 pages dont 97% sont vides et noindexées.
 */
export async function generateStaticParams() {
  const supabase = createAnonSupabase()
  const { data } = await supabase
    .from('announcements')
    .select('companies (url_slug)')
  const slugs = new Set<string>()
  for (const row of (data ?? []) as any[]) {
    if (row.companies?.url_slug) slugs.add(row.companies.url_slug)
  }
  return [...slugs].map((slug) => ({ slug }))
}

/** Fetch unique par requête (cache React) — partagé entre generateMetadata et la page. */
const getPageData = cache(async (slug: string) => {
  const supabase = createAnonSupabase()
  // ⚠️ Pas de .maybeSingle() : certains url_slug existent en double en base
  // (ex : « hello-bank » ×2) et maybeSingle() renvoie alors une erreur → 404 à tort.
  const { data: companies } = await supabase
    .from('companies')
    .select('*')
    .eq('url_slug', slug)
  if (!companies || companies.length === 0) return null

  // La ligne avec offre renseignée fait foi ; les annonces des doublons sont fusionnées.
  const company = companies.find((c: any) => c.referral_bonus_description) ?? companies[0]
  const ids = companies.map((c: any) => c.id)

  const { data: announcements } = await supabase
    .from('announcements')
    .select('*, users (pseudo, xp, level), boosts (active, ends_at)')
    .in('company_id', ids)
    .order('last_bumped_at', { ascending: false })

  // Les annonces boostées (boost en cours) passent en tête, donc dans le grand
  // encadré du haut. sort() est stable : à boost égal, l'ordre de remontée est gardé.
  const maintenant = Date.now()
  const rows = (announcements ?? []).map((a: any) => ({
    ...a,
    boosted: (a.boosts ?? []).some((b: any) => b.active && new Date(b.ends_at).getTime() > maintenant),
  }))
  rows.sort((a: any, b: any) => Number(b.boosted) - Number(a.boosted))

  return { company, announcements: rows }
})

/** Marques les plus actives (maillage interne) — calcul léger, mis en cache par requête. */
const getTopActiveBrands = cache(async () => {
  const supabase = createAnonSupabase()
  const { data } = await supabase
    .from('announcements')
    .select('company_id, companies (name, url_slug)')
  const counts = new Map<string, { name: string; slug: string; n: number }>()
  for (const row of (data ?? []) as any[]) {
    const c = row.companies
    if (!c?.url_slug) continue
    const e = counts.get(c.url_slug) ?? { name: c.name, slug: c.url_slug, n: 0 }
    e.n++
    counts.set(c.url_slug, e)
  }
  return [...counts.values()].sort((a, b) => b.n - a.n)
})

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const data = await getPageData(slug)
  if (!data) return { title: 'Page introuvable', robots: { index: false, follow: false } }

  const { company, announcements } = data
  const name = formatBrandName(company.name)
  const codesCount = announcements.length
  const lastDateIso = dateLaPlusRecente(announcements)
  const bonus: string | null = company.referral_bonus_description ?? null

  const metaInput = { slug, name, bonus, codesCount, lastDateIso }
  const title = buildBrandTitle(metaInput)
  const description = buildBrandDescription(metaInput)
  const url = `${SITE_URL}/code-parrainage/${slug}`

  return {
    title: { absolute: title },
    description,
    alternates: { canonical: url },
    // Coquille vide (0 code), ou page qui n'a que des codes publiés en masse
    // (src/data/moderation.ts) → noindex,follow : hors index sans casser le maillage.
    robots: hasIndexableCode(announcements.map((a: any) => a.user_id))
      ? { index: true, follow: true }
      : { index: false, follow: true },
    openGraph: {
      title,
      description,
      url,
      type: 'website',
      siteName: 'codedeparrainage.com',
      locale: 'fr_FR',
    },
    twitter: { card: 'summary_large_image', title, description },
  }
}

/* ── FAQ data-aware : réponses construites à partir de l'état réel de la page ── */
function buildFaq(opts: {
  slug: string
  name: string
  bonus: string | null
  codesCount: number
  parrainsCount: number
  dateStr: string | null
}): { q: string; a: string }[] {
  const { slug, name, bonus, codesCount, parrainsCount, dateStr } = opts
  const year = new Date().getFullYear()
  const faq: { q: string; a: string }[] = []

  // 1. Validité — réponse basée sur l'état réel de la page
  faq.push({
    q: pickVariant(slug, [
      `Le code parrainage ${name} est-il valable en ${year} ?`,
      `Y a-t-il un code parrainage ${name} qui fonctionne en ${year} ?`,
    ], 10),
    a:
      codesCount > 0
        ? `Oui : ${codesCount} code${codesCount > 1 ? 's' : ''} ${name} ${codesCount > 1 ? 'sont' : 'est'} actuellement partagé${codesCount > 1 ? 's' : ''} par ${parrainsCount} parrain${parrainsCount > 1 ? 's' : ''} de la communauté${dateStr ? `, dernière mise à jour le ${dateStr}` : ''}. Vérifie les conditions directement sur le site ${name} au moment de l'inscription.`
        : `Aucun code ${name} n'est publié pour le moment. La page est mise à jour dès qu'un parrain partage le sien — tu peux aussi publier ton propre code si tu es déjà client.`,
  })

  // 2. Montant — UNIQUEMENT si la donnée existe en base
  if (bonus) {
    faq.push({
      q: `Combien rapporte le parrainage ${name} ?`,
      a: `L'offre actuellement renseignée : ${bonus}. Le montant exact et les conditions (dépôt minimum, première commande…) sont fixés par ${name} et peuvent évoluer — vérifie l'offre en vigueur au moment de ton inscription.`,
    })
  }

  // 3. Où entrer le code
  faq.push({
    q: pickVariant(slug, [
      `Où entrer le code parrainage ${name} ?`,
      `Comment utiliser le code parrainage ${name} à l'inscription ?`,
    ], 11),
    a: pickVariant(slug, [
      `Le code s'entre lors de la création de ton compte ${name}, dans le champ « code parrainage », « code promo » ou « code ami » selon la plateforme. Il est rarement possible de l'ajouter après coup.`,
      `Renseigne le code au moment de ton inscription sur le site ou l'application ${name} — un champ dédié (« code parrain », « code promo ») apparaît dans le formulaire. Pense-y avant de valider : l'ajout rétroactif est rarement accepté.`,
    ], 12),
  })

  // 4. Codes vérifiés — seulement si des codes existent
  if (codesCount > 0) {
    faq.push({
      q: `Comment trouver un code ${name} qui fonctionne ?`,
      a: `Les codes de cette page sont publiés par des membres inscrits, avec leur pseudo et leur date ; les plus récents ou remontés par leur parrain passent en tête${dateStr ? ` (dernière mise à jour le ${dateStr})` : ''}. Si un code est refusé, essaie le suivant, et compare la prime avec celle affichée par ${name}.`,
    })
  }

  return faq
}

// Marques du hub « paris sportifs » : message de mise en garde obligatoire.
const BETTING_BRANDS = new Set(CATEGORIES.find((c) => c.slug === 'paris-sportifs')?.brands ?? [])

function isLink(code: string) {
  return /^https?:\/\//i.test(code.trim())
}

export default async function CompanyPage({ params }: Props) {
  const { slug } = await params
  const data = await getPageData(slug)

  // Marque inconnue → vrai 404 (fini le soft-404 en 200)
  if (!data) notFound()

  const { company, announcements } = data
  const name = formatBrandName(company.name)
  const bonus: string | null = company.referral_bonus_description ?? null
  const codesCount = announcements.length
  const parrainsCount = new Set(announcements.map((a: any) => a.user_id).filter(Boolean)).size
  const lastDateIso = dateLaPlusRecente(announcements)
  const dateStr = formatDateFr(lastDateIso)
  const year = new Date().getFullYear()
  const category = getCategoryForBrand(slug)
  const url = `${SITE_URL}/code-parrainage/${slug}`
  const betting = BETTING_BRANDS.has(slug)
  // Bouton « Publier » : la marque arrive présélectionnée dans le formulaire
  // (companies.slug = clé de recherche utilisée par /publier).
  const publishHref = company.slug
    ? `/publier?marque=${encodeURIComponent(company.slug)}&nom=${encodeURIComponent(name)}`
    : '/publier'

  // Le domaine pour le favicon — on nettoie au cas où la colonne slug contient un path ou sous-domaine
  const domain = (company.slug ?? slug + '.com').replace(/^(https?:\/\/)?(www\.)?/, '')

  // Sous-titre : description réelle si en base, sinon formulation variée SANS donnée inventée
  const tagline: string =
    company.description ??
    pickVariant(slug, [
      `Les codes de parrainage ${name} publiés par des clients, du plus récent au plus ancien.`,
      `Des codes ${name} partagés par des membres déjà clients, avec leur date de publication.`,
      `Copie le code d'un client ${name} et colle-le au moment de ton inscription.`,
    ], 20)

  const faq = buildFaq({ slug, name, bonus, codesCount, parrainsCount, dateStr })

  /* ── Maillage : marques de la même catégorie (curées) + marques les plus actives ── */
  const topActive = await getTopActiveBrands()
  const related: { slug: string; name: string }[] = []
  if (category) {
    const catSlugs = category.brands.filter((s) => s !== slug)
    if (catSlugs.length > 0) {
      const supabase = createAnonSupabase()
      const { data: catCompanies } = await supabase
        .from('companies')
        .select('name, url_slug')
        .in('url_slug', catSlugs)
      for (const c of (catCompanies ?? []) as any[]) {
        if (!related.some((r) => r.slug === c.url_slug)) related.push({ slug: c.url_slug, name: formatBrandName(c.name) })
      }
    }
  }
  for (const t of topActive) {
    if (related.length >= 12) break
    if (t.slug === slug || related.some((r) => r.slug === t.slug)) continue
    related.push({ slug: t.slug, name: formatBrandName(t.name) })
  }

  /* ── JSON-LD ── */
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Accueil', item: SITE_URL },
      category
        ? { '@type': 'ListItem', position: 2, name: category.short, item: `${SITE_URL}/code-parrainage/categorie/${category.slug}` }
        : { '@type': 'ListItem', position: 2, name: 'Codes de parrainage', item: `${SITE_URL}/codes` },
      { '@type': 'ListItem', position: 3, name: `Code parrainage ${name}`, item: url },
    ],
  }

  const [first, ...others] = announcements as any[]
  const firstParsed = first ? parseAnnouncementDescription(first.description) : null

  const steps = [
    codesCount > 0 ? `Copie un code de cette page.` : `Récupère un code auprès d'un proche déjà client, ou reviens quand un parrain aura publié le sien.`,
    `Ouvre le site ou l'application ${name} et commence ton inscription.`,
    `Colle le code dans le champ « code parrainage », « code promo » ou « code ami », avant de valider.`,
    bonus
      ? `La prime (${bonus}) est versée par ${name} une fois ses conditions remplies.`
      : `Si ${name} prévoit une prime de parrainage, elle est versée une fois ses conditions remplies.`,
  ]

  return (
    <div className="bp">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbJsonLd) }} />

      <Navbar />

      <main>
        {/* ── En-tête : la marque, la prime, et le code le plus récent ── */}
        <section className="bp-hero">
          <div className="wrap">
            <nav aria-label="Fil d'Ariane" className="bp-crumbs">
              <a href="/">Accueil</a>
              <span aria-hidden="true">/</span>
              {category ? (
                <a href={`/code-parrainage/categorie/${category.slug}`}>{category.short}</a>
              ) : (
                <a href="/codes">Codes de parrainage</a>
              )}
              <span aria-hidden="true">/</span>
              <span>{name}</span>
            </nav>

            <div className="bp-hero-grid">
              <div>
                <div className="bp-brand">
                  <span className="bp-logo"><CompanyLogo domain={domain} name={name} /></span>
                  <span className="bp-brand-name">{name}</span>
                </div>
                <h1 className="bp-title">Code parrainage {name} {year}</h1>
                <p className="bp-tagline">{tagline}</p>

                {bonus && (
                  <div className="bp-bonus">
                    <span className="bp-bonus-label">Prime annoncée par {name}</span>
                    <span className="bp-bonus-value">{bonus}</span>
                  </div>
                )}

                {codesCount > 0 && (
                  <p className="bp-own">Client {name} ? <a href={publishHref} rel="nofollow">Publie ton code</a>, il apparaîtra ici.</p>
                )}
                {codesCount > 0 && (
                  <p className="bp-facts tnum">
                    {codesCount} code{codesCount > 1 ? 's' : ''} publié{codesCount > 1 ? 's' : ''} par {parrainsCount} parrain{parrainsCount > 1 ? 's' : ''}
                    {dateStr && <>, dernière mise à jour le {dateStr}</>}
                  </p>
                )}
              </div>

              {first ? (
                <div className="bp-top" id={`code-${first.id}`}>
                  <p className="bp-top-label">{first.boosted ? 'Code mis en avant' : 'Le code le plus récent'}</p>
                  <div className="bp-ticket">
                    <span className="bp-ticket-code code-str" title={first.code}>
                      {isLink(first.code) ? first.code.replace(/^https?:\/\/(www\.)?/i, '') : first.code}
                    </span>
                    <CopyButton code={first.code} variant="ink" announcementId={first.id} />
                  </div>
                  {firstParsed?.gain && <p className="bp-gain">{firstParsed.gain}</p>}
                  {firstParsed?.description && <p className="bp-desc">{firstParsed.description}</p>}
                  <p className="bp-by">
                    Publié par{' '}
                    <a href={`/u/${encodeURIComponent(first.users?.pseudo ?? '')}`}>{first.users?.pseudo ?? 'un membre'}</a>
                    {first.users?.level && <span className="bp-level">{first.users.level}</span>}
                    <span className="bp-date">le {new Date(first.last_bumped_at ?? first.created_at).toLocaleDateString('fr-FR')}</span>
                  </p>
                  {isLink(first.code) && <p className="bp-hint">C&apos;est un lien : ouvre-le, ou copie-le dans ton navigateur pour t&apos;inscrire.</p>}
                  <TestCode announcementId={first.id} stats={{ tests_ok: first.tests_ok, tests_ko: first.tests_ko, last_tested_at: first.last_tested_at }} />
                </div>
              ) : (
                <div className="bp-top bp-empty">
                  <p className="bp-empty-title">
                    {pickVariant(slug, [
                      `Aucun code ${name} pour l'instant.`,
                      `Personne n'a encore partagé de code ${name}.`,
                      `Pas encore de code ${name} publié.`,
                    ], 21)}
                  </p>
                  <p className="bp-desc">Tu es client {name} ? Ton code se trouve dans ton espace client ou dans l&apos;application. Publie-le : il apparaîtra ici.</p>
                  <a href={publishHref} rel="nofollow" className="btn btn-accent">Publier le premier code</a>
                </div>
              )}
            </div>

            {betting && (
              <p className="bp-anj">
                Jouer comporte des risques : endettement, isolement, dépendance. Pour être aidé, appelle le 09 74 75 13 13
                (appel non surtaxé). Les jeux d&apos;argent sont interdits aux moins de 18 ans.
              </p>
            )}
          </div>
        </section>

        {/* ── Les autres codes ── */}
        {others.length > 0 && (
          <section className="bp-list-section">
            <div className="wrap">
              <div className="bp-list-head">
                <h2>Les autres codes {name}</h2>
                <a href={publishHref} rel="nofollow" className="bp-publish">Publier le mien</a>
              </div>
              <ul className="bp-list">
                {others.map((ann: any) => {
                  const { gain, description } = parseAnnouncementDescription(ann.description)
                  return (
                    <li key={ann.id} id={`code-${ann.id}`} className="bp-row reveal">
                      <div className="bp-row-code">
                        <span className="code-str" title={ann.code}>
                          {isLink(ann.code) ? ann.code.replace(/^https?:\/\/(www\.)?/i, '') : ann.code}
                        </span>
                        <CopyButton code={ann.code} announcementId={ann.id} />
                      </div>
                      {(gain || description) && (
                        <p className="bp-row-desc">
                          {gain && <span className="bp-row-gain">{gain}</span>}
                          {description}
                        </p>
                      )}
                      <p className="bp-row-by">
                        <a href={`/u/${encodeURIComponent(ann.users?.pseudo ?? '')}`}>{ann.users?.pseudo ?? 'un membre'}</a>
                        {ann.users?.level && <span className="bp-level">{ann.users.level}</span>}
                        <span className="bp-date">{new Date(ann.last_bumped_at ?? ann.created_at).toLocaleDateString('fr-FR')}</span>
                      </p>
                      <TestCode announcementId={ann.id} stats={{ tests_ok: ann.tests_ok, tests_ko: ann.tests_ko, last_tested_at: ann.last_tested_at }} />
                    </li>
                  )
                })}
              </ul>
            </div>
          </section>
        )}

        {/* ── Mode d'emploi et questions ── */}
        <section className="band-paper bp-help">
          <div className="wrap bp-help-grid">
            <div>
              <h2 className="reveal">Comment utiliser un code parrainage {name}</h2>
              <ol className="bp-steps">
                {steps.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ol>
            </div>
            <div>
              <h2>Questions sur le parrainage {name}</h2>
              {faq.map((item, i) => (
                <details key={i} className="bp-qa reveal">
                  <summary><h3>{item.q}</h3></summary>
                  <p>{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ── Maillage interne ── */}
        <section className="bp-related">
          <div className="wrap">
            <h2>{category ? `Autres codes ${category.short.toLowerCase()}` : 'Autres codes de parrainage'}</h2>
            <ul className="bp-related-list">
              {related.map((r) => (
                <li key={r.slug}>
                  <a href={`/code-parrainage/${r.slug}`}>Code parrainage {r.name}</a>
                </li>
              ))}
            </ul>
            <div className="bp-related-foot">
              {category && <a href={`/code-parrainage/categorie/${category.slug}`} className="btn btn-ghost">Tous les codes {category.short.toLowerCase()}</a>}
              <a href="/codes" className="btn btn-ghost">Toutes les marques</a>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
