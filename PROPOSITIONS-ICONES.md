# Propositions d'icônes — codedeparrainage.com

## Pourquoi changer

Aujourd'hui les catégories utilisent des **emojis** (`🏦 ₿ ⚽ 💸 ⚡ 📱 🛍️ 🛡️`).
Problèmes :
- **Rendu incohérent** : un emoji s'affiche différemment sur iPhone, Android, Windows,
  Mac. Tu ne contrôles ni la couleur, ni le style, ni l'épaisseur du trait.
- **Effet « template / généré »** : les emojis colorés en aplat sont l'un des
  marqueurs visuels les plus associés aux sites « vite faits ». 
- **Pas raccord avec ton identité** : ton site est sombre, violet, premium — les
  emojis cassent cette direction artistique.

La solution : un jeu d'icônes **au trait, monochrome, cohérent**, teinté avec ta
couleur de marque. Tu as déjà la librairie `lucide-react` installée → zéro
dépendance à ajouter.

---

## Correspondance proposée (catégories principales)

| Catégorie | Emoji actuel | Icône Lucide proposée | Pourquoi |
|---|---|---|---|
| Banque | 🏦 | `Landmark` | Le fronton à colonnes = code visuel universel d'une banque |
| Crypto | ₿ | `Bitcoin` | Symbole crypto reconnaissable, version dessinée propre |
| Paris sportifs | ⚽ | `Trophy` | Évoque le gain/la victoire plutôt qu'un seul sport (foot) |
| Cashback | 💸 | `PiggyBank` | L'idée d'« argent qui revient / économie », plus parlant que des billets qui s'envolent |
| Énergie | ⚡ | `Plug` (ou `Zap`) | `Plug` = fournisseur d'énergie (élec/gaz) ; `Zap` si tu veux garder l'éclair |
| Téléphonie | 📱 | `Smartphone` | Direct et neutre |
| Shopping | 🛍️ | `ShoppingBag` | Le sac, plus élégant que le caddie |
| Assurance | 🛡️ | `ShieldCheck` | Bouclier + coche = protection validée |

### Catégories secondaires (forum / filtres)

| Catégorie | Emoji actuel | Icône Lucide proposée |
|---|---|---|
| Tout | ✦ | `LayoutGrid` (ou `Sparkles`) |
| Général | 💬 | `MessageCircle` |
| Astuce | 💡 | `Lightbulb` |
| Bourse | 📈 | `TrendingUp` (ou `LineChart`) |

---

## Palette de couleurs (à réutiliser, tu les as déjà définies)

Garde une couleur par catégorie, mais applique-la **au trait de l'icône** (pas en
fond plein). Tes couleurs actuelles sont bonnes :

```
Banque        #3b82f6   (bleu)
Crypto        #f59e0b   (ambre)
Paris         #10b981   (vert)
Cashback      #6366f1   (indigo)
Énergie       #ec4899   (rose)   → ou #f59e0b si tu passes sur l'éclair
Téléphonie    #8b5cf6   (violet)
Shopping      #14b8a6   (turquoise)
Assurance     #f97316   (orange)
```

Astuce design : icône au trait dans la couleur de la catégorie, sur une pastille
ronde du même ton à ~12 % d'opacité (`background: rgba(R,G,B,0.12)`). C'est
exactement le style « fintech premium » (Revolut, Qonto, Lydia).

---

## Code prêt à l'emploi

### 1. Centraliser dans UN seul fichier : `src/data/categories.ts`

> Actuellement les icônes sont dupliquées dans **5 fichiers**
> (`HomeClient.tsx`, `codes/CodesClient.tsx`, `publier/page.tsx`,
> `forum/page.tsx`, `forum/[id]/page.tsx`). Tout centraliser évite les oublis.

```ts
import {
  Landmark, Bitcoin, Trophy, PiggyBank, Plug,
  Smartphone, ShoppingBag, ShieldCheck, LayoutGrid,
  MessageCircle, Lightbulb, TrendingUp, type LucideIcon,
} from 'lucide-react'

export type CategoryMeta = {
  slug: string
  label: string
  Icon: LucideIcon
  color: string
}

export const CATEGORIES: Record<string, CategoryMeta> = {
  banque:     { slug: 'banque',     label: 'Banque',         Icon: Landmark,    color: '#3b82f6' },
  crypto:     { slug: 'crypto',     label: 'Crypto',         Icon: Bitcoin,     color: '#f59e0b' },
  paris:      { slug: 'paris',      label: 'Paris sportifs', Icon: Trophy,      color: '#10b981' },
  cashback:   { slug: 'cashback',   label: 'Cashback',       Icon: PiggyBank,   color: '#6366f1' },
  energie:    { slug: 'energie',    label: 'Énergie',        Icon: Plug,        color: '#ec4899' },
  telephonie: { slug: 'telephonie', label: 'Téléphonie',     Icon: Smartphone,  color: '#8b5cf6' },
  shopping:   { slug: 'shopping',   label: 'Shopping',       Icon: ShoppingBag, color: '#14b8a6' },
  assurance:  { slug: 'assurance',  label: 'Assurance',      Icon: ShieldCheck, color: '#f97316' },
}
```

### 2. Petit composant réutilisable : `src/components/CategoryIcon.tsx`

```tsx
import { CATEGORIES } from '@/data/categories'

export default function CategoryIcon({ slug, size = 20 }: { slug: string; size?: number }) {
  const cat = CATEGORIES[slug]
  if (!cat) return null
  const { Icon, color } = cat
  return (
    <span
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: size * 1.9, height: size * 1.9, borderRadius: '50%',
        background: `${color}1f`,        // ~12 % d'opacité
        border: `1px solid ${color}33`,
      }}
    >
      <Icon size={size} color={color} strokeWidth={2} />
    </span>
  )
}
```

### 3. Utilisation

```tsx
// Avant :  {CAT_ICONS[c]} {CAT_LABELS[c]}
// Après :
<CategoryIcon slug={c} /> {CATEGORIES[c]?.label}
```

---

## Fichiers à mettre à jour le jour où tu valides

1. `src/data/categories.ts` — **créer** (source unique)
2. `src/components/CategoryIcon.tsx` — **créer**
3. `src/app/HomeClient.tsx` — remplacer `CATEGORIES` + `TOP_CODES.icon`
4. `src/app/codes/CodesClient.tsx` — remplacer `CATEGORY_ICONS`
5. `src/app/publier/page.tsx` — remplacer `CAT_ICONS`
6. `src/app/forum/page.tsx` + `src/app/forum/[id]/page.tsx` — remplacer `CAT_ICONS`

> Note : pour les **logos d'entreprises** (Boursobank, Revolut…) tu utilises déjà
> les vrais favicons via Google — c'est parfait, ne touche pas à ça. Ces
> propositions concernent uniquement les **icônes de catégories**.
