import { createAnonSupabase } from '@/lib/supabase-server'

export default async function sitemap() {
  const baseUrl = 'https://www.codedeparrainage.com'

  const supabase = createAnonSupabase()
  const { data: companies } = await supabase
    .from('companies')
    .select('url_slug')

  const companyPages = (companies ?? [])
    .filter((c) => c.url_slug) // ignore les entrées sans url_slug
    .map((c) => ({
      url: `${baseUrl}/code-parrainage/${c.url_slug}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    }))

  return [
    { url: baseUrl,                              lastModified: new Date(), changeFrequency: 'daily'   as const, priority: 1.0 },
    { url: `${baseUrl}/codes`,                   lastModified: new Date(), changeFrequency: 'daily'   as const, priority: 0.9 },
    { url: `${baseUrl}/classement`,              lastModified: new Date(), changeFrequency: 'daily'   as const, priority: 0.7 },
    { url: `${baseUrl}/faq`,                     lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.6 },
    { url: `${baseUrl}/avis`,                    lastModified: new Date(), changeFrequency: 'weekly'  as const, priority: 0.5 },
    { url: `${baseUrl}/cgu`,                     lastModified: new Date(), changeFrequency: 'yearly'  as const, priority: 0.2 },
    { url: `${baseUrl}/confidentialite`,         lastModified: new Date(), changeFrequency: 'yearly'  as const, priority: 0.2 },
    { url: `${baseUrl}/mentions-legales`,        lastModified: new Date(), changeFrequency: 'yearly'  as const, priority: 0.2 },
    ...companyPages,
  ]
}
