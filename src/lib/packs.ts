// Packs de crédits vendus. Source unique du prix : le checkout crée la session
// Stripe avec ces montants, le webhook vérifie que le montant payé correspond.
export const PACKS = [
  { credits: 5,   price: 500  },  // 5 €
  { credits: 20,  price: 1900 },  // 19 €
  { credits: 50,  price: 4500 },  // 45 €
  { credits: 100, price: 8000 },  // 80 €
  { credits: 300, price: 21000 }, // 210 €
] as const

export function prixAttendu(credits: number): number | null {
  return PACKS.find((p) => p.credits === credits)?.price ?? null
}
