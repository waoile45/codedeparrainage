import { cache } from 'react'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createAnonSupabase } from '@/lib/supabase-server'
import Navbar from '@/components/Navbar'
import CopyButton from '@/components/CopyButton'
import CompanyLogo from '@/components/CompanyLogo'
import { FraicheurCode } from '@/components/FraicheurCode'
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
import { getCategoryForBrand } from '@/data/categories'

// ISR 4h — pages 100% statiques (client anon : PAS de cookies(), sinon la route
// bascule en rendu dynamique à chaque requête et n'est plus pré-générée).
export const revalidate = 14400
export const dynamicParams = true

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
    .select('*, users (pseudo, xp, level)')
    .in('company_id', ids)
    .order('last_bumped_at', { ascending: false })

  return { company, announcements: announcements ?? [] }
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
  const lastDateIso = announcements[0]?.last_bumped_at ?? announcements[0]?.created_at ?? null
  const bonus: string | null = company.referral_bonus_description ?? null

  const metaInput = { slug, name, bonus, codesCount, lastDateIso }
  const title = buildBrandTitle(metaInput)
  const description = buildBrandDescription(metaInput)
  const url = `${SITE_URL}/code-parrainage/${slug}`

  return {
    title: { absolute: title },
    description,
    alternates: { canonical: url },
    // Coquille vide (0 code) → noindex,follow : hors index sans casser le maillage.
    robots: codesCount > 0 ? { index: true, follow: true } : { index: false, follow: true },
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
      a: `Les codes listés sur cette page sont publiés par des parrains inscrits et notés par la communauté (code fonctionnel, réponse rapide…)${dateStr ? ` — dernier code mis à jour le ${dateStr}` : ''}. En cas de problème, tu peux contacter le parrain directement depuis son annonce.`,
    })
  }

  return faq
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
  const lastDateIso = announcements[0]?.last_bumped_at ?? announcements[0]?.created_at ?? null
  const dateStr = formatDateFr(lastDateIso)
  const year = new Date().getFullYear()
  const category = getCategoryForBrand(slug)
  const url = `${SITE_URL}/code-parrainage/${slug}`

  // Le domaine pour le favicon — on nettoie au cas où la colonne slug contient un path ou sous-domaine
  const domain = (company.slug ?? slug + '.com').replace(/^(https?:\/\/)?(www\.)?/, '')

  // Sous-titre : description réelle si en base, sinon formulation variée SANS donnée inventée
  const tagline: string =
    company.description ??
    pickVariant(slug, [
      `Codes de parrainage ${name} partagés et vérifiés par la communauté.`,
      `Les codes parrainage ${name} publiés par nos parrains, mis à jour en continu.`,
      `Trouve un parrain ${name} actif et récupère son code en un clic.`,
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
        related.push({ slug: c.url_slug, name: formatBrandName(c.name) })
      }
    }
  }
  for (const t of topActive) {
    if (related.length >= 10) break
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

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', fontFamily: "var(--font-dm-sans),'DM Sans',sans-serif", color: 'var(--text-strong)' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbJsonLd) }} />

      <Navbar />

      <div style={{ maxWidth: 860, margin: '0 auto', padding: '2rem 1.5rem 6rem' }}>

        {/* ── Fil d'Ariane (cohérent avec le BreadcrumbList JSON-LD) ── */}
        <nav aria-label="Fil d'Ariane" style={{ fontSize: '.78rem', color: 'var(--text-faint)', marginBottom: '1rem', display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
          <a href="/" style={{ color: 'var(--text-dim)', textDecoration: 'none' }}>Accueil</a>
          <span aria-hidden="true">›</span>
          {category ? (
            <a href={`/code-parrainage/categorie/${category.slug}`} style={{ color: 'var(--text-dim)', textDecoration: 'none' }}>{category.short}</a>
          ) : (
            <a href="/codes" style={{ color: 'var(--text-dim)', textDecoration: 'none' }}>Codes de parrainage</a>
          )}
          <span aria-hidden="true">›</span>
          <span style={{ color: 'var(--text-muted)' }}>{name}</span>
        </nav>

        {/* ── En-tête entreprise ── */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 20, padding: '1.75rem', marginBottom: '1.25rem' }}>
          <div className="brand-head" style={{ marginBottom: bonus || codesCount > 0 ? '1.25rem' : 0 }}>
            <div style={{ width: 56, height: 56, borderRadius: 14, background: 'rgba(124,58,237,.12)', border: '1px solid rgba(124,58,237,.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
              <CompanyLogo domain={domain} name={name} />
            </div>
            <div>
              <h1 style={{ fontFamily: "var(--font-syne),Syne,sans-serif", fontWeight: 800, fontSize: 'clamp(1.4rem,3vw,1.9rem)', margin: 0, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                Code parrainage {name} {year}
              </h1>
              <p style={{ color: 'var(--text-dim)', fontSize: '.85rem', margin: '4px 0 0' }}>{tagline}</p>
            </div>
          </div>

          {/* Offre — UNIQUEMENT si la donnée existe en base (fini le « null ») */}
          {bonus && (
            <div style={{ background: 'rgba(124,58,237,.1)', border: '1px solid rgba(124,58,237,.25)', borderRadius: 14, padding: '1rem 1.25rem', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <div>
                <div style={{ fontSize: '.72rem', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: '#a78bfa', marginBottom: 4 }}>Offre de parrainage</div>
                <div style={{ color: 'var(--text-strong)', fontWeight: 600, fontSize: '.95rem' }}>{bonus}</div>
              </div>
            </div>
          )}

          {/* E-E-A-T : signaux réels de fraîcheur et de vérification communautaire */}
          {codesCount > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem 1.25rem', marginTop: bonus ? '0.875rem' : 0, fontSize: '.78rem', color: 'var(--text-muted)' }}>
              <span>{codesCount} code{codesCount > 1 ? 's' : ''} publié{codesCount > 1 ? 's' : ''}</span>
              <span>{parrainsCount} parrain{parrainsCount > 1 ? 's' : ''} inscrit{parrainsCount > 1 ? 's' : ''}</span>
              {dateStr && <span>Dernière mise à jour le {dateStr}</span>}
            </div>
          )}
        </div>

        {/* ── Liste des codes ── */}
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: '1rem' }}>
          <h2 style={{ fontFamily: "var(--font-syne),Syne,sans-serif", fontWeight: 700, fontSize: '1rem', margin: 0, color: 'var(--text-strong)' }}>
            {codesCount} code{codesCount > 1 ? 's' : ''} parrainage {name} disponible{codesCount > 1 ? 's' : ''}
          </h2>
          <a href="/publier" style={{ fontSize: '.78rem', color: '#a78bfa', textDecoration: 'none', fontWeight: 600 }}>
            + Publier le mien
          </a>
        </div>

        {codesCount > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {announcements.map((ann: any) => {
              const { gain, description } = parseAnnouncementDescription(ann.description)
              return (
                <div key={ann.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 18, padding: '1.25rem 1.375rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-code,rgba(124,58,237,.07))', border: '1px solid var(--border)', borderRadius: 12, padding: '.75rem 1rem', marginBottom: '0.875rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#7c3aed', boxShadow: '0 0 6px #7c3aed', display: 'inline-block', flexShrink: 0 }} />
                      <code style={{ fontFamily: "'Courier New',monospace", fontSize: '.95rem', fontWeight: 700, color: 'var(--text-strong)', letterSpacing: '.08em', wordBreak: 'break-all' }}>
                        {ann.code}
                      </code>
                    </div>
                    <CopyButton code={ann.code} announcementId={ann.id} />
                  </div>

                  {/* Gain custom (préfixe __gain__) parsé — plus jamais rendu brut */}
                  {gain && (
                    <span style={{ display: 'inline-block', padding: '.3rem .625rem', background: 'rgba(34,197,94,.12)', border: '1px solid rgba(34,197,94,.25)', borderRadius: 8, color: '#16a34a', fontSize: '.8rem', fontWeight: 700, marginBottom: '.75rem' }}>
                      {gain}
                    </span>
                  )}

                  {description && (
                    <p style={{ fontSize: '.875rem', color: 'var(--text-muted)', margin: '0 0 .875rem', lineHeight: 1.55 }}>{description}</p>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'rgba(124,58,237,.2)', border: '1px solid rgba(124,58,237,.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.72rem', fontWeight: 700, color: '#a78bfa', flexShrink: 0 }}>
                      {ann.users?.pseudo?.slice(0, 1).toUpperCase()}
                    </div>
                    <a href={`/u/${encodeURIComponent(ann.users?.pseudo ?? '')}`} style={{ fontSize: '.8rem', color: 'var(--text-muted)', textDecoration: 'none', fontWeight: 500 }}>
                      {ann.users?.pseudo}
                    </a>
                    {ann.users?.level && (
                      <span style={{ fontSize: '.7rem', fontWeight: 600, color: '#a78bfa', background: 'rgba(124,58,237,.12)', border: '1px solid rgba(124,58,237,.25)', borderRadius: 100, padding: '1px 8px' }}>
                        {ann.users.level}
                      </span>
                    )}
                    <span style={{ fontSize: '.75rem', color: 'var(--text-faint)', marginLeft: 'auto' }}>
                      {new Date(ann.last_bumped_at ?? ann.created_at).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  {/* Fraîcheur du code : la seule donnée du site qu'un moteur
                      génératif ne peut pas restituer, puisqu'elle périme. */}
                  <div style={{ marginTop: '.6rem', paddingTop: '.6rem', borderTop: '1px solid var(--border)' }}>
                    <FraicheurCode stats={ann} />
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 18, padding: '3rem 2rem', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '.9rem', marginBottom: '1.25rem' }}>
              {pickVariant(slug, [
                `Aucun code parrainage ${name} pour l'instant — sois le premier parrain.`,
                `Personne n'a encore partagé de code ${name}. Client ${name} ? Publie le tien.`,
                `Pas encore de code ${name} publié par la communauté.`,
              ], 21)}
            </p>
            <a href="/publier" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#7c3aed', color: '#fff', fontWeight: 700, fontSize: '.875rem', padding: '.7rem 1.5rem', borderRadius: 12, textDecoration: 'none' }}>
              Publier le premier code
            </a>
          </div>
        )}

        {/* ── Comment utiliser ── */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 20, padding: '1.5rem', marginTop: '1.5rem', marginBottom: '1.25rem' }}>
          <h2 style={{ fontFamily: "var(--font-syne),Syne,sans-serif", fontWeight: 700, fontSize: '1rem', margin: '0 0 .875rem', color: 'var(--text-strong)' }}>
            Comment utiliser un code parrainage {name} ?
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              codesCount > 0 ? `Choisis un code dans la liste ci-dessus.` : `Reviens quand un parrain aura publié son code, ou récupères-en un auprès d'un proche déjà client.`,
              `Copie-le et rends-toi sur le site ou l'application ${name}.`,
              `Entre le code lors de ton inscription (champ « code parrainage » ou « code promo »).`,
              bonus
                ? `${bonus} — la récompense est créditée après validation des conditions.`
                : `Valide ton inscription : si ${name} prévoit un bonus de parrainage, il est crédité une fois les conditions remplies.`,
            ].map((step, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <span style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(124,58,237,.2)', border: '1px solid rgba(124,58,237,.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.7rem', fontWeight: 800, color: '#a78bfa', flexShrink: 0, marginTop: 1 }}>{i + 1}</span>
                <p style={{ fontSize: '.875rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.55 }}>{step}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── FAQ : questions dont la réponse dépend des données de la page ── */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 20, padding: '1.5rem', marginBottom: '1.5rem' }}>
          <h2 style={{ fontFamily: "var(--font-syne),Syne,sans-serif", fontWeight: 700, fontSize: '1rem', margin: '0 0 .875rem', color: 'var(--text-strong)' }}>
            Questions fréquentes — parrainage {name}
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {faq.map((item, i, arr) => (
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

        {/* ── Maillage interne ── */}
        <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
          {category && (
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '.72rem', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text-faint)', marginBottom: '0.875rem', fontFamily: "var(--font-syne),Syne,sans-serif" }}>
                {category.label}
              </div>
              <a href={`/code-parrainage/categorie/${category.slug}`} style={{ fontSize: '.8rem', color: '#a78bfa', textDecoration: 'none', fontWeight: 600 }}>
                Voir tous les codes {category.short.toLowerCase()} →
              </a>
            </div>
          )}
          <div style={{ fontSize: '.72rem', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text-faint)', marginBottom: '0.875rem', fontFamily: "var(--font-syne),Syne,sans-serif" }}>
            Autres codes populaires
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {related.map((r) => (
              <a key={r.slug} href={`/code-parrainage/${r.slug}`} style={{ fontSize: '.8rem', padding: '.4rem .875rem', borderRadius: 10, background: 'var(--bg-card-md)', border: '1px solid var(--border)', color: 'var(--text-dim)', textDecoration: 'none' }}>
                Code parrainage {r.name}
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
        .brand-head { display: flex; align-items: center; gap: 16px; }
        @media (max-width: 600px) {
          .brand-head { align-items: flex-start; gap: 12px; }
          .brand-head h1 { font-size: 1.3rem !important; }
        }
      `}</style>
    </div>
  )
}
