import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

/**
 * GET /api/admin/code-copies — statistiques de copie des codes.
 *
 * L'accès est déjà filtré en amont : le middleware (src/proxy.ts) bloque tout
 * /api/admin/* pour qui n'est pas l'administrateur. On lit la vue
 * code_copy_stats, qui agrège côté base (voir scripts/code-copies.sql) plutôt
 * que de rapatrier une ligne par copie.
 *
 * Renvoie les annonces les plus copiées, enrichies de la marque et du code,
 * plus les totaux globaux.
 */
export async function GET() {
  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: stats, error } = await supabaseAdmin
      .from('code_copy_stats')
      .select('announcement_id, total, last_7d, last_24h, last_copy_at')
      .order('total', { ascending: false })
      .limit(100)

    if (error) {
      // La table n'existe pas encore tant que scripts/code-copies.sql n'a pas
      // été exécuté : on le dit explicitement plutôt que de renvoyer une liste
      // vide, qui se confondrait avec « personne n'a jamais copié de code ».
      const notInstalled = error.code === 'PGRST205' || /does not exist/i.test(error.message ?? '')
      return NextResponse.json(
        {
          installed: !notInstalled,
          error: notInstalled
            ? "Le suivi des copies n'est pas installé : exécuter scripts/code-copies.sql dans Supabase."
            : 'Erreur serveur',
          rows: [],
          totals: { total: 0, last_7d: 0, last_24h: 0 },
        },
        { status: notInstalled ? 200 : 500 }
      )
    }

    const rows = stats ?? []

    // Enrichissement : on ne garde que les annonces encore existantes.
    const ids = rows.map(r => r.announcement_id)
    let details: Record<string, { code: string; company: string | null; pseudo: string | null }> = {}

    if (ids.length > 0) {
      const { data: anns } = await supabaseAdmin
        .from('announcements')
        .select('id, code, companies(name), users(pseudo)')
        .in('id', ids)

      details = Object.fromEntries(
        (anns ?? []).map((a: Record<string, unknown>) => [
          a.id as string,
          {
            code: (a.code as string) ?? '',
            company: ((a.companies as { name?: string } | null)?.name) ?? null,
            pseudo: ((a.users as { pseudo?: string } | null)?.pseudo) ?? null,
          },
        ])
      )
    }

    return NextResponse.json({
      installed: true,
      rows: rows.map(r => ({
        announcement_id: r.announcement_id,
        total: Number(r.total) || 0,
        last_7d: Number(r.last_7d) || 0,
        last_24h: Number(r.last_24h) || 0,
        last_copy_at: r.last_copy_at,
        ...details[r.announcement_id],
      })),
      totals: {
        total: rows.reduce((s, r) => s + (Number(r.total) || 0), 0),
        last_7d: rows.reduce((s, r) => s + (Number(r.last_7d) || 0), 0),
        last_24h: rows.reduce((s, r) => s + (Number(r.last_24h) || 0), 0),
      },
    })
  } catch {
    return NextResponse.json({ error: 'Erreur serveur', rows: [], installed: false }, { status: 500 })
  }
}
