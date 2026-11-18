import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

/**
 * GET /api/me/copies — bilan des copies des codes du membre connecté.
 *
 * La table code_copies et la vue code_copy_stats sont fermées aux clés anon et
 * authenticated (scripts/code-copies.sql) : la lecture passe par service_role,
 * APRÈS avoir vérifié l'identité, et seulement pour les annonces du membre.
 *
 * Réponse : { last7d, total, byAnnouncement: { [id]: { last7d, total } } }.
 * En cas d'erreur, des zéros : le bilan est accessoire, le profil doit s'afficher.
 */
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
  if (!user) {
    return NextResponse.json({ error: 'Non connecté' }, { status: 401 })
  }

  const empty = { last7d: 0, total: 0, byAnnouncement: {} as Record<string, { last7d: number; total: number }> }

  try {
    const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    const { data: anns } = await admin.from('announcements').select('id').eq('user_id', user.id)
    const ids = (anns ?? []).map((a) => a.id as string)
    if (ids.length === 0) return NextResponse.json(empty)

    const { data: stats, error } = await admin
      .from('code_copy_stats')
      .select('announcement_id, total, last_7d')
      .in('announcement_id', ids)
    if (error) return NextResponse.json(empty)

    const out = { ...empty, byAnnouncement: {} as Record<string, { last7d: number; total: number }> }
    for (const s of stats ?? []) {
      const total = Number(s.total ?? 0)
      const last7d = Number(s.last_7d ?? 0)
      out.byAnnouncement[s.announcement_id as string] = { last7d, total }
      out.total += total
      out.last7d += last7d
    }
    return NextResponse.json(out, { headers: { 'Cache-Control': 'private, no-store' } })
  } catch {
    return NextResponse.json(empty)
  }
}
