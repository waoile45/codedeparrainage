import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-03-25.dahlia',
})

const PACKS = [
  { credits: 5,   price: 500  },  // 5€
  { credits: 20,  price: 1900 },  // 19€
  { credits: 50,  price: 4500 },  // 45€
  { credits: 100, price: 8000 },  // 80€
  { credits: 300, price: 21000 }, // 210€
]

export async function POST(request: Request) {
  try {
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
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Non connecté' }, { status: 401 })
    }

    const { credits } = await request.json()
    const pack = PACKS.find(p => p.credits === credits)

    if (!pack) {
      return NextResponse.json({ error: 'Pack invalide' }, { status: 400 })
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: session.user.email,
      metadata: {
        user_id: session.user.id,
        credits: pack.credits.toString(),
      },
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `${pack.credits} crédits Boost`,
              description: `Pack de ${pack.credits} crédits pour booster vos annonces`,
            },
            unit_amount: pack.price,
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/credits?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/credits?cancelled=true`,
    })

    return NextResponse.json({ url: checkoutSession.url })
  } catch (error) {
    console.error('Stripe error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}