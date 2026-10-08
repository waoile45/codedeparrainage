import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

// Bornes reprises ici pour refuser une requête absurde avant d'atteindre la
// base. Le tarif et la vérification de propriété font autorité dans la
// fonction SQL place_boost (scripts/credits-atomiques.sql) : ces constantes ne
// servent qu'à renvoyer un message clair, jamais à décider du prix.
// DOIVENT rester synchronisées avec place_boost et src/app/boost/page.tsx.
const MAX_DAYS = 30

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

    // getUser() revalide le JWT côté serveur (getSession() fait juste confiance au cookie)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Non connecté' }, { status: 401 })
    }

    const { announcement_id, days } = await request.json()

    if (!announcement_id || typeof announcement_id !== 'string') {
      return NextResponse.json({ error: 'Annonce invalide' }, { status: 400 })
    }
    if (!Number.isInteger(days) || days < 1 || days > MAX_DAYS) {
      return NextResponse.json({ error: 'Durée invalide (1 à 30 jours)' }, { status: 400 })
    }

    // Tout le reste — propriété de l'annonce, tarif, contrôle du solde, débit
    // et création du boost — se joue dans une transaction unique côté base.
    //
    // L'ancienne version lisait le solde puis le réécrivait en deux requêtes :
    // deux boosts lancés en même temps partaient du même solde lu et un seul
    // était facturé. Elle insérait de surcroît le boost AVANT le débit, si
    // bien qu'un débit en échec laissait un boost impayé. place_boost débite
    // par `update ... where balance >= coût` (Postgres verrouille la ligne) et
    // annule tout si l'insertion échoue.
    //
    // L'appel passe par la session de l'utilisateur, pas par la clé
    // service_role : c'est auth.uid() qui identifie l'appelant côté base.
    const { data: boost, error } = await supabase.rpc('place_boost', {
      p_announcement_id: announcement_id,
      p_days: days,
    })

    if (error) {
      const msg = error.message ?? ''
      if (msg.includes('Solde')) {
        return NextResponse.json({ error: 'Solde insuffisant' }, { status: 400 })
      }
      if (msg.includes('introuvable') || msg.includes('non autorisée')) {
        return NextResponse.json({ error: 'Annonce introuvable' }, { status: 404 })
      }
      if (msg.includes('Durée')) {
        return NextResponse.json({ error: 'Durée invalide (1 à 30 jours)' }, { status: 400 })
      }
      // Tant que scripts/credits-atomiques.sql n'a pas été exécuté, la fonction
      // n'existe pas : on le journalise clairement côté serveur.
      console.error('[/api/boost] place_boost:', error)
      return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
    }

    return NextResponse.json({ success: true, boost })
  } catch (error) {
    console.error('Boost error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
