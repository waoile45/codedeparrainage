'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function PublierPage() {
  const [companies, setCompanies] = useState<any[]>([])
  const [companyId, setCompanyId] = useState('')
  const [code, setCode] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUser(user)
      const { data } = await supabase.from('companies').select('*').order('name')
      setCompanies(data ?? [])
    }
    load()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.from('announcements').insert({
      user_id: user.id,
      company_id: companyId,
      code,
      description,
      last_bumped_at: new Date().toISOString(),
    })

    if (error) {
      setError('Erreur : ' + error.message)
      setLoading(false)
      return
    }

    const { data: profile } = await supabase
      .from('users')
      .select('xp, level')
      .eq('id', user.id)
      .single()

    if (profile) {
      const newXp = profile.xp + 10
      const newLevel =
        newXp >= 10000 ? 'Parrain Légendaire' :
        newXp >= 5000 ? 'Super Parrain' :
        newXp >= 2000 ? 'Parrain Or' :
        newXp >= 500 ? 'Parrain Argent' :
        newXp >= 100 ? 'Parrain Bronze' : 'Débutant'

      await supabase
        .from('users')
        .update({ xp: newXp, level: newLevel })
        .eq('id', user.id)
    }

    const { data: existingBadge } = await supabase
      .from('badges')
      .select('id')
      .eq('user_id', user.id)
      .eq('badge_type', 'premier_pas')
      .single()

    if (!existingBadge) {
      await supabase.from('badges').insert({
        user_id: user.id,
        badge_type: 'premier_pas',
      })
    }

    const { data: annonces } = await supabase
      .from('announcements')
      .select('id')
      .eq('user_id', user.id)

    if (annonces && annonces.length >= 5) {
      const { data: multiParrain } = await supabase
        .from('badges')
        .select('id')
        .eq('user_id', user.id)
        .eq('badge_type', 'multi_parrain')
        .single()

      if (!multiParrain) {
        await supabase.from('badges').insert({
          user_id: user.id,
          badge_type: 'multi_parrain',
        })
      }
    }

    router.push('/codes')
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl border border-gray-100 p-8 w-full max-w-lg">

        <div className="mb-8">
          <a href="/" className="text-lg font-medium">
            code<span className="text-violet-600">deparrainage</span>.fr
          </a>
          <h1 className="text-xl font-medium text-gray-900 mt-4 mb-1">
            Publier mon code de parrainage
          </h1>
          <p className="text-sm text-gray-500">
            Gagnez +10 XP en publiant votre annonce
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              Entreprise
            </label>
            <select
              value={companyId}
              onChange={(e) => setCompanyId(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-violet-400 bg-white"
              required
            >
              <option value="">Choisissez une entreprise...</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} — {c.category}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              Votre code de parrainage
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-violet-400"
              placeholder="Ex: MON-CODE-2024"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              Description (optionnel)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-violet-400 resize-none"
              placeholder="Décrivez votre offre de parrainage..."
              rows={3}
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
            {loading ? 'Publication...' : 'Publier mon annonce +10 XP'}
          </button>
        </form>

      </div>
    </main>
  )
}