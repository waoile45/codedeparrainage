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
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
  }

  const { userId, amount } = await request.json()
  if (!userId || typeof amount !== 'number' || amount === 0) {
    return NextResponse.json({ error: 'Paramètres invalides' }, { status: 400 })
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: credits } = await supabaseAdmin
    .from('credits')
    .select('balance')
    .eq('user_id', userId)
    .single()

  if (credits) {
    const newBalance = Math.max(0, credits.balance + amount)
    await supabaseAdmin
      .from('credits')
      .update({ balance: newBalance, updated_at: new Date().toISOString() })
      .eq('user_id', userId)
  } else {
    await supabaseAdmin
      .from('credits')
      .insert({ user_id: userId, balance: Math.max(0, amount) })
  }

  return NextResponse.json({ success: true })
}
