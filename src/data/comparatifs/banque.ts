export type BanqueScores = {
  frais: number
  international: number
  fonctionnalites: number
  support: number
  bonus: number
}

export type BanqueEntry = {
  id: string
  name: string
  domain: string
  tagline: string
  description: string
  score: number
  scores: BanqueScores
  pros: string[]
  cons: string[]
  fraisMensuels: string
  paysDisponibles: number
  bonusBienvenue: string
  garantieDepots: string
  affiliateUrl: string
  badge?: string
  type: 'néobanque' | 'banque en ligne'
}

// ─── Données banques ──────────────────────────────────────────────────────────
// Pour ajouter vos liens d'affiliation, remplacez '#' par votre lien.

export const BANQUE_LIST: BanqueEntry[] = [
  {
    id: 'revolut',
    name: 'Revolut',
    domain: 'revolut.com',
    tagline: 'La néobanque tout-en-un, idéale pour les voyageurs',
    description:
      "Revolut s'est imposée comme la néobanque la plus complète du marché avec plus de 45 millions d'utilisateurs dans le monde. Son point fort est indiscutable : les paiements et retraits en devises étrangères au taux interbancaire réel, sans frais cachés. La version standard est gratuite et suffit pour la majorité des usages. Les abonnements Premium et Metal ajoutent des assurances voyage, du cashback et un support prioritaire.",
    score: 9.5,
    scores: {
      frais: 9.5,
      international: 9.9,
      fonctionnalites: 9.7,
      support: 8.5,
      bonus: 8.5,
    },
    pros: [
      'Taux de change interbancaire sur 150+ devises',
      'Compte multi-devises en un clic',
      'Crypto, actions et métaux précieux intégrés',
      'Assurance voyage incluse dès Premium',
      'Virements instantanés entre utilisateurs Revolut',
    ],
    cons: [
      'Support client limité en version gratuite',
      'Plafond de retrait gratuit en devises (200€/mois en standard)',
    ],
    fraisMensuels: '0€ (standard)',
    paysDisponibles: 150,
    bonusBienvenue: 'Variable selon offres',
    garantieDepots: '100 000€ (FSCS)',
    affiliateUrl: '#',
    badge: 'Meilleure pour les voyages',
    type: 'néobanque',
  },
  {
    id: 'wise',
    name: 'Wise',
    domain: 'wise.com',
    tagline: 'Le meilleur pour les virements internationaux et les freelances',
    description:
      "Wise (anciennement TransferWise) a révolutionné les transferts d'argent internationaux en proposant le taux de change réel — le même que celui affiché sur Google — avec des frais transparents affichés avant confirmation. Pour les freelances et les indépendants qui facturent à l'étranger, Wise est sans équivalent : tu obtiens un IBAN local dans 10 pays (France, UK, USA, Australie...) sans ouvrir de compte dans chacun.",
    score: 9.3,
    scores: {
      frais: 9.0,
      international: 9.9,
      fonctionnalites: 9.0,
      support: 8.5,
      bonus: 7.5,
    },
    pros: [
      'Taux de change réel (zéro marge sur le taux)',
      'IBAN local dans 10 pays pour recevoir des paiements',
      'Carte multi-devises disponible dans 170 pays',
      'Frais affichés avant confirmation — aucune surprise',
      'Idéal pour facturer des clients étrangers',
    ],
    cons: [
      'Frais par transaction (0,4–2% selon la devise)',
      'Pas de découvert ni de crédit',
    ],
    fraisMensuels: '0€',
    paysDisponibles: 170,
    bonusBienvenue: 'Offre parrainage variable',
    garantieDepots: 'Fonds ségrégués (non bancaire)',
    affiliateUrl: '#',
    badge: 'Meilleure pour les freelances',
    type: 'néobanque',
  },
  {
    id: 'n26',
    name: 'N26',
    domain: 'n26.com',
    tagline: 'La néobanque la plus simple à utiliser au quotidien',
    description:
      "N26 est la néobanque allemande qui a popularisé le concept de compte bancaire 100% mobile en Europe. Son interface est la plus épurée du marché — ouverture de compte en moins de 8 minutes, aucun document à envoyer par courrier. La version standard est gratuite et inclut une carte Mastercard. Les notifications en temps réel, l'espace épargne intégré (Spaces) et la catégorisation automatique des dépenses en font un excellent choix pour gérer son budget au quotidien.",
    score: 9.0,
    scores: {
      frais: 9.2,
      international: 8.8,
      fonctionnalites: 8.7,
      support: 8.5,
      bonus: 8.0,
    },
    pros: [
      'Ouverture de compte en moins de 8 minutes',
      'Interface la plus intuitive du marché',
      'Spaces : sous-comptes épargne intégrés',
      'Notifications instantanées à chaque transaction',
      'Carte Mastercard gratuite dès la version standard',
    ],
    cons: [
      'Support uniquement par chat (pas de téléphone en standard)',
      'Moins de fonctionnalités avancées que Revolut',
    ],
    fraisMensuels: '0€ (standard)',
    paysDisponibles: 24,
    bonusBienvenue: 'Offres ponctuelles parrainage',
    garantieDepots: '100 000€ (Fonds de garantie allemand)',
    affiliateUrl: '#',
    type: 'néobanque',
  },
  {
    id: 'boursobank',
    name: 'Boursobank',
    domain: 'boursobank.com',
    tagline: 'La banque en ligne française n°1, avec les meilleurs bonus parrainage',
    description:
      "Boursobank (anciennement Boursorama Banque) est la banque en ligne la plus choisie en France avec plus de 7 millions de clients. Contrairement aux néobanques, c'est une vraie banque qui propose l'ensemble des services : compte courant, livret A, PEA, crédit immobilier, assurance vie. Son programme de parrainage est le plus généreux du marché avec des bonus pouvant atteindre 240€ selon les offres en cours. Le compte est gratuit sous conditions d'utilisation.",
    score: 8.8,
    scores: {
      frais: 9.5,
      international: 7.5,
      fonctionnalites: 9.0,
      support: 8.8,
      bonus: 9.8,
    },
    pros: [
      'Jusqu\'à 240€ de bonus parrainage selon les offres',
      'Banque complète : épargne, bourse, crédit, assurance vie',
      'PEA et compte-titres sans frais de tenue',
      'Application mobile très bien notée',
      'Compte gratuit (sous conditions de revenus ou d\'utilisation)',
    ],
    cons: [
      'Moins performante pour les paiements en devises étrangères',
      'Conditions d\'accès à la gratuité parfois contraignantes',
    ],
    fraisMensuels: '0€ (sous conditions)',
    paysDisponibles: 30,
    bonusBienvenue: 'Jusqu\'à 240€',
    garantieDepots: '100 000€ (FGDR France)',
    affiliateUrl: '#',
    badge: 'Meilleur bonus parrainage',
    type: 'banque en ligne',
  },
  {
    id: 'fortuneo',
    name: 'Fortuneo',
    domain: 'fortuneo.fr',
    tagline: 'La référence pour investir en bourse sans frais',
    description:
      "Fortuneo est la banque en ligne du groupe Crédit Mutuel Arkéa, spécialisée dans l'investissement. Elle propose le PEA (Plan d'Épargne en Actions) et le compte-titres avec les frais de courtage les plus compétitifs du marché pour les investisseurs réguliers. La carte Mastercard World Elite — normalement réservée aux clients premium dans d'autres banques — est accessible gratuitement sous conditions. Son programme de parrainage offre environ 80€ par filleul.",
    score: 8.6,
    scores: {
      frais: 9.0,
      international: 8.0,
      fonctionnalites: 9.5,
      support: 8.5,
      bonus: 8.5,
    },
    pros: [
      'Frais de courtage parmi les plus bas du marché',
      'PEA et compte-titres complets',
      'Carte Mastercard World Elite gratuite (sous conditions)',
      'Livret d\'épargne compétitif',
      'Appartient au groupe Crédit Mutuel Arkéa (solide)',
    ],
    cons: [
      'Moins adaptée pour les voyages et le multi-devises',
      'Interface moins moderne que les néobanques',
    ],
    fraisMensuels: '0€ (sous conditions)',
    paysDisponibles: 30,
    bonusBienvenue: '~80€',
    garantieDepots: '100 000€ (FGDR France)',
    affiliateUrl: '#',
    badge: 'Meilleure pour investir',
    type: 'banque en ligne',
  },
  {
    id: 'sumeria',
    name: 'Sumeria (Lydia)',
    domain: 'sumeria.money',
    tagline: 'La néobanque 100% française avec livret à 4%',
    description:
      "Sumeria est la nouvelle version bancaire de Lydia, l'application de paiement entre amis la plus populaire en France. 100% française et réglementée par l'ACPR, elle propose un compte courant gratuit avec un livret d'épargne rémunéré jusqu'à 4% brut — l'un des meilleurs taux sans condition du marché. Simple d'accès, sans conditions de revenus ni d'utilisation, c'est l'option idéale pour les étudiants et les jeunes actifs qui veulent démarrer sans prise de tête.",
    score: 8.3,
    scores: {
      frais: 9.5,
      international: 7.5,
      fonctionnalites: 8.0,
      support: 8.0,
      bonus: 7.5,
    },
    pros: [
      '100% française, régulée par l\'ACPR',
      'Livret d\'épargne jusqu\'à 4% brut sans conditions',
      'Aucune condition de revenus ni d\'utilisation',
      'Envoi d\'argent instantané entre contacts',
      'Carte virtuelle disponible immédiatement',
    ],
    cons: [
      'Moins de fonctionnalités que Revolut pour les voyages',
      'Programme de parrainage moins généreux que Boursobank',
    ],
    fraisMensuels: '0€',
    paysDisponibles: 30,
    bonusBienvenue: 'Offres parrainage variables',
    garantieDepots: '100 000€ (FGDR France)',
    affiliateUrl: '#',
    type: 'néobanque',
  },
]

// ─── Cas d'usage ──────────────────────────────────────────────────────────────

export type BanqueCasKey =
  | 'freelance'
  | 'voyageurs'
  | 'etudiants'
  | 'trading'
  | 'sans-frais'

export type BanqueCas = {
  label: string
  h1: string
  metaTitle: string
  metaDescription: string
  intro: string
  ranking: string[]
}

export const BANQUE_CAS: Record<BanqueCasKey, BanqueCas> = {
  freelance: {
    label: 'Freelance',
    h1: 'Meilleure banque pour Freelance en 2026',
    metaTitle: 'Meilleure banque pour Freelance en 2026 — Comparatif',
    metaDescription:
      'Quelle banque choisir quand on est freelance ou indépendant ? IBAN multi-pays, virements internationaux, facturation étrangère. Notre comparatif 2026.',
    intro:
      "En tant que freelance, vos besoins bancaires sont spécifiques : recevoir des paiements depuis l'étranger sans perdre sur le change, disposer d'un IBAN reconnu internationalement, et garder des frais raisonnables sur les virements entrants. Les banques traditionnelles sont souvent inadaptées — voici les meilleures alternatives.",
    ranking: ['wise', 'revolut', 'n26', 'boursobank', 'fortuneo', 'sumeria'],
  },
  voyageurs: {
    label: 'Voyageurs',
    h1: 'Meilleure banque pour les Voyageurs en 2026',
    metaTitle: 'Meilleure banque pour Voyager en 2026 — Sans frais à l\'étranger',
    metaDescription:
      'Payez et retirez à l\'étranger sans frais. Notre comparatif des meilleures banques pour voyager : taux de change, retraits gratuits, assurance voyage.',
    intro:
      "Les frais bancaires à l'étranger peuvent vite chiffrer : commission de change, frais de retrait, surprime sur le taux... Un voyageur régulier peut économiser plusieurs centaines d'euros par an en choisissant la bonne banque. Voici celles qui ne vous ponctionnent pas hors de France.",
    ranking: ['revolut', 'wise', 'n26', 'fortuneo', 'boursobank', 'sumeria'],
  },
  etudiants: {
    label: 'Étudiants',
    h1: 'Meilleure banque pour Étudiants en 2026',
    metaTitle: 'Meilleure banque pour Étudiants en 2026 — Gratuite & Sans conditions',
    metaDescription:
      'Banque gratuite sans condition de revenus pour les étudiants. Notre comparatif des meilleures offres bancaires étudiantes en 2026.',
    intro:
      "Pour un étudiant, le critère numéro un est simple : zéro frais, zéro condition de revenus. Les néobanques ont rendu cela possible — mais toutes ne se valent pas en termes de fiabilité, de fonctionnalités et de facilité d'utilisation au quotidien.",
    ranking: ['n26', 'sumeria', 'revolut', 'boursobank', 'wise', 'fortuneo'],
  },
  trading: {
    label: 'Trading',
    h1: 'Meilleure banque pour Investir et Trader en 2026',
    metaTitle: 'Meilleure banque pour Investir en Bourse en 2026 — PEA & Courtage',
    metaDescription:
      'PEA, compte-titres, ETF sans frais : notre comparatif des meilleures banques pour investir en bourse en 2026.',
    intro:
      "Pour investir en bourse en France, le choix de la banque impacte directement votre rendement : les frais de courtage, la qualité de l'interface de trading et la disponibilité du PEA font des différences significatives sur le long terme. Voici le classement 2026.",
    ranking: ['fortuneo', 'boursobank', 'revolut', 'n26', 'wise', 'sumeria'],
  },
  'sans-frais': {
    label: 'Sans frais',
    h1: 'Meilleure banque Gratuite en 2026',
    metaTitle: 'Meilleure banque Gratuite en 2026 — 0€ par mois',
    metaDescription:
      'Banque vraiment gratuite : sans frais cachés, sans condition de revenus. Notre classement des meilleures banques à 0€ en 2026.',
    intro:
      "Une banque gratuite ne devrait pas avoir de frais cachés — ni frais de tenue de compte, ni commission sur les paiements courants, ni pénalités pour solde insuffisant. Voici celles qui tiennent vraiment cette promesse en 2026.",
    ranking: ['sumeria', 'n26', 'revolut', 'boursobank', 'wise', 'fortuneo'],
  },
}

export const BANQUE_CAS_KEYS = Object.keys(BANQUE_CAS) as BanqueCasKey[]
