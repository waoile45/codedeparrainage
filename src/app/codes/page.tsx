'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'

export default function CodesPage() {
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)
  const [bumping, setBumping] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const [avisOpen, setAvisOpen] = useState<string | null>(null)
  const [msgOpen, setMsgOpen] = useState<string | null>(null)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [msgContent, setMsgContent] = useState('')
  const [avisLoading, setAvisLoading] = useState(false)
  const [msgLoading, setMsgLoading] = useState(false)
  const [search, setSearch] = useState('')
  const supabase = createClient()
  const [bumpsLeft, setBumpsLeft] = useState<Record<string, number>>({})

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      const { data } = await supabase
        .from('announcements')
        .select('*, users (id, pseudo, xp, level), companies (name, slug, category, referral_bonus_description), reviews (rating)')
        .order('last_bumped_at', { ascending: false })
      setAnnouncements(data ?? [])
    }
    load()
  }, [])

  async function handleBump(announcementId: string, bumpsToday: number) {
    if (!user) { window.location.href = '/login'; return }
    setBumping(announcementId)
    const res = await fetch('/api/bump', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ announcementId }),
    })
    const data = await res.json()
    if (res.ok) {
      setBumpsLeft(prev => ({ ...prev, [announcementId]: data.bumpsLeft }))
      const { data: updated } = await supabase
        .from('announcements')
        .select('*, users (id, pseudo, xp, level), companies (name, slug, category, referral_bonus_description), reviews (rating)')
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
      alert('Avis publié !')
    } else {
      alert(data.error)
    }
    setAvisLoading(false)
  }

  async function handleMessage(announcementId: string, receiverId: string) {
    if (!user) { window.location.href = '/login'; return }
    setMsgLoading(true)
    const res = await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ announcementId, receiverId, content: msgContent }),
    })
    const data = await res.json()
    if (res.ok) {
      setMsgOpen(null)
      setMsgContent('')
      alert('Message envoyé !')
    } else {
      alert(data.error)
    }
    setMsgLoading(false)
  }

  function getAvgRating(reviews: any[]) {
    if (!reviews || reviews.length === 0) return null
    const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    return avg.toFixed(1)
  }

  const filtered = announcements.filter((ann: any) =>
    ann.companies?.name?.toLowerCase().includes(search.toLowerCase()) ||
    ann.companies?.category?.toLowerCase().includes(search.toLowerCase()) ||
    ann.code?.toLowerCase().includes(search.toLowerCase())
  )

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
                <a href="/messages" className="text-sm text-gray-600 px-4 py-2">Messages</a>
                <a href="/profil" className="text-sm text-gray-600 px-4 py-2">Mon profil</a>
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
        <p className="text-gray-500 text-sm mb-4">
          {announcements.length} codes disponibles — mis à jour en temps réel
        </p>

        <div className="flex gap-3 mb-8">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher... (ex: Boursobank, Winamax, crypto)"
            className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-violet-400 bg-white"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-500 hover:text-gray-900"
            >
              ✕
            </button>
          )}
        </div>

        {filtered.length > 0 ? (
          <div className="flex flex-col gap-4">
            {filtered.map((ann: any) => {
              const avgRating = getAvgRating(ann.reviews)
              const isOwner = user && user.id === ann.user_id
              const isAvisOpen = avisOpen === ann.id
              const isMsgOpen = msgOpen === ann.id

              function getCompanyDomain(slug: string) {
    const domains: Record<string, string> = {
      'boursobank': 'boursobank.com',
      'fortuneo': 'fortuneo.fr',
      'hello-bank': 'hello.bank',
      'revolut': 'revolut.com',
      'lydia': 'lydia-app.com',
      'winamax': 'winamax.fr',
      'betclic': 'betclic.fr',
      'pmu': 'pmu.fr',
      'free': 'free.fr',
      'sfr': 'sfr.fr',
      'igraal': 'igraal.com',
      'poulpeo': 'poulpeo.com',
      'binance': 'binance.com',
      'coinbase': 'coinbase.com',
      'edf': 'edf.fr',
      'engie': 'engie.fr',
    }
    return domains[slug] ?? slug + '.com'
  }

              return (
                <div key={ann.id} className="bg-white border border-gray-100 rounded-2xl p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center overflow-hidden">
                        <img
                          src={"https://www.google.com/s2/favicons?domain=" + getCompanyDomain(ann.companies?.slug) + "&sz=64"}
                          alt={ann.companies?.name}
                          className="w-8 h-8 object-contain"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                            e.currentTarget.parentElement!.innerHTML = '<span class="text-xs font-medium text-violet-600">' + ann.companies?.name?.slice(0, 2).toUpperCase() + '</span>'
                          }}
                        />
                      </div>
                      <div>
                        <a href={"/code-parrainage/" + ann.companies?.slug} className="font-medium text-gray-900 hover:text-violet-600">
                          {ann.companies?.name}
                        </a>
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
                        <span className="text-xs text-yellow-500">★ {avgRating} ({ann.reviews.length})</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {!isOwner && user && (
                        <>
                          <button
                            onClick={() => { setMsgOpen(isMsgOpen ? null : ann.id); setAvisOpen(null) }}
                            className="text-xs border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg hover:border-blue-400 hover:text-blue-600"
                          >
                            💬 Contacter
                          </button>
                          <button
                            onClick={() => { setAvisOpen(isAvisOpen ? null : ann.id); setMsgOpen(null) }}
                            className="text-xs border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg hover:border-yellow-400 hover:text-yellow-600"
                          >
                            ★ Avis
                          </button>
                        </>
                      )}
                      {isOwner && (() => {
                        const left = bumpsLeft[ann.id] ?? (5 - (ann.bumps_today ?? 0))
                        const isExhausted = left <= 0
                        return (
                          <button
                            onClick={() => handleBump(ann.id, ann.bumps_today)}
                            disabled={bumping === ann.id || isExhausted}
                            className={
                              "text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors " +
                              (isExhausted
                                ? "border-red-200 bg-red-50 text-red-400 cursor-not-allowed"
                                : left <= 2
                                ? "border-orange-200 bg-orange-50 text-orange-600 hover:border-orange-400"
                                : "border-violet-200 bg-violet-50 text-violet-600 hover:border-violet-400")
                            }
                          >
                            {bumping === ann.id ? (
                              '...'
                            ) : isExhausted ? (
                              '✕ Limite atteinte'
                            ) : (
                              '▲ Remonter · ' + left + '/5'
                            )}
                          </button>
                        )
                      })()}
                    </div>
                  </div>

                  {isMsgOpen && (
                    <div className="border-t border-gray-100 pt-4 mt-2">
                      <div className="text-sm font-medium text-gray-700 mb-3">
                        Envoyer un message à {ann.users?.pseudo}
                      </div>
                      <textarea
                        value={msgContent}
                        onChange={(e) => setMsgContent(e.target.value)}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-violet-400 resize-none mb-3"
                        placeholder="Votre message..."
                        rows={3}
                      />
                      <button
                        onClick={() => handleMessage(ann.id, ann.users?.id)}
                        disabled={msgLoading}
                        className="bg-violet-600 text-white px-4 py-2 rounded-xl text-sm font-medium disabled:opacity-50"
                      >
                        {msgLoading ? 'Envoi...' : 'Envoyer'}
                      </button>
                    </div>
                  )}

                  {isAvisOpen && (
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
            <div className="text-4xl mb-4">{search ? '🔍' : '🎯'}</div>
            <div className="text-gray-500 mb-4">
              {search ? 'Aucun résultat pour "' + search + '"' : 'Aucune annonce pour l\'instant'}
            </div>
            {search ? (
              <button onClick={() => setSearch('')} className="text-violet-600 text-sm">
                Effacer la recherche
              </button>
            ) : (
              <a href="/publier" className="bg-violet-600 text-white px-6 py-3 rounded-xl text-sm font-medium">
                Soyez le premier à publier !
              </a>
            )}
          </div>
        )}
      </div>
    </main>
  )
}