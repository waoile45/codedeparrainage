import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/profil',
          '/messages',
          '/publier',
          '/login',
          '/register',
          '/api/',
          '/auth/',
          '/boost',
          '/credits',
          '/v2', // page démo avec données fictives — jamais à indexer
        ],
      },
    ],
    sitemap: 'https://www.codedeparrainage.com/sitemap.xml',
  }
}
