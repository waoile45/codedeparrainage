import { NextResponse } from 'next/server'
import { createAnonSupabase } from '@/lib/supabase-server'
import { pingIndexNow } from '@/lib/indexnow'
import { MASS_PUBLISHERS } from '@/data/moderation'

/**
 * POST /api/indexnow { announcementId } — appelé par le formulaire Publier
 * juste après une publication, pour signaler la page de la marque à Bing.
 *
 * Garde-fous : seule une annonce publiée il y a moins de 10 minutes déclenche
 * un signalement (impossible de rejouer de vieux identifiants en boucle), le
 * débit est limité par IP (src/proxy.ts), et l'URL signalée est construite ici
 * depuis la base, jamais reçue du navigateur. Toujours 204 : rien à exploiter.
 */
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null)
    const id = body?.announcementId
    if (typeof id !== 'string' || !UUID_RE.test(id)) return new NextResponse(null, { status: 204 })

    const { data } = await createAnonSupabase()
      .from('announcements')
      .select('user_id, created_at, companies (url_slug)')
      .eq('id', id)
      .maybeSingle()

    const ann = data as { user_id: string; created_at: string; companies: { url_slug: string | null } | null } | null
    const slug = ann?.companies?.url_slug
    const recent = ann && Date.now() - new Date(ann.created_at).getTime() < 10 * 60 * 1000
    if (!ann || !slug || !recent || MASS_PUBLISHERS.has(ann.user_id)) {
      return new NextResponse(null, { status: 204 })
    }

    await pingIndexNow([`https://www.codedeparrainage.com/code-parrainage/${slug}`])
    return new NextResponse(null, { status: 204 })
  } catch {
    return new NextResponse(null, { status: 204 })
  }
}
