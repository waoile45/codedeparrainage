import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { createHash } from 'crypto'
import { z } from 'zod'

// ── Beacon de facturation des boosts « au réel » ───────────────────────────────
// Appelée par /codes quand une carte boostée devient visible à l'écran.
// Pour chaque annonce boostée : 1 vue max par visiteur (IP hachée) par 24 h,
// 0,10 crédit débité du solde du propriétaire. Solde insuffisant → pause du
// boost (active=false) ; il est réactivé à la recharge (webhook / give-credits).
//
// Route publique (les visiteurs ne sont pas connectés) :
// - rate limitée dans proxy.ts
// - la dédup (boost_id, ip_hash, jour) borne naturellement l'impact d'un abus
// - la réponse ne révèle jamais quelles annonces sont facturées ni les soldes

const bodySchema = z.object({
  announcement_ids: z.array(z.string().uuid()).min(1).max(30),
})

const MAX_BODY_BYTES = 4 * 1024

function hashIp(ip: string): string {
  // Pepper optionnel en env ; le hash évite de stocker des IP en clair (RGPD)
  const pepper = process.env.BOOST_VIEW_PEPPER ?? 'cdp-boost-views-v1'
  return createHash('sha256').update(ip + pepper).digest('hex').slice(0, 32)
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text()
  if (rawBody.length > MAX_BODY_BYTES) {
    return NextResponse.json({ received: true })
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ received: true })
  }
  const result = bodySchema.safeParse(parsed)
  if (!result.success) {
    return NextResponse.json({ received: true })
  }

  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  const ipHash = hashIp(ip)

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Dédup, débit et pause du boost se font dans une seule transaction côté
  // Postgres (scripts/boost-par-vue.sql). Un débit en deux temps ici laisserait
  // deux vues simultanées partir du même solde lu à l'avance.
  await supabaseAdmin.rpc('charge_boost_views', {
    p_announcement_ids: result.data.announcement_ids,
    p_ip_hash: ipHash,
  })

  return NextResponse.json({ received: true })
}
