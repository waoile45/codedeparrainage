import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  try {
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

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Non connecté' }, { status: 401 })
    }

    const { announcement_id, days, cost_per_day, total_cost } = await request.json()

    // Vérifier le solde
    const { data: credits } = await supabaseAdmin
      .from('credits')
      .select('balance')
      .eq('user_id', session.user.id)
      .single()

    if (!credits || credits.balance < total_cost) {
      return NextResponse.json({ error: 'Solde insuffisant' }, { status: 400 })
    }

    // Créer le boost
    const endsAt = new Date()
    endsAt.setDate(endsAt.getDate() + days)

    await supabaseAdmin.from('boosts').insert({
      user_id: session.user.id,
      announcement_id,
      days,
      cost_per_day,
      total_cost,
      ends_at: endsAt.toISOString(),
      active: true,
    })

    // Déduire les crédits
    await supabaseAdmin
      .from('credits')
      .update({ 
        balance: credits.balance - total_cost,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', session.user.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Boost error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}