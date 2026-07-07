import type { NextConfig } from 'next'

const isDev = process.env.NODE_ENV === 'development'

// Content-Security-Policy
// - script-src : 'unsafe-inline' requis par Next.js (scripts inline d'hydratation),
//   'unsafe-eval' uniquement en dev (HMR Turbopack). challenges.cloudflare.com = Turnstile.
// - img-src : logos d'entreprises (favicons Google/DuckDuckGo/gstatic) + avatars Supabase Storage.
//   blob:/data: requis par le recadrage photo (canvas) du profil.
// - connect-src : Supabase (REST + Realtime websocket) et Turnstile.
// - frame-src : iframe du widget Turnstile.
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''} https://challenges.cloudflare.com`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://www.google.com https://icons.duckduckgo.com https://t2.gstatic.com https://*.supabase.co",
  "font-src 'self'",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://challenges.cloudflare.com",
  "frame-src https://challenges.cloudflare.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  ...(isDev ? [] : ['upgrade-insecure-requests']),
].join('; ')

const securityHeaders = [
  { key: 'Content-Security-Policy', value: csp },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
]

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ]
  },
  // Une seule version canonique : non-www → www en redirection permanente.
  // (Le trailing slash est déjà normalisé par Next : /foo/ → 308 → /foo.)
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'codedeparrainage.com' }],
        destination: 'https://www.codedeparrainage.com/:path*',
        permanent: true,
      },
    ]
  },
}

export default nextConfig
