'use client'

import { useState } from 'react'

import { FraicheurCode, type StatsTest } from '@/components/FraicheurCode'

/**
 * « Ce code a marché ? » — les deux boutons qui alimentent la fraîcheur.
 *
 * Sans eux le badge ne se remplit jamais. Ils sont donc placés juste sous le
 * code, au moment exact où le visiteur vient de l'utiliser.
 *
 * Turnstile est rendu par la page hôte, comme pour le bump : ce composant
 * reçoit simplement le jeton courant.
 */
export function TestCodeButtons({
  announcementId,
  stats,
  turnstileToken,
  connecte,
}: {
  announcementId: string
  stats: StatsTest
  turnstileToken?: string | null
  connecte: boolean
}) {
  const [etat, setEtat] = useState<StatsTest>(stats)
  const [envoi, setEnvoi] = useState(false)
  const [choix, setChoix] = useState<boolean | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  async function signaler(worked: boolean) {
    if (!connecte) {
      setMessage('Connectez-vous pour signaler un test.')
      return
    }
    setEnvoi(true)
    setMessage(null)
    try {
      const res = await fetch('/api/codes/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ announcementId, worked, turnstileToken }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setMessage(data.error ?? "L'enregistrement a échoué.")
        return
      }
      setChoix(worked)
      setEtat({
        tests_ok: data.tests_ok,
        tests_ko: data.tests_ko,
        last_tested_at: data.last_tested_at,
      })
    } catch {
      setMessage('Connexion impossible. Réessayez.')
    } finally {
      setEnvoi(false)
    }
  }

  const bouton = (actif: boolean, couleur: string): React.CSSProperties => ({
    borderRadius: 8,
    border: `1px solid ${actif ? couleur : 'var(--border)'}`,
    background: actif ? `${couleur}1f` : 'transparent',
    color: actif ? couleur : 'var(--text-muted)',
    padding: '3px 12px',
    fontSize: '.75rem',
    fontWeight: 600,
    cursor: envoi ? 'default' : 'pointer',
    opacity: envoi ? 0.5 : 1,
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '.45rem' }}>
      <FraicheurCode stats={etat} />

      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '.5rem' }}>
        <span style={{ fontSize: '.75rem', color: 'var(--text-faint)' }}>
          Ce code a marché ?
        </span>
        <button
          type="button"
          onClick={() => signaler(true)}
          disabled={envoi}
          aria-pressed={choix === true}
          style={bouton(choix === true, '#10b981')}
        >
          Oui
        </button>
        <button
          type="button"
          onClick={() => signaler(false)}
          disabled={envoi}
          aria-pressed={choix === false}
          style={bouton(choix === false, '#ef4444')}
        >
          Non
        </button>
      </div>

      {message && (
        <p style={{ fontSize: '.72rem', color: '#f59e0b', margin: 0 }}>{message}</p>
      )}
    </div>
  )
}
