'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

const LEVELS = [
  { name: 'Débutant', min: 0, color: 'bg-gray-100 text-gray-600' },
  { name: 'Parrain Bronze', min: 100, color: 'bg-amber-100 text-amber-700' },
  { name: 'Parrain Argent', min: 500, color: 'bg-gray-200 text-gray-700' },
  { name: 'Parrain Or', min: 2000, color: 'bg-yellow-100 text-yellow-700' },
  { name: 'Super Parrain', min: 5000, color: 'bg-violet-100 text-violet-700' },
  { name: 'Parrain Légendaire', min: 10000, color: 'bg-orange-100 text-orange-700' },
]

const BADGES = [
  { type: 'premier_pas', icon: '🚀', name: 'Premier pas', desc: '1ère annonce publiée' },
  { type: 'assidu', icon: '🔥', name: 'Assidu', desc: '7 jours consécutifs' },
  { type: 'populaire', icon: '⭐', name: 'Populaire', desc: '10+ avis positifs' },
  { type: 'multi_parrain', icon: '🏆', name: 'Multi-parrain', desc: '5+ annonces actives' },
  { type: 'veteran', icon: '💎', name: 'Vétéran', desc: 'Membre depuis 1 an' },
  { type: 'legendaire', icon: '👑', name: 'Légendaire', desc: '10 000 XP atteints' },
]

function getLevel(xp: number) {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].min) return LEVELS[i]
  }
  return LEVELS[0]
}

function getNextLevel(xp: number) {
  for (let i = 0; i < LEVELS.length; i++) {
    if (xp < LEVELS[i].min) return LEVELS[i]
  }
  return null
}

function getProgress(xp: number) {
  const current = getLevel(xp)
  const next = getNextLevel(xp)
  if (!next) return 100
  const range = next.min - current.min
  const progress = xp - current.min
  return Math.round((progress / range) * 100)
}

export default function ProfilPage() {
  const [profile, setProfile] = useState<any>(null)
  const [badges, setBadges] = useState<any[]>([])
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [credits, setCredits] = useState<number>(0)
  const [activeBoosts, setActiveBoosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editingAnn, setEditingAnn] = useState<any>(null)
  const [editCode, setEditCode] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editLoading, setEditLoading] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      const { data: badges } = await supabase
        .from('badges')
        .select('*')
        .eq('user_id', user.id)

      const { data: announcements } = await supabase
        .from('announcements')
        .select('*, companies (name, category)')
        .eq('user_id', user.id)
        .order('last_bumped_at', { ascending: false })

      const { data: creditsData } = await supabase
        .from('credits')
        .select('balance')
        .eq('user_id', user.id)
        .single()

      const { data: boostsData } = await supabase
        .from('boosts')
        .select('*, announcements (code, companies (name))')
        .eq('user_id', user.id)
        .eq('active', true)
        .gt('ends_at', new Date().toISOString())
        .order('ends_at', { ascending: true })

      setProfile(profile)
      setBadges(badges ?? [])
      setAnnouncements(announcements ?? [])
      setCredits(creditsData?.balance ?? 0)
      setActiveBoosts(boostsData ?? [])
      setLoading(false)
    }
    load()
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
  }

  async function handleDelete() {
    if (!deletingId) return
    const res = await fetch('/api/announcements/' + deletingId, { method: 'DELETE' })
    if (res.ok) {
      setAnnouncements(prev => prev.filter(a => a.id !== deletingId))
      setDeletingId(null)
    } else {
      alert('Erreur lors de la suppression')
    }
  }

  async function handleEdit() {
    setEditLoading(true)
    const res = await fetch('/api/announcements/' + editingAnn.id, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: editCode, description: editDescription }),
    })
    if (res.ok) {
      setAnnouncements(prev => prev.map(a =>
        a.id === editingAnn.id ? { ...a, code: editCode, description: editDescription } : a
      ))
      setEditingAnn(null)
    } else {
      alert('Erreur lors de la modification')
    }
    setEditLoading(false)
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-gray-400">Chargement...</div>
    </div>
  )

  if (!profile) return null

  const level = getLevel(profile.xp)
  const nextLevel = getNextLevel(profile.xp)
  const progress = getProgress(profile.xp)
  const unlockedBadges = badges.map(b => b.badge_type)

  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <a href="/" className="text-lg font-medium">
            code<span className="text-violet-600">deparrainage</span>.com
          </a>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-500 hover:text-gray-900"
          >
            Déconnexion
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8 flex flex-col gap-6">

        {/* CARTE PROFIL */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-violet-100 flex items-center justify-center text-2xl font-medium text-violet-600">
              {profile.pseudo?.slice(0, 1).toUpperCase()}
            </div>
            <div>
              <div className="text-xl font-medium text-gray-900">{profile.pseudo}</div>
              <span className={"text-sm px-3 py-1 rounded-full font-medium " + level.color}>
                {level.name}
              </span>
            </div>
            <div className="ml-auto text-center">
              <div className="text-2xl font-medium text-violet-600">{profile.xp}</div>
              <div className="text-xs text-gray-500">XP total</div>
            </div>
          </div>

          {/* BARRE XP */}
          <div className="mb-2 flex justify-between text-xs text-gray-500">
            <span>{profile.xp} XP</span>
            <span>{nextLevel ? nextLevel.name + ' à ' + nextLevel.min + ' XP' : 'Niveau maximum !'}</span>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden mb-4">
            <div
              className="h-full bg-violet-600 rounded-full transition-all"
              style={{ width: progress + '%' }}
            />
          </div>

          {/* STATS */}
          <div className="grid grid-cols-4 gap-3">
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <div className="text-xl font-medium text-gray-900">{announcements.length}</div>
              <div className="text-xs text-gray-500">Annonces</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <div className="text-xl font-medium text-gray-900">{profile.streak_days}</div>
              <div className="text-xs text-gray-500">Streak 🔥</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <div className="text-xl font-medium text-gray-900">{badges.length}</div>
              <div className="text-xs text-gray-500">Badges</div>
            </div>
            <div className="bg-violet-50 rounded-xl p-3 text-center">
              <div className="text-xl font-medium text-violet-600">{credits.toFixed(1)}</div>
              <div className="text-xs text-violet-500">Crédits ⚡</div>
            </div>
          </div>
        </div>

        {/* CRÉDITS & BOOSTS */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">Crédits & Boosts ⚡</h2>
            <div className="flex gap-2">
              <a href="/credits" className="text-sm bg-violet-600 text-white px-4 py-2 rounded-full font-medium hover:bg-violet-700">
                Acheter des crédits
              </a>
              <a href="/boost" className="text-sm border border-violet-200 text-violet-600 px-4 py-2 rounded-full font-medium hover:bg-violet-50">
                Booster une annonce
              </a>
            </div>
          </div>

          <div className="bg-violet-50 rounded-xl p-4 mb-4 flex items-center justify-between">
            <div>
              <div className="text-sm text-violet-600 font-medium">Solde actuel</div>
              <div className="text-3xl font-bold text-violet-700">{credits.toFixed(2)}</div>
              <div className="text-xs text-violet-500">crédits disponibles</div>
            </div>
            <div className="text-5xl">⚡</div>
          </div>

          {activeBoosts.length > 0 ? (
            <div>
              <div className="text-sm font-medium text-gray-700 mb-3">Boosts actifs</div>
              <div className="flex flex-col gap-2">
                {activeBoosts.map((boost: any) => {
                  const endsAt = new Date(boost.ends_at)
                  const daysLeft = Math.ceil((endsAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                  return (
                    <div key={boost.id} className="border border-violet-100 rounded-xl p-3 flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          ⚡ {boost.announcements?.companies?.name}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          Code : {boost.announcements?.code}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-violet-600">
                          {daysLeft} jour{daysLeft > 1 ? 's' : ''} restant{daysLeft > 1 ? 's' : ''}
                        </div>
                        <div className="text-xs text-gray-400">
                          jusqu'au {endsAt.toLocaleDateString('fr-FR')}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-4 text-gray-400 text-sm">
              Aucun boost actif —{' '}
              <a href="/boost" className="text-violet-600">boostez une annonce !</a>
            </div>
          )}
        </div>

        {/* BADGES */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Badges</h2>
          <div className="grid grid-cols-3 gap-3">
            {BADGES.map((badge) => {
              const unlocked = unlockedBadges.includes(badge.type)
              return (
                <div
                  key={badge.type}
                  className={"border rounded-xl p-3 text-center " + (unlocked ? "border-violet-200 bg-violet-50" : "border-gray-100 opacity-40")}
                >
                  <div className="text-2xl mb-1">{badge.icon}</div>
                  <div className="text-xs font-medium text-gray-900">{badge.name}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{badge.desc}</div>
                </div>
              )
            })}
          </div>
        </div>

        {/* MES ANNONCES */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">Mes annonces</h2>
            <a href="/publier" className="text-sm text-violet-600 font-medium">+ Ajouter</a>
          </div>
          {announcements.length > 0 ? (
            <div className="flex flex-col gap-3">
              {announcements.map((ann: any) => (
                <div key={ann.id} className="border border-gray-100 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-sm text-gray-900">{ann.companies?.name}</div>
                      <div className="font-mono text-xs text-gray-500 mt-0.5">{ann.code}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-violet-50 text-violet-600 px-2 py-1 rounded-full">
                        {ann.companies?.category}
                      </span>
                      <button
                        onClick={() => {
                          setEditingAnn(ann)
                          setEditCode(ann.code)
                          setEditDescription(ann.description || '')
                        }}
                        className="text-xs border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg hover:border-violet-400 hover:text-violet-600"
                      >
                        ✏️ Modifier
                      </button>
                      <button
                        onClick={() => setDeletingId(ann.id)}
                        className="text-xs border border-red-100 text-red-400 px-3 py-1.5 rounded-lg hover:border-red-400 hover:text-red-600"
                      >
                        🗑️ Supprimer
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400 text-sm">
              Aucune annonce — <a href="/publier" className="text-violet-600">publiez votre premier code !</a>
            </div>
          )}
        </div>

        {/* COMMENT GAGNER DES XP */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Comment gagner des XP ?</h2>
          <div className="flex flex-col gap-2">
            {[
              { action: 'Publier une annonce', xp: '+10 XP' },
              { action: 'Remonter une annonce', xp: '+5 XP' },
              { action: 'Connexion quotidienne', xp: '+2 XP' },
              { action: 'Recevoir un avis positif', xp: '+20 XP' },
              { action: 'Premier parrainage validé', xp: '+50 XP' },
            ].map((item) => (
              <div key={item.action} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                <span className="text-sm text-gray-600">{item.action}</span>
                <span className="text-sm font-medium text-violet-600">{item.xp}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* MODAL MODIFIER */}
      {editingAnn && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Modifier l'annonce — {editingAnn.companies?.name}
            </h3>
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Code</label>
                <input
                  type="text"
                  value={editCode}
                  onChange={(e) => setEditCode(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-violet-400"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Description</label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-violet-400 resize-none"
                  rows={3}
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setEditingAnn(null)}
                  className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-xl text-sm font-medium hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  onClick={handleEdit}
                  disabled={editLoading}
                  className="flex-1 bg-violet-600 text-white py-3 rounded-xl text-sm font-medium hover:bg-violet-700 disabled:opacity-50"
                >
                  {editLoading ? 'Sauvegarde...' : 'Sauvegarder'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL SUPPRESSION */}
      {deletingId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm text-center">
            <div className="text-4xl mb-4">🗑️</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Supprimer cette annonce ?
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Cette action est irréversible.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeletingId(null)}
                className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-xl text-sm font-medium hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 bg-red-500 text-white py-3 rounded-xl text-sm font-medium hover:bg-red-600"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}