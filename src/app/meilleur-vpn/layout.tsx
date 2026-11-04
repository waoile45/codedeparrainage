import type { Metadata } from 'next'

// Comparatifs d'affiliation hors du sujet du site (codes de parrainage) : ce
// sont les pages les plus exposées aux règles anti-spam de Google (spam update
// d'août 2026). Gardées pour les visiteurs, retirées de l'index et du sitemap.
export const metadata: Metadata = {
  robots: { index: false, follow: true },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
