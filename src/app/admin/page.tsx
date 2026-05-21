'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase'

type Tab = 'annonces' | 'utilisateurs' | 'entreprises' | 'stats'

const S = {
  page:      { minHeight: '100vh', background: '#09090f', color: '#e2e8f0', fontFamily: "'DM Sans', system-ui, sans-serif" } as React.CSSProperties,
  nav:       { background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '0 2rem', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' } as React.CSSProperties,
  logo:      { fontWeight: 700, fontSize: '0.95rem', color: '#fff', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 } as React.CSSProperties,
  badge:     { background: 'rgba(239,68,68,0.15)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)', fontSize: '0.65rem', fontWeight: 700, padding: '2px 8px', borderRadius: 100, letterSpacing: '0.06em' } as React.CSSProperties,
  back:      { fontSize: '0.82rem', color: 'rgba(255,255,255,0.35)', textDecoration: 'none' } as React.CSSProperties,
  body:      { maxWidth: 1140, margin: '0 auto', padding: '2rem 1.5rem 4rem' } as React.CSSProperties,
  statGrid:  { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 28 } as React.CSSProperties,
  statCard:  { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '1.25rem 1.5rem' } as React.CSSProperties,
  statVal:   { fontSize: '1.8rem', fontWeight: 800, color: '#a78bfa', lineHeight: 1, marginBottom: 4, fontFamily: "'Syne', sans-serif" } as React.CSSProperties,
  statLabel: { fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)', fontWeight: 500 } as React.CSSProperties,
  tabBar:    { display: 'flex', gap: 4, marginBottom: 20, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: 4, width: 'fit-content' } as React.CSSProperties,
  panel:     { background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: '1.5rem', overflow: 'hidden' } as React.CSSProperties,
  searchWrap:{ position: 'relative', marginBottom: 14 } as React.CSSProperties,
  search:    { width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '0.6rem 1rem 0.6rem 2.5rem', color: '#fff', fontSize: '0.85rem', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' } as React.CSSProperties,
  rows:      { display: 'flex', flexDirection: 'column', gap: 6 } as React.CSSProperties,
  row:       { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.8rem 1rem', borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)', gap: 12 } as React.CSSProperties,
  code:      { fontFamily: 'monospace', fontSize: '0.8rem', color: '#a78bfa', background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.2)', padding: '1px 7px', borderRadius: 6 } as React.CSSProperties,
  avatar:    { width: 34, height: 34, borderRadius: '50%', background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(124,58,237,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 800, color: '#a78bfa', flexShrink: 0 } as React.CSSProperties,
  empty:     { textAlign: 'center' as const, padding: '3rem', color: 'rgba(255,255,255,0.2)', fontSize: '0.875rem' },
}

function Btn({ children, onClick, variant = 'ghost', disabled = false }: { children: React.ReactNode; onClick?: () => void; variant?: 'primary' | 'ghost' | 'danger' | 'credit'; disabled?: boolean }) {
  const base: React.CSSProperties = { fontSize: '0.75rem', border: 'none', borderRadius: 8, padding: '0.35rem 0.75rem', cursor: disabled ? 'not-allowed' : 'pointer', fontFamily: 'inherit', fontWeight: 600, whiteSpace: 'nowrap', opacity: disabled ? 0.5 : 1, transition: 'all 0.15s' }
  const variants: Record<string, React.CSSProperties> = {
    primary: { background: '#7c3aed', color: '#fff', padding: '0.5rem 1.1rem', fontSize: '0.82rem' },
    ghost:   { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.1)' },
    danger:  { background: 'rgba(239,68,68,0.08)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' },
    credit:  { background: 'rgba(124,58,237,0.1)', color: '#a78bfa', border: '1px solid rgba(124,58,237,0.3)' },
  }
  return <button style={{ ...base, ...variants[variant] }} onClick={onClick} disabled={disabled}>{children}</button>
}

function TabBtn({ label, count, active, onClick }: { label: string; count?: number; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{ padding: '0.45rem 1rem', borderRadius: 10, fontSize: '0.82rem', fontWeight: 600, border: 'none', cursor: 'pointer', background: active ? '#7c3aed' : 'none', color: active ? '#fff' : 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'inherit', transition: 'all 0.15s' }}>
      {label}
      {count !== undefined && (
        <span style={{ background: active ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)', borderRadius: 100, fontSize: '0.67rem', padding: '1px 6px', fontWeight: 700 }}>{count}</span>
      )}
    </button>
  )
}

const CATEGORIES = ['banque', 'paris', 'cashback', 'energie', 'telephonie', 'crypto', 'assurance', 'shopping']

export default function AdminPage() {
  const [tab, setTab]                 = useState<Tab>('annonces')
  const [companies, setCompanies]     = useState<any[]>([])
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [users, setUsers]             = useState<any[]>([])
  const [loading, setLoading]         = useState(true)

  const [searchAnn, setSearchAnn]     = useState('')
  const [searchComp, setSearchComp]   = useState('')
  const [searchUser, setSearchUser]   = useState('')

  const [editingCompany, setEditingCompany] = useState<any>(null)
  const [showCompanyModal, setShowCompanyModal] = useState(false)
  const [companyForm, setCompanyForm] = useState({ name: '', slug: '', category: '', referral_bonus_description: '' })
  const [formLoading, setFormLoading] = useState(false)

  const [givingCredits, setGivingCredits] = useState<string | null>(null)
  const [creditAmount, setCreditAmount]   = useState('')
  const [creditLoading, setCreditLoading] = useState(false)

  const supabase = createClient()

  useEffect(() => { loadData() }, [])

  async function loadData() {
    setLoading(true)
    const [{ data: comp }, { data: ann }, { data: usr }] = await Promise.all([
      supabase.from('companies').select('*').order('name'),
      supabase.from('announcements').select('*, users(pseudo,email), companies(name)').order('created_at', { ascending: false }),
      supabase.from('users').select('*, credits(balance)').order('xp', { ascending: false }),
    ])
    setCompanies(comp ?? [])
    setAnnouncements(ann ?? [])
    setUsers(usr ?? [])
    setLoading(false)
  }

  const filteredAnn  = useMemo(() => { const q = searchAnn.toLowerCase(); return !q ? announcements : announcements.filter(a => a.companies?.name?.toLowerCase().includes(q) || a.code?.toLowerCase().includes(q) || a.users?.pseudo?.toLowerCase().includes(q)) }, [announcements, searchAnn])
  const filteredComp = useMemo(() => { const q = searchComp.toLowerCase(); return !q ? companies : companies.filter(c => c.name?.toLowerCase().includes(q) || c.slug?.toLowerCase().includes(q) || c.category?.toLowerCase().includes(q)) }, [companies, searchComp])
  const filteredUsers = useMemo(() => { const q = searchUser.toLowerCase(); return !q ? users : users.filter(u => u.pseudo?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q)) }, [users, searchUser])

  async function handleDeleteAnnouncement(id: string) {
    if (!confirm('Supprimer cette annonce ?')) return
    await fetch('/api/admin/delete', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ table: 'announcements', id }) })
    setAnnouncements(prev => prev.filter(a => a.id !== id))
  }

  async function handleDeleteCompany(id: string) {
    if (!confirm('Supprimer cette entreprise ?')) return
    await fetch('/api/admin/delete', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ table: 'companies', id }) })
    setCompanies(prev => prev.filter(c => c.id !== id))
  }

  async function handleGiveCredits(userId: string) {
    const amount = parseFloat(creditAmount)
    if (isNaN(amount) || amount === 0) return
    setCreditLoading(true)
    await fetch('/api/admin/give-credits', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId, amount }) })
    setUsers(prev => prev.map(u => u.id !== userId ? u : { ...u, credits: [{ balance: Math.max(0, (u.credits?.[0]?.balance ?? 0) + amount) }] }))
    setGivingCredits(null)
    setCreditAmount('')
    setCreditLoading(false)
  }

  async function handleSaveCompany() {
    setFormLoading(true)
    if (editingCompany) {
      await supabase.from('companies').update(companyForm).eq('id', editingCompany.id)
      setCompanies(prev => prev.map(c => c.id === editingCompany.id ? { ...c, ...companyForm } : c))
    } else {
      const { data } = await supabase.from('companies').insert(companyForm).select().single()
      if (data) setCompanies(prev => [...prev, data])
    }
    setShowCompanyModal(false)
    setEditingCompany(null)
    setCompanyForm({ name: '', slug: '', category: '', referral_bonus_description: '' })
    setFormLoading(false)
  }

  const totalCredits = users.reduce((s, u) => s + (u.credits?.[0]?.balance ?? 0), 0)

  return (
    <div style={S.page}>

      {/* NAV */}
      <nav style={S.nav}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <a href="/" style={S.logo}>
            <span>code<span style={{ color: '#7c3aed' }}>de</span>parrainage.com</span>
          </a>
          <span style={S.badge}>ADMIN</span>
        </div>
        <a href="/" style={S.back}>← Retour au site</a>
      </nav>

      <div style={S.body}>

        {/* STATS */}
        <div style={S.statGrid}>
          {[
            { val: users.length,            label: 'Utilisateurs',         icon: '👥' },
            { val: announcements.length,    label: 'Annonces',             icon: '📢' },
            { val: companies.length,        label: 'Entreprises',          icon: '🏢' },
            { val: totalCredits.toFixed(0), label: 'Crédits en circulation', icon: '⚡' },
          ].map(({ val, label, icon }) => (
            <div key={label} style={S.statCard}>
              <div style={S.statVal}>{val}</div>
              <div style={S.statLabel}>{icon} {label}</div>
            </div>
          ))}
        </div>

        {/* TABS */}
        <div style={S.tabBar}>
          <TabBtn label="Annonces"     count={announcements.length} active={tab==='annonces'}     onClick={() => setTab('annonces')} />
          <TabBtn label="Utilisateurs" count={users.length}         active={tab==='utilisateurs'} onClick={() => setTab('utilisateurs')} />
          <TabBtn label="Entreprises"  count={companies.length}     active={tab==='entreprises'}  onClick={() => setTab('entreprises')} />
          <TabBtn label="Stats"                                      active={tab==='stats'}        onClick={() => setTab('stats')} />
        </div>

        {loading ? (
          <div style={S.empty}>Chargement...</div>
        ) : (
          <>

            {/* ── ANNONCES ── */}
            {tab === 'annonces' && (
              <div style={S.panel}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#fff' }}>Annonces</div>
                    <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>{filteredAnn.length} résultat{filteredAnn.length !== 1 ? 's' : ''} sur {announcements.length}</div>
                  </div>
                </div>
                <div style={S.searchWrap}>
                  <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.25)', fontSize: '0.85rem' }}>🔍</span>
                  <input style={S.search} placeholder="Entreprise, code ou utilisateur..." value={searchAnn} onChange={e => setSearchAnn(e.target.value)} />
                </div>
                <div style={S.rows}>
                  {filteredAnn.length === 0 && <div style={S.empty}>Aucune annonce trouvée</div>}
                  {filteredAnn.map((ann: any) => (
                    <div key={ann.id} style={S.row}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flex: 1 }}>
                        <img src={`https://www.google.com/s2/favicons?domain=${ann.companies?.name?.toLowerCase().replace(/ /g,'')}.fr&sz=32`} alt="" style={{ width: 28, height: 28, borderRadius: 6, background: 'rgba(255,255,255,0.05)', flexShrink: 0 }} onError={e => (e.currentTarget.style.display='none')} />
                        <div style={{ minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#e2e8f0' }}>{ann.companies?.name ?? '—'}</span>
                            <span style={S.code}>{ann.code}</span>
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>
                            par {ann.users?.pseudo ?? '?'} · {new Date(ann.created_at).toLocaleDateString('fr-FR')}
                          </div>
                        </div>
                      </div>
                      <Btn variant="danger" onClick={() => handleDeleteAnnouncement(ann.id)}>Supprimer</Btn>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── UTILISATEURS ── */}
            {tab === 'utilisateurs' && (
              <div style={S.panel}>
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#fff' }}>Utilisateurs</div>
                  <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>{filteredUsers.length} résultat{filteredUsers.length !== 1 ? 's' : ''} sur {users.length}</div>
                </div>
                <div style={S.searchWrap}>
                  <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.25)', fontSize: '0.85rem' }}>🔍</span>
                  <input style={S.search} placeholder="Pseudo ou email..." value={searchUser} onChange={e => setSearchUser(e.target.value)} />
                </div>
                <div style={S.rows}>
                  {filteredUsers.length === 0 && <div style={S.empty}>Aucun utilisateur trouvé</div>}
                  {filteredUsers.map((user: any) => (
                    <div key={user.id} style={S.row}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flex: 1 }}>
                        <div style={S.avatar}>{user.pseudo?.slice(0,1).toUpperCase()}</div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#e2e8f0' }}>{user.pseudo}</div>
                          <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>{user.email} · {user.level} · {user.xp} XP</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                        {givingCredits === user.id ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <input
                              type="number"
                              value={creditAmount}
                              onChange={e => setCreditAmount(e.target.value)}
                              placeholder="ex: 10 ou -5"
                              autoFocus
                              style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.4)', borderRadius: 8, padding: '0.35rem 0.6rem', color: '#fff', fontSize: '0.82rem', width: 110, outline: 'none', fontFamily: 'inherit' }}
                            />
                            <Btn variant="primary" onClick={() => handleGiveCredits(user.id)} disabled={creditLoading}>{creditLoading ? '...' : 'OK'}</Btn>
                            <button onClick={() => { setGivingCredits(null); setCreditAmount('') }} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: '1rem', lineHeight: 1, padding: '0 2px' }}>✕</button>
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#a78bfa' }}>{(user.credits?.[0]?.balance ?? 0).toFixed(1)} cr.</span>
                        )}
                        <Btn variant="credit" onClick={() => { setGivingCredits(user.id); setCreditAmount('') }}>⚡ Crédits</Btn>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── ENTREPRISES ── */}
            {tab === 'entreprises' && (
              <div style={S.panel}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#fff' }}>Entreprises</div>
                    <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>{filteredComp.length} résultat{filteredComp.length !== 1 ? 's' : ''} sur {companies.length}</div>
                  </div>
                  <Btn variant="primary" onClick={() => { setShowCompanyModal(true); setEditingCompany(null); setCompanyForm({ name:'', slug:'', category:'', referral_bonus_description:'' }) }}>+ Ajouter</Btn>
                </div>
                <div style={S.searchWrap}>
                  <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.25)', fontSize: '0.85rem' }}>🔍</span>
                  <input style={S.search} placeholder="Nom, slug ou catégorie..." value={searchComp} onChange={e => setSearchComp(e.target.value)} />
                </div>
                <div style={S.rows}>
                  {filteredComp.length === 0 && <div style={S.empty}>Aucune entreprise trouvée</div>}
                  {filteredComp.map((c: any) => (
                    <div key={c.id} style={S.row}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flex: 1 }}>
                        <img src={`https://www.google.com/s2/favicons?domain=${c.slug}&sz=32`} alt="" style={{ width: 28, height: 28, borderRadius: 6, background: 'rgba(255,255,255,0.05)', flexShrink: 0 }} onError={e => (e.currentTarget.style.display='none')} />
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#e2e8f0' }}>{c.name}</div>
                          <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>{c.slug} · {c.category}</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <Btn variant="ghost" onClick={() => { setEditingCompany(c); setShowCompanyModal(true); setCompanyForm({ name: c.name, slug: c.slug, category: c.category, referral_bonus_description: c.referral_bonus_description || '' }) }}>Modifier</Btn>
                        <Btn variant="danger" onClick={() => handleDeleteCompany(c.id)}>Supprimer</Btn>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── STATS ── */}
            {tab === 'stats' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 16 }}>
                {[
                  { val: users.length,                    label: 'Utilisateurs inscrits',      icon: '👥' },
                  { val: announcements.length,            label: 'Annonces publiées',           icon: '📢' },
                  { val: companies.length,                label: 'Entreprises référencées',     icon: '🏢' },
                  { val: totalCredits.toFixed(2) + ' cr.',label: 'Crédits en circulation',      icon: '⚡' },
                ].map(({ val, label, icon }) => (
                  <div key={label} style={{ background: 'rgba(124,58,237,0.07)', border: '1px solid rgba(124,58,237,0.18)', borderRadius: 20, padding: '2rem' }}>
                    <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#a78bfa', lineHeight: 1, fontFamily: "'Syne',sans-serif" }}>{val}</div>
                    <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)', marginTop: 8 }}>{icon} {label}</div>
                  </div>
                ))}
              </div>
            )}

          </>
        )}
      </div>

      {/* MODAL ENTREPRISE */}
      {showCompanyModal && (
        <div onClick={e => { if (e.target === e.currentTarget) { setShowCompanyModal(false); setEditingCompany(null) } }}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '1rem' }}>
          <div style={{ background: '#13131a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: '1.75rem', width: '100%', maxWidth: 440 }}>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', marginBottom: '1.25rem' }}>
              {editingCompany ? 'Modifier' : 'Ajouter'} une entreprise
            </div>
            {[
              { key: 'name',                      label: 'NOM',             placeholder: 'ex: Boursobank',              type: 'input' },
              { key: 'slug',                      label: 'SLUG / DOMAINE',  placeholder: 'ex: boursobank.com',          type: 'input' },
              { key: 'referral_bonus_description',label: 'BONUS',           placeholder: 'ex: 80€ offerts à l\'ouverture', type: 'input' },
            ].map(({ key, label, placeholder }) => (
              <div key={key} style={{ marginBottom: 12 }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'rgba(255,255,255,0.35)', marginBottom: 5, letterSpacing: '0.05em' }}>{label}</div>
                <input
                  type="text"
                  value={(companyForm as any)[key]}
                  onChange={e => setCompanyForm(p => ({ ...p, [key]: e.target.value }))}
                  placeholder={placeholder}
                  style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '0.65rem 1rem', color: '#fff', fontSize: '0.875rem', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
                />
              </div>
            ))}
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'rgba(255,255,255,0.35)', marginBottom: 5, letterSpacing: '0.05em' }}>CATÉGORIE</div>
              <select value={companyForm.category} onChange={e => setCompanyForm(p => ({ ...p, category: e.target.value }))}
                style={{ width: '100%', background: '#13131a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '0.65rem 1rem', color: '#fff', fontSize: '0.875rem', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' as const }}>
                <option value="">Choisir...</option>
                {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: '1.25rem' }}>
              <button onClick={() => { setShowCompanyModal(false); setEditingCompany(null) }}
                style={{ flex: 1, padding: '0.75rem', borderRadius: 12, fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', background: 'none', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }}>
                Annuler
              </button>
              <button onClick={handleSaveCompany} disabled={formLoading}
                style={{ flex: 1, padding: '0.75rem', borderRadius: 12, fontSize: '0.875rem', fontWeight: 600, cursor: formLoading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', background: '#7c3aed', border: 'none', color: '#fff', opacity: formLoading ? 0.6 : 1 }}>
                {formLoading ? 'Sauvegarde...' : 'Sauvegarder'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
