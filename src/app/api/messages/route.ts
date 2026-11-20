import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { escapeHtml } from '@/lib/sanitize'

const MAX_MESSAGE_LENGTH = 2000
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function POST(request: Request) {
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
  if (!user) return NextResponse.json({ error: 'Non connecté' }, { status: 401 })

  const body = await request.json().catch(() => null)
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Requête invalide' }, { status: 400 })
  }
  const { receiverId, announcementId, content } = body as Record<string, unknown>

  if (typeof content !== 'string' || content.trim() === '') {
    return NextResponse.json({ error: 'Message vide' }, { status: 400 })
  }

  if (content.length > MAX_MESSAGE_LENGTH) {
    return NextResponse.json({ error: 'Message trop long' }, { status: 400 })
  }

  if (typeof receiverId !== 'string' || !UUID_RE.test(receiverId)) {
    return NextResponse.json({ error: 'Destinataire invalide' }, { status: 400 })
  }

  if (announcementId != null && (typeof announcementId !== 'string' || !UUID_RE.test(announcementId))) {
    return NextResponse.json({ error: 'Annonce invalide' }, { status: 400 })
  }

  if (receiverId === user.id) {
    return NextResponse.json({ error: 'Vous ne pouvez pas vous écrire à vous-même' }, { status: 400 })
  }

  const { data: message, error: insertError } = await supabase
    .from('messages')
    .insert({
      sender_id: user.id,
      receiver_id: receiverId,
      announcement_id: announcementId ?? null,
      content: content.trim(),
    })
    .select('id, sender_id, receiver_id, announcement_id, content, read, created_at')
    .single()

  if (insertError || !message) {
    return NextResponse.json({ error: "Le message n'a pas pu être envoyé." }, { status: 500 })
  }

  // ── Notification email via Resend ──────────────────────────────────────────
  if (process.env.RESEND_API_KEY) {
    try {
      // Service role pour accéder aux emails sans RLS
      const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      )

      const [{ data: receiver }, { data: sender }] = await Promise.all([
        supabaseAdmin.from('users').select('email, pseudo').eq('id', receiverId).single(),
        supabaseAdmin.from('users').select('pseudo').eq('id', user.id).single(),
      ])

      if (receiver?.email) {
        const resend = new Resend(process.env.RESEND_API_KEY)
        const senderPseudo = sender?.pseudo ?? 'Un utilisateur'
        const previewText = content.trim().slice(0, 120)
        // Échappement : pseudo et contenu sont saisis par l'utilisateur → anti-injection HTML/phishing dans l'email
        const safePseudo = escapeHtml(senderPseudo)
        const safePreview = escapeHtml(previewText)

        await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL ?? 'noreply@codedeparrainage.com',
          to: receiver.email,
          subject: `Nouveau message de ${senderPseudo.replace(/[\r\n]+/g, ' ')}`,
          html: `
            <div style="font-family:'DM Sans',Arial,sans-serif;max-width:520px;margin:0 auto;background:#121211;color:#e2e8f0;border-radius:16px;overflow:hidden;">
              <div style="background:#FFD43B;padding:28px 32px;">
                <p style="margin:0;font-size:1.2rem;font-weight:800;color:#141414;letter-spacing:-0.02em;">codedeparrainage.com</p>
              </div>
              <div style="padding:32px;">
                <p style="margin:0 0 8px;font-size:1rem;font-weight:700;color:#fff;">Tu as un nouveau message !</p>
                <p style="margin:0 0 20px;font-size:0.875rem;color:rgba(255,255,255,0.5);">
                  <strong style="color:rgba(255,255,255,0.8);">${safePseudo}</strong> t'a envoyé un message sur codedeparrainage.com.
                </p>
                <div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:16px 20px;margin-bottom:24px;">
                  <p style="margin:0;font-size:0.9rem;color:#e2e8f0;line-height:1.6;">${safePreview}${content.trim().length > 120 ? '…' : ''}</p>
                </div>
                <a href="https://www.codedeparrainage.com/profil?tab=messages" style="display:inline-block;background:#FFD43B;color:#141414;text-decoration:none;padding:12px 24px;border-radius:10px;font-weight:700;font-size:0.9rem;">
                  Répondre →
                </a>
              </div>
              <div style="padding:16px 32px;border-top:1px solid rgba(255,255,255,0.07);">
                <p style="margin:0;font-size:0.72rem;color:rgba(255,255,255,0.25);">
                  Tu reçois cet email car tu as un compte sur codedeparrainage.com.
                </p>
              </div>
            </div>
          `,
        })
      }
    } catch {
      // Ne pas bloquer la réponse si l'email échoue
    }
  }

  return NextResponse.json({ success: true, message })
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
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non connecté' }, { status: 401 })

  const { data: messages } = await supabase
    .from('messages')
    .select('*, sender:users!sender_id (pseudo), receiver:users!receiver_id (pseudo), announcements (companies (name))')
    .or('sender_id.eq.' + user.id + ',receiver_id.eq.' + user.id)
    .order('created_at', { ascending: false })

  await supabase
    .from('messages')
    .update({ read: true })
    .eq('receiver_id', user.id)
    .eq('read', false)

  return NextResponse.json({ messages })
}
