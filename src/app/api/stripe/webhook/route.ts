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

    await supabase.from('credit_purchases').insert({
      user_id: userId,
      stripe_session_id: session.id,
      credits_bought: credits,
      amount_paid: session.amount_total,
      status: 'completed',
    })

    const { data: existing } = await supabase
      .from('credits')
      .select('balance')
      .eq('user_id', userId)
      .single()

    if (existing) {
      await supabase
        .from('credits')
        .update({ 
          balance: existing.balance + credits, 
          updated_at: new Date().toISOString() 
        })
        .eq('user_id', userId)
    } else {
      await supabase
        .from('credits')
        .insert({ user_id: userId, balance: credits })
    }

    console.log(`✅ ${credits} crédits ajoutés à l'utilisateur ${userId}`)
  }

  return NextResponse.json({ received: true })
}