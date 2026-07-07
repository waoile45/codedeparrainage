import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

// Liste des utilisateurs (avec email) réservée à l'admin.
// L'email n'est plus lisible via l'API publique (RLS + privilèges colonne) :
// on passe par le service_role, qui ignore ces restrictions, après contrôle admin.
export async function GET() {
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

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Deux requêtes plates plutôt qu'un embed credits(balance) : l'embed échoue
  // (PGRST200) si PostgREST ne connaît pas de FK credits → public.users.
  const [{ data: users, error }, { data: credits, error: creditsError }] = await Promise.all([
    supabaseAdmin.from('users').select('*').order('xp', { ascending: false }),
    supabaseAdmin.from('credits').select('user_id, balance'),
  ])

  if (error || creditsError) {
    console.error('Admin users error:', error ?? creditsError)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }

  const balanceByUser = new Map((credits ?? []).map((c: any) => [c.user_id, c.balance]))
  // Même forme que l'ancien embed : credits[0].balance, attendu par la page admin
  const shaped = (users ?? []).map((u: any) => ({
    ...u,
    credits: [{ balance: balanceByUser.get(u.id) ?? 0 }],
  }))

  return NextResponse.json({ users: shaped })
}
