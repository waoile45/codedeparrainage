import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
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

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non connecté' }, { status: 401 })

  const { announcementId, turnstileToken } = await request.json()

  // Vérification Turnstile anti-bot
  if (!turnstileToken) {
    return NextResponse.json({ error: 'Vérification anti-bot manquante' }, { status: 403 })
  }

  const verify = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      secret: process.env.TURNSTILE_SECRET_KEY,
      response: turnstileToken,
    }),
  })
  const verifyData = await verify.json()

  if (!verifyData.success) {
    return NextResponse.json({ error: 'Vérification anti-bot échouée' }, { status: 403 })
  }

  if (typeof announcementId !== 'string' || !/^[0-9a-f-]{36}$/i.test(announcementId)) {
    return NextResponse.json({ error: 'Annonce invalide' }, { status: 400 })
  }

  // Contrôle du propriétaire, limite de 5 par jour et +5 XP dans une seule
  // fonction en base, ligne verrouillée : des requêtes parallèles ne passent plus.
  const { data: bumpsLeft, error } = await supabase.rpc('remonter_annonce', {
    p_announcement_id: announcementId,
  })
  if (error) {
    const msg = error.message ?? ''
    if (msg.includes('limite_remontees')) {
      return NextResponse.json({ error: 'Limite de 5 remontées par jour atteinte' }, { status: 429 })
    }
    if (msg.includes('annonce_introuvable')) {
      return NextResponse.json({ error: 'Annonce introuvable' }, { status: 404 })
    }
    console.error('[/api/bump] remonter_annonce:', error.code)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }

  return NextResponse.json({ success: true, bumpsLeft })
}