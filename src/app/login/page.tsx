'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Turnstile } from '@marsidev/react-turnstile'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState('')
  const supabase = createClient()

  async function handleLogin(e: React.FormEvent) {
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

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

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
            newXp >= 5000  ? 'Super Parrain' :
            newXp >= 2000  ? 'Parrain Or' :
            newXp >= 500   ? 'Parrain Argent' :
            newXp >= 100   ? 'Parrain Bronze' : 'Débutant'

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

    window.location.href = '/profil'
  }

  return (
    <>
      <style>{`
        @keyframes fadeIn { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin   { to{transform:rotate(360deg)} }
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        body { background:#0A0A0F; font-family:'DM Sans',sans-serif; min-height:100vh; }

        .auth-bg {
          min-height:100vh;
          background:#0A0A0F;
          display:flex; align-items:center; justify-content:center;
          padding:1.5rem;
          position:relative; overflow:hidden;
        }
        .auth-bg::before {
          content:'';
          position:fixed; top:-200px; left:50%; transform:translateX(-50%);
          width:600px; height:600px;
          background:radial-gradient(circle,rgba(124,58,237,0.12),transparent 65%);
          pointer-events:none;
        }
        .auth-card {
          width:100%; max-width:420px;
          background:rgba(255,255,255,0.03);
          border:1px solid rgba(255,255,255,0.08);
          border-radius:24px; padding:2.5rem 2rem;
          position:relative; animation:fadeIn 0.4s ease; overflow:hidden;
        }
        .auth-card::before {
          content:'';
          position:absolute; top:0; left:0; right:0; height:1px;
          background:linear-gradient(90deg,transparent,rgba(124,58,237,0.5),transparent);
        }
        .auth-logo {
          font-family:'Syne',sans-serif; font-weight:800; font-size:1.15rem;
          color:#fff; text-decoration:none; letter-spacing:-0.02em;
          display:block; text-align:center; margin-bottom:0.5rem;
        }
        .auth-logo span { color:#7c3aed; }
        .auth-subtitle {
          text-align:center; color:rgba(255,255,255,0.35);
          font-size:0.875rem; margin-bottom:2rem;
        }
        .auth-form { display:flex; flex-direction:column; gap:1rem; }
        .auth-field { display:flex; flex-direction:column; gap:6px; }
        .auth-label {
          font-size:0.78rem; font-weight:600;
          color:rgba(255,255,255,0.45); letter-spacing:0.04em;
        }
        .auth-input {
          background:rgba(255,255,255,0.04);
          border:1px solid rgba(255,255,255,0.08);
          border-radius:12px; padding:0.75rem 1rem;
          color:#fff; font-size:0.9rem;
          font-family:'DM Sans',sans-serif; outline:none; transition:all 0.2s; width:100%;
        }
        .auth-input::placeholder { color:rgba(255,255,255,0.25); }
        .auth-input:focus {
          border-color:rgba(124,58,237,0.45);
          background:rgba(124,58,237,0.05);
          box-shadow:0 0 0 3px rgba(124,58,237,0.1);
        }
        .auth-forgot {
          text-align:right; font-size:0.75rem;
          color:rgba(255,255,255,0.3); text-decoration:none;
          transition:color 0.18s; margin-top:-2px; display:block;
        }
        .auth-forgot:hover { color:#a78bfa; }
        .turnstile-wrap {
          border-radius:12px; overflow:hidden;
          border:1px solid rgba(255,255,255,0.07);
        }
        .auth-error {
          display:flex; align-items:center; gap:8px;
          background:rgba(239,68,68,0.1); border:1px solid rgba(239,68,68,0.25);
          border-radius:10px; padding:0.7rem 0.875rem;
          font-size:0.8rem; color:#f87171;
        }
        .auth-btn {
          display:flex; align-items:center; justify-content:center; gap:7px;
          width:100%; background:#7c3aed; color:#fff; border:none;
          border-radius:13px; padding:0.875rem; font-size:0.9rem; font-weight:700;
          cursor:pointer; transition:all 0.2s; font-family:'DM Sans',sans-serif;
        }
        .auth-btn:hover:not(:disabled) {
          background:#6d28d9; transform:translateY(-1px);
          box-shadow:0 6px 24px rgba(124,58,237,0.4);
        }
        .auth-btn:disabled { opacity:0.5; cursor:not-allowed; transform:none; }
        .auth-switch {
          text-align:center; font-size:0.82rem;
          color:rgba(255,255,255,0.3); margin-top:1.25rem;
        }
        .auth-switch a { color:#a78bfa; text-decoration:none; font-weight:600; }
        .auth-switch a:hover { text-decoration:underline; }
      `}</style>

      <div className="auth-bg">
        <div className="auth-card">
          <a href="/" className="auth-logo">
            code<span>de</span>parrainage.com
          </a>
          <p className="auth-subtitle">Connectez-vous à votre compte</p>

          <form className="auth-form" onSubmit={handleLogin}>

            {error && (
              <div className="auth-error">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                {error}
              </div>
            )}

            <div className="auth-field">
              <label className="auth-label">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="auth-input"
                placeholder="ton@email.com"
                required
              />
            </div>

            <div className="auth-field">
              <label className="auth-label">Mot de passe</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="auth-input"
                placeholder="••••••••"
                required
              />
              <a href="/forgot-password" className="auth-forgot">Mot de passe oublié ?</a>
            </div>

            <div className="turnstile-wrap">
              <Turnstile
                siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
                onSuccess={token => setTurnstileToken(token)}
              />
            </div>

            <button
              type="submit"
              className="auth-btn"
              disabled={loading || !turnstileToken}
            >
              {loading
                ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation:"spin 1s linear infinite" }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                : "Se connecter"
              }
            </button>

          </form>

          <p className="auth-switch">
            Pas encore de compte ?{' '}
            <a href="/register">S'inscrire gratuitement</a>
          </p>
        </div>
      </div>
    </>
  )
}