import HomeClient from './HomeClient'

export const metadata = {
  title: 'codedeparrainage.com — Les meilleurs codes de parrainage 2026',
  description: 'Trouvez les meilleurs codes de parrainage français : BoursoBank, Winamax, Revolut, Betclic, Trade Republic. Codes vérifiés par la communauté, mis à jour en temps réel.',
  alternates: {
    canonical: 'https://www.codedeparrainage.com',
  },
  openGraph: {
    title: 'codedeparrainage.com — Les meilleurs codes de parrainage 2026',
    description: 'Trouvez les meilleurs codes de parrainage français : BoursoBank, Winamax, Revolut, Betclic, Trade Republic.',
    url: 'https://www.codedeparrainage.com',
    type: 'website',
  },
}

// Données statiques — visibles par Google sans JS
const SEO_COMPANIES = [
  { slug: 'boursobank',     name: 'BoursoBank',     gain: 'jusqu\'à 240€',  category: 'Banque' },
  { slug: 'winamax',        name: 'Winamax',         gain: '100€ de freebets', category: 'Paris sportifs' },
  { slug: 'betclic',        name: 'Betclic',         gain: 'paris remboursés', category: 'Paris sportifs' },
  { slug: 'revolut',        name: 'Revolut',         gain: '30€ en cashback',  category: 'Banque' },
  { slug: 'trade-republic', name: 'Trade Republic',  gain: '5€ en actions',    category: 'Bourse' },
  { slug: 'bourse-direct',  name: 'BourseDirect',    gain: 'ordres offerts',   category: 'Bourse' },
  { slug: 'unibet',         name: 'Unibet',          gain: 'bonus bienvenue',  category: 'Paris sportifs' },
  { slug: 'binance',        name: 'Binance',         gain: '-20% sur les frais', category: 'Crypto' },
]

const SEO_CATEGORIES = [
  { slug: 'banque',     label: 'Banque' },
  { slug: 'paris',      label: 'Paris sportifs' },
  { slug: 'crypto',     label: 'Crypto' },
  { slug: 'cashback',   label: 'Cashback' },
  { slug: 'energie',    label: 'Énergie' },
  { slug: 'telephonie', label: 'Téléphonie' },
]

export default function HomePage() {
  return (
    <>
      {/*
        Contenu server-rendu visible par Google.
        Positionné hors écran — pas de cloaking car le contenu est identique
        à ce que voit l'utilisateur via HomeClient, juste pré-rendu.
      */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: '-9999px',
          width: '1px',
          overflow: 'hidden',
        }}
      >
        <span>Impact-Site-Verification: 258648a3-b1d3-4525-8787-d19c969c5798</span>
        <h1>Les meilleurs codes de parrainage 2026 — codedeparrainage.com</h1>
        <p>
          Trouvez et partagez les meilleurs codes de parrainage français.
          BoursoBank, Winamax, Betclic, Revolut, Trade Republic et bien d'autres.
          Codes vérifiés par la communauté, mis à jour en temps réel.
        </p>

        {/* Maillage interne — liens crawlables vers chaque page entreprise */}
        <nav aria-label="Codes de parrainage par entreprise">
          <h2>Codes de parrainage populaires</h2>
          {SEO_COMPANIES.map((c) => (
            <a key={c.slug} href={`/code-parrainage/${c.slug}`}>
              Code parrainage {c.name} — {c.gain} ({c.category})
            </a>
          ))}
        </nav>

        {/* Liens par catégorie */}
        <nav aria-label="Catégories de parrainage">
          <h2>Parcourir par catégorie</h2>
          {SEO_CATEGORIES.map((cat) => (
            <a key={cat.slug} href={`/codes?categorie=${cat.slug}`}>
              Codes de parrainage {cat.label}
            </a>
          ))}
        </nav>

        <p>
          Comment utiliser un code parrainage ? Choisissez un code dans notre annuaire,
          copie-le, et entre-le lors de ton inscription sur le site de l'entreprise.
          Tu recevras automatiquement ta récompense après validation.
        </p>
      </div>

      {/* Interface complète avec animations et thème */}
      <HomeClient />
    </>
  )
}
