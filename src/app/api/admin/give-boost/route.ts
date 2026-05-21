import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
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
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== (process.env.ADMIN_EMAIL ?? process.env.NEXT_PUBLIC_ADMIN_EMAIL)) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
  }

  const { announcementId, userId, days } = await request.json()
  if (!announcementId || !userId || !days) {
    return NextResponse.json({ error: 'Paramètres invalides' }, { status: 400 })
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const endsAt = new Date()
  endsAt.setDate(endsAt.getDate() + days)

  const { error } = await supabaseAdmin.from('boosts').insert({
    user_id: userId,
    announcement_id: announcementId,
    days,
    cost_per_day: 0,
    total_cost: 0,
    ends_at: endsAt.toISOString(),
    active: true,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
