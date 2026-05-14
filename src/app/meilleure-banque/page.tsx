import { Metadata } from 'next'
import BanqueComparatif from './BanqueComparatif'
import { BANQUE_LIST } from '@/data/comparatifs/banque'

export const metadata: Metadata = {
  title: 'Meilleure banque en ligne en 2026 — Comparatif complet',
  description:
    'Revolut, Wise, N26, Boursobank, Fortuneo ou Sumeria ? Notre comparatif des meilleures banques en ligne et néobanques en 2026 : frais, fonctionnalités et bonus parrainage.',
  alternates: { canonical: 'https://www.codedeparrainage.com/meilleure-banque' },
  openGraph: {
    title: 'Meilleure banque en ligne en 2026 — Comparatif complet',
    description: 'Comparatif honnête des meilleures néobanques et banques en ligne françaises : frais, international, bonus et avis.',
    url: 'https://www.codedeparrainage.com/meilleure-banque',
    type: 'article',
  },
}

const INTRO =
  "Le marché bancaire français a été bouleversé par les néobanques : Revolut, Wise, N26 proposent des services souvent supérieurs aux banques traditionnelles pour une fraction du prix. Mais toutes ne se valent pas selon votre profil. Voici notre comparatif mis à jour pour choisir la banque qui correspond vraiment à vos besoins."

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
