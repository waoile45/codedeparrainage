import { Metadata } from 'next'
import VpnComparatif from './VpnComparatif'
import { VPN_LIST } from '@/data/comparatifs/vpn'

export const metadata: Metadata = {
  title: 'Meilleur VPN en 2026 : comparatif des offres',
  description:
    'NordVPN, Surfshark, ExpressVPN, CyberGhost et ProtonVPN comparés sur les critères publiés par chaque éditeur : serveurs, protocoles, streaming, audits no-log et prix.',
  alternates: { canonical: 'https://www.codedeparrainage.com/meilleur-vpn' },
  openGraph: {
    title: 'Meilleur VPN en 2026 : comparatif des offres',
    description:
      'NordVPN, Surfshark, ExpressVPN, CyberGhost ou ProtonVPN ? Points forts, limites et prix comparés à partir des informations publiées par chaque éditeur.',
    url: 'https://www.codedeparrainage.com/meilleur-vpn',
    type: 'article',
  },
}

const INTRO =
  "Cinq services dominent le marché grand public : NordVPN, Surfshark, ExpressVPN, CyberGhost et ProtonVPN. Ce comparatif met côte à côte ce que chacun publie (réseau de serveurs, protocoles, audits de leur politique no-log, prix selon la durée d'engagement) et indique pour quel usage chacun est le plus pertinent. Les liens en bas de page renvoient vers des comparatifs par usage : streaming, torrents, gaming, mobile."

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
