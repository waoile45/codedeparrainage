import { NextResponse } from 'next/server'
import { Resend } from 'resend'

export async function POST(request: Request) {
  const { nomEntreprise, note, userEmail } = await request.json()

  if (!nomEntreprise || typeof nomEntreprise !== 'string' || !nomEntreprise.trim()) {
    return NextResponse.json({ error: 'Nom requis' }, { status: 400 })
  }

  if (process.env.RESEND_API_KEY) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY)
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev',
        to: 'waoile45@gmail.com',
        subject: `🏢 Proposition d'entreprise : ${nomEntreprise.trim()}`,
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
                <p style="margin:0;font-size:1.1rem;font-weight:800;color:#fff;">${nomEntreprise.trim()}</p>
              </div>
              ${note ? `
              <div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:16px 20px;margin-bottom:16px;">
                <p style="margin:0 0 4px;font-size:0.72rem;color:rgba(255,255,255,0.4);text-transform:uppercase;letter-spacing:0.08em;">Note de l'utilisateur</p>
                <p style="margin:0;font-size:0.9rem;color:#e2e8f0;line-height:1.6;">${note.trim().slice(0, 500)}</p>
              </div>
              ` : ''}
              ${userEmail ? `<p style="margin:0 0 0;font-size:0.8rem;color:rgba(255,255,255,0.4);">Email de l'utilisateur : ${userEmail}</p>` : ''}
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
