import { createClient } from '@/lib/supabase'
import { Metadata } from 'next'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = createClient()
  const { data: company } = await supabase
    .from('companies')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!company) return { title: 'Code parrainage introuvable' }

  return {
    title: `Code parrainage ${company.name} 2025`,
    description: `Trouvez le meilleur code parrainage ${company.name} en 2025. ${company.referral_bonus_description}. Codes vérifiés et mis à jour en temps réel.`,
  }
}

export default async function CompanyPage({ params }: Props) {
  const { slug } = await params
  const supabase = createClient()

  const { data: company } = await supabase
    .from('companies')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!company) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">😕</div>
          <div className="text-gray-500">Entreprise introuvable</div>
          <a href="/" className="text-violet-600 text-sm mt-4 block">Retour à l'accueil</a>
        </div>
      </main>
    )
  }

  const { data: announcements } = await supabase
    .from('announcements')
    .select('*, users (pseudo, xp, level)')
    .eq('company_id', company.id)
    .order('last_bumped_at', { ascending: false })

  const autresSlug = ['boursobank', 'winamax', 'fortuneo', 'free', 'binance', 'betclic'].filter(s => s !== slug)



  function getDomain(slug: string) {
    const domains: Record<string, string> = {
      'boursobank': 'boursobank.com',
      'fortuneo': 'fortuneo.fr',
      'hello-bank': 'hello.bank',
      'revolut': 'revolut.com',
      'lydia': 'lydia-app.com',
      'winamax': 'winamax.fr',
      'betclic': 'betclic.fr',
      'pmu': 'pmu.fr',
      'free': 'free.fr',
      'sfr': 'sfr.fr',
      'igraal': 'igraal.com',
      'poulpeo': 'poulpeo.com',
      'binance': 'binance.com',
      'coinbase': 'coinbase.com',
      'edf': 'edf.fr',
      'engie': 'engie.fr',
    }
    return domains[slug] ?? slug + '.com'
  }
  
  return (
    <main className="min-h-screen bg-gray-50">

      <nav className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <a href="/" className="text-lg font-medium">
            code<span className="text-violet-600">deparrainage</span>.fr
          </a>
          <a href="/publier" className="text-sm bg-violet-600 text-white px-4 py-2 rounded-full">
            Publier mon code
          </a>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">

        <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-white border border-gray-100 flex items-center justify-center overflow-hidden">
              <img
                src={"https://www.google.com/s2/favicons?domain=" + getDomain(company.slug) + "&sz=64"}
                alt={company.name}
                className="w-12 h-12 object-contain"
              />
            </div>
            <div>
              <h1 className="text-2xl font-medium text-gray-900">
                Code parrainage {company.name}
              </h1>
              <div className="text-sm text-gray-500 mt-1">{company.description}</div>
            </div>
          </div>
          <div className="bg-violet-50 rounded-xl p-4">
            <div className="text-sm font-medium text-violet-700 mb-1">🎁 Offre de parrainage</div>
            <div className="text-violet-900">{company.referral_bonus_description}</div>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-3">
            Comment utiliser un code parrainage {company.name} ?
          </h2>
          <div className="text-sm text-gray-600 leading-relaxed flex flex-col gap-2">
            <p>
              Pour profiter d'un code parrainage {company.name}, choisissez un code
              dans la liste ci-dessous et utilisez-le lors de votre inscription sur {company.name}.
            </p>
            <p>
              {company.referral_bonus_description} — c'est l'offre actuelle proposée par {company.name}.
            </p>
            <p>
              Tous nos codes sont vérifiés et mis à jour en temps réel par notre communauté de parrains.
            </p>
          </div>
        </div>

        <h2 className="text-lg font-medium text-gray-900 mb-4">
          {announcements?.length ?? 0} codes parrainage {company.name} disponibles
        </h2>

        {announcements && announcements.length > 0 ? (
          <div className="flex flex-col gap-4">
            {announcements.map((ann: any) => (
              <div key={ann.id} className="bg-white border border-gray-100 rounded-2xl p-5">
                <div className="bg-gray-50 rounded-xl px-4 py-3 flex items-center justify-between mb-3">
                  <span className="font-mono text-sm font-medium text-gray-900">{ann.code}</span>
                  <button className="text-xs text-violet-600 font-medium">
                    Copier
                  </button>
                </div>
                {ann.description && (
                  <p className="text-sm text-gray-600 mb-3">{ann.description}</p>
                )}
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-violet-100 flex items-center justify-center text-xs font-medium text-violet-600">
                    {ann.users?.pseudo?.slice(0, 1).toUpperCase()}
                  </div>
                  <span className="text-xs text-gray-500">{ann.users?.pseudo}</span>
                  <span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full">
                    {ann.users?.level}
                  </span>
                  <span className="text-xs text-gray-400 ml-auto">
                    {new Date(ann.last_bumped_at).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white border border-gray-100 rounded-2xl">
            <div className="text-4xl mb-4">🎯</div>
            <div className="text-gray-500 mb-4">
              Aucun code parrainage {company.name} pour l'instant
            </div>
            <a href="/publier" className="bg-violet-600 text-white px-6 py-3 rounded-xl text-sm font-medium">
              Publier le premier code
            </a>
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">
            Autres codes populaires
          </div>
          <div className="flex flex-wrap gap-2">
            {autresSlug.map((s) => (
              <a key={s} href={"/code-parrainage/" + s} className="text-xs bg-gray-100 text-gray-600 rounded-lg px-3 py-2 hover:bg-violet-100 hover:text-violet-700">
                Code parrainage {s.charAt(0).toUpperCase() + s.slice(1)}
              </a>
            ))}
          </div>
        </div>

      </div>
    </main>
  )
}