'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Turnstile } from '@marsidev/react-turnstile'

export default function LoginPage() {
  const [email, setEmail]               = useState('')
  const [password, setPassword]         = useState('')
  const [showPwd, setShowPwd]           = useState(false)
  const [error, setError]               = useState('')
  const [loading, setLoading]           = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState('')
  const supabase = createClient()

  async function handleGoogleLogin() {
    setGoogleLoading(true)
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

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
          min-height:100vh; background:#0A0A0F;
          display:flex; align-items:center; justify-content:center;
          padding:1.5rem; position:relative; overflow:hidden;
        }
        .auth-bg::before {
          content:''; position:fixed; top:-200px; left:50%; transform:translateX(-50%);
          width:600px; height:600px;
          background:radial-gradient(circle,rgba(124,58,237,0.12),transparent 65%);
          pointer-events:none;
        }
        .auth-card {
          width:100%; max-width:420px;
          background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08);
          border-radius:24px; padding:2.5rem 2rem;
          position:relative; animation:fadeIn 0.4s ease; overflow:hidden;
        }
        .auth-card::before {
          content:''; position:absolute; top:0; left:0; right:0; height:1px;
          background:linear-gradient(90deg,transparent,rgba(124,58,237,0.5),transparent);
        }
        .auth-logo {
          font-family:'Syne',sans-serif; font-weight:800; font-size:1.15rem;
          color:#fff; text-decoration:none; letter-spacing:-0.02em;
          display:block; text-align:center; margin-bottom:0.5rem;
        }
        .auth-logo span { color:#7c3aed; }
        .auth-subtitle { text-align:center; color:rgba(255,255,255,0.35); font-size:0.875rem; margin-bottom:1.75rem; }
        .auth-form { display:flex; flex-direction:column; gap:1rem; }
        .auth-field { display:flex; flex-direction:column; gap:6px; }
        .auth-label { font-size:0.78rem; font-weight:600; color:rgba(255,255,255,0.45); letter-spacing:0.04em; }
        .pwd-wrap { position:relative; }
        .auth-input {
          background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08);
          border-radius:12px; padding:0.75rem 1rem;
          color:#fff; font-size:0.9rem; font-family:'DM Sans',sans-serif;
          outline:none; transition:all 0.2s; width:100%;
        }
        .auth-input.has-toggle { padding-right:2.75rem; }
        .auth-input::placeholder { color:rgba(255,255,255,0.25); }
        .auth-input:focus { border-color:rgba(124,58,237,0.45); background:rgba(124,58,237,0.05); box-shadow:0 0 0 3px rgba(124,58,237,0.1); }
        .pwd-toggle {
          position:absolute; right:0.875rem; top:50%; transform:translateY(-50%);
          background:none; border:none; cursor:pointer; color:rgba(255,255,255,0.3);
          padding:0; display:flex; align-items:center; transition:color 0.18s;
        }
        .pwd-toggle:hover { color:rgba(255,255,255,0.7); }
        .auth-forgot { text-align:right; font-size:0.75rem; color:rgba(255,255,255,0.3); text-decoration:none; transition:color 0.18s; margin-top:-2px; display:block; }
        .auth-forgot:hover { color:#a78bfa; }
        .turnstile-wrap { border-radius:12px; overflow:hidden; border:1px solid rgba(255,255,255,0.07); }
        .auth-error { display:flex; align-items:center; gap:8px; background:rgba(239,68,68,0.1); border:1px solid rgba(239,68,68,0.25); border-radius:10px; padding:0.7rem 0.875rem; font-size:0.8rem; color:#f87171; }
        .auth-btn {
          display:flex; align-items:center; justify-content:center; gap:7px;
          width:100%; background:#7c3aed; color:#fff; border:none;
          border-radius:13px; padding:0.875rem; font-size:0.9rem; font-weight:700;
          cursor:pointer; transition:all 0.2s; font-family:'DM Sans',sans-serif;
        }
        .auth-btn:hover:not(:disabled) { background:#6d28d9; transform:translateY(-1px); box-shadow:0 6px 24px rgba(124,58,237,0.4); }
        .auth-btn:disabled { opacity:0.5; cursor:not-allowed; transform:none; }
        .auth-btn-google {
          display:flex; align-items:center; justify-content:center; gap:10px;
          width:100%; background:rgba(255,255,255,0.05); color:rgba(255,255,255,0.85);
          border:1px solid rgba(255,255,255,0.12); border-radius:13px; padding:0.8rem;
          font-size:0.9rem; font-weight:600; cursor:pointer; transition:all 0.2s;
          font-family:'DM Sans',sans-serif;
        }
        .auth-btn-google:hover:not(:disabled) { background:rgba(255,255,255,0.09); border-color:rgba(255,255,255,0.2); }
        .auth-btn-google:disabled { opacity:0.5; cursor:not-allowed; }
        .auth-separator { display:flex; align-items:center; gap:10px; }
        .auth-separator-line { flex:1; height:1px; background:rgba(255,255,255,0.07); }
        .auth-separator-text { font-size:0.72rem; color:rgba(255,255,255,0.25); white-space:nowrap; }
        .auth-switch { text-align:center; font-size:0.82rem; color:rgba(255,255,255,0.3); margin-top:1.25rem; }
        .auth-switch a { color:#a78bfa; text-decoration:none; font-weight:600; }
        .auth-switch a:hover { text-decoration:underline; }
      `}</style>

      <div className="auth-bg">
        <div className="auth-card">
          <a href="/" className="auth-logo" style={{ display:"flex", alignItems:"center", gap:8 }}>code<span>de</span>parrainage.com</a>
          <p className="auth-subtitle">Connectez-vous à votre compte</p>

          {/* Google */}
          <button className="auth-btn-google" onClick={handleGoogleLogin} disabled={googleLoading} type="button">
            {googleLoading
              ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation:"spin 1s linear infinite" }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
              : <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            }
            Continuer avec Google
          </button>

          <div className="auth-separator" style={{ margin:"1.25rem 0" }}>
            <div className="auth-separator-line" />
            <span className="auth-separator-text">ou avec email</span>
            <div className="auth-separator-line" />
          </div>

          <form className="auth-form" onSubmit={handleLogin}>

            {error && (
              <div className="auth-error">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                {error}
              </div>
            )}

            <div className="auth-field">
              <label className="auth-label">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="auth-input" placeholder="ton@email.com" required />
            </div>

            <div className="auth-field">
              <label className="auth-label">Mot de passe</label>
              <input
                type="text"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="auth-input"
                placeholder="Ton mot de passe"
                required
              />
              <a href="/forgot-password" className="auth-forgot">Mot de passe oublié ?</a>
            </div>

            <div className="turnstile-wrap">
              <Turnstile siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!} onSuccess={token => setTurnstileToken(token)} />
            </div>

            <button type="submit" className="auth-btn" disabled={loading || !turnstileToken}>
              {loading
                ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation:"spin 1s linear infinite" }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                : "Se connecter"
              }
            </button>
          </form>

          <p className="auth-switch">Pas encore de compte ?{' '}<a href="/register">S&apos;inscrire gratuitement</a></p>
        </div>
      </div>
    </>
  )
}
