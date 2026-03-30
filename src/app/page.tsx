export default function Home() {
  const categories = [
    { icon: "🏦", name: "Banque", count: 342, bg: "bg-blue-50" },
    { icon: "🎰", name: "Paris sportifs", count: 276, bg: "bg-amber-50" },
    { icon: "💸", name: "Cashback", count: 201, bg: "bg-green-50" },
    { icon: "⚡", name: "Énergie", count: 189, bg: "bg-emerald-50" },
    { icon: "📱", name: "Téléphonie", count: 94, bg: "bg-pink-50" },
    { icon: "₿", name: "Crypto", count: 118, bg: "bg-violet-50" },
  ]

  const tags = [
    "Boursobank", "Winamax", "Fortuneo", "Free",
    "Binance", "BetClic", "Hello bank", "Coinbase", "Lydia", "Revolut",
  ]

  const stats = [
    { n: "4 200+", l: "Codes actifs" },
    { n: "850+", l: "Parrains vérifiés" },
    { n: "97%", l: "Avis positifs" },
  ]

  return (
    <main className="min-h-screen bg-white">

      <nav className="flex justify-between items-center px-6 py-4 max-w-6xl mx-auto">
        <div className="text-lg font-medium">
          code<span className="text-violet-600">deparrainage</span>.com
        </div>
        <div className="flex gap-3">
          <a href="/login" className="text-sm text-gray-600 px-4 py-2">
            Connexion
          </a>
          <a href="/register" className="text-sm bg-violet-600 text-white px-4 py-2 rounded-full">
            Inscription gratuite
          </a>
        </div>
      </nav>

      <section className="bg-violet-600 mx-4 rounded-2xl px-6 py-16 text-center mt-2 max-w-6xl lg:mx-auto">
        <div className="inline-block bg-white/15 border border-white/25 rounded-full px-4 py-1 text-xs text-white mb-6">
          🎯 Le 1er site de parrainage gamifié en France
        </div>
        <h1 className="text-3xl md:text-5xl font-medium text-white leading-tight mb-4">
          Trouve ton{" "}
          <span className="text-yellow-300">code parrainage</span>
          <br />
          et gagne des récompenses
        </h1>
        <p className="text-white/75 text-sm max-w-xl mx-auto mb-8 leading-relaxed">
          Des milliers de codes de parrainage vérifiés pour Boursobank, Winamax,
          Fortuneo, Free et bien plus. Publiez, parrainez, montez de niveau.
        </p>
        <div className="flex gap-3 justify-center flex-wrap mb-10">
          <a href="/codes" className="bg-yellow-300 text-yellow-900 font-medium px-6 py-3 rounded-xl text-sm">
            Trouver un code gratuit
          </a>
          <a href="/register" className="border border-white/40 text-white px-6 py-3 rounded-xl text-sm">
            Publier mon code
          </a>
        </div>
        <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto">
          {stats.map((s) => (
            <div key={s.l} className="bg-white/10 rounded-xl py-3">
              <div className="text-xl font-medium text-white">{s.n}</div>
              <div className="text-xs text-white/65 mt-1">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-xl font-medium text-gray-900 mb-6">
          Parcourir par catégorie
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {categories.map((cat) => (
            <a key={cat.name} href={"/categorie/" + cat.name.toLowerCase()} className="bg-white border border-gray-100 rounded-xl p-4">
              <div className={"w-10 h-10 rounded-lg flex items-center justify-center text-xl mb-3 " + cat.bg}>
                {cat.icon}
              </div>
              <div className="text-sm font-medium text-gray-900">{cat.name}</div>
              <div className="text-xs text-gray-500 mt-1">{cat.count} codes</div>
            </a>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 pb-12">
        <div className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">
          Codes populaires
        </div>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (  
            <a key={tag} href={"/code-parrainage/" + tag.toLowerCase().replace(" ", "-")} className="text-xs bg-gray-100 text-gray-600 rounded-lg px-3 py-2">
              Code parrainage {tag}
            </a>
          ))}
        </div>
      </section>

    </main>
  )
}