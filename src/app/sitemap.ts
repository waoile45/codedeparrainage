import { createAnonSupabase } from '@/lib/supabase-server'

// Même mapping que dans code-parrainage/[slug]/page.tsx
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

export default async function sitemap() {
  const baseUrl = 'https://www.codedeparrainage.com'

  const supabase = createAnonSupabase()
  const { data: companies } = await supabase
    .from('companies')
    .select('slug')

  const companyPages = (companies ?? []).map((c) => {
    const urlSlug = DOMAIN_TO_SLUG[c.slug] ?? c.slug.replace(/\.(com|fr|io|co|net|org|bank|be|es|de)$/, '')
    return {
      url: `${baseUrl}/code-parrainage/${urlSlug}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    }
  })

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/codes`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/classement`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.5,
    },
    ...companyPages,
  ]
}
