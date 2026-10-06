import type { Metadata } from 'next'

// Le forum n'a pas encore de contenu réel (tables forum_* absentes en base) :
// hors index tant qu'il n'héberge pas de vraies discussions. Retirer le
// `robots` ci-dessous une fois les tables créées et les premiers posts publiés.
export const metadata: Metadata = {
  title: 'Communauté',
  description: 'Questions et retours d\'expérience sur les codes de parrainage.',
  robots: { index: false, follow: true },
}

export default function ForumLayout({ children }: { children: React.ReactNode }) {
  return children
}
