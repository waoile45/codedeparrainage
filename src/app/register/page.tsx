'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Turnstile } from '@marsidev/react-turnstile'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [pseudo, setPseudo] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState('')
  const supabase = createClient()

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!turnstileToken) {
      setError('Vérification anti-bot échouée, réessayez.')
      setLoading(false)
      return
    }

    const verify = await fetch('/api/verify-turnstile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: turnstileToken }),
    })
    const verifyData = await verify.json()

    if (!verifyData.success) {
      setError('Vérification anti-bot échouée, réessayez.')
      setLoading(false)
      return
    }

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (signUpError) {
      setError('Erreur : ' + signUpError.message)
      setLoading(false)
      return
    }

    if (data.user) {
      const { error: profileError } = await supabase
        .from('users')
        .insert({ id: data.user.id, email, pseudo })

      if (profileError) {
        setError('Erreur profil : ' + profileError.message)
        setLoading(false)
        return
      }
    }

    window.location.href = '/profil'
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl border border-gray-100 p-8 w-full max-w-md">

        <div className="text-center mb-8">
          <div className="text-xl font-medium mb-1">
            code<span className="text-violet-600">deparrainage</span>.com
          </div>
          <div className="text-gray-500 text-sm">Créez votre compte gratuit</div>
        </div>

        <form onSubmit={handleRegister} className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Pseudo</label>
            <input
              type="text"
              value={pseudo}
              onChange={(e) => setPseudo(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-violet-400"
              placeholder="VotreSuperPseudo"
              required
            />
          </div>
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
              minLength={6}
            />
          </div>

          <Turnstile
            siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
            onSuccess={(token) => setTurnstileToken(token)}
          />

          {error && (
            <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !turnstileToken}
            className="bg-violet-600 text-white py-3 rounded-xl text-sm font-medium hover:bg-violet-700 disabled:opacity-50"
          >
            {loading ? 'Création...' : 'Créer mon compte'}
          </button>
        </form>

        <div className="text-center mt-6 text-sm text-gray-500">
          Déjà un compte ?{' '}
          <a href="/login" className="text-violet-600 font-medium">
            Se connecter
          </a>
        </div>

      </div>
    </main>
  )
}