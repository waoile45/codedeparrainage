import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

/**
 * Enregistre le test d'un code : « ça a marché » / « ça n'a pas marché ».
 *
 * Un test par utilisateur et par code ; un nouvel essai écrase le précédent.
 * C'est volontaire : on publie l'état COURANT d'un code, pas un historique de
 * votes. Un code qui remarche après avoir été cassé doit pouvoir remonter.
 *
 * Les garde-fous sont doublés côté base (voir scripts/code-tests.sql) : un
 * client peut toujours parler à Supabase avec la clé anon sans passer par ici.
 */
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
  if (!user) {
    return NextResponse.json({ error: 'Connectez-vous pour signaler un test.' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Requête invalide.' }, { status: 400 })
  }

  const { announcementId, worked, turnstileToken } = (body ?? {}) as {
    announcementId?: unknown
    worked?: unknown
    turnstileToken?: unknown
  }

  if (typeof announcementId !== 'string' || typeof worked !== 'boolean') {
    return NextResponse.json({ error: 'Paramètres invalides.' }, { status: 400 })
  }

  // Anti-bot, même mécanisme que /api/bump.
  if (typeof turnstileToken !== 'string' || !turnstileToken) {
    return NextResponse.json({ error: 'Vérification anti-bot manquante.' }, { status: 403 })
  }
  const verify = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      secret: process.env.TURNSTILE_SECRET_KEY,
      response: turnstileToken,
    }),
  })
  const verifyData = await verify.json().catch(() => ({ success: false }))
  if (!verifyData.success) {
    return NextResponse.json({ error: 'Vérification anti-bot échouée.' }, { status: 403 })
  }

  const { data: annonce } = await supabase
    .from('announcements')
    .select('id, user_id')
    .eq('id', announcementId)
    .single()

  if (!annonce) {
    return NextResponse.json({ error: 'Code introuvable.' }, { status: 404 })
  }

  // On ne teste pas son propre code : sinon le taux de réussite ne vaut rien.
  if (annonce.user_id === user.id) {
    return NextResponse.json(
      { error: 'Vous ne pouvez pas tester votre propre code.' },
      { status: 403 }
    )
  }

  const { error } = await supabase
    .from('code_tests')
    .upsert(
      { announcement_id: announcementId, user_id: user.id, worked, created_at: new Date().toISOString() },
      { onConflict: 'announcement_id,user_id' }
    )

  if (error) {
    // Pas de détail interne renvoyé au client.
    console.error('code_tests upsert', error)
    return NextResponse.json({ error: "L'enregistrement a échoué." }, { status: 500 })
  }

  const { data: maj } = await supabase
    .from('announcements')
    .select('tests_ok, tests_ko, last_tested_at')
    .eq('id', announcementId)
    .single()

  return NextResponse.json({ success: true, ...maj })
}
