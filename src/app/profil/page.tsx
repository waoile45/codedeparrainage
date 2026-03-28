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
  const [loading, setLoading] = useState(true)
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

      setProfile(profile)
      setBadges(badges ?? [])
      setAnnouncements(announcements ?? [])
      setLoading(false)
    }
    load()
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
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
            code<span className="text-violet-600">deparrainage</span>.fr
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
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <div className="text-xl font-medium text-gray-900">{announcements.length}</div>
              <div className="text-xs text-gray-500">Annonces</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <div className="text-xl font-medium text-gray-900">{profile.streak_days}</div>
              <div className="text-xs text-gray-500">Jours streak 🔥</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <div className="text-xl font-medium text-gray-900">{badges.length}</div>
              <div className="text-xs text-gray-500">Badges</div>
            </div>
          </div>
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
                <div key={ann.id} className="border border-gray-100 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <div className="font-medium text-sm text-gray-900">{ann.companies?.name}</div>
                    <div className="font-mono text-xs text-gray-500 mt-0.5">{ann.code}</div>
                  </div>
                  <span className="text-xs bg-violet-50 text-violet-600 px-2 py-1 rounded-full">
                    {ann.companies?.category}
                  </span>
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
    </main>
  )
}