import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

/**
 * POST /api/code-copy — enregistre qu'un code de parrainage a été copié.
 *
 * Route publique et volontairement muette : elle ne renvoie jamais d'erreur
 * exploitable et ne doit jamais faire échouer la copie côté visiteur, qui est
 * l'action utile. Si l'enregistrement échoue, on perd une statistique, pas un
 * usage.
 *
 * Aucune donnée personnelle n'est stockée (ni IP, ni hash, ni cookie) : voir
 * l'en-tête de scripts/code-copies.sql. Le rate limit par IP est appliqué en
 * amont par le middleware (src/proxy.ts, liste RATE_LIMITED_PATHS) et ne sert
 * qu'à empêcher le gonflage du compteur — l'IP n'est pas conservée.
 */

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null)
    const announcementId = body?.announcement_id

    if (typeof announcementId !== 'string' || !UUID_RE.test(announcementId)) {
      // 204 même en cas d'entrée invalide : rien à apprendre pour un curieux.
      return new NextResponse(null, { status: 204 })
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // La clé étrangère vers announcements rejette d'elle-même un identifiant
    // qui n'existe pas : inutile de vérifier l'existence en amont.
    await supabaseAdmin.from('code_copies').insert({ announcement_id: announcementId })

    return new NextResponse(null, { status: 204 })
  } catch {
    // Jamais de détail d'erreur au client.
    return new NextResponse(null, { status: 204 })
  }
}
