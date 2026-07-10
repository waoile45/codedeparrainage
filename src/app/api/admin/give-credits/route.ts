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
  if (!user || user.email !== (process.env.ADMIN_EMAIL ?? process.env.NEXT_PUBLIC_ADMIN_EMAIL)) {
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

  let newBalance: number
  if (credits) {
    newBalance = Math.max(0, credits.balance + amount)
    await supabaseAdmin
      .from('credits')
      .update({ balance: newBalance, updated_at: new Date().toISOString() })
      .eq('user_id', userId)
  } else {
    newBalance = Math.max(0, amount)
    await supabaseAdmin
      .from('credits')
      .insert({ user_id: userId, balance: newBalance })
  }

  // Recharge → réactiver les boosts « par vue » mis en pause faute de solde
  // (il n'existe pas d'arrêt manuel de boost : inactif = épuisé, sans ambiguïté)
  if (amount > 0 && newBalance > 0) {
    await supabaseAdmin
      .from('boosts')
      .update({ active: true })
      .eq('user_id', userId)
      .eq('active', false)
      .not('cost_per_view', 'is', null)
  }

  return NextResponse.json({ success: true })
}
