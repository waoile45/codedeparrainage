import type { Metadata } from 'next'

// /v2 est une maquette avec des données fictives (compteurs, bonus inventés) :
// noindex strict pour ne jamais la laisser entrer dans l'index.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default function V2Layout({ children }: { children: React.ReactNode }) {
  return children
}
