'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'

export default function BoostPage() {
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [balance, setBalance] = useState<number>(0)
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<any>(null)
  const [days, setDays] = useState<number>(1)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const router = useRouter()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { router.push('/login'); return }

    // Récupérer les annonces de l'utilisateur
    const { data: anns } = await supabase
      .from('announcements')
      .select('*, companies(name, slug)')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })

    setAnnouncements(anns || [])

    // Récupérer le solde
    const { data: credits } = await supabase
      .from('credits')
      .select('balance')
      .eq('user_id', session.user.id)
      .single()

    setBalance(credits?.balance || 0)
  }

  const getCostPerDay = (ann: any): number => {
    const views = ann.companies?.monthly_views || 0
    if (views >= 3000) return 1.00
    if (views >= 1000) return 0.79
    if (views >= 500)  return 0.64
    if (views >= 100)  return 0.15
    return 0.10
  }

  const totalCost = selectedAnnouncement 
    ? getCostPerDay(selectedAnnouncement) * days 
    : 0

  const handleBoost = async () => {
    if (!selectedAnnouncement) return
    if (totalCost > balance) {
      setMessage({ type: 'error', text: 'Solde insuffisant !' })
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/boost', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          announcement_id: selectedAnnouncement.id,
          days,
          cost_per_day: getCostPerDay(selectedAnnouncement),
          total_cost: totalCost,
        }),
      })

      const data = await res.json()
      if (res.ok) {
        setMessage({ type: 'success', text: `✅ Annonce boostée pour ${days} jour(s) !` })
        setBalance(prev => prev - totalCost)
        setSelectedAnnouncement(null)
        setDays(1)
      } else {
        setMessage({ type: 'error', text: data.error || 'Erreur serveur' })
      }
    } catch {
      setMessage({ type: 'error', text: 'Erreur serveur' })
    }
    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Booster une annonce ⚡
          </h1>
          <p className="text-gray-500">Apparaissez en tête de liste sur /codes</p>
          <div className="mt-4 inline-block bg-violet-100 text-violet-700 px-6 py-2 rounded-full font-semibold">
            Solde : {balance.toFixed(2)} crédits
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-xl text-center font-medium ${
            message.type === 'success' 
              ? 'bg-green-100 text-green-700' 
              : 'bg-red-100 text-red-700'
          }`}>
            {message.text}
            {balance === 0 && message.type === 'error' && (
              <a href="/credits" className="ml-2 underline">Acheter des crédits</a>
            )}
          </div>
        )}

        {/* Liste des annonces */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
          <h2 className="font-semibold text-gray-800 mb-4">
            1. Choisissez votre annonce
          </h2>

          {announcements.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              Vous n'avez pas encore d'annonces.{' '}
              <a href="/publier" className="text-violet-600 underline">Publier une annonce</a>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {announcements.map((ann) => (
                <div
                  key={ann.id}
                  onClick={() => setSelectedAnnouncement(ann)}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition ${
                    selectedAnnouncement?.id === ann.id
                      ? 'border-violet-500 bg-violet-50'
                      : 'border-gray-100 hover:border-violet-200'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium text-gray-800">
                        {ann.companies?.name || 'Entreprise inconnue'}
                      </div>
                      <div className="text-sm text-gray-400 mt-1">
                        Code : {ann.code}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-violet-600">
                        {getCostPerDay(ann).toFixed(2)} crédit/jour
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Nombre de jours */}
        {selectedAnnouncement && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
            <h2 className="font-semibold text-gray-800 mb-4">
              2. Choisissez la durée
            </h2>

            <div className="flex items-center gap-4 mb-4">
              <button
                onClick={() => setDays(Math.max(1, days - 1))}
                className="w-10 h-10 rounded-full bg-gray-100 text-gray-600 font-bold text-lg hover:bg-gray-200"
              >
                −
              </button>
              <span className="text-2xl font-bold text-gray-900 w-20 text-center">
                {days} jour{days > 1 ? 's' : ''}
              </span>
              <button
                onClick={() => setDays(Math.min(30, days + 1))}
                className="w-10 h-10 rounded-full bg-gray-100 text-gray-600 font-bold text-lg hover:bg-gray-200"
              >
                +
              </button>
            </div>

            {/* Récap */}
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Coût par jour</span>
                <span>{getCostPerDay(selectedAnnouncement).toFixed(2)} crédit</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Durée</span>
                <span>{days} jour{days > 1 ? 's' : ''}</span>
              </div>
              <div className="border-t border-gray-200 mt-2 pt-2 flex justify-between font-bold text-gray-900">
                <span>Total</span>
                <span className={totalCost > balance ? 'text-red-500' : 'text-violet-600'}>
                  {totalCost.toFixed(2)} crédits
                </span>
              </div>
              {totalCost > balance && (
                <p className="text-red-500 text-xs mt-2">
                  Solde insuffisant — <a href="/credits" className="underline">acheter des crédits</a>
                </p>
              )}
            </div>
          </div>
        )}

        {/* Bouton boost */}
        {selectedAnnouncement && (
          <button
            onClick={handleBoost}
            disabled={loading || totalCost > balance}
            className="w-full py-4 bg-violet-600 text-white rounded-2xl font-bold text-lg hover:bg-violet-700 disabled:opacity-50 transition"
          >
            {loading ? 'Activation...' : `⚡ Booster ${days} jour${days > 1 ? 's' : ''} — ${totalCost.toFixed(2)} crédits`}
          </button>
        )}

      </div>
    </main>
  )
}