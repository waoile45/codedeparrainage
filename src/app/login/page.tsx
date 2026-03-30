'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    console.log('data:', data)
    console.log('error:', error)

    if (error) {
      setError('Email ou mot de passe incorrect')
      setLoading(false)
      return
    }

    if (data.user) {
      const { data: profile } = await supabase
        .from('users')
        .select('xp, level, streak_days, last_login')
        .eq('id', data.user.id)
        .single()

      if (profile) {
        const now = new Date()
        const lastLogin = profile.last_login ? new Date(profile.last_login) : null
        const isNewDay = !lastLogin || lastLogin.toDateString() !== now.toDateString()

        if (isNewDay) {
          const yesterday = new Date(now)
          yesterday.setDate(yesterday.getDate() - 1)
          const isStreak = lastLogin && lastLogin.toDateString() === yesterday.toDateString()

          const newXp = profile.xp + 2
          const newStreak = isStreak ? profile.streak_days + 1 : 1
          const newLevel =
            newXp >= 10000 ? 'Parrain Légendaire' :
            newXp >= 5000 ? 'Super Parrain' :
            newXp >= 2000 ? 'Parrain Or' :
            newXp >= 500 ? 'Parrain Argent' :
            newXp >= 100 ? 'Parrain Bronze' : 'Débutant'

          await supabase
            .from('users')
            .update({
              xp: newXp,
              level: newLevel,
              streak_days: newStreak,
              last_login: now.toISOString(),
            })
            .eq('id', data.user.id)
        }
      }
    }

    router.push('/profil')
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl border border-gray-100 p-8 w-full max-w-md">

        <div className="text-center mb-8">
          <div className="text-xl font-medium mb-1">
            code<span className="text-violet-600">deparrainage</span>.com
          </div>
          <div className="text-gray-500 text-sm">Connectez-vous à votre compte</div>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-violet-400"
              placeholder="votre@email.com"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-violet-400"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="bg-violet-600 text-white py-3 rounded-xl text-sm font-medium hover:bg-violet-700 disabled:opacity-50"
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <div className="text-center mt-6 text-sm text-gray-500">
          Pas encore de compte ?{' '}
          <a href="/register" className="text-violet-600 font-medium">
            S'inscrire gratuitement
          </a>
        </div>

      </div>
    </main>
  )
}