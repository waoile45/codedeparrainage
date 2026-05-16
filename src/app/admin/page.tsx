'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase'

type Tab = 'entreprises' | 'annonces' | 'utilisateurs' | 'stats'

export default function AdminPage() {
  const [tab, setTab]                   = useState<Tab>('annonces')
  const [companies, setCompanies]       = useState<any[]>([])
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [users, setUsers]               = useState<any[]>([])
  const [loading, setLoading]           = useState(true)

  const [searchAnn, setSearchAnn]       = useState('')
  const [searchComp, setSearchComp]     = useState('')
  const [searchUser, setSearchUser]     = useState('')

  const [editingCompany, setEditingCompany]   = useState<any>(null)
  const [showAddCompany, setShowAddCompany]   = useState(false)
  const [companyForm, setCompanyForm]         = useState({ name: '', slug: '', category: '', referral_bonus_description: '' })
  const [formLoading, setFormLoading]         = useState(false)

  const [givingCredits, setGivingCredits]     = useState<string | null>(null)
  const [creditAmount, setCreditAmount]       = useState('')
  const [creditLoading, setCreditLoading]     = useState(false)

  const supabase = createClient()

  useEffect(() => { loadData() }, [])

  async function loadData() {
    setLoading(true)
    const [{ data: comp }, { data: ann }, { data: usr }] = await Promise.all([
      supabase.from('companies').select('*').order('name'),
      supabase.from('announcements').select('*, users (pseudo, email), companies (name)').order('created_at', { ascending: false }),
      supabase.from('users').select('*, credits (balance)').order('xp', { ascending: false }),
    ])
    setCompanies(comp ?? [])
    setAnnouncements(ann ?? [])
    setUsers(usr ?? [])
    setLoading(false)
  }

  const filteredAnn = useMemo(() => {
    const q = searchAnn.toLowerCase()
    if (!q) return announcements
    return announcements.filter(a =>
      a.companies?.name?.toLowerCase().includes(q) ||
      a.code?.toLowerCase().includes(q) ||
      a.users?.pseudo?.toLowerCase().includes(q)
    )
  }, [announcements, searchAnn])

  const filteredComp = useMemo(() => {
    const q = searchComp.toLowerCase()
    if (!q) return companies
    return companies.filter(c => c.name?.toLowerCase().includes(q) || c.slug?.toLowerCase().includes(q) || c.category?.toLowerCase().includes(q))
  }, [companies, searchComp])

  const filteredUsers = useMemo(() => {
    const q = searchUser.toLowerCase()
    if (!q) return users
    return users.filter(u => u.pseudo?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q))
  }, [users, searchUser])

  async function handleDeleteCompany(id: string) {
    if (!confirm('Supprimer cette entreprise ?')) return
    await supabase.from('companies').delete().eq('id', id)
    setCompanies(prev => prev.filter(c => c.id !== id))
  }

  async function handleDeleteAnnouncement(id: string) {
    if (!confirm('Supprimer cette annonce ?')) return
    await supabase.from('announcements').delete().eq('id', id)
    setAnnouncements(prev => prev.filter(a => a.id !== id))
  }

  async function handleGiveCredits(userId: string) {
    const amount = parseFloat(creditAmount)
    if (isNaN(amount) || amount === 0) return
    setCreditLoading(true)
    await fetch('/api/admin/give-credits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, amount }),
    })
    setUsers(prev => prev.map(u => {
      if (u.id !== userId) return u
      return { ...u, credits: [{ balance: Math.max(0, (u.credits?.[0]?.balance ?? 0) + amount) }] }
    }))
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
    setEditingCompany(null)
    setShowAddCompany(false)
    setCompanyForm({ name: '', slug: '', category: '', referral_bonus_description: '' })
    setFormLoading(false)
  }

  const TABS: { key: Tab; label: string; count?: number }[] = [
    { key: 'annonces',     label: 'Annonces',     count: announcements.length },
    { key: 'utilisateurs', label: 'Utilisateurs',  count: users.length },
    { key: 'entreprises',  label: 'Entreprises',   count: companies.length },
    { key: 'stats',        label: 'Stats' },
  ]

  const CATEGORIES = ['banque', 'paris', 'cashback', 'energie', 'telephonie', 'crypto', 'assurance', 'shopping']

  const totalCredits = users.reduce((s: number, u: any) => s + (u.credits?.[0]?.balance ?? 0), 0)

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0f0f14; font-family: 'DM Sans', system-ui, sans-serif; color: #e2e8f0; min-height: 100vh; }
        .admin-nav { background: rgba(255,255,255,0.03); border-bottom: 1px solid rgba(255,255,255,0.07); padding: 0 2rem; height: 56px; display: flex; align-items: center; justify-content: space-between; }
        .admin-logo { font-weight: 700; font-size: 1rem; color: #fff; text-decoration: none; }
        .admin-logo span { color: #7c3aed; }
        .admin-badge { background: rgba(239,68,68,0.15); color: #f87171; border: 1px solid rgba(239,68,68,0.3); font-size: 0.7rem; font-weight: 700; padding: 2px 8px; border-radius: 100px; margin-left: 8px; letter-spacing: 0.05em; }
        .admin-back { font-size: 0.82rem; color: rgba(255,255,255,0.4); text-decoration: none; transition: color 0.15s; }
        .admin-back:hover { color: #fff; }

        .admin-body { max-width: 1100px; margin: 0 auto; padding: 2rem 1.5rem 4rem; }

        .stat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-bottom: 2rem; }
        .stat-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; padding: 1.25rem 1.5rem; }
        .stat-val { font-size: 1.75rem; font-weight: 800; color: #a78bfa; line-height: 1; margin-bottom: 4px; }
        .stat-label { font-size: 0.75rem; color: rgba(255,255,255,0.4); font-weight: 500; }

        .tab-bar { display: flex; gap: 4px; margin-bottom: 1.5rem; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 14px; padding: 4px; width: fit-content; }
        .tab-btn { padding: 0.45rem 1rem; border-radius: 10px; font-size: 0.82rem; font-weight: 600; border: none; cursor: pointer; transition: all 0.15s; background: none; color: rgba(255,255,255,0.4); display: flex; align-items: center; gap: 6px; font-family: inherit; }
        .tab-btn.active { background: #7c3aed; color: #fff; }
        .tab-btn:not(.active):hover { color: rgba(255,255,255,0.8); }
        .tab-count { background: rgba(255,255,255,0.12); border-radius: 100px; font-size: 0.68rem; padding: 1px 6px; font-weight: 700; }
        .tab-btn.active .tab-count { background: rgba(255,255,255,0.2); }

        .panel { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 20px; padding: 1.5rem; }
        .panel-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.25rem; }
        .panel-title { font-size: 1rem; font-weight: 700; color: #fff; }
        .panel-sub { font-size: 0.75rem; color: rgba(255,255,255,0.35); margin-top: 2px; }

        .search-bar { width: 100%; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; padding: 0.6rem 1rem; color: #fff; font-size: 0.85rem; outline: none; transition: border-color 0.15s; margin-bottom: 1rem; font-family: inherit; }
        .search-bar::placeholder { color: rgba(255,255,255,0.25); }
        .search-bar:focus { border-color: rgba(124,58,237,0.5); }

        .row { display: flex; align-items: center; justify-content: space-between; padding: 0.875rem 1rem; border-radius: 12px; border: 1px solid rgba(255,255,255,0.06); background: rgba(255,255,255,0.02); transition: background 0.15s; gap: 1rem; }
        .row:hover { background: rgba(255,255,255,0.04); }
        .rows { display: flex; flex-direction: column; gap: 6px; }

        .row-main { font-size: 0.875rem; font-weight: 600; color: #e2e8f0; }
        .row-sub { font-size: 0.72rem; color: rgba(255,255,255,0.35); margin-top: 2px; }
        .row-code { font-family: 'Courier New', monospace; font-size: 0.8rem; color: #a78bfa; background: rgba(124,58,237,0.12); border: 1px solid rgba(124,58,237,0.2); padding: 1px 7px; border-radius: 6px; max-width: 260px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; display: inline-block; vertical-align: middle; }

        .actions { display: flex; align-items: center; gap: 6px; flex-shrink: 0; }
        .btn-del { font-size: 0.75rem; border: 1px solid rgba(239,68,68,0.2); color: rgba(239,68,68,0.7); padding: 0.35rem 0.75rem; border-radius: 8px; cursor: pointer; background: none; transition: all 0.15s; white-space: nowrap; font-family: inherit; }
        .btn-del:hover { border-color: #ef4444; color: #f87171; background: rgba(239,68,68,0.08); }
        .btn-edit { font-size: 0.75rem; border: 1px solid rgba(255,255,255,0.1); color: rgba(255,255,255,0.5); padding: 0.35rem 0.75rem; border-radius: 8px; cursor: pointer; background: none; transition: all 0.15s; white-space: nowrap; font-family: inherit; }
        .btn-edit:hover { border-color: rgba(124,58,237,0.4); color: #a78bfa; }
        .btn-primary { font-size: 0.82rem; background: #7c3aed; color: #fff; border: none; padding: 0.5rem 1rem; border-radius: 10px; cursor: pointer; font-weight: 600; transition: background 0.15s; font-family: inherit; }
        .btn-primary:hover { background: #6d28d9; }
        .btn-credit { font-size: 0.75rem; border: 1px solid rgba(124,58,237,0.3); color: #a78bfa; padding: 0.35rem 0.75rem; border-radius: 8px; cursor: pointer; background: none; transition: all 0.15s; white-space: nowrap; font-family: inherit; }
        .btn-credit:hover { border-color: #7c3aed; background: rgba(124,58,237,0.1); }

        .credit-inline { display: flex; align-items: center; gap: 6px; }
        .credit-input { border: 1px solid rgba(124,58,237,0.4); background: rgba(124,58,237,0.08); border-radius: 8px; padding: 0.35rem 0.625rem; color: #fff; font-size: 0.82rem; width: 100px; outline: none; font-family: inherit; }
        .btn-ok { background: #7c3aed; color: #fff; border: none; border-radius: 8px; padding: 0.35rem 0.75rem; font-size: 0.75rem; font-weight: 700; cursor: pointer; font-family: inherit; }
        .btn-ok:disabled { opacity: 0.5; cursor: not-allowed; }
        .btn-cancel-sm { background: none; border: none; color: rgba(255,255,255,0.3); cursor: pointer; font-size: 0.9rem; line-height: 1; padding: 0 4px; }
        .btn-cancel-sm:hover { color: rgba(255,255,255,0.7); }

        .credit-val { font-size: 0.82rem; font-weight: 700; color: #a78bfa; white-space: nowrap; }
        .streak-val { font-size: 0.7rem; color: rgba(255,255,255,0.3); }

        .avatar { width: 32px; height: 32px; border-radius: 50%; background: rgba(124,58,237,0.2); border: 1px solid rgba(124,58,237,0.3); display: flex; align-items: center; justify-content: center; font-size: 0.8rem; font-weight: 800; color: #a78bfa; flex-shrink: 0; }
        .company-logo { width: 28px; height: 28px; border-radius: 6px; object-fit: contain; background: rgba(255,255,255,0.05); flex-shrink: 0; }

        .empty { text-align: center; padding: 3rem; color: rgba(255,255,255,0.2); font-size: 0.875rem; }

        .stat-section { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; }
        .stat-big { background: rgba(124,58,237,0.08); border: 1px solid rgba(124,58,237,0.2); border-radius: 16px; padding: 1.5rem; }
        .stat-big .val { font-size: 2.5rem; font-weight: 800; color: #a78bfa; line-height: 1; }
        .stat-big .lbl { font-size: 0.82rem; color: rgba(255,255,255,0.4); margin-top: 6px; }

        /* Modal */
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 50; padding: 1rem; }
        .modal { background: #16161f; border: 1px solid rgba(255,255,255,0.1); border-radius: 20px; padding: 1.75rem; width: 100%; max-width: 440px; }
        .modal-title { font-size: 1rem; font-weight: 700; color: #fff; margin-bottom: 1.25rem; }
        .field { display: flex; flex-direction: column; gap: 5px; margin-bottom: 1rem; }
        .field label { font-size: 0.75rem; font-weight: 600; color: rgba(255,255,255,0.4); letter-spacing: 0.04em; }
        .field input, .field select { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; padding: 0.65rem 1rem; color: #fff; font-size: 0.875rem; outline: none; transition: border-color 0.15s; font-family: inherit; }
        .field input:focus, .field select:focus { border-color: rgba(124,58,237,0.5); }
        .field select option { background: #16161f; }
        .modal-actions { display: flex; gap: 10px; margin-top: 1.25rem; }
        .modal-actions button { flex: 1; padding: 0.75rem; border-radius: 12px; font-size: 0.875rem; font-weight: 600; cursor: pointer; font-family: inherit; transition: all 0.15s; }
        .btn-ghost-modal { background: none; border: 1px solid rgba(255,255,255,0.1); color: rgba(255,255,255,0.5); }
        .btn-ghost-modal:hover { border-color: rgba(255,255,255,0.2); color: #fff; }
        .btn-primary-modal { background: #7c3aed; border: none; color: #fff; }
        .btn-primary-modal:hover:not(:disabled) { background: #6d28d9; }
        .btn-primary-modal:disabled { opacity: 0.5; cursor: not-allowed; }

        @media (max-width: 768px) {
          .stat-grid { grid-template-columns: repeat(2, 1fr); }
          .admin-body { padding: 1rem 1rem 3rem; }
        }
      `}</style>

      {/* NAV */}
      <nav className="admin-nav">
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <a href="/" className="admin-logo">code<span>de</span>parrainage.com</a>
          <span className="admin-badge">ADMIN</span>
        </div>
        <a href="/" className="admin-back">← Retour au site</a>
      </nav>

      <div className="admin-body">

        {/* STATS RAPIDES */}
        <div className="stat-grid">
          <div className="stat-card">
            <div className="stat-val">{users.length}</div>
            <div className="stat-label">👥 Utilisateurs</div>
          </div>
          <div className="stat-card">
            <div className="stat-val">{announcements.length}</div>
            <div className="stat-label">📢 Annonces</div>
          </div>
          <div className="stat-card">
            <div className="stat-val">{companies.length}</div>
            <div className="stat-label">🏢 Entreprises</div>
          </div>
          <div className="stat-card">
            <div className="stat-val">{totalCredits.toFixed(0)}</div>
            <div className="stat-label">⚡ Crédits en circulation</div>
          </div>
        </div>

        {/* TABS */}
        <div className="tab-bar">
          {TABS.map(t => (
            <button
              key={t.key}
              className={`tab-btn ${tab === t.key ? 'active' : ''}`}
              onClick={() => setTab(t.key)}
            >
              {t.label}
              {t.count !== undefined && <span className="tab-count">{t.count}</span>}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="empty">Chargement...</div>
        ) : (
          <>

            {/* ── ANNONCES ── */}
            {tab === 'annonces' && (
              <div className="panel">
                <div className="panel-header">
                  <div>
                    <div className="panel-title">Annonces</div>
                    <div className="panel-sub">{filteredAnn.length} résultat{filteredAnn.length !== 1 ? 's' : ''} sur {announcements.length}</div>
                  </div>
                </div>
                <input
                  className="search-bar"
                  placeholder="Rechercher par entreprise, code ou utilisateur..."
                  value={searchAnn}
                  onChange={e => setSearchAnn(e.target.value)}
                />
                <div className="rows">
                  {filteredAnn.length === 0 && <div className="empty">Aucune annonce trouvée</div>}
                  {filteredAnn.map((ann: any) => (
                    <div key={ann.id} className="row">
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div className="row-main" style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                          <span>{ann.companies?.name ?? '—'}</span>
                          <span className="row-code">{ann.code}</span>
                        </div>
                        <div className="row-sub">par {ann.users?.pseudo ?? '?'} · {new Date(ann.created_at).toLocaleDateString('fr-FR')}</div>
                      </div>
                      <div className="actions">
                        <button className="btn-del" onClick={() => handleDeleteAnnouncement(ann.id)}>Supprimer</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── UTILISATEURS ── */}
            {tab === 'utilisateurs' && (
              <div className="panel">
                <div className="panel-header">
                  <div>
                    <div className="panel-title">Utilisateurs</div>
                    <div className="panel-sub">{filteredUsers.length} résultat{filteredUsers.length !== 1 ? 's' : ''} sur {users.length}</div>
                  </div>
                </div>
                <input
                  className="search-bar"
                  placeholder="Rechercher par pseudo ou email..."
                  value={searchUser}
                  onChange={e => setSearchUser(e.target.value)}
                />
                <div className="rows">
                  {filteredUsers.length === 0 && <div className="empty">Aucun utilisateur trouvé</div>}
                  {filteredUsers.map((user: any) => (
                    <div key={user.id} className="row">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flex: 1 }}>
                        <div className="avatar">{user.pseudo?.slice(0, 1).toUpperCase()}</div>
                        <div style={{ minWidth: 0 }}>
                          <div className="row-main">{user.pseudo}</div>
                          <div className="row-sub">{user.level} · {user.xp} XP</div>
                        </div>
                      </div>
                      <div className="actions">
                        {givingCredits === user.id ? (
                          <div className="credit-inline">
                            <input
                              className="credit-input"
                              type="number"
                              value={creditAmount}
                              onChange={e => setCreditAmount(e.target.value)}
                              placeholder="ex: 10 ou -5"
                              autoFocus
                            />
                            <button className="btn-ok" onClick={() => handleGiveCredits(user.id)} disabled={creditLoading}>
                              {creditLoading ? '...' : 'OK'}
                            </button>
                            <button className="btn-cancel-sm" onClick={() => { setGivingCredits(null); setCreditAmount('') }}>✕</button>
                          </div>
                        ) : (
                          <div style={{ textAlign: 'right', marginRight: 4 }}>
                            <div className="credit-val">{(user.credits?.[0]?.balance ?? 0).toFixed(1)} cr.</div>
                            <div className="streak-val">🔥 {user.streak_days ?? 0}j</div>
                          </div>
                        )}
                        <button className="btn-credit" onClick={() => { setGivingCredits(user.id); setCreditAmount('') }}>
                          ⚡ Crédits
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── ENTREPRISES ── */}
            {tab === 'entreprises' && (
              <div className="panel">
                <div className="panel-header">
                  <div>
                    <div className="panel-title">Entreprises</div>
                    <div className="panel-sub">{filteredComp.length} résultat{filteredComp.length !== 1 ? 's' : ''} sur {companies.length}</div>
                  </div>
                  <button className="btn-primary" onClick={() => { setShowAddCompany(true); setEditingCompany(null); setCompanyForm({ name: '', slug: '', category: '', referral_bonus_description: '' }) }}>
                    + Ajouter
                  </button>
                </div>
                <input
                  className="search-bar"
                  placeholder="Rechercher par nom, slug ou catégorie..."
                  value={searchComp}
                  onChange={e => setSearchComp(e.target.value)}
                />
                <div className="rows">
                  {filteredComp.length === 0 && <div className="empty">Aucune entreprise trouvée</div>}
                  {filteredComp.map((company: any) => (
                    <div key={company.id} className="row">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flex: 1 }}>
                        <img className="company-logo" src={`https://www.google.com/s2/favicons?domain=${company.slug}&sz=32`} alt={company.name} />
                        <div style={{ minWidth: 0 }}>
                          <div className="row-main">{company.name}</div>
                          <div className="row-sub">{company.slug} · {company.category}</div>
                        </div>
                      </div>
                      <div className="actions">
                        <button className="btn-edit" onClick={() => { setEditingCompany(company); setShowAddCompany(true); setCompanyForm({ name: company.name, slug: company.slug, category: company.category, referral_bonus_description: company.referral_bonus_description || '' }) }}>
                          Modifier
                        </button>
                        <button className="btn-del" onClick={() => handleDeleteCompany(company.id)}>
                          Supprimer
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── STATS ── */}
            {tab === 'stats' && (
              <div className="panel">
                <div className="panel-title" style={{ marginBottom: '1.25rem' }}>Statistiques</div>
                <div className="stat-section">
                  <div className="stat-big">
                    <div className="val">{users.length}</div>
                    <div className="lbl">👥 Utilisateurs inscrits</div>
                  </div>
                  <div className="stat-big">
                    <div className="val">{announcements.length}</div>
                    <div className="lbl">📢 Annonces publiées</div>
                  </div>
                  <div className="stat-big">
                    <div className="val">{companies.length}</div>
                    <div className="lbl">🏢 Entreprises référencées</div>
                  </div>
                  <div className="stat-big">
                    <div className="val">{totalCredits.toFixed(0)}</div>
                    <div className="lbl">⚡ Crédits en circulation</div>
                  </div>
                </div>
              </div>
            )}

          </>
        )}
      </div>

      {/* MODAL ENTREPRISE */}
      {showAddCompany && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) { setShowAddCompany(false); setEditingCompany(null) } }}>
          <div className="modal">
            <div className="modal-title">{editingCompany ? 'Modifier' : 'Ajouter'} une entreprise</div>
            <div className="field">
              <label>NOM</label>
              <input type="text" value={companyForm.name} onChange={e => setCompanyForm(p => ({ ...p, name: e.target.value }))} placeholder="ex: Boursobank" />
            </div>
            <div className="field">
              <label>SLUG / DOMAINE</label>
              <input type="text" value={companyForm.slug} onChange={e => setCompanyForm(p => ({ ...p, slug: e.target.value }))} placeholder="ex: boursobank.com" />
            </div>
            <div className="field">
              <label>CATÉGORIE</label>
              <select value={companyForm.category} onChange={e => setCompanyForm(p => ({ ...p, category: e.target.value }))}>
                <option value="">Choisir...</option>
                {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>)}
              </select>
            </div>
            <div className="field">
              <label>DESCRIPTION BONUS</label>
              <input type="text" value={companyForm.referral_bonus_description} onChange={e => setCompanyForm(p => ({ ...p, referral_bonus_description: e.target.value }))} placeholder="ex: 80€ offerts à l'ouverture" />
            </div>
            <div className="modal-actions">
              <button className="btn-ghost-modal" onClick={() => { setShowAddCompany(false); setEditingCompany(null) }}>Annuler</button>
              <button className="btn-primary-modal" onClick={handleSaveCompany} disabled={formLoading}>
                {formLoading ? 'Sauvegarde...' : 'Sauvegarder'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
