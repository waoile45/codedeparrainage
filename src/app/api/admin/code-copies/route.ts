import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

/**
 * GET /api/admin/code-copies — nombre de copies de chaque code, pour l'admin.
 *
 * La vue code_copy_stats (scripts/code-copies.sql) est fermée aux clés anon et
 * authenticated : on la lit avec service_role, seulement après avoir vérifié
 * que la personne connectée est l'admin (ADMIN_EMAIL). Le proxy fait déjà ce
 * contrôle sur /api/admin ; on le refait ici pour ne pas dépendre de lui seul.
 *
 * Aucune donnée personnelle : la table ne contient qu'une annonce et une date.
 */
type StatRow = { announcement_id: string; total: number; last_7d: number; last_24h: number; last_copy_at: string | null }
type AnnRow = {
  id: string
  code: string
  users: { pseudo: string } | null
  companies: { name: string; url_slug: string | null } | null
}

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

  // 1. Compteurs par annonce (PostgREST plafonne à 1000 lignes : on pagine)
  const stats: StatRow[] = []
  for (let from = 0; ; from += 1000) {
    const { data, error } = await admin
      .from('code_copy_stats')
      .select('announcement_id, total, last_7d, last_24h, last_copy_at')
      .order('total', { ascending: false })
      .range(from, from + 999)
    if (error) {
      console.error('Admin code-copies (stats) :', error.code)
      return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
    }
    stats.push(...((data ?? []) as StatRow[]))
    if (!data || data.length < 1000) break
  }

  // 2. Marque, code et membre de chaque annonce copiée (par paquets : l'URL a une longueur maximale)
  const ids = stats.map((s) => s.announcement_id)
  const anns = new Map<string, AnnRow>()
  for (let i = 0; i < ids.length; i += 150) {
    const { data, error } = await admin
      .from('announcements')
      .select('id, code, users(pseudo), companies(name, url_slug)')
      .in('id', ids.slice(i, i + 150))
    if (error) {
      console.error('Admin code-copies (annonces) :', error.code)
      return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
    }
    for (const a of (data ?? []) as unknown as AnnRow[]) anns.set(a.id, a)
  }

  const rows = stats.map((s) => {
    const a = anns.get(s.announcement_id)
    return {
      id: s.announcement_id,
      code: a?.code ?? '',
      company: a?.companies?.name ?? 'Annonce supprimée',
      slug: a?.companies?.url_slug ?? null,
      pseudo: a?.users?.pseudo ?? '',
      total: Number(s.total ?? 0),
      last7d: Number(s.last_7d ?? 0),
      last24h: Number(s.last_24h ?? 0),
      lastCopyAt: s.last_copy_at,
    }
  })

  const totals = rows.reduce(
    (t, r) => ({ total: t.total + r.total, last7d: t.last7d + r.last7d, last24h: t.last24h + r.last24h }),
    { total: 0, last7d: 0, last24h: 0 }
  )

  return NextResponse.json(
    { totals: { ...totals, codes: rows.length }, rows },
    { headers: { 'Cache-Control': 'private, no-store' } }
  )
}
