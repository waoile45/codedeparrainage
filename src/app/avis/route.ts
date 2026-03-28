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

  const { announcementId, rating, comment } = await request.json()

  if (!rating || rating < 1 || rating > 5) {
    return NextResponse.json({ error: 'Note invalide' }, { status: 400 })
  }

  const { data: ann } = await supabase
    .from('announcements')
    .select('user_id')
    .eq('id', announcementId)
    .single()

  if (!ann) return NextResponse.json({ error: 'Annonce introuvable' }, { status: 404 })

  if (ann.user_id === user.id) {
    return NextResponse.json({ error: 'Vous ne pouvez pas noter votre propre annonce' }, { status: 400 })
  }

  const { data: existing } = await supabase
    .from('reviews')
    .select('id')
    .eq('announcement_id', announcementId)
    .eq('reviewer_id', user.id)
    .single()

  if (existing) {
    return NextResponse.json({ error: 'Vous avez déjà noté cette annonce' }, { status: 400 })
  }

  await supabase.from('reviews').insert({
    reviewer_id: user.id,
    reviewed_user_id: ann.user_id,
    announcement_id: announcementId,
    rating,
    comment,
  })

  if (rating >= 4) {
    const { data: parrain } = await supabase
      .from('users')
      .select('xp')
      .eq('id', ann.user_id)
      .single()

    if (parrain) {
      await supabase
        .from('users')
        .update({ xp: parrain.xp + 20 })
        .eq('id', ann.user_id)
    }
  }

  return NextResponse.json({ success: true })
}