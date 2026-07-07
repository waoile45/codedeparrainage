/**
 * Catégories éditoriales pour les hubs /code-parrainage/categorie/[categorie].
 *
 * ⚠️ La colonne companies.category en base est inexploitable (996 marques
 * mal étiquetées « banque », 1764 NULL) — le classement est donc curé ici,
 * à la main, comme les listes SEO_COMPANIES / COMPANY_LINKS existantes.
 * Les `brands` sont des url_slug vérifiés en base (marques actives ou avec
 * offre renseignée). Les montants/bonus ne sont JAMAIS écrits ici : ils
 * viennent de la base au rendu.
 */

export interface CategoryDef {
  slug: string
  label: string
  short: string
  title: string // <title> — sans le suffixe de template (absolute)
  metaDescription: string
  h1: string
  intro: string[]
  faq: { q: string; a: string }[]
  brands: string[] // url_slug vérifiés en base
}

export const CATEGORIES: CategoryDef[] = [
  {
    slug: 'banque',
    label: 'Banque & néobanques',
    short: 'Banque',
    title: 'Code parrainage banque 2026 : primes à l\'ouverture',
    metaDescription:
      'Codes parrainage banque en ligne et néobanques vérifiés : Revolut, BoursoBank, Fortuneo… Compare les primes de bienvenue et parraine-toi en 2 minutes.',
    h1: 'Codes parrainage banque & néobanques 2026',
    intro: [
      'Les banques en ligne sont le secteur où le parrainage rapporte le plus : la plupart versent une prime en euros au filleul comme au parrain dès l\'ouverture du compte. Le principe est simple : tu récupères un code (ou un lien) auprès d\'un parrain existant, tu l\'indiques dans le formulaire d\'inscription, et la prime est créditée une fois les conditions remplies (souvent un premier dépôt ou l\'activation de la carte).',
      'Ci-dessous, les banques et néobanques pour lesquelles notre communauté partage des codes. Les montants affichés viennent de notre base et sont vérifiés par les parrains eux-mêmes — vérifie toujours les conditions exactes sur le site de la banque avant de t\'inscrire.',
    ],
    faq: [
      {
        q: 'Comment fonctionne un parrainage bancaire ?',
        a: 'Tu t\'inscris avec le code ou le lien d\'un client existant. Une fois ton compte validé (dépôt minimum, activation de la carte…), la banque verse une prime au parrain et souvent au filleul aussi. Les conditions exactes varient selon chaque banque.',
      },
      {
        q: 'Peut-on cumuler un code parrainage avec une offre de bienvenue bancaire ?',
        a: 'En général, non : le parrainage remplace l\'offre de bienvenue standard. Compare les deux montants avant de choisir — le parrainage est souvent plus avantageux, mais pas toujours.',
      },
      {
        q: 'Le parrainage bancaire est-il vraiment gratuit ?',
        a: 'Oui. Utiliser un code parrainage ne coûte rien : c\'est la banque qui finance la prime pour recruter de nouveaux clients. Méfie-toi en revanche de toute personne qui te demande de payer pour un code.',
      },
    ],
    brands: [
      'revolut',
      'boursobank',
      'fortuneo',
      'hello-bank',
      'boursorama',
      'creditmutuel',
      'trade-republic',
      'cashbee',
      'lydia.app',
      'bankin',
      'deblock',
    ],
  },
  {
    slug: 'cashback',
    label: 'Cashback & applis rémunératrices',
    short: 'Cashback',
    title: 'Code parrainage cashback 2026 : iGraal, Poulpeo…',
    metaDescription:
      'Codes parrainage cashback vérifiés : iGraal, Poulpeo, TopCashback, Joko… Bonus de bienvenue à l\'inscription et argent récupéré sur tes achats en ligne.',
    h1: 'Codes parrainage cashback & applis rémunératrices 2026',
    intro: [
      'Les plateformes de cashback te reversent un pourcentage de tes achats en ligne. En t\'inscrivant avec un code parrainage, tu démarres généralement avec un bonus de bienvenue crédité directement sur ta cagnotte — et ton parrain touche une commission, sans rien te coûter.',
      'La communauté partage ici ses codes pour les principaux services de cashback, sondages rémunérés et applis qui paient. C\'est le secteur avec le plus de parrains actifs sur le site.',
    ],
    faq: [
      {
        q: 'Quel est l\'intérêt d\'un code parrainage cashback ?',
        a: 'Sans code, tu démarres avec une cagnotte vide. Avec un code parrainage, la plupart des plateformes créditent un bonus de bienvenue dès ton premier achat validé. C\'est le moyen le plus simple de démarrer gagnant.',
      },
      {
        q: 'Peut-on s\'inscrire sur plusieurs sites de cashback ?',
        a: 'Oui, rien ne l\'interdit — beaucoup d\'utilisateurs comparent les taux entre iGraal, Poulpeo ou TopCashback avant chaque achat. Tu peux utiliser un code parrainage différent sur chaque plateforme.',
      },
      {
        q: 'Quand la cagnotte de parrainage est-elle versée ?',
        a: 'Le bonus apparaît en « attente » à l\'inscription puis est confirmé après ton premier achat validé par le marchand, ce qui peut prendre de quelques jours à plusieurs semaines selon les plateformes.',
      },
    ],
    brands: [
      'igraal',
      'poulpeo',
      'topcashback',
      'letyshops',
      'widilo',
      'ebuyclub',
      'quidco',
      'shopmium',
      'joko',
      'wanteeed',
      'swagbucks',
      'freecash',
    ],
  },
  {
    slug: 'paris-sportifs',
    label: 'Paris sportifs',
    short: 'Paris sportifs',
    title: 'Code parrainage paris sportifs 2026 : Betclic, Winamax…',
    metaDescription:
      'Codes parrainage paris sportifs vérifiés : Betclic, Winamax, Unibet, PMU. Offres de bienvenue et freebets en t\'inscrivant avec le code d\'un parrain actif.',
    h1: 'Codes parrainage paris sportifs 2026',
    intro: [
      'Les bookmakers français récompensent le parrainage avec des freebets ou des paris remboursés. Le code s\'entre au moment de la création du compte — impossible de l\'ajouter après coup, donc choisis ton code avant de t\'inscrire.',
      'Rappel : les paris sportifs sont réservés aux plus de 18 ans et comportent des risques : endettement, isolement, dépendance. Pour être aidé, appelle le 09 74 75 13 13 (appel non surtaxé).',
    ],
    faq: [
      {
        q: 'Où entrer le code parrainage sur un site de paris sportifs ?',
        a: 'Le champ « code promo » ou « code parrain » apparaît dans le formulaire d\'inscription, avant la validation du compte. Une fois le compte créé, il est généralement impossible d\'ajouter un code rétroactivement.',
      },
      {
        q: 'Faut-il déposer de l\'argent pour toucher le bonus de parrainage ?',
        a: 'Dans la plupart des cas, oui : le bonus (freebets, pari remboursé) se déclenche après un premier dépôt ou un premier pari. Les conditions exactes sont fixées par chaque bookmaker.',
      },
      {
        q: 'Les codes parrainage paris sportifs sont-ils légaux ?',
        a: 'Oui, tant que l\'opérateur est agréé ANJ (Betclic, Winamax, Unibet, PMU le sont). Le parrainage est un dispositif officiel proposé par les bookmakers eux-mêmes.',
      },
    ],
    brands: ['betclic', 'winamax', 'unibet', 'pmu'],
  },
  {
    slug: 'crypto',
    label: 'Crypto & exchanges',
    short: 'Crypto',
    title: 'Code parrainage crypto 2026 : Binance, Coinbase…',
    metaDescription:
      'Codes parrainage crypto vérifiés : Binance, Coinbase, Waltio… Réduction de frais ou bonus à l\'inscription avec le code d\'un parrain de la communauté.',
    h1: 'Codes parrainage crypto & exchanges 2026',
    intro: [
      'Sur les plateformes crypto, le parrainage prend deux formes : une réduction permanente sur les frais de trading (le modèle Binance) ou un bonus ponctuel crédité à l\'inscription. Dans les deux cas, le code doit être renseigné à la création du compte.',
      'Investir dans les crypto-actifs comporte des risques de perte en capital. Les offres listées ici sont partagées par la communauté — vérifie toujours les conditions en vigueur sur la plateforme.',
    ],
    faq: [
      {
        q: 'Que rapporte un code parrainage crypto ?',
        a: 'Selon la plateforme : une réduction sur les frais de trading (souvent à vie) ou un bonus en crypto crédité après un premier achat. Le détail de chaque offre est affiché sur la page de la marque quand la donnée est vérifiée.',
      },
      {
        q: 'Peut-on ajouter un code parrainage après l\'inscription sur un exchange ?',
        a: 'Rarement. La quasi-totalité des exchanges exigent le code au moment de la création du compte. Si tu as déjà un compte, le parrainage ne s\'appliquera pas.',
      },
      {
        q: 'Les codes parrainage crypto sont-ils sans risque ?',
        a: 'Le code en lui-même, oui : il ne donne aucun accès à ton compte. En revanche, l\'investissement en crypto reste risqué et non garanti — n\'investis que ce que tu peux te permettre de perdre.',
      },
    ],
    brands: ['binance', 'coinbase', 'waltio', 'deblock'],
  },
  {
    slug: 'telephonie',
    label: 'Téléphonie & internet',
    short: 'Téléphonie',
    title: 'Code parrainage téléphonie 2026 : Free, SFR, RED…',
    metaDescription:
      'Codes parrainage forfaits mobile et box internet : Free Mobile, SFR, RED by SFR. Réductions sur la facture et mois offerts grâce au parrainage communautaire.',
    h1: 'Codes parrainage téléphonie & internet 2026',
    intro: [
      'Les opérateurs télécom récompensent le parrainage par des réductions sur facture ou des mois d\'abonnement offerts. C\'est l\'un des parrainages les plus simples : le code s\'applique à la souscription du forfait ou de la box.',
      'Retrouve ici les codes partagés par la communauté pour les principaux opérateurs français.',
    ],
    faq: [
      {
        q: 'Comment utiliser un code parrainage chez un opérateur mobile ?',
        a: 'Renseigne le code (ou l\'identifiant du parrain) dans le champ dédié lors de la souscription en ligne. La réduction apparaît ensuite directement sur tes factures suivantes.',
      },
      {
        q: 'Le parrainage télécom fonctionne-t-il en cas de portabilité du numéro ?',
        a: 'Oui : conserver son numéro via la portabilité n\'empêche pas d\'utiliser un code parrainage. Les deux dispositifs sont indépendants.',
      },
      {
        q: 'Combien de filleuls un abonné peut-il parrainer ?',
        a: 'Chaque opérateur fixe son plafond (souvent entre 5 et 10 filleuls actifs simultanément). Le parrain cumule les réductions tant que ses filleuls restent abonnés.',
      },
    ],
    brands: ['free', 'sfr', 'red-by-sfr'],
  },
  {
    slug: 'energie',
    label: 'Énergie',
    short: 'Énergie',
    title: 'Code parrainage énergie 2026 : EDF, Engie…',
    metaDescription:
      'Codes parrainage électricité et gaz : EDF, Engie, Hello Watt. Prime de bienvenue à la souscription d\'un contrat d\'énergie avec le code d\'un parrain vérifié.',
    h1: 'Codes parrainage énergie 2026',
    intro: [
      'Changer de fournisseur d\'électricité ou de gaz est gratuit, sans coupure et sans engagement — et avec un code parrainage, la souscription déclenche une prime pour le filleul comme pour le parrain.',
      'Les codes ci-dessous sont partagés par la communauté pour les fournisseurs d\'énergie et les services de comparaison.',
    ],
    faq: [
      {
        q: 'Comment se passe un parrainage chez un fournisseur d\'énergie ?',
        a: 'Tu indiques le code ou la référence client du parrain au moment de la souscription du contrat. La prime est ensuite versée (en euros ou en remise sur facture) une fois le contrat actif.',
      },
      {
        q: 'Peut-on utiliser un code parrainage en déménageant ?',
        a: 'Oui, un déménagement est même le moment idéal : tu souscris un nouveau contrat de toute façon, autant le faire avec un code parrainage pour toucher la prime.',
      },
      {
        q: 'Le parrainage énergie engage-t-il sur la durée ?',
        a: 'Non. Les contrats d\'énergie résidentiels sont sans engagement en France : tu peux changer de fournisseur à tout moment, même après avoir touché une prime de parrainage.',
      },
    ],
    brands: ['edf', 'engie', 'hello-watt'],
  },
  {
    slug: 'shopping',
    label: 'Shopping & e-commerce',
    short: 'Shopping',
    title: 'Code parrainage shopping 2026 : Vinted, Temu, AliExpress…',
    metaDescription:
      'Codes parrainage shopping vérifiés : Vinted, Temu, AliExpress, Veepee… Bons d\'achat et réductions de bienvenue en t\'inscrivant avec le code d\'un membre.',
    h1: 'Codes parrainage shopping & e-commerce 2026',
    intro: [
      'Les sites e-commerce utilisent le parrainage pour attirer de nouveaux clients : bons d\'achat, réductions sur la première commande ou crédits offerts. Le code s\'applique à l\'inscription ou au moment du premier achat selon les enseignes.',
      'Voici les marques shopping pour lesquelles la communauté partage actuellement des codes.',
    ],
    faq: [
      {
        q: 'Où entrer un code parrainage sur un site de shopping ?',
        a: 'Selon l\'enseigne : dans le formulaire de création de compte, ou dans le champ « code promo » du panier lors de la première commande. La page de chaque marque précise le fonctionnement quand l\'info est disponible.',
      },
      {
        q: 'Un code parrainage shopping est-il cumulable avec les promos ?',
        a: 'Ça dépend des enseignes : certaines acceptent le cumul avec les soldes, d\'autres limitent à un seul code par commande. En cas de doute, teste le code au panier avant de payer.',
      },
      {
        q: 'Les codes parrainage expirent-ils ?',
        a: 'Le code d\'un parrain reste généralement valable tant que son compte est actif, mais l\'offre de bienvenue associée peut changer. Nos parrains mettent à jour leurs annonces — la date de dernière activité est affichée sur chaque page.',
      },
    ],
    brands: ['vinted', 'temu', 'aliexpress', 'veepee', 'eneba', 'zavvi', 'autodoc', 'xiaomi'],
  },
  {
    slug: 'mobilite',
    label: 'Covoiturage & mobilité',
    short: 'Mobilité',
    title: 'Code parrainage covoiturage 2026 : BlaBlaCar, Klaxit…',
    metaDescription:
      'Codes parrainage covoiturage et mobilité : BlaBlaCar, BlaBlaCar Daily, Klaxit… Crédits de trajet offerts à l\'inscription avec le code d\'un membre.',
    h1: 'Codes parrainage covoiturage & mobilité 2026',
    intro: [
      'Les applis de covoiturage et de mobilité créditent des bons de trajet ou des primes quand tu t\'inscris via un parrainage. Les applis de covoiturage domicile-travail (BlaBlaCar Daily, Klaxit) sont particulièrement généreuses car souvent subventionnées par les employeurs et collectivités.',
      'Les codes ci-dessous sont partagés par des membres actifs de la communauté.',
    ],
    faq: [
      {
        q: 'Comment fonctionne le parrainage sur les applis de covoiturage ?',
        a: 'Tu crées ton compte avec le code d\'un parrain, puis le bonus (crédit de trajet ou prime) se débloque après ton premier trajet effectué en tant que conducteur ou passager selon l\'appli.',
      },
      {
        q: 'Le parrainage covoiturage est-il réservé aux conducteurs ?',
        a: 'Non : la plupart des applis récompensent aussi les passagers. Certaines offres sont même plus intéressantes pour les passagers réguliers domicile-travail.',
      },
      {
        q: 'Peut-on parrainer des collègues sur les applis domicile-travail ?',
        a: 'Oui, c\'est même l\'usage principal : les applis comme Klaxit ou BlaBlaCar Daily encouragent le parrainage entre collègues qui partagent le même trajet quotidien.',
      },
    ],
    brands: ['blablacar', 'daily.blablacar', 'klaxit', 'macadam.app', 'moovance'],
  },
]

export const CATEGORY_BY_SLUG: Record<string, CategoryDef> = Object.fromEntries(
  CATEGORIES.map((c) => [c.slug, c])
)

/** Catégorie curée d'une marque (url_slug), ou null si non classée. */
export function getCategoryForBrand(urlSlug: string): CategoryDef | null {
  for (const cat of CATEGORIES) {
    if (cat.brands.includes(urlSlug)) return cat
  }
  return null
}
