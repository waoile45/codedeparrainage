import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'FAQ : XP, badges, classement et publication de codes',
  description:
    'Comment gagner des XP, publier ou modifier un code de parrainage, booster une annonce et monter dans le classement de codedeparrainage.com.',
  alternates: { canonical: 'https://www.codedeparrainage.com/faq' },
}

export default function FaqLayout({ children }: { children: React.ReactNode }) {
  return children
}
