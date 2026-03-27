import { createClient } from '@/lib/supabase'

export default async function CodesPage() {
  const supabase = createClient()

  const { data: announcements } = await supabase
    .from('announcements')
    .select(`
      *,
      users (pseudo, xp, level),
      companies (name, slug, category, referral_bonus_description)
    `)
    .order('last_bumped_at', { ascending: false })

  return (
    <main className="min-h-screen bg-gray-50">

      <nav className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <a href="/" className="text-lg font-medium">
            code<span className="text-violet-600">deparrainage</span>.fr
          </a>
          <a href="/register" className="text-sm bg-violet-600 text-white px-4 py-2 rounded-full">
            Publier mon code
          </a>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-medium text-gray-900 mb-2">
          Codes de parrainage disponibles
        </h1>
        <p className="text-gray-500 text-sm mb-8">
          {announcements?.length ?? 0} codes disponibles — mis à jour en temps réel
        </p>

        {announcements && announcements.length > 0 ? (
          <div className="flex flex-col gap-4">
            {announcements.map((ann: any) => (
              <div key={ann.id} className="bg-white border border-gray-100 rounded-2xl p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center text-sm font-medium text-violet-600">
                      {ann.companies?.name?.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{ann.companies?.name}</div>
                      <div className="text-xs text-gray-500">{ann.companies?.referral_bonus_description}</div>
                    </div>
                  </div>
                  <span className="text-xs bg-violet-50 text-violet-600 px-3 py-1 rounded-full">
                    {ann.companies?.category}
                  </span>
                </div>

                <div className="bg-gray-50 rounded-xl px-4 py-3 flex items-center justify-between mb-3">
                  <span className="font-mono text-sm font-medium text-gray-900">{ann.code}</span>
                  <button className="text-xs text-violet-600 font-medium">Copier</button>
                </div>

                {ann.description && (
                  <p className="text-sm text-gray-600 mb-3">{ann.description}</p>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-violet-100 flex items-center justify-center text-xs font-medium text-violet-600">
                      {ann.users?.pseudo?.slice(0, 1).toUpperCase()}
                    </div>
                    <span className="text-xs text-gray-500">{ann.users?.pseudo}</span>
                    <span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full">
                      {ann.users?.level}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(ann.last_bumped_at).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              </div>
            ))}
          </div>    
        ) : (
          <div className="text-center py-20">
            <div className="text-4xl mb-4">🎯</div>
            <div className="text-gray-500 mb-4">Aucune annonce pour l'instant</div>
            <a href="/register" className="bg-violet-600 text-white px-6 py-3 rounded-xl text-sm font-medium">
              Soyez le premier à publier !
            </a>
          </div>
        )}
      </div>

    </main>
  )
}