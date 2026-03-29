export default function sitemap() {
  const baseUrl = 'https://www.codedeparrainage.com'
  
  const companies = [
    'boursobank', 'fortuneo', 'hello-bank', 'revolut', 'lydia',
    'winamax', 'betclic', 'pmu', 'free', 'sfr',
    'igraal', 'poulpeo', 'binance', 'coinbase', 'edf', 'engie'
  ]

  const companyPages = companies.map((slug) => ({
    url: `${baseUrl}/code-parrainage/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.9,
  }))

  return [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 1 },
    { url: `${baseUrl}/codes`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.8 },
    { url: `${baseUrl}/classement`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.6 },
    ...companyPages,
  ]
}
