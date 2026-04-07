import CodesClient from './CodesClient'

export const metadata = {
  title: 'Codes de parrainage — Annuaire complet',
  description: 'Parcourez tous les codes de parrainage disponibles : banque, paris sportifs, crypto, cashback. Codes vérifiés par la communauté et mis à jour en temps réel.',
  alternates: {
    canonical: 'https://www.codedeparrainage.com/codes',
  },
}

const COMPANY_LINKS = [
  { slug: 'boursobank',     name: 'BoursoBank' },
  { slug: 'winamax',        name: 'Winamax' },
  { slug: 'betclic',        name: 'Betclic' },
  { slug: 'revolut',        name: 'Revolut' },
  { slug: 'trade-republic', name: 'Trade Republic' },
  { slug: 'bourse-direct',  name: 'BourseDirect' },
  { slug: 'unibet',         name: 'Unibet' },
  { slug: 'binance',        name: 'Binance' },
  { slug: 'fortuneo',       name: 'Fortuneo' },
  { slug: 'free',           name: 'Free Mobile' },
]

// Pas de fetch Supabase ici — createClient est un client navigateur.
// Les données sont chargées par CodesClient côté client comme avant.
export default function CodesPage() {
  return (
    <>
      {/* Contenu statique visible par Google — maillage interne vers les pages entreprises */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: '-9999px',
          width: '1px',
          overflow: 'hidden',
        }}
      >
        <h1>Codes de parrainage — Annuaire complet</h1>
        <p>
          Trouvez les meilleurs codes de parrainage vérifiés par notre communauté.
          Banque, paris sportifs, crypto, cashback — tous les secteurs sont couverts.
        </p>
        <nav aria-label="Pages entreprises">
          {COMPANY_LINKS.map((c) => (
            <a key={c.slug} href={`/code-parrainage/${c.slug}`}>
              Code parrainage {c.name}
            </a>
          ))}
        </nav>
      </div>

      {/* Interface interactive — même comportement qu'avant */}
      <CodesClient />
    </>
  )
}
