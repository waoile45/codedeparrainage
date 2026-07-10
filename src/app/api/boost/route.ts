import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

// ── Activation d'un boost « au réel » (facturé par vue) ────────────────────────
// Plus de durée ni de paiement d'avance : le boost reste actif sans date de fin
// et consomme COST_PER_VIEW crédits à chaque vue dédupliquée (cf. /api/boost-view).
// Solde épuisé → pause automatique, réactivation à la recharge.
// DOIT rester synchronisé avec COST_PER_VIEW de src/app/boost/page.tsx.
const COST_PER_VIEW = 0.10

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

    const { announcement_id } = await request.json()
    if (!announcement_id || typeof announcement_id !== 'string') {
      return NextResponse.json({ error: 'Annonce invalide' }, { status: 400 })
    }

    // Vérifier que l'annonce existe ET appartient bien à l'utilisateur (anti-IDOR)
    const { data: ann } = await supabaseAdmin
      .from('announcements')
      .select('id, user_id')
      .eq('id', announcement_id)
      .single()

    if (!ann || ann.user_id !== user.id) {
      return NextResponse.json({ error: 'Annonce introuvable' }, { status: 404 })
    }

    // Un seul boost par vue actif par annonce
    const { data: existing } = await supabaseAdmin
      .from('boosts')
      .select('id')
      .eq('announcement_id', announcement_id)
      .eq('active', true)
      .not('cost_per_view', 'is', null)
      .limit(1)

    if (existing && existing.length > 0) {
      return NextResponse.json({ error: 'Cette annonce est déjà boostée' }, { status: 400 })
    }

    // Il faut au moins de quoi payer une vue, sinon le boost serait mis en
    // pause immédiatement — autant le dire tout de suite.
    const { data: credits } = await supabaseAdmin
      .from('credits')
      .select('balance')
      .eq('user_id', user.id)
      .single()

    if (!credits || credits.balance < COST_PER_VIEW) {
      return NextResponse.json({ error: 'Solde insuffisant (minimum 0,10 crédit)' }, { status: 400 })
    }

    // Création du boost — rien n'est débité maintenant, la facturation se fait à la vue
    const { error: boostError } = await supabaseAdmin.from('boosts').insert({
      user_id: user.id,
      announcement_id,
      cost_per_view: COST_PER_VIEW,
      views_charged: 0,
      days: null,
      ends_at: null,
      cost_per_day: 0,
      total_cost: 0,
      active: true,
    })

    if (boostError) {
      return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Boost error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
