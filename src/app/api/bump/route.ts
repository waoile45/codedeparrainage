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

  const { announcementId } = await request.json()

  const { data: ann } = await supabase
    .from('announcements')
    .select('*')
    .eq('id', announcementId)
    .single()

  if (!ann) return NextResponse.json({ error: 'Annonce introuvable' }, { status: 404 })

  const lastBump = ann.last_bumped_at ? new Date(ann.last_bumped_at) : null
  const now = new Date()
  const isNewDay = !lastBump || lastBump.toDateString() !== now.toDateString()
  const bumpsToday = isNewDay ? 0 : ann.bumps_today

  if (bumpsToday >= 5) {
    return NextResponse.json({ error: 'Limite de 5 remontées par jour atteinte' }, { status: 429 })
  }

  await supabase
    .from('announcements')
    .update({
      bumps_today: bumpsToday + 1,
      last_bumped_at: now.toISOString(),
      updated_at: now.toISOString(),
    })
    .eq('id', announcementId)

  await supabase
    .from('users')
    .update({ xp: ann.xp + 5 })
    .eq('id', user.id)

  return NextResponse.json({ success: true, bumpsLeft: 4 - bumpsToday })
}