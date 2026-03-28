'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function MessagesPage() {
  const [messages, setMessages] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUser(user)

      const { data } = await supabase
        .from('messages')
        .select('*, sender:users!sender_id (pseudo), receiver:users!receiver_id (pseudo), announcements (companies (name))')
        .or('sender_id.eq.' + user.id + ',receiver_id.eq.' + user.id)
        .order('created_at', { ascending: false })

      setMessages(data ?? [])
      setLoading(false)
    }
    load()
  }, [])

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
            code<span className="text-violet-600">deparrainage</span>.fr
          </a>
          <a href="/profil" className="text-sm text-gray-600 px-4 py-2">
            Mon profil
          </a>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-medium text-gray-900 mb-8">Mes messages</h1>

        {messages.length > 0 ? (
          <div className="flex flex-col gap-3">
            {messages.map((msg: any) => {
              const isReceived = msg.receiver_id === user?.id
              return (
                <div key={msg.id} className={"bg-white border rounded-2xl p-5 " + (!msg.read && isReceived ? "border-violet-200" : "border-gray-100")}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-xs font-medium text-violet-600">
                        {(isReceived ? msg.sender?.pseudo : msg.receiver?.pseudo)?.slice(0, 1).toUpperCase()}
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-900">
                          {isReceived ? msg.sender?.pseudo : msg.receiver?.pseudo}
                        </span>
                        <span className="text-xs text-gray-400 ml-2">
                          {isReceived ? 'vous a écrit' : 'vous avez écrit'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!msg.read && isReceived && (
                        <span className="text-xs bg-violet-600 text-white px-2 py-0.5 rounded-full">Nouveau</span>
                      )}
                      <span className="text-xs text-gray-400">
                        {new Date(msg.created_at).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  </div>
                  {msg.announcements?.companies?.name && (
                    <div className="text-xs text-violet-600 mb-2">
                      À propos de : {msg.announcements.companies.name}
                    </div>
                  )}
                  <p className="text-sm text-gray-700">{msg.content}</p>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-4xl mb-4">💬</div>
            <div className="text-gray-500">Aucun message pour l'instant</div>
            <a href="/codes" className="text-violet-600 text-sm mt-4 block">
              Parcourir les codes de parrainage
            </a>
          </div>
        )}
      </div>
    </main>
  )
}