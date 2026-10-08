import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'

export async function POST(request: Request) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2026-03-25.dahlia',
  })
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Webhook signature error:', err)
    return NextResponse.json({ error: 'Signature invalide' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const userId = session.metadata?.user_id
    const credits = parseFloat(session.metadata?.credits || '0')

    if (!userId || !credits) {
      return NextResponse.json({ error: 'Metadata manquante' }, { status: 400 })
    }

    // Crédit atomique, côté base (scripts/credits-atomiques.sql).
    //
    // L'ancienne version enchaînait trois requêtes : un select pour vérifier
    // que la session n'avait pas déjà été traitée, puis un select du solde,
    // puis un update à « valeur lue + montant ». Deux livraisons simultanées
    // de Stripe pouvaient donc franchir ensemble le contrôle d'idempotence,
    // et deux paiements arrivant en même temps faisaient perdre un crédit au
    // client. grant_purchased_credits s'appuie sur l'index unique de
    // stripe_session_id comme verrou et incrémente le solde en relatif.
    const { data: credited, error: creditError } = await supabase.rpc(
      'grant_purchased_credits',
      {
        p_user_id: userId,
        p_credits: credits,
        p_session_id: session.id,
        p_amount: session.amount_total,
      }
    )

    if (creditError) {
      console.error('[stripe/webhook] grant_purchased_credits:', creditError)
      // 500 → Stripe réessaiera, ce qui est le comportement voulu tant que
      // le crédit n'a pas abouti.
      return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
    }

    if (credited === false) {
      // Événement déjà traité : rien à faire, surtout pas recréditer.
      return NextResponse.json({ received: true })
    }

    console.log(`✅ ${credits} crédits ajoutés à l'utilisateur ${userId}`)
  }

  return NextResponse.json({ received: true })
}