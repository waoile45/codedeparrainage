import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { safeNext } from '@/lib/safe-next'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  // Chemin interne uniquement : voir safeNext (open redirect corrigé).
  const next = safeNext(requestUrl.searchParams.get('next'))

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )

    await supabase.auth.exchangeCodeForSession(code)

    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      // Profil créé par la base (trigger à l'inscription) ; filet de sécurité
      // pour un compte qui n'en aurait pas. Puis série et XP du jour, calculées
      // par la base : le client n'écrit plus ces colonnes.
      await supabase.rpc('assurer_profil')
      await supabase.rpc('enregistrer_connexion')
    }
  }

  return NextResponse.redirect(new URL(next, requestUrl.origin))
}
