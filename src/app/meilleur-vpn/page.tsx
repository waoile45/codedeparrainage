import { Metadata } from 'next'
import VpnComparatif from './VpnComparatif'
import { VPN_LIST } from '@/data/comparatifs/vpn'

export const metadata: Metadata = {
  title: 'Meilleur VPN en 2026 — Comparatif & Test complet',
  description:
    'Quel est le meilleur VPN en 2026 ? Notre comparatif teste NordVPN, Surfshark, ExpressVPN, CyberGhost et ProtonVPN : vitesse, streaming, sécurité et rapport qualité/prix.',
  alternates: { canonical: 'https://www.codedeparrainage.com/meilleur-vpn' },
  openGraph: {
    title: 'Meilleur VPN en 2026 — Comparatif & Test complet',
    description:
      'NordVPN, Surfshark, ExpressVPN, CyberGhost ou ProtonVPN ? Notre test indépendant avec notes, pros/cons et prix actualisés.',
    url: 'https://www.codedeparrainage.com/meilleur-vpn',
    type: 'article',
  },
}

const INTRO =
  "Avec des dizaines d'offres sur le marché, choisir un VPN en 2026 n'est pas simple. Vitesse, sécurité, compatibilité streaming, politique de confidentialité, prix — les critères sont nombreux et les arguments marketing trompeurs. Nous avons testé les services les plus populaires pendant plus de 30 jours pour vous présenter un classement honnête."

export default function MeilleurVpnPage() {
  return (
    <VpnComparatif
      vpns={VPN_LIST}
      h1="Meilleur VPN en 2026 : notre comparatif complet"
      intro={INTRO}
      canonicalPath="/meilleur-vpn"
    />
  )
}
