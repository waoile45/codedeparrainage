import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

// Barème serveur — DOIT rester synchronisé avec COST_PER_DAY de src/app/boost/page.tsx.
// Le client n'a AUCUN droit de fixer le prix : on le recalcule ici.
const COST_PER_DAY = 0.10
const MAX_DAYS = 30

export async function POST(request: Request) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
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

    // getUser() revalide le JWT côté serveur (getSession() fait juste confiance au cookie)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Non connecté' }, { status: 401 })
    }

    const { announcement_id, days } = await request.json()

    // Validation stricte de la durée (le prix vient UNIQUEMENT du serveur)
    if (!announcement_id || typeof announcement_id !== 'string') {
      return NextResponse.json({ error: 'Annonce invalide' }, { status: 400 })
    }
    if (!Number.isInteger(days) || days < 1 || days > MAX_DAYS) {
      return NextResponse.json({ error: 'Durée invalide (1 à 30 jours)' }, { status: 400 })
    }

    const total_cost = Number((days * COST_PER_DAY).toFixed(2))

    // Vérifier que l'annonce existe ET appartient bien à l'utilisateur (anti-IDOR)
    const { data: ann } = await supabaseAdmin
      .from('announcements')
      .select('id, user_id')
      .eq('id', announcement_id)
      .single()

    if (!ann || ann.user_id !== user.id) {
      return NextResponse.json({ error: 'Annonce introuvable' }, { status: 404 })
    }

    // Vérifier le solde (recalculé serveur)
    const { data: credits } = await supabaseAdmin
      .from('credits')
      .select('balance')
      .eq('user_id', user.id)
      .single()

    if (!credits || credits.balance < total_cost) {
      return NextResponse.json({ error: 'Solde insuffisant' }, { status: 400 })
    }

    // Créer le boost
    const endsAt = new Date()
    endsAt.setDate(endsAt.getDate() + days)

    const { error: boostError } = await supabaseAdmin.from('boosts').insert({
      user_id: user.id,
      announcement_id,
      days,
      cost_per_day: COST_PER_DAY,
      total_cost,
      ends_at: endsAt.toISOString(),
      active: true,
    })

    if (boostError) {
      return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
    }

    // Déduire les crédits
    await supabaseAdmin
      .from('credits')
      .update({
        balance: Number((credits.balance - total_cost).toFixed(2)),
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Boost error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
