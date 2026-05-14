export type VpnScores = {
  vitesse: number
  securite: number
  facilite: number
  streaming: number
  prix: number
}

export type VpnEntry = {
  id: string
  name: string
  domain: string
  tagline: string
  description: string
  score: number
  scores: VpnScores
  pros: string[]
  cons: string[]
  servers: number
  countries: number
  connections: number | string
  guarantee: number
  monthlyPrice: number
  bestPrice: number
  bestPriceDuration: string
  affiliateUrl: string
  badge?: string
  platforms: string[]
}

// ─── Données VPN ────────────────────────────────────────────────────────────
// Pour ajouter vos liens d'affiliation, remplacez '#' par votre lien :
//  • NordVPN    → partners.nordvpn.com (programme CJ Affiliate)
//  • Surfshark  → impact.com (rechercher "Surfshark")
//  • ExpressVPN → expressvpn.com/affiliates
//  • CyberGhost → Affily.io (programme propre CyberGhost)
//  • ProtonVPN  → proton.me/affiliates

export const VPN_LIST: VpnEntry[] = [
  {
    id: 'nordvpn',
    name: 'NordVPN',
    domain: 'nordvpn.com',
    tagline: 'La référence absolue, tous usages confondus',
    description:
      "NordVPN s'est imposé comme le standard du secteur depuis plusieurs années, et pour de bonnes raisons. Son protocole NordLynx — une implémentation maison de WireGuard — délivre des vitesses record sans sacrifier la sécurité. Les 7 100 serveurs répartis dans 118 pays couvrent l'essentiel des besoins, et la fonction SmartPlay déverrouille 15+ services de streaming en un clic. Sa politique no-log a été auditée deux fois par PricewaterhouseCoopers.",
    score: 9.7,
    scores: {
      vitesse: 9.8,
      securite: 9.7,
      facilite: 9.5,
      streaming: 9.8,
      prix: 9.4,
    },
    pros: [
      'Protocole NordLynx (WireGuard) ultra-rapide',
      'SmartPlay : débloque Netflix, Disney+, BBC iPlayer...',
      'Double VPN et Onion Over VPN disponibles',
      'Politique no-log auditée par PwC',
      'Threat Protection intégré (bloqueur pubs & malwares)',
    ],
    cons: [
      'Prix de renouvellement plus élevé après la période promo',
      'L\'app desktop un peu chargée en fonctionnalités',
    ],
    servers: 7100,
    countries: 118,
    connections: 10,
    guarantee: 30,
    monthlyPrice: 13.99,
    bestPrice: 3.99,
    bestPriceDuration: '2 ans',
    affiliateUrl: '#',
    badge: 'Choix de la rédaction',
    platforms: ['Windows', 'Mac', 'Linux', 'Android', 'iOS', 'Routeur'],
  },
  {
    id: 'surfshark',
    name: 'Surfshark',
    domain: 'surfshark.com',
    tagline: 'Connexions illimitées et meilleur rapport qualité/prix',
    description:
      "Surfshark propose quelque chose de rare dans le secteur : des connexions simultanées illimitées sur un seul abonnement. Que vous protégiez toute la famille ou tous vos appareils à la fois, c'est l'option la plus flexible. Ses 3 200+ serveurs dans 100 pays sont suffisants pour la plupart des usages, et son mode NoBorders permet de passer les restrictions dans les pays à forte censure. Le rapport qualité/prix en fait la référence des offres à long terme.",
    score: 9.5,
    scores: {
      vitesse: 9.4,
      securite: 9.3,
      facilite: 9.6,
      streaming: 9.2,
      prix: 9.9,
    },
    pros: [
      'Appareils simultanés illimités',
      'Prix parmi les plus bas du marché sur 2 ans',
      'CleanWeb : bloqueur de pubs et malwares intégré',
      'Mode Camouflage pour contourner la censure',
      'Interface très accessible, idéale pour les débutants',
    ],
    cons: [
      'Vitesses légèrement moins constantes que NordVPN',
      'Réseau de serveurs plus petit que les concurrents premium',
    ],
    servers: 3200,
    countries: 100,
    connections: 'Illimitées',
    guarantee: 30,
    monthlyPrice: 12.95,
    bestPrice: 2.49,
    bestPriceDuration: '2 ans',
    affiliateUrl: '#',
    badge: 'Meilleur rapport qualité/prix',
    platforms: ['Windows', 'Mac', 'Linux', 'Android', 'iOS', 'Routeur'],
  },
  {
    id: 'expressvpn',
    name: 'ExpressVPN',
    domain: 'expressvpn.com',
    tagline: 'Le plus rapide — idéal pour le streaming 4K',
    description:
      "ExpressVPN est la référence en termes de vitesse pure. Son protocole propriétaire Lightway — plus léger que WireGuard sur les connexions mobiles — donne des résultats impressionnants pour le streaming 4K. La juridiction des Îles Vierges britanniques le place hors des accords 5/9/14 Eyes. MediaStreamer, son DNS intelligent inclus dans l'abonnement, déverrouille Netflix US, BBC iPlayer et Disney+ sans configuration VPN sur les appareils qui ne le supportent pas nativement (Smart TV, consoles).",
    score: 9.3,
    scores: {
      vitesse: 9.9,
      securite: 9.4,
      facilite: 9.3,
      streaming: 9.7,
      prix: 8.5,
    },
    pros: [
      'Protocole Lightway : vitesse la plus élevée testée',
      'Serveurs 100% RAM (zéro donnée stockée sur disque)',
      'MediaStreamer pour Smart TV et consoles',
      'Split tunneling avancé sur toutes les plateformes',
      'Support client disponible 24h/24 en chat',
    ],
    cons: [
      'Le plus cher des services premium',
      'Seulement 8 connexions simultanées',
    ],
    servers: 3000,
    countries: 105,
    connections: 8,
    guarantee: 30,
    monthlyPrice: 12.95,
    bestPrice: 6.67,
    bestPriceDuration: '1 an',
    affiliateUrl: '#',
    platforms: ['Windows', 'Mac', 'Linux', 'Android', 'iOS', 'Routeur'],
  },
  {
    id: 'cyberghost',
    name: 'CyberGhost',
    domain: 'cyberghost.com',
    tagline: '9 700 serveurs avec des profils dédiés par usage',
    description:
      "CyberGhost se distingue par la volumétrie : avec plus de 9 700 serveurs dans 91 pays, c'est le réseau le plus étendu de notre sélection. Sa particularité réside dans les serveurs catégorisés par usage — streaming, torrents, gaming, anonymat — qui permettent une connexion optimale en un clic, sans paramétrage. La garantie satisfait-ou-remboursé de 45 jours est la plus longue du marché, ce qui en fait un excellent choix pour tester sereinement.",
    score: 9.1,
    scores: {
      vitesse: 9.0,
      securite: 9.0,
      facilite: 9.4,
      streaming: 9.1,
      prix: 9.6,
    },
    pros: [
      '9 700+ serveurs — le réseau le plus étendu',
      'Serveurs dédiés streaming, torrents et gaming',
      'Garantie 45 jours satisfait ou remboursé',
      'Prix très compétitif sur les offres 2 ans',
      'Interface guidée, parfaite pour les non-techniciens',
    ],
    cons: [
      'Vitesses moins constantes sur les serveurs très éloignés',
      'Pas de split tunneling sur toutes les plateformes',
    ],
    servers: 9700,
    countries: 91,
    connections: 7,
    guarantee: 45,
    monthlyPrice: 12.99,
    bestPrice: 2.03,
    bestPriceDuration: '2 ans + 4 mois offerts',
    affiliateUrl: 'https://affily.link/jz8jXva',
    platforms: ['Windows', 'Mac', 'Linux', 'Android', 'iOS', 'Routeur'],
  },
  {
    id: 'protonvpn',
    name: 'ProtonVPN',
    domain: 'protonvpn.com',
    tagline: 'Le plus sécurisé — créé par les chercheurs du CERN',
    description:
      "Né du même projet que ProtonMail, ProtonVPN est basé en Suisse — l'une des meilleures juridictions mondiales pour la vie privée. Son infrastructure Secure Core achemine le trafic via des serveurs en Islande, Suisse ou Suède avant de sortir sur internet, rendant la remontée vers l'utilisateur pratiquement impossible. L'accès réseau Tor est intégré directement dans l'application. Le code source est entièrement open source et régulièrement audité par des tiers.",
    score: 8.9,
    scores: {
      vitesse: 8.8,
      securite: 9.9,
      facilite: 8.5,
      streaming: 8.4,
      prix: 8.8,
    },
    pros: [
      'Secure Core : double chiffrement via pays neutres',
      'Basé en Suisse, hors juridiction 14 Eyes',
      'Accès réseau Tor intégré (Tor over VPN)',
      'Code source open source et audité publiquement',
      'Version gratuite sans limites de données',
    ],
    cons: [
      'Vitesses inférieures aux leaders sur serveurs chargés',
      'Moins efficace pour déverrouiller Netflix et streaming',
      'Interface moins intuitive pour les néophytes',
    ],
    servers: 8900,
    countries: 112,
    connections: 10,
    guarantee: 30,
    monthlyPrice: 9.99,
    bestPrice: 4.99,
    bestPriceDuration: '1 an',
    affiliateUrl: '#',
    platforms: ['Windows', 'Mac', 'Linux', 'Android', 'iOS', 'Routeur'],
  },
]

// ─── Cas d'usage ─────────────────────────────────────────────────────────────

export type UseCaseKey =
  | 'netflix'
  | 'torrents'
  | 'gaming'
  | 'iptv'
  | 'streaming'
  | 'android'
  | 'iphone'

export type UseCase = {
  label: string
  h1: string
  metaTitle: string
  metaDescription: string
  intro: string
  ranking: string[]
}

export const USE_CASES: Record<UseCaseKey, UseCase> = {
  netflix: {
    label: 'Netflix',
    h1: 'Meilleur VPN pour Netflix en 2026',
    metaTitle: 'Meilleur VPN pour Netflix en 2026 — Comparatif & Test',
    metaDescription:
      'Quel VPN débloque vraiment Netflix US, UK et Canada ? Notre comparatif mis à jour teste la vitesse 4K, la compatibilité streaming et le rapport qualité/prix.',
    intro:
      "Netflix bloque activement la majorité des VPN depuis 2016. Seuls quelques services maintiennent un accès stable aux catalogues étrangers — et parmi eux, les différences de vitesse pour le 4K sont déterminantes pour l'expérience.",
    ranking: ['nordvpn', 'expressvpn', 'surfshark', 'cyberghost', 'protonvpn'],
  },
  torrents: {
    label: 'Torrents',
    h1: 'Meilleur VPN pour les Torrents en 2026',
    metaTitle: 'Meilleur VPN pour Torrents en 2026 — P2P & No-Log',
    metaDescription:
      'VPN torrents : vitesse P2P, kill switch fiable, no-log audité et serveurs dédiés. Notre comparatif pour télécharger en toute sécurité.',
    intro:
      "Le téléchargement BitTorrent expose votre IP publique à tous les participants du swarm. Un bon VPN P2P doit combiner vitesse élevée, kill switch fiable et politique no-log auditée — sans quoi la protection reste purement théorique.",
    ranking: ['protonvpn', 'nordvpn', 'surfshark', 'cyberghost', 'expressvpn'],
  },
  gaming: {
    label: 'Gaming',
    h1: 'Meilleur VPN pour le Gaming en 2026',
    metaTitle: 'Meilleur VPN Gaming en 2026 — Ping, DDoS & Sorties Anticipées',
    metaDescription:
      'Réduisez votre ping, protégez-vous des attaques DDoS et accédez aux sorties anticipées. Notre comparatif VPN gaming axé sur la latence et la stabilité.',
    intro:
      "En gaming compétitif, chaque milliseconde compte. Un VPN peut réduire le ping en empruntant des routes réseau plus directes, protéger contre les attaques DDoS en ranked, ou déverrouiller les sorties anticipées depuis d'autres régions.",
    ranking: ['surfshark', 'nordvpn', 'expressvpn', 'cyberghost', 'protonvpn'],
  },
  iptv: {
    label: 'IPTV',
    h1: "Meilleur VPN pour l'IPTV en 2026",
    metaTitle: "Meilleur VPN pour l'IPTV en 2026 — Sans Buffering HD/4K",
    metaDescription:
      "VPN IPTV : débits stables pour le streaming HD/4K, contournement des DPI, sans coupures. Comparatif testé sur les principales offres IPTV.",
    intro:
      "L'IPTV exige des débits stables et élevés en continu. Un VPN adapté doit contourner les analyses Deep Packet Inspection de certains FAI tout en maintenant des vitesses suffisantes pour la 4K sans coupures ni buffering.",
    ranking: ['nordvpn', 'cyberghost', 'surfshark', 'expressvpn', 'protonvpn'],
  },
  streaming: {
    label: 'Streaming',
    h1: 'Meilleur VPN pour le Streaming en 2026',
    metaTitle: 'Meilleur VPN Streaming en 2026 — Disney+, Prime, HBO Max',
    metaDescription:
      'Débloquez Disney+, Amazon Prime Video, HBO Max et les catalogues étrangers. Comparatif VPN streaming avec tests de vitesse 4K.',
    intro:
      "Au-delà de Netflix, les catalogues de Disney+, Amazon Prime ou HBO Max varient considérablement selon les pays. Un VPN streaming doit maintenir des vitesses 4K tout en contournant des systèmes de détection anti-VPN de plus en plus sophistiqués.",
    ranking: ['nordvpn', 'expressvpn', 'surfshark', 'cyberghost', 'protonvpn'],
  },
  android: {
    label: 'Android',
    h1: 'Meilleur VPN pour Android en 2026',
    metaTitle: 'Meilleur VPN Android en 2026 — Léger, Rapide & Kill Switch',
    metaDescription:
      "VPN Android : applications légères, Kill Switch mobile, faible impact batterie. Comparatif pour smartphones et tablettes Android.",
    intro:
      "Sur Android, un bon VPN doit être léger sur la batterie, proposer un kill switch fonctionnel en arrière-plan, et une interface adaptée à l'écran tactile. La stabilité lors des transitions WiFi/4G est également clé.",
    ranking: ['surfshark', 'nordvpn', 'expressvpn', 'cyberghost', 'protonvpn'],
  },
  iphone: {
    label: 'iPhone',
    h1: 'Meilleur VPN pour iPhone en 2026',
    metaTitle: 'Meilleur VPN iPhone en 2026 — iOS & iPad, VPN on-demand',
    metaDescription:
      "Les meilleurs VPN iOS pour iPhone et iPad : intégration système native, VPN on-demand et confidentialité maximale sur Apple.",
    intro:
      "iOS impose ses propres contraintes aux VPN : les protocoles disponibles, la gestion de l'arrière-plan et l'intégration aux réglages système varient sensiblement d'Android. Les meilleurs VPN iPhone proposent un mode VPN à la demande et une implémentation WireGuard ou IKEv2 soignée.",
    ranking: ['expressvpn', 'nordvpn', 'surfshark', 'protonvpn', 'cyberghost'],
  },
}

export const USE_CASE_KEYS = Object.keys(USE_CASES) as UseCaseKey[]
