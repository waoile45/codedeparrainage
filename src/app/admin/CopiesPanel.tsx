'use client'

// Onglet « Copies » de l'admin : combien de fois chaque code a été copié.
// Les chiffres viennent de /api/admin/code-copies (réservé à l'admin).
// Une copie = un clic sur « Copier » (une seule fois par code et par session de
// navigateur) : c'est une mesure de copies, pas de personnes ni d'inscriptions.

import { useEffect, useMemo, useState } from 'react'
import { Search } from '@/components/Pictos'

type Row = {
  id: string
  code: string
  company: string
  slug: string | null
  pseudo: string
  total: number
  last7d: number
  last24h: number
  lastCopyAt: string | null
}
type Data = { totals: { total: number; last7d: number; last24h: number; codes: number }; rows: Row[] }
type Sort = 'total' | 'last7d' | 'recent'
type View = 'code' | 'marque'

function ago(iso: string | null) {
  if (!iso) return '—'
  const min = Math.round((Date.now() - new Date(iso).getTime()) / 60000)
  if (min < 1) return "à l'instant"
  if (min < 60) return `il y a ${min} min`
  const h = Math.round(min / 60)
  if (h < 24) return `il y a ${h} h`
  const d = Math.round(h / 24)
  if (d < 31) return `il y a ${d} j`
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
}

const st = {
  head:   { display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 16 } as React.CSSProperties,
  title:  { fontWeight: 700, fontSize: '0.95rem', color: '#fff' } as React.CSSProperties,
  sub:    { fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)', marginTop: 3, maxWidth: 560, lineHeight: 1.5 } as React.CSSProperties,
  kpis:   { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(125px,1fr))', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, marginBottom: 16 } as React.CSSProperties,
  kpi:    { padding: '1rem 1.2rem', borderLeft: '1px solid rgba(255,255,255,0.08)' } as React.CSSProperties,
  kpiV:   { fontSize: '1.7rem', fontWeight: 800, color: '#fff', lineHeight: 1.1, fontFamily: 'var(--font-display)', fontVariantNumeric: 'tabular-nums' } as React.CSSProperties,
  kpiL:   { fontSize: '0.74rem', color: 'rgba(255,255,255,0.5)', marginTop: 2 } as React.CSSProperties,
  tools:  { display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginBottom: 12 } as React.CSSProperties,
  search: { flex: '1 1 240px', position: 'relative' } as React.CSSProperties,
  input:  { width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '0.55rem 1rem 0.55rem 2.4rem', color: '#fff', fontSize: '0.85rem', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' } as React.CSSProperties,
  seg:    { display: 'inline-flex', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: 3, gap: 2 } as React.CSSProperties,
  table:  { width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' } as React.CSSProperties,
  th:     { textAlign: 'left', fontWeight: 600, fontSize: '0.72rem', color: 'rgba(255,255,255,0.45)', padding: '0.5rem 0.6rem', borderBottom: '1px solid rgba(255,255,255,0.08)', whiteSpace: 'nowrap' } as React.CSSProperties,
  td:     { padding: '0.6rem', borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#e2e8f0', verticalAlign: 'middle' } as React.CSSProperties,
  num:    { textAlign: 'right', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' } as React.CSSProperties,
  code:   { fontFamily: 'var(--font-code), monospace', fontSize: '0.76rem', color: 'rgba(255,255,255,0.7)', maxWidth: 220, display: 'inline-block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', verticalAlign: 'bottom' } as React.CSSProperties,
  empty:  { textAlign: 'center', padding: '2.5rem 1rem', color: 'rgba(255,255,255,0.45)', fontSize: '0.85rem' } as React.CSSProperties,
}

function SegBtn({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={on}
      style={{ border: 'none', borderRadius: 7, padding: '0.35rem 0.75rem', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', background: on ? 'var(--accent)' : 'transparent', color: on ? 'var(--accent-ink)' : 'rgba(255,255,255,0.6)' }}>
      {children}
    </button>
  )
}

export default function CopiesPanel() {
  const [data, setData] = useState<Data | null>(null)
  const [error, setError] = useState('')
  const [q, setQ] = useState('')
  const [sort, setSort] = useState<Sort>('total')
  const [view, setView] = useState<View>('code')

  useEffect(() => {
    fetch('/api/admin/code-copies')
      .then(async (r) => {
        if (!r.ok) throw new Error(`la route a répondu ${r.status}`)
        return r.json() as Promise<Data>
      })
      .then(setData)
      .catch((e: Error) => setError(e.message))
  }, [])

  const rows = useMemo(() => {
    if (!data) return []
    let list: Row[] = data.rows
    if (view === 'marque') {
      const byBrand = new Map<string, Row>()
      for (const r of data.rows) {
        const key = r.company
        const b = byBrand.get(key)
        if (!b) byBrand.set(key, { ...r, id: key, code: '', pseudo: '1 code' })
        else {
          b.total += r.total; b.last7d += r.last7d; b.last24h += r.last24h
          const n = Number(b.pseudo.split(' ')[0]) + 1
          b.pseudo = `${n} codes`
          if (r.lastCopyAt && (!b.lastCopyAt || r.lastCopyAt > b.lastCopyAt)) b.lastCopyAt = r.lastCopyAt
        }
      }
      list = [...byBrand.values()]
    }
    const s = q.trim().toLowerCase()
    if (s) list = list.filter((r) => r.company.toLowerCase().includes(s) || r.code.toLowerCase().includes(s) || r.pseudo.toLowerCase().includes(s))
    return [...list].sort((a, b) =>
      sort === 'recent' ? (b.lastCopyAt ?? '').localeCompare(a.lastCopyAt ?? '')
      : sort === 'last7d' ? b.last7d - a.last7d || b.total - a.total
      : b.total - a.total || b.last7d - a.last7d)
  }, [data, q, sort, view])

  if (error) {
    return <div style={{ ...st.empty, color: '#f87171' }}>Les copies n&apos;ont pas pu être chargées : {error}.</div>
  }
  if (!data) return <div style={st.empty}>Chargement des copies…</div>

  const t = data.totals
  return (
    <div>
      <div style={st.head}>
        <div>
          <div style={st.title}>Copies des codes</div>
          <div style={st.sub}>
            Un clic sur « Copier » compte une fois par code et par visite. C&apos;est le nombre de copies,
            pas de personnes ni d&apos;inscriptions réussies.
          </div>
        </div>
      </div>

      <div style={st.kpis}>
        {[
          { v: t.last24h, l: 'dernières 24 h' },
          { v: t.last7d, l: '7 derniers jours' },
          { v: t.total, l: 'depuis le début' },
          { v: t.codes, l: 'codes copiés au moins une fois' },
        ].map((k, i) => (
          <div key={k.l} style={{ ...st.kpi, ...(i === 0 ? { borderLeft: 'none' } : {}) }}>
            <div style={st.kpiV}>{k.v.toLocaleString('fr-FR')}</div>
            <div style={st.kpiL}>{k.l}</div>
          </div>
        ))}
      </div>

      <div style={st.tools}>
        <div style={st.search}>
          <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.35)', display: 'inline-flex' }}><Search size={15} /></span>
          <input style={st.input} placeholder="Marque, code ou membre…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Filtrer" />
        </div>
        <div style={st.seg} role="group" aria-label="Regrouper">
          <SegBtn on={view === 'code'} onClick={() => setView('code')}>Par code</SegBtn>
          <SegBtn on={view === 'marque'} onClick={() => setView('marque')}>Par marque</SegBtn>
        </div>
        <div style={st.seg} role="group" aria-label="Trier">
          <SegBtn on={sort === 'total'} onClick={() => setSort('total')}>Total</SegBtn>
          <SegBtn on={sort === 'last7d'} onClick={() => setSort('last7d')}>7 jours</SegBtn>
          <SegBtn on={sort === 'recent'} onClick={() => setSort('recent')}>Récentes</SegBtn>
        </div>
      </div>

      {rows.length === 0 ? (
        <div style={st.empty}>{data.rows.length === 0 ? 'Aucune copie enregistrée pour le moment.' : 'Aucun résultat pour ce filtre.'}</div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={st.table}>
            <thead>
              <tr>
                <th style={st.th}>Marque</th>
                {view === 'code' && <th style={st.th}>Code</th>}
                <th style={st.th}>{view === 'code' ? 'Membre' : 'Codes'}</th>
                <th style={{ ...st.th, ...st.num }}>24 h</th>
                <th style={{ ...st.th, ...st.num }}>7 jours</th>
                <th style={{ ...st.th, ...st.num }}>Total</th>
                <th style={{ ...st.th, ...st.num }}>Dernière copie</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td style={st.td}>
                    {r.slug
                      ? <a href={`/code-parrainage/${r.slug}${view === 'code' ? `#code-${r.id}` : ''}`} target="_blank" rel="noopener" style={{ color: '#fff', textDecoration: 'none', fontWeight: 600 }}>{r.company}</a>
                      : <span style={{ fontWeight: 600 }}>{r.company}</span>}
                  </td>
                  {view === 'code' && <td style={st.td}><span style={st.code} title={r.code}>{r.code}</span></td>}
                  <td style={{ ...st.td, color: 'rgba(255,255,255,0.6)' }}>{r.pseudo || '—'}</td>
                  <td style={{ ...st.td, ...st.num, color: r.last24h ? '#fff' : 'rgba(255,255,255,0.35)' }}>{r.last24h}</td>
                  <td style={{ ...st.td, ...st.num, color: r.last7d ? '#fff' : 'rgba(255,255,255,0.35)' }}>{r.last7d}</td>
                  <td style={{ ...st.td, ...st.num, fontWeight: 700, color: '#fff' }}>{r.total}</td>
                  <td style={{ ...st.td, ...st.num, color: 'rgba(255,255,255,0.55)' }}>{ago(r.lastCopyAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
