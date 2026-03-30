'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'

type Tab = 'entreprises' | 'annonces' | 'utilisateurs' | 'stats'

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>('entreprises')
  const [companies, setCompanies] = useState<any[]>([])
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [stats, setStats] = useState<any>({})
  const [loading, setLoading] = useState(true)

  // États pour ajouter/modifier une entreprise
  const [editingCompany, setEditingCompany] = useState<any>(null)
  const [showAddCompany, setShowAddCompany] = useState(false)
  const [companyForm, setCompanyForm] = useState({
    name: '', slug: '', category: '', referral_bonus_description: ''
  })
  const [formLoading, setFormLoading] = useState(false)

  const supabase = createClient()

  useEffect(() => { loadData() }, [])

  async function loadData() {
    setLoading(true)

    const { data: companiesData } = await supabase
      .from('companies')
      .select('*')
      .order('name')

    const { data: announcementsData } = await supabase
      .from('announcements')
      .select('*, users (pseudo, email), companies (name)')
      .order('created_at', { ascending: false })

    const { data: usersData } = await supabase
      .from('users')
      .select('*, credits (balance)')
      .order('xp', { ascending: false })

    setCompanies(companiesData ?? [])
    setAnnouncements(announcementsData ?? [])
    setUsers(usersData ?? [])
    setStats({
      totalUsers: usersData?.length ?? 0,
      totalAnnouncements: announcementsData?.length ?? 0,
      totalCompanies: companiesData?.length ?? 0,
    })
    setLoading(false)
  }

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

  const TABS: { key: Tab, label: string, icon: string }[] = [
    { key: 'entreprises', label: 'Entreprises', icon: '🏢' },
    { key: 'annonces', label: 'Annonces', icon: '📢' },
    { key: 'utilisateurs', label: 'Utilisateurs', icon: '👥' },
    { key: 'stats', label: 'Stats', icon: '📊' },
  ]

  const CATEGORIES = ['banque', 'paris', 'cashback', 'energie', 'telephonie', 'crypto', 'assurance', 'shopping']

  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <a href="/" className="text-lg font-medium">
              code<span className="text-violet-600">deparrainage</span>.com
            </a>
            <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full font-medium">
              Admin
            </span>
          </div>
          <a href="/" className="text-sm text-gray-500 hover:text-gray-900">← Retour au site</a>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* STATS RAPIDES */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white border border-gray-100 rounded-2xl p-5 text-center">
            <div className="text-3xl font-bold text-violet-600">{stats.totalUsers}</div>
            <div className="text-sm text-gray-500 mt-1">Utilisateurs</div>
          </div>
          <div className="bg-white border border-gray-100 rounded-2xl p-5 text-center">
            <div className="text-3xl font-bold text-violet-600">{stats.totalAnnouncements}</div>
            <div className="text-sm text-gray-500 mt-1">Annonces</div>
          </div>
          <div className="bg-white border border-gray-100 rounded-2xl p-5 text-center">
            <div className="text-3xl font-bold text-violet-600">{stats.totalCompanies}</div>
            <div className="text-sm text-gray-500 mt-1">Entreprises</div>
          </div>
        </div>

        {/* TABS */}
        <div className="flex gap-2 mb-6">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                tab === t.key
                  ? 'bg-violet-600 text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-violet-400'
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-400">Chargement...</div>
        ) : (
          <>
            {/* ENTREPRISES */}
            {tab === 'entreprises' && (
              <div className="bg-white border border-gray-100 rounded-2xl p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-medium text-gray-900">
                    Entreprises ({companies.length})
                  </h2>
                  <button
                    onClick={() => {
                      setShowAddCompany(true)
                      setEditingCompany(null)
                      setCompanyForm({ name: '', slug: '', category: '', referral_bonus_description: '' })
                    }}
                    className="bg-violet-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-violet-700"
                  >
                    + Ajouter
                  </button>
                </div>
                <div className="flex flex-col gap-3">
                  {companies.map((company: any) => (
                    <div key={company.id} className="border border-gray-100 rounded-xl p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={`https://www.google.com/s2/favicons?domain=${company.slug}.com&sz=32`}
                          className="w-8 h-8"
                          alt={company.name}
                        />
                        <div>
                          <div className="font-medium text-sm text-gray-900">{company.name}</div>
                          <div className="text-xs text-gray-400">{company.slug} · {company.category}</div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingCompany(company)
                            setShowAddCompany(true)
                            setCompanyForm({
                              name: company.name,
                              slug: company.slug,
                              category: company.category,
                              referral_bonus_description: company.referral_bonus_description || ''
                            })
                          }}
                          className="text-xs border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg hover:border-violet-400 hover:text-violet-600"
                        >
                          ✏️ Modifier
                        </button>
                        <button
                          onClick={() => handleDeleteCompany(company.id)}
                          className="text-xs border border-red-100 text-red-400 px-3 py-1.5 rounded-lg hover:border-red-400 hover:text-red-600"
                        >
                          🗑️ Supprimer
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ANNONCES */}
            {tab === 'annonces' && (
              <div className="bg-white border border-gray-100 rounded-2xl p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-6">
                  Annonces ({announcements.length})
                </h2>
                <div className="flex flex-col gap-3">
                  {announcements.map((ann: any) => (
                    <div key={ann.id} className="border border-gray-100 rounded-xl p-4 flex items-center justify-between">
                      <div>
                        <div className="font-medium text-sm text-gray-900">
                          {ann.companies?.name} — <span className="font-mono">{ann.code}</span>
                        </div>
                        <div className="text-xs text-gray-400 mt-0.5">
                          par {ann.users?.pseudo} · {new Date(ann.created_at).toLocaleDateString('fr-FR')}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteAnnouncement(ann.id)}
                        className="text-xs border border-red-100 text-red-400 px-3 py-1.5 rounded-lg hover:border-red-400 hover:text-red-600"
                      >
                        🗑️ Supprimer
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* UTILISATEURS */}
            {tab === 'utilisateurs' && (
              <div className="bg-white border border-gray-100 rounded-2xl p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-6">
                  Utilisateurs ({users.length})
                </h2>
                <div className="flex flex-col gap-3">
                  {users.map((user: any) => (
                    <div key={user.id} className="border border-gray-100 rounded-xl p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-sm font-medium text-violet-600">
                          {user.pseudo?.slice(0, 1).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-sm text-gray-900">{user.pseudo}</div>
                          <div className="text-xs text-gray-400">{user.level} · {user.xp} XP</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-violet-600">
                          {user.credits?.[0]?.balance?.toFixed(2) ?? '0.00'} crédits
                        </div>
                        <div className="text-xs text-gray-400">
                          streak {user.streak_days} jours 🔥
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STATS */}
            {tab === 'stats' && (
              <div className="bg-white border border-gray-100 rounded-2xl p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-6">Statistiques</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-violet-50 rounded-xl p-5">
                    <div className="text-3xl font-bold text-violet-600">{stats.totalUsers}</div>
                    <div className="text-sm text-violet-500 mt-1">👥 Utilisateurs inscrits</div>
                  </div>
                  <div className="bg-violet-50 rounded-xl p-5">
                    <div className="text-3xl font-bold text-violet-600">{stats.totalAnnouncements}</div>
                    <div className="text-sm text-violet-500 mt-1">📢 Annonces publiées</div>
                  </div>
                  <div className="bg-violet-50 rounded-xl p-5">
                    <div className="text-3xl font-bold text-violet-600">{stats.totalCompanies}</div>
                    <div className="text-sm text-violet-500 mt-1">🏢 Entreprises référencées</div>
                  </div>
                  <div className="bg-violet-50 rounded-xl p-5">
                    <div className="text-3xl font-bold text-violet-600">
                      {users.reduce((sum: number, u: any) => sum + (u.credits?.[0]?.balance ?? 0), 0).toFixed(0)}
                    </div>
                    <div className="text-sm text-violet-500 mt-1">⚡ Crédits en circulation</div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* MODAL ENTREPRISE */}
      {showAddCompany && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {editingCompany ? 'Modifier' : 'Ajouter'} une entreprise
            </h3>
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Nom</label>
                <input
                  type="text"
                  value={companyForm.name}
                  onChange={(e) => setCompanyForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="ex: Boursobank"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-violet-400"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Slug</label>
                <input
                  type="text"
                  value={companyForm.slug}
                  onChange={(e) => setCompanyForm(prev => ({ ...prev, slug: e.target.value }))}
                  placeholder="ex: boursobank"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-violet-400"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Catégorie</label>
                <select
                  value={companyForm.category}
                  onChange={(e) => setCompanyForm(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-violet-400"
                >
                  <option value="">Choisir...</option>
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Description bonus</label>
                <input
                  type="text"
                  value={companyForm.referral_bonus_description}
                  onChange={(e) => setCompanyForm(prev => ({ ...prev, referral_bonus_description: e.target.value }))}
                  placeholder="ex: 80€ offerts à l'ouverture"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-violet-400"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => { setShowAddCompany(false); setEditingCompany(null) }}
                  className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-xl text-sm font-medium hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSaveCompany}
                  disabled={formLoading}
                  className="flex-1 bg-violet-600 text-white py-3 rounded-xl text-sm font-medium hover:bg-violet-700 disabled:opacity-50"
                >
                  {formLoading ? 'Sauvegarde...' : 'Sauvegarder'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}