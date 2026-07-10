import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

// ── Boost admin : mêmes règles que le boost utilisateur ────────────────────────
// Le boost est facturé par vue (0,10 crédit) sur le solde du PROPRIÉTAIRE de
// l'annonce, sans date de fin. Pour offrir un boost, donner d'abord des crédits
// (bouton ⚡ Crédits) : c'est le solde qui finance les vues.
const COST_PER_VIEW = 0.10

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

  const { announcementId } = await request.json()
  if (!announcementId || typeof announcementId !== 'string') {
    return NextResponse.json({ error: 'Paramètres invalides' }, { status: 400 })
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Le propriétaire vient de la base, pas du client (le boost est débité chez lui)
  const { data: ann } = await supabaseAdmin
    .from('announcements')
    .select('id, user_id')
    .eq('id', announcementId)
    .single()

  if (!ann) {
    return NextResponse.json({ error: 'Annonce introuvable' }, { status: 404 })
  }

  const { data: existing } = await supabaseAdmin
    .from('boosts')
    .select('id')
    .eq('announcement_id', announcementId)
    .eq('active', true)
    .not('cost_per_view', 'is', null)
    .limit(1)

  if (existing && existing.length > 0) {
    return NextResponse.json({ error: 'Cette annonce est déjà boostée' }, { status: 400 })
  }

  const { error } = await supabaseAdmin.from('boosts').insert({
    user_id: ann.user_id,
    announcement_id: announcementId,
    cost_per_view: COST_PER_VIEW,
    views_charged: 0,
    days: null,
    ends_at: null,
    cost_per_day: 0,
    total_cost: 0,
    active: true,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Avertir si le solde du propriétaire ne couvre même pas une vue :
  // le boost passera en pause dès la première vue facturable.
  const { data: credits } = await supabaseAdmin
    .from('credits')
    .select('balance')
    .eq('user_id', ann.user_id)
    .single()

  const balance = credits?.balance ?? 0
  return NextResponse.json({
    success: true,
    warning: balance < COST_PER_VIEW
      ? `Solde de l'utilisateur : ${balance.toFixed(2)} crédit — le boost sera mis en pause dès la première vue. Donne-lui des crédits (⚡ Crédits).`
      : undefined,
  })
}
