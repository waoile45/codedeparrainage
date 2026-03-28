'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'

export default function CodesPage() {
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)
  const [bumping, setBumping] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const [avisOpen, setAvisOpen] = useState<string | null>(null)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [avisLoading, setAvisLoading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      const { data } = await supabase
        .from('announcements')
        .select('*, users (pseudo, xp, level), companies (name, slug, category, referral_bonus_description), reviews (rating)')
        .order('last_bumped_at', { ascending: false })
      setAnnouncements(data ?? [])
    }
    load()
  }, [])

  async function handleBump(announcementId: string) {
    if (!user) { window.location.href = '/login'; return }
    setBumping(announcementId)
    const res = await fetch('/api/bump', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ announcementId }),
    })
    const data = await res.json()
    if (res.ok) {
      const { data: updated } = await supabase
        .from('announcements')
        .select('*, users (pseudo, xp, level), companies (name, slug, category, referral_bonus_description), reviews (rating)')
        .order('last_bumped_at', { ascending: false })
      setAnnouncements(updated ?? [])
    } else {
      alert(data.error)
    }
    setBumping(null)
  }

  async function handleCopy(code: string, id: string) {
    await navigator.clipboard.writeText(code)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  async function handleAvis(announcementId: string) {
    setAvisLoading(true)
    const res = await fetch('/api/avis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ announcementId, rating, comment }),
    })
    const data = await res.json()
    if (res.ok) {
      setAvisOpen(null)
      setRating(5)
      setComment('')
      alert('Avis publié ! +20 XP pour le parrain')
    } else {
      alert(data.error)
    }
    setAvisLoading(false)
  }

  function getAvgRating(reviews: any[]) {
    if (!reviews || reviews.length === 0) return null
    const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    return avg.toFixed(1)
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <a href="/" className="text-lg font-medium">
            code<span className="text-violet-600">deparrainage</span>.fr
          </a>
          <div className="flex gap-3">
            {user ? (
              <div className="flex gap-3">
                <a href="/profil" className="text-sm text-gray-600 px-4 py-2">
                  Mon profil
                </a>
                <a href="/publier" className="text-sm bg-violet-600 text-white px-4 py-2 rounded-full">
                  Publier mon code
                </a>
              </div>
            ) : (
              <a href="/login" className="text-sm bg-violet-600 text-white px-4 py-2 rounded-full">
                Connexion
              </a>
            )}
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-medium text-gray-900 mb-2">
          Codes de parrainage disponibles
        </h1>
        <p className="text-gray-500 text-sm mb-8">
          {announcements.length} codes disponibles — mis à jour en temps réel
        </p>

        {announcements.length > 0 ? (
          <div className="flex flex-col gap-4">
            {announcements.map((ann: any) => {
              const avgRating = getAvgRating(ann.reviews)
              const isOwner = user && user.id === ann.user_id
              const isOpen = avisOpen === ann.id

              return (
                <div key={ann.id} className="bg-white border border-gray-100 rounded-2xl p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center text-sm font-medium text-violet-600">
                        {ann.companies?.name?.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{ann.companies?.name}</div>
                        <div className="text-xs text-gray-500">{ann.companies?.referral_bonus_description}</div>
                      </div>
                    </div>
                    <span className="text-xs bg-violet-50 text-violet-600 px-3 py-1 rounded-full">
                      {ann.companies?.category}
                    </span>
                  </div>

                  <div className="bg-gray-50 rounded-xl px-4 py-3 flex items-center justify-between mb-3">
                    <span className="font-mono text-sm font-medium text-gray-900">{ann.code}</span>
                    <button onClick={() => handleCopy(ann.code, ann.id)} className="text-xs text-violet-600 font-medium">
                      {copied === ann.id ? '✓ Copié !' : 'Copier'}
                    </button>
                  </div>

                  {ann.description && (
                    <p className="text-sm text-gray-600 mb-3">{ann.description}</p>
                  )}

                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-violet-100 flex items-center justify-center text-xs font-medium text-violet-600">
                        {ann.users?.pseudo?.slice(0, 1).toUpperCase()}
                      </div>
                      <span className="text-xs text-gray-500">{ann.users?.pseudo}</span>
                      <span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full">
                        {ann.users?.level}
                      </span>
                      {avgRating && (
                        <span className="text-xs text-yellow-500">
                          ★ {avgRating} ({ann.reviews.length})
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {!isOwner && user && (
                        <button
                          onClick={() => setAvisOpen(isOpen ? null : ann.id)}
                          className="text-xs border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg hover:border-yellow-400 hover:text-yellow-600"
                        >
                          ★ Laisser un avis
                        </button>
                      )}
                      {isOwner && (
                        <button
                          onClick={() => handleBump(ann.id)}
                          disabled={bumping === ann.id}
                          className="text-xs border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg hover:border-violet-400 hover:text-violet-600 disabled:opacity-50"
                        >
                          {bumping === ann.id ? '...' : '▲ Remonter'}
                        </button>
                      )}
                    </div>
                  </div>

                  {isOpen && (
                    <div className="border-t border-gray-100 pt-4 mt-2">
                      <div className="text-sm font-medium text-gray-700 mb-3">Votre avis</div>
                      <div className="flex gap-2 mb-3">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => setRating(star)}
                            className={"text-2xl " + (star <= rating ? 'text-yellow-400' : 'text-gray-200')}
                          >
                            ★
                          </button>
                        ))}
                      </div>
                      <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-violet-400 resize-none mb-3"
                        placeholder="Décrivez votre expérience..."
                        rows={2}
                      />
                      <button
                        onClick={() => handleAvis(ann.id)}
                        disabled={avisLoading}
                        className="bg-violet-600 text-white px-4 py-2 rounded-xl text-sm font-medium disabled:opacity-50"
                      >
                        {avisLoading ? 'Envoi...' : 'Publier mon avis'}
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-4xl mb-4">🎯</div>
            <div className="text-gray-500 mb-4">Aucune annonce pour l'instant</div>
            <a href="/publier" className="bg-violet-600 text-white px-6 py-3 rounded-xl text-sm font-medium">
              Soyez le premier à publier !
            </a>
          </div>
        )}
      </div>
    </main>
  )
}