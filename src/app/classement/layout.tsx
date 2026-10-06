import type { Metadata } from 'next'

// La page est un client component : ses métadonnées vivent ici.
export const metadata: Metadata = {
  title: 'Classement des parrains',
  description:
    'Les membres qui publient le plus de codes de parrainage et reçoivent les meilleurs avis. Classement mis à jour en continu à partir des XP gagnés sur le site.',
  alternates: { canonical: 'https://www.codedeparrainage.com/classement' },
}

export default function ClassementLayout({ children }: { children: React.ReactNode }) {
  return children
}
