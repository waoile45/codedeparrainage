import { Metadata } from 'next'
import BanqueComparatif from './BanqueComparatif'
import { BANQUE_LIST } from '@/data/comparatifs/banque'

export const metadata: Metadata = {
  title: 'Meilleure banque en ligne en 2026 : comparatif des offres',
  description:
    'Revolut, Wise, N26, Boursobank, Fortuneo ou Sumeria ? Notre comparatif des meilleures banques en ligne et néobanques en 2026 : frais, fonctionnalités et bonus parrainage.',
  alternates: { canonical: 'https://www.codedeparrainage.com/meilleure-banque' },
  openGraph: {
    title: 'Meilleure banque en ligne en 2026 : comparatif des offres',
    description: "Néobanques et banques en ligne comparées sur leurs brochures tarifaires : frais, usage à l'étranger, bonus de parrainage.",
    url: 'https://www.codedeparrainage.com/meilleure-banque',
    type: 'article',
  },
}

const INTRO =
  "Revolut, Wise, N26, Boursobank, Fortuneo et Sumeria couvrent des besoins différents : paiements à l'étranger, virements internationaux, compte gratuit sans condition, bourse. Ce comparatif reprend, pour chacune, les frais et conditions publiés dans leurs brochures tarifaires, puis les classe par profil d'usage. Chaque fiche renvoie aussi vers la page de codes de parrainage de la banque quand elle en propose un."

export default function MeilleureBanquePage() {
  return (
    <BanqueComparatif
      banques={BANQUE_LIST}
      h1="Meilleure banque en ligne en 2026 : notre comparatif"
      intro={INTRO}
      canonicalPath="/meilleure-banque"
    />
  )
}
