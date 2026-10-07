import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

const RATE_LIMIT_WINDOW_MS = 60_000
const MAX_REQUESTS_PER_WINDOW = 30

const ipRequestMap = new Map<string, { count: number; windowStart: number }>()

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  )
}

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const entry = ipRequestMap.get(ip)

  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    ipRequestMap.set(ip, { count: 1, windowStart: now })
    return false
  }

  entry.count++
  if (entry.count > MAX_REQUESTS_PER_WINDOW) return true
  return false
}

const RATE_LIMITED_PATHS = [
  '/api/messages',
  '/api/reviews',
  '/api/boost',
  '/api/bump',
  '/api/stripe/checkout',
  '/api/proposer-entreprise',
  '/api/verify-turnstile',
  // Endpoint public appelé à chaque copie de code : sans limite, le compteur
  // se gonfle en boucle depuis un simple script.
  '/api/code-copy',
]

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl
  const res = NextResponse.next()

  // ── Protection admin (serveur) ─────────────────────────────────────────────
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => req.cookies.getAll(),
          setAll: (cookiesToSet) => {
            cookiesToSet.forEach(({ name, value, options }) =>
              res.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      const loginUrl = new URL('/login', req.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }

    // Vérification email admin — fail-closed : si ADMIN_EMAIL n'est pas
    // configuré, personne ne passe (plutôt que tout utilisateur connecté).
    const adminEmail = process.env.ADMIN_EMAIL || process.env.NEXT_PUBLIC_ADMIN_EMAIL
    if (!adminEmail || user.email !== adminEmail) {
      return NextResponse.redirect(new URL('/', req.url))
    }
  }

  // ── Rate limiting routes API sensibles ────────────────────────────────────
  const isRateLimitedPath = RATE_LIMITED_PATHS.some(p => pathname.startsWith(p))
  if (isRateLimitedPath) {
    const ip = getClientIp(req)
    if (isRateLimited(ip)) {
      return new NextResponse(
        JSON.stringify({ error: 'Trop de requêtes. Réessayez dans une minute.' }),
        { status: 429, headers: { 'Content-Type': 'application/json', 'Retry-After': '60' } }
      )
    }
  }

  // Les en-têtes de sécurité (CSP, HSTS, X-Frame-Options…) sont définis dans
  // next.config.ts → headers(), appliqués à toutes les réponses y compris statiques.
  return res
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|logo.png|.*\\.svg).*)',
  ],
}
