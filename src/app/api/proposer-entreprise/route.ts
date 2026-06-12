import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { z } from 'zod'

// ── Validation Zod (jamais confiance au client) ────────────────────────────────
const proposalSchema = z.object({
  nomEntreprise: z.string().trim().min(1).max(100),
  note: z.string().trim().max(500).optional(),
  userEmail: z.string().trim().email().max(200).optional(),
  // Honeypot : champ caché côté client, un humain le laisse vide
  website: z.string().max(200).optional(),
})

// ── Rate limiting : max 3 soumissions par IP par tranche de 10 minutes ────────
// Implémentation en mémoire : suffisant pour le trafic actuel. Sur Vercel,
// chaque instance serverless a sa propre Map (la limite est donc "par instance") ;
// si le trafic augmente, passer à @upstash/ratelimit + Redis pour une limite globale.
const RATE_WINDOW_MS = 10 * 60_000
const MAX_PER_WINDOW = 3

const submissions = new Map<string, { count: number; windowStart: number }>()

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  // Nettoyage des fenêtres expirées pour éviter une croissance infinie
  if (submissions.size > 1000) {
    for (const [key, entry] of submissions) {
      if (now - entry.windowStart > RATE_WINDOW_MS) submissions.delete(key)
    }
  }
  const entry = submissions.get(ip)
  if (!entry || now - entry.windowStart > RATE_WINDOW_MS) {
    submissions.set(ip, { count: 1, windowStart: now })
    return false
  }
  entry.count++
  return entry.count > MAX_PER_WINDOW
}

// ── Neutralisation du contenu utilisateur injecté dans l'email ────────────────
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

// Le sujet d'un email ne doit jamais contenir de retour à la ligne
// (prévention injection de headers SMTP)
function sanitizeSubject(value: string): string {
  return value.replace(/[\r\n]+/g, ' ').slice(0, 150)
}

const MAX_BODY_BYTES = 10 * 1024 // 10 Ko

export async function POST(request: NextRequest) {
  // ── Limite de taille du body ──
  const contentLength = Number(request.headers.get('content-length') ?? 0)
  if (contentLength > MAX_BODY_BYTES) {
    return NextResponse.json({ error: 'Requête trop volumineuse' }, { status: 413 })
  }
  const rawBody = await request.text()
  if (rawBody.length > MAX_BODY_BYTES) {
    return NextResponse.json({ error: 'Requête trop volumineuse' }, { status: 413 })
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'JSON invalide' }, { status: 400 })
  }

  const result = proposalSchema.safeParse(parsed)
  if (!result.success) {
    return NextResponse.json({ error: 'Données invalides' }, { status: 400 })
  }
  const { nomEntreprise, note, userEmail, website } = result.data

  // ── Honeypot : rempli = bot → rejet silencieux avec 200 (ne pas révéler la détection) ──
  if (website) {
    return NextResponse.json({ success: true })
  }

  // ── Rate limiting ──
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: 'Trop de propositions envoyées. Réessaie dans quelques minutes.' },
      { status: 429, headers: { 'Retry-After': '600' } }
    )
  }

  if (process.env.RESEND_API_KEY) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY)
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev',
        to: 'waoile45@gmail.com',
        subject: sanitizeSubject(`🏢 Proposition d'entreprise : ${nomEntreprise}`),
        html: `
          <div style="font-family:'DM Sans',Arial,sans-serif;max-width:520px;margin:0 auto;background:#0A0A0F;color:#e2e8f0;border-radius:16px;overflow:hidden;">
            <div style="background:linear-gradient(135deg,#7c3aed,#4f46e5);padding:28px 32px;">
              <p style="margin:0;font-size:1.2rem;font-weight:800;color:#fff;letter-spacing:-0.02em;">codedeparrainage.com</p>
            </div>
            <div style="padding:32px;">
              <p style="margin:0 0 8px;font-size:1rem;font-weight:700;color:#fff;">Nouvelle proposition d'entreprise</p>
              <p style="margin:0 0 20px;font-size:0.875rem;color:rgba(255,255,255,0.5);">
                Un utilisateur souhaite ajouter une entreprise qui n'est pas encore dans la base de données.
              </p>
              <div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:16px 20px;margin-bottom:16px;">
                <p style="margin:0 0 4px;font-size:0.72rem;color:rgba(255,255,255,0.4);text-transform:uppercase;letter-spacing:0.08em;">Entreprise proposée</p>
                <p style="margin:0;font-size:1.1rem;font-weight:800;color:#fff;">${escapeHtml(nomEntreprise)}</p>
              </div>
              ${note ? `
              <div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:16px 20px;margin-bottom:16px;">
                <p style="margin:0 0 4px;font-size:0.72rem;color:rgba(255,255,255,0.4);text-transform:uppercase;letter-spacing:0.08em;">Note de l'utilisateur</p>
                <p style="margin:0;font-size:0.9rem;color:#e2e8f0;line-height:1.6;">${escapeHtml(note)}</p>
              </div>
              ` : ''}
              ${userEmail ? `<p style="margin:0 0 0;font-size:0.8rem;color:rgba(255,255,255,0.4);">Email de l'utilisateur : ${escapeHtml(userEmail)}</p>` : ''}
            </div>
          </div>
        `,
      })
    } catch {
      // Log silencieux
    }
  }

  return NextResponse.json({ success: true })
}
