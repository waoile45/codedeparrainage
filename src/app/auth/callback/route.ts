import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') ?? '/profil'

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
      // Créer le profil s'il n'existe pas (cas email confirmation activée)
      const { data: existingProfile } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .single()

      if (!existingProfile) {
        const pseudo = (user.user_metadata?.pseudo as string | undefined) ?? 'Anonyme'
        await supabase.from('users').insert({
          id:    user.id,
          email: user.email,
          pseudo,
        })
      }
    }
  }

  return NextResponse.redirect(new URL(next, requestUrl.origin))
}
