import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

/**
 * GET /api/admin/platform-reviews — avis laissés sur le site (page /avis et
 * onglet Avis du profil), pour l'admin uniquement.
 *
 * La table platform_reviews n'est lisible que par l'auteur de chaque avis
 * (RLS) : on la lit avec service_role, après contrôle ADMIN_EMAIL (le proxy
 * le fait déjà sur /api/admin, on le refait ici). Aucun e-mail renvoyé.
 */
type Row = { id: string; user_id: string | null; rating: number | null; comment: string | null; created_at: string }

export async function GET() {
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
  if (!user || !process.env.ADMIN_EMAIL || user.email !== process.env.ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
  }

  const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

  const rows: Row[] = []
  for (let from = 0; ; from += 1000) {
    const { data, error } = await admin
      .from('platform_reviews')
      .select('id, user_id, rating, comment, created_at')
      .order('created_at', { ascending: false })
      .range(from, from + 999)
    if (error) {
      console.error('Admin platform-reviews :', error.code)
      return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
    }
    rows.push(...((data ?? []) as Row[]))
    if (!data || data.length < 1000) break
  }

  const ids = [...new Set(rows.map((r) => r.user_id).filter((x): x is string => !!x))]
  const pseudos = new Map<string, string>()
  for (let i = 0; i < ids.length; i += 150) {
    const { data } = await admin.from('users').select('id, pseudo').in('id', ids.slice(i, i + 150))
    for (const u of data ?? []) pseudos.set(u.id as string, u.pseudo as string)
  }

  return NextResponse.json(
    {
      reviews: rows.map((r) => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        createdAt: r.created_at,
        author: r.user_id ? pseudos.get(r.user_id) ?? 'Compte supprimé' : null,
      })),
    },
    { headers: { 'Cache-Control': 'private, no-store' } }
  )
}
