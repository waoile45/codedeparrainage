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
      const { data: existingProfile } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .single()

      if (!existingProfile) {
        // Pseudo : metadata.pseudo (email signup) → full_name Google → email prefix
        const meta = user.user_metadata ?? {}
        const pseudo =
          (meta.pseudo as string | undefined) ??
          (meta.full_name as string | undefined) ??
          (meta.name as string | undefined) ??
          (user.email?.split('@')[0] ?? 'Anonyme')

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
