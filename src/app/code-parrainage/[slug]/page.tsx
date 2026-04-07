import { createServerSupabase, createAnonSupabase } from '@/lib/supabase-server'
import { Metadata } from 'next'
import Navbar from '@/components/Navbar'
import CopyButton from '@/components/CopyButton'

export const revalidate = 14400

type Props = { params: Promise<{ slug: string }> }

// Mapping domaine DB → slug URL propre
const DOMAIN_TO_SLUG: Record<string, string> = {
  'boursobank.com':    'boursobank',
  'fortuneo.fr':      'fortuneo',
  'hello.bank':       'hello-bank',
  'revolut.com':      'revolut',
  'lydia-app.com':    'lydia',
  'winamax.fr':       'winamax',
  'betclic.fr':       'betclic',
  'unibet.fr':        'unibet',
  'pmu.fr':           'pmu',
  'free.fr':          'free',
  'sfr.fr':           'sfr',
  'igraal.com':       'igraal',
  'poulpeo.com':      'poulpeo',
  'binance.com':      'binance',
  'coinbase.com':     'coinbase',
  'edf.fr':           'edf',
  'engie.fr':         'engie',
  'traderepublic.com':'trade-republic',
  'boursedirect.fr':  'bourse-direct',
  'pokerstars.fr':    'pokerstars',
  '10doigts.com':     '10doigts',
  'pokawa.com':       'pokawa',
}

// Mapping slug URL → domaine DB
function getDomain(slug: string): string {
  const domains: Record<string, string> = {
    'boursobank':    'boursobank.com',
    'fortuneo':     'fortuneo.fr',
    'hello-bank':   'hello.bank',
    'revolut':      'revolut.com',
    'lydia':        'lydia-app.com',
    'winamax':      'winamax.fr',
    'betclic':      'betclic.fr',
    'unibet':       'unibet.fr',
    'pmu':          'pmu.fr',
    'free':         'free.fr',
    'sfr':          'sfr.fr',
    'igraal':       'igraal.com',
    'poulpeo':      'poulpeo.com',
    'binance':      'binance.com',
    'coinbase':     'coinbase.com',
    'edf':          'edf.fr',
    'engie':        'engie.fr',
    'trade-republic':'traderepublic.com',
    'bourse-direct':'boursedirect.fr',
    'pokerstars':   'pokerstars.fr',
    '10doigts':     '10doigts.com',
    'pokawa':       'pokawa.com',
  }
  return domains[slug] ?? slug + '.com'
}

export async function generateStaticParams() {
  const supabase = createAnonSupabase()
  const { data: companies } = await supabase.from('companies').select('slug')
  return (companies ?? []).map((c) => ({
    slug: DOMAIN_TO_SLUG[c.slug] ?? c.slug.replace(/\.(com|fr|io|co|net|org|bank|be|es|de)$/, ''),
  }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createServerSupabase()
  const domain = getDomain(slug)
  const { data: company } = await supabase
    .from('companies')
    .select('*')
    .or(`slug.eq.${domain},slug.eq.${slug}`)
    .limit(1)
    .maybeSingle()

  if (!company) return { title: 'Code parrainage introuvable' }

  const year = new Date().getFullYear()
  const title = `Code parrainage ${company.name} ${year} — ${company.referral_bonus_description}`
  const description = `Obtenez un code parrainage ${company.name} vérifié en ${year}. ${company.referral_bonus_description}. Codes actifs partagés par la communauté, mis à jour en temps réel.`

  return {
    title,
    description,
    alternates: { canonical: `https://www.codedeparrainage.com/code-parrainage/${slug}` },
    openGraph: { title, description, url: `https://www.codedeparrainage.com/code-parrainage/${slug}`, type: 'website' },
  }
}

const AUTRES = ['boursobank', 'winamax', 'betclic', 'revolut', 'trade-republic', 'binance', 'fortuneo', 'bourse-direct']

export default async function CompanyPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createServerSupabase()
  const domain = getDomain(slug)

  const { data: company } = await supabase
    .from('companies')
    .select('*')
    .or(`slug.eq.${domain},slug.eq.${slug}`)
    .limit(1)
    .maybeSingle()

  if (!company) {
    return (
      <div style={{ background: 'var(--bg)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
        <div style={{ fontSize: '3rem' }}>😕</div>
        <div style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>Entreprise introuvable</div>
        <a href="/" style={{ color: '#a78bfa', fontSize: '.875rem', marginTop: 8 }}>Retour à l'accueil</a>
      </div>
    )
  }

  const { data: announcements } = await supabase
    .from('announcements')
    .select('*, users (pseudo, xp, level)')
    .eq('company_id', company.id)
    .order('last_bumped_at', { ascending: false })

  const autresSlug = AUTRES.filter(s => s !== slug)
  const year = new Date().getFullYear()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    'name': `Codes parrainage ${company.name} ${year}`,
    'description': company.referral_bonus_description,
    'numberOfItems': announcements?.length ?? 0,
    'itemListElement': (announcements ?? []).slice(0, 10).map((ann: any, i: number) => ({
      '@type': 'ListItem',
      'position': i + 1,
      'name': `Code parrainage ${company.name} — ${ann.code}`,
      'url': `https://www.codedeparrainage.com/code-parrainage/${slug}`,
    })),
  }

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', fontFamily: "var(--font-dm-sans),'DM Sans',sans-serif", color: 'var(--text-strong)' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <Navbar />

      <div style={{ maxWidth: 860, margin: '0 auto', padding: '2rem 1.5rem 6rem' }}>

        {/* ── En-tête entreprise ── */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 20, padding: '1.75rem', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: '1.25rem' }}>
            <div style={{ width: 56, height: 56, borderRadius: 14, background: 'rgba(124,58,237,.12)', border: '1px solid rgba(124,58,237,.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
              <img
                src={`https://www.google.com/s2/favicons?domain=${domain}&sz=64`}
                alt={company.name}
                style={{ width: 36, height: 36, objectFit: 'contain' }}
              />
            </div>
            <div>
              <h1 style={{ fontFamily: "var(--font-syne),Syne,sans-serif", fontWeight: 800, fontSize: 'clamp(1.4rem,3vw,1.9rem)', margin: 0, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                Code parrainage {company.name} {year}
              </h1>
              <p style={{ color: 'var(--text-dim)', fontSize: '.85rem', margin: '4px 0 0' }}>{company.description}</p>
            </div>
          </div>

          <div style={{ background: 'rgba(124,58,237,.1)', border: '1px solid rgba(124,58,237,.25)', borderRadius: 14, padding: '1rem 1.25rem', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <span style={{ fontSize: '1.1rem', flexShrink: 0, marginTop: 1 }}>🎁</span>
            <div>
              <div style={{ fontSize: '.72rem', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: '#a78bfa', marginBottom: 4 }}>Offre de parrainage</div>
              <div style={{ color: 'var(--text-strong)', fontWeight: 600, fontSize: '.95rem' }}>{company.referral_bonus_description}</div>
            </div>
          </div>
        </div>

        {/* ── Comment utiliser ── */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 20, padding: '1.5rem', marginBottom: '1.25rem' }}>
          <h2 style={{ fontFamily: "var(--font-syne),Syne,sans-serif", fontWeight: 700, fontSize: '1rem', margin: '0 0 .875rem', color: 'var(--text-strong)' }}>
            Comment utiliser un code parrainage {company.name} ?
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              `Choisissez un code dans la liste ci-dessous.`,
              `Copiez-le et rendez-vous sur le site ou l'application ${company.name}.`,
              `Entrez le code lors de votre inscription (champ "code parrainage" ou "code promo").`,
              `${company.referral_bonus_description} — la récompense sera créditée après validation.`,
            ].map((step, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <span style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(124,58,237,.2)', border: '1px solid rgba(124,58,237,.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.7rem', fontWeight: 800, color: '#a78bfa', flexShrink: 0, marginTop: 1 }}>{i + 1}</span>
                <p style={{ fontSize: '.875rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.55 }}>{step}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── FAQ ── */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 20, padding: '1.5rem', marginBottom: '1.5rem' }}>
          <h2 style={{ fontFamily: "var(--font-syne),Syne,sans-serif", fontWeight: 700, fontSize: '1rem', margin: '0 0 .875rem', color: 'var(--text-strong)' }}>
            Questions fréquentes — {company.name}
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {[
              {
                q: `Le code parrainage ${company.name} est-il valable en ${year} ?`,
                a: `Oui. Les codes présentés sont vérifiés par notre communauté. ${company.referral_bonus_description}. Vérifiez les conditions directement sur le site ${company.name} lors de l'inscription.`,
              },
              {
                q: `Peut-on utiliser plusieurs codes parrainage ${company.name} ?`,
                a: `Non, ${company.name} n'accepte généralement qu'un seul code par compte. Choisissez un parrain actif dans la liste ci-dessous.`,
              },
              {
                q: `Où entrer le code parrainage ${company.name} ?`,
                a: `Le code s'entre lors de votre inscription, dans le champ "code parrainage", "code promo" ou "code ami" selon la plateforme.`,
              },
              {
                q: `Combien de temps pour recevoir la récompense ${company.name} ?`,
                a: `Le délai varie selon les conditions de ${company.name}. En général, la récompense est versée après validation du compte et des conditions requises (dépôt minimum, première mise, etc.).`,
              },
            ].map((item, i, arr) => (
              <details key={i} style={{ borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none', padding: '0.75rem 0' }}>
                <summary style={{ fontSize: '.875rem', fontWeight: 600, color: 'var(--text-strong)', cursor: 'pointer', listStyle: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                  {item.q}
                  <span style={{ color: 'var(--text-faint)', fontSize: '.75rem', flexShrink: 0 }}>▼</span>
                </summary>
                <p style={{ fontSize: '.85rem', color: 'var(--text-muted)', margin: '.625rem 0 0', lineHeight: 1.6 }}>{item.a}</p>
              </details>
            ))}
          </div>
        </div>

        {/* ── Liste des codes ── */}
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h2 style={{ fontFamily: "var(--font-syne),Syne,sans-serif", fontWeight: 700, fontSize: '1rem', margin: 0, color: 'var(--text-strong)' }}>
            {announcements?.length ?? 0} code{(announcements?.length ?? 0) > 1 ? 's' : ''} parrainage {company.name} disponible{(announcements?.length ?? 0) > 1 ? 's' : ''}
          </h2>
          <a href="/publier" style={{ fontSize: '.78rem', color: '#a78bfa', textDecoration: 'none', fontWeight: 600 }}>
            + Publier le mien
          </a>
        </div>

        {announcements && announcements.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {announcements.map((ann: any) => (
              <div key={ann.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 18, padding: '1.25rem 1.375rem' }}>
                {/* Code row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-code,rgba(124,58,237,.07))', border: '1px solid var(--border)', borderRadius: 12, padding: '.75rem 1rem', marginBottom: '0.875rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#7c3aed', boxShadow: '0 0 6px #7c3aed', display: 'inline-block', flexShrink: 0 }} />
                    <code style={{ fontFamily: "'Courier New',monospace", fontSize: '.95rem', fontWeight: 700, color: 'var(--text-strong)', letterSpacing: '.08em' }}>
                      {ann.code}
                    </code>
                  </div>
                  <CopyButton code={ann.code} />
                </div>

                {ann.description && (
                  <p style={{ fontSize: '.875rem', color: 'var(--text-muted)', margin: '0 0 .875rem', lineHeight: 1.55 }}>{ann.description}</p>
                )}

                {/* Footer parrain */}
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
                    {new Date(ann.last_bumped_at).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 18, padding: '3rem 2rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.875rem' }}>🎯</div>
            <p style={{ color: 'var(--text-muted)', fontSize: '.9rem', marginBottom: '1.25rem' }}>
              Aucun code parrainage {company.name} pour l'instant.
            </p>
            <a href="/publier" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#7c3aed', color: '#fff', fontWeight: 700, fontSize: '.875rem', padding: '.7rem 1.5rem', borderRadius: 12, textDecoration: 'none' }}>
              Publier le premier code
            </a>
          </div>
        )}

        {/* ── Maillage interne ── */}
        <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
          <div style={{ fontSize: '.72rem', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text-faint)', marginBottom: '0.875rem', fontFamily: "var(--font-syne),Syne,sans-serif" }}>
            Autres codes populaires
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {autresSlug.map((s) => (
              <a key={s} href={`/code-parrainage/${s}`} style={{ fontSize: '.8rem', padding: '.4rem .875rem', borderRadius: 10, background: 'var(--bg-card-md)', border: '1px solid var(--border)', color: 'var(--text-dim)', textDecoration: 'none', transition: 'all .18s' }}>
                Code parrainage {s.charAt(0).toUpperCase() + s.slice(1).replace(/-/g, ' ')}
              </a>
            ))}
          </div>
        </div>

      </div>

      <style>{`
        details summary::-webkit-details-marker { display: none; }
        @media (max-width: 600px) {
          h1 { font-size: 1.35rem !important; }
        }
      `}</style>
    </div>
  )
}
