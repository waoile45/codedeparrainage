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
        ],
      },
    ],
    sitemap: 'https://www.codedeparrainage.com/sitemap.xml',
  }
}
