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
    { url: baseUrl,                    lastModified: new Date(), changeFrequency: 'daily'  as const, priority: 1   },
    { url: `${baseUrl}/codes`,         lastModified: new Date(), changeFrequency: 'daily'  as const, priority: 0.8 },
    { url: `${baseUrl}/classement`,    lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.5 },
    ...companyPages,
  ]
}
