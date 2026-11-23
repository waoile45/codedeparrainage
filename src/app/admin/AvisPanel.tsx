'use client'

// Onglet « Avis » de l'admin : les avis laissés sur le site (page /avis et
// onglet Avis du profil). Une note de 4 ou 5 renvoie le visiteur vers Google,
// une note de 1 à 3 lui demande un commentaire : ces commentaires sont des
// retours privés, à lire ici.

import { useEffect, useMemo, useState } from 'react'
import { Star } from '@/components/Pictos'

type Review = { id: string; rating: number | null; comment: string | null; createdAt: string; author: string | null }
type Filtre = 'tous' | 'commentes' | 'bas' | 'hauts'

const st = {
  head:  { display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 16 } as React.CSSProperties,
  title: { fontWeight: 700, fontSize: '0.95rem', color: '#fff' } as React.CSSProperties,
  sub:   { fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)', marginTop: 3, maxWidth: 600, lineHeight: 1.5 } as React.CSSProperties,
  kpis:  { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(125px,1fr))', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, marginBottom: 16 } as React.CSSProperties,
  kpi:   { padding: '1rem 1.2rem', borderLeft: '1px solid rgba(255,255,255,0.08)' } as React.CSSProperties,
  kpiV:  { fontSize: '1.7rem', fontWeight: 800, color: '#fff', lineHeight: 1.1, fontFamily: 'var(--font-display)', fontVariantNumeric: 'tabular-nums' } as React.CSSProperties,
  kpiL:  { fontSize: '0.74rem', color: 'rgba(255,255,255,0.5)', marginTop: 2 } as React.CSSProperties,
  seg:   { display: 'inline-flex', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: 3, gap: 2, marginBottom: 12, flexWrap: 'wrap' } as React.CSSProperties,
  item:  { display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: '0.4rem 1rem', alignItems: 'start', padding: '0.9rem 0.6rem', borderBottom: '1px solid rgba(255,255,255,0.06)' } as React.CSSProperties,
  empty: { textAlign: 'center', padding: '2.5rem 1rem', color: 'rgba(255,255,255,0.45)', fontSize: '0.85rem' } as React.CSSProperties,
}

function Etoiles({ n }: { n: number | null }) {
  const v = n ?? 0
  return (
    <span aria-label={`${v} sur 5`} style={{ display: 'inline-flex', gap: 2, color: 'var(--accent)' }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} style={{ opacity: i <= v ? 1 : 0.22, display: 'inline-flex' }}><Star size={14} filled={i <= v} /></span>
      ))}
    </span>
  )
}

function SegBtn({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={on}
      style={{ border: 'none', borderRadius: 7, padding: '0.35rem 0.75rem', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', background: on ? 'var(--accent)' : 'transparent', color: on ? 'var(--accent-ink)' : 'rgba(255,255,255,0.6)' }}>
      {children}
    </button>
  )
}

export default function AvisPanel() {
  const [reviews, setReviews] = useState<Review[] | null>(null)
  const [error, setError] = useState('')
  const [filtre, setFiltre] = useState<Filtre>('tous')
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/admin/platform-reviews')
      .then(async (r) => {
        if (!r.ok) throw new Error(`la route a répondu ${r.status}`)
        return (await r.json()).reviews as Review[]
      })
      .then(setReviews)
      .catch((e: Error) => setError(e.message))
  }, [])

  const liste = useMemo(() => {
    if (!reviews) return []
    if (filtre === 'commentes') return reviews.filter((r) => r.comment?.trim())
    if (filtre === 'bas') return reviews.filter((r) => (r.rating ?? 0) <= 3)
    if (filtre === 'hauts') return reviews.filter((r) => (r.rating ?? 0) >= 4)
    return reviews
  }, [reviews, filtre])

  async function supprimer(id: string) {
    if (!confirm('Supprimer cet avis ? (à réserver aux tests et au spam)')) return
    setDeleting(id)
    const res = await fetch('/api/admin/delete', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ table: 'platform_reviews', id }),
    })
    if (res.ok) setReviews((prev) => (prev ?? []).filter((r) => r.id !== id))
    else alert("La suppression a échoué.")
    setDeleting(null)
  }

  if (error) return <div style={{ ...st.empty, color: '#f87171' }}>Les avis n&apos;ont pas pu être chargés : {error}.</div>
  if (!reviews) return <div style={st.empty}>Chargement des avis…</div>

  const notes = reviews.map((r) => r.rating ?? 0).filter((n) => n > 0)
  const moyenne = notes.length ? (notes.reduce((a, b) => a + b, 0) / notes.length).toFixed(1).replace('.', ',') : '—'

  return (
    <div>
      <div style={st.head}>
        <div>
          <div style={st.title}>Avis sur le site</div>
          <div style={st.sub}>
            Laissés sur la page /avis et dans l&apos;onglet Avis du profil. Une note de 4 ou 5 renvoie
            le visiteur vers Google ; une note de 1 à 3 lui demande ce qui ne va pas.
          </div>
        </div>
      </div>

      <div style={st.kpis}>
        {[
          { v: String(reviews.length), l: 'avis au total' },
          { v: moyenne, l: 'note moyenne sur 5' },
          { v: String(reviews.filter((r) => r.comment?.trim()).length), l: 'avec un commentaire' },
          { v: String(reviews.filter((r) => !r.author).length), l: 'laissés sans compte' },
        ].map((k, i) => (
          <div key={k.l} style={{ ...st.kpi, ...(i === 0 ? { borderLeft: 'none' } : {}) }}>
            <div style={st.kpiV}>{k.v}</div>
            <div style={st.kpiL}>{k.l}</div>
          </div>
        ))}
      </div>

      <div style={st.seg} role="group" aria-label="Filtrer">
        <SegBtn on={filtre === 'tous'} onClick={() => setFiltre('tous')}>Tous</SegBtn>
        <SegBtn on={filtre === 'commentes'} onClick={() => setFiltre('commentes')}>Avec commentaire</SegBtn>
        <SegBtn on={filtre === 'bas'} onClick={() => setFiltre('bas')}>1 à 3</SegBtn>
        <SegBtn on={filtre === 'hauts'} onClick={() => setFiltre('hauts')}>4 et 5</SegBtn>
      </div>

      {liste.length === 0 ? (
        <div style={st.empty}>{reviews.length === 0 ? 'Aucun avis pour le moment.' : 'Aucun avis pour ce filtre.'}</div>
      ) : (
        <div>
          {liste.map((r) => (
            <div key={r.id} style={st.item}>
              <Etoiles n={r.rating} />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.55)' }}>
                  <span style={{ color: '#fff', fontWeight: 600 }}>{r.author ?? 'Anonyme'}</span>
                  {' · '}
                  {new Date(r.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
                <p style={{ margin: '0.3rem 0 0', fontSize: '0.88rem', lineHeight: 1.55, color: r.comment?.trim() ? '#e2e8f0' : 'rgba(255,255,255,0.35)', whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>
                  {r.comment?.trim() || 'Pas de commentaire'}
                </p>
              </div>
              <button type="button" onClick={() => supprimer(r.id)} disabled={deleting === r.id}
                style={{ fontSize: '0.72rem', background: 'transparent', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 7, padding: '0.3rem 0.6rem', cursor: 'pointer', fontFamily: 'inherit' }}>
                {deleting === r.id ? '…' : 'Supprimer'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
