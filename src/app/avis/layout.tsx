import type { Metadata } from 'next'

// Page-formulaire (donner son avis sur le site) : sans intérêt pour l'index.
export const metadata: Metadata = {
  title: 'Ton avis sur le site',
  robots: { index: false, follow: true },
}

export default function AvisLayout({ children }: { children: React.ReactNode }) {
  return children
}
