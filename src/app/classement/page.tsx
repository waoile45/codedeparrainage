'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'

export default function ClassementPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('users')
        .select('*, announcements (id)')
        .order('xp', { ascending: false })
        .limit(50)
      setUsers(data ?? [])
      setLoading(false)
    }
    load()
  }, [])

  const medals = ['🥇', '🥈', '🥉']

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-gray-400">Chargement...</div>
    </div>
  )

  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <a href="/" className="text-lg font-medium">
            code<span className="text-violet-600">deparrainage</span>.com
          </a>
          <a href="/codes" className="text-sm text-gray-600 px-4 py-2">
            Voir les codes
          </a>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-medium text-gray-900 mb-2">
            🏆 Classement des parrains
          </h1>
          <p className="text-gray-500 text-sm">
            Les meilleurs parrains de la communauté — mis à jour en temps réel
          </p>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-medium text-gray-900">Top 50 parrains</h2>
          </div>
          {users.map((u: any, index: number) => (
            <div
              key={u.id}
              className={"flex items-center gap-4 px-6 py-4 border-b border-gray-50 last:border-0 " + (index < 3 ? "bg-violet-50/30" : "")}
            >
              <div className="w-8 text-center">
                {index < 3 ? (
                  <span className="text-lg">{medals[index]}</span>
                ) : (
                  <span className="text-sm font-medium text-gray-400">#{index + 1}</span>
                )}
              </div>
              <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center text-sm font-medium text-violet-600 flex-shrink:0">
                {u.pseudo?.slice(0, 1).toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="font-medium text-sm text-gray-900">{u.pseudo}</div>
                <div className="text-xs text-gray-500">{u.level}</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-violet-600">{u.xp} XP</div>
                <div className="text-xs text-gray-400">{u.announcements?.length ?? 0} annonces</div>
              </div>
            </div>
          ))}
          {users.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <div className="text-4xl mb-4">🏆</div>
              <div>Aucun parrain pour l'instant</div>
            </div>
          )}
        </div>

        <div className="bg-violet-600 rounded-2xl p-6 text-center mt-6">
          <div className="text-white font-medium text-lg mb-2">
            Vous voulez apparaître dans le classement ?
          </div>
          <p className="text-white/75 text-sm mb-4">
            Publiez vos codes de parrainage et gagnez des XP !
          </p>
          <a href="/publier" className="bg-yellow-300 text-yellow-900 px-6 py-3 rounded-xl text-sm font-medium">
            Publier mon code
          </a>
        </div>

      </div>
    </main>
  )
}