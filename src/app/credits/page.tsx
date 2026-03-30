'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'

const PACKS = [
  { credits: 5,   price: 5,   pricePerCredit: 1.00,  label: 'Starter' },
  { credits: 20,  price: 19,  pricePerCredit: 0.95,  label: 'Standard' },
  { credits: 50,  price: 45,  pricePerCredit: 0.90,  label: 'Pro' },
  { credits: 100, price: 80,  pricePerCredit: 0.80,  label: 'Expert' },
  { credits: 300, price: 210, pricePerCredit: 0.70,  label: 'Légendaire' },
]

export default function CreditsPage() {
  const [balance, setBalance] = useState<number>(0)
  const [loading, setLoading] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
  const router = useRouter()

  useEffect(() => {
    // Vérifier si retour Stripe
    const params = new URLSearchParams(window.location.search)
    if (params.get('success') === 'true') {
      setMessage('✅ Paiement réussi ! Vos crédits ont été ajoutés.')
    }
    if (params.get('cancelled') === 'true') {
      setMessage('❌ Paiement annulé.')
    }

    fetchBalance()
  }, [])

  const fetchBalance = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { router.push('/login'); return }

    const { data } = await supabase
      .from('credits')
      .select('balance')
      .eq('user_id', session.user.id)
      .single()

    setBalance(data?.balance || 0)
  }

  const handleBuy = async (credits: number) => {
    setLoading(credits.toString())
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credits }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        alert('Erreur : ' + data.error)
      }
    } catch (e) {
      alert('Erreur serveur')
    }
    setLoading(null)
  }

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Crédits Boost ⚡
          </h1>
          <p className="text-gray-500">
            Boostez vos annonces pour apparaître en tête de liste
          </p>
          <div className="mt-4 inline-block bg-violet-100 text-violet-700 px-6 py-2 rounded-full font-semibold text-lg">
            Solde actuel : {balance.toFixed(2)} crédits
          </div>
        </div>

        {/* Message retour Stripe */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg text-center font-medium ${
            message.startsWith('✅') 
              ? 'bg-green-100 text-green-700' 
              : 'bg-red-100 text-red-700'
          }`}>
            {message}
          </div>
        )}

        {/* Packs */}
        <div className="flex flex-wrap justify-center gap-6">
          {PACKS.map((pack) => (
            <div
              key={pack.credits}
              className={`bg-white rounded-2xl shadow-sm border-2 p-6 flex flex-col ${
                pack.label === 'Pro' 
                  ? 'border-violet-500 relative' 
                  : 'border-gray-100'
              }`}
            >
              {pack.label === 'Pro' && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-violet-500 text-white text-xs px-3 py-1 rounded-full">
                  ⭐ Populaire
                </div>
              )}

              <div className="mb-4">
                <span className="text-sm font-medium text-violet-600 uppercase tracking-wide">
                  {pack.label}
                </span>
                <div className="text-4xl font-bold text-gray-900 mt-1">
                  {pack.credits}
                  <span className="text-lg font-normal text-gray-500 ml-1">crédits</span>
                </div>
                <div className="text-gray-400 text-sm mt-1">
                  soit {pack.pricePerCredit.toFixed(2)}€ / crédit
                </div>
              </div>

              <div className="text-2xl font-bold text-gray-900 mb-6">
                {pack.price}€ <span className="text-sm font-normal text-gray-400">TTC</span>
              </div>

              <ul className="text-sm text-gray-500 space-y-2 mb-6 flex-1">
                <li>✅ Annonce en tête de liste</li>
                <li>✅ Badge "Boosté" visible</li>
                <li>✅ Crédits sans expiration</li>
              </ul>

              <button
                onClick={() => handleBuy(pack.credits)}
                disabled={loading === pack.credits.toString()}
                className={`w-full py-3 rounded-xl font-semibold transition ${
                  pack.label === 'Pro'
                    ? 'bg-violet-600 text-white hover:bg-violet-700'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                } disabled:opacity-50`}
              >
                {loading === pack.credits.toString() ? 'Chargement...' : `Acheter — ${pack.price}€`}
              </button>
            </div>
          ))}
        </div>

        {/* Info */}
        <p className="text-center text-gray-400 text-sm mt-8">
          Paiement sécurisé par Stripe · Crédits sans date d'expiration
        </p>
      </div>
    </main>
  )
}