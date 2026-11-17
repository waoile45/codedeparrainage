# Direction artistique — refonte de codedeparrainage.com

Branche `refonte/design`, partie de la prod (`main` 3168223). Même niveau de soin
qu'amfexpert.com, avec une identité propre : on reprend la méthode, pas le style.

- **Le métier et le lecteur** : une plateforme où des particuliers partagent leurs
  codes de parrainage. Le lecteur arrive de Google en tapant « code parrainage
  Fortuneo » juste avant d'ouvrir un compte (banque en ligne, paris sportifs,
  cashback) ; il a 20 à 40 ans et veut la prime sans perdre de temps. Le second
  lecteur est le parrain qui veut faire circuler son code.
- **L'impression voulue** : franc, rapide, réglo.
- **Palette** : le jaune des étiquettes promo comme seul accent, `#FFD43B`, toujours
  en aplat (bouton, ticket de code, surlignage) avec du texte encre dessus, jamais
  en texte sur fond clair. Papier `#FAF8F3`, encre `#141414`, gris chauds pour le
  secondaire. Thème sombre conservé : noir chaud `#121211`, le jaune reste le même.
  Couleurs sémantiques à part : vert `#1E7A4C` pour une prime, rouge `#B42318` pour
  une erreur. Fin du violet, du bleu nuit, des particules et de la grille en fond.
- **Typographies** : Archivo en largeur étendue et très grasse pour les titres (la
  famille des étiquettes de prix et des tickets), Hanken Grotesk pour le texte.
  Une police à chasse fixe (IBM Plex Mono) uniquement pour la chaîne d'un code à
  recopier, pour distinguer 0 et O, 1 et I. Chiffres tabulaires pour les montants.
- **La scène signature : le trajet d'un code.** En haut de l'accueil, une
  démonstration qui joue seule : la recherche Google, la fiche du code sur le site,
  le clic sur « Copier », le champ « code parrain » du formulaire d'ouverture qui se
  remplit lettre par lettre, puis la prime qui tombe. Marque et montant lus en base
  au rendu (une marque qui a un vrai code et une prime renseignée), bouton pause,
  arrêt hors écran et quand l'onglet est caché.

## Périmètre de la prévisualisation

1. **Le socle** : palette claire et sombre, polices, barre du haut fixe, pied de
   page, boutons, champs. Comme toutes les pages lisent déjà les mêmes variables
   CSS, la nouvelle palette s'applique partout, y compris aux pages connectées.
2. **L'accueil**, refait entièrement : une idée par écran, grands titres alignés à
   gauche, la scène signature, les marques les plus actives, les catégories, la FAQ.
3. **La page marque** `/code-parrainage/[slug]`, celle où arrive Google : le code en
   grand, la prime, le bouton copier, puis les autres codes.
4. **L'annuaire** `/codes` et les **pages catégorie**, restylés.

Les pages connectées (profil, publier, boost, crédits, messages, admin) prennent la
nouvelle palette et les polices, sans refonte de mise en page dans cette étape.

## Ce qu'on n'affiche pas

Aucun chiffre qui ne sorte de la base au rendu (nombre de codes, de parrains, de
marques). Pas de « code vérifié » tant que la vérification n'existe pas, pas d'avis
inventés, pas de note sur 5. Sur les marques de paris sportifs, le message de mise
en garde obligatoire (« Jouer comporte des risques… 09 74 75 13 13 »).

## Mouvement

Apparitions douces au défilement (IntersectionObserver, état final visible sans
JavaScript), la démonstration du haut déclenchée par le temps, pas par le
défilement. Seuls `transform` et `opacity` sont animés, `prefers-reduced-motion`
coupe tout. Polices préchargées par `next/font`.

## Hors de cette branche

`fix/publier-marque` (publier depuis une page marque, correctif de redirection
ouverte) n'est pas incluse : elle partira de son côté, les conflits éventuels seront
réglés à la fusion.
