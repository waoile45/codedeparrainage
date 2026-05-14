import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import BanqueComparatif from '../BanqueComparatif'
import { BANQUE_LIST, BANQUE_CAS, BANQUE_CAS_KEYS, BanqueCasKey } from '@/data/comparatifs/banque'

type Props = { params: Promise<{ cas: string }> }

export async function generateStaticParams() {
  return BANQUE_CAS_KEYS.map((cas) => ({ cas }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { cas } = await params
  const useCase = BANQUE_CAS[cas as BanqueCasKey]
  if (!useCase) return { title: 'Comparatif banque introuvable' }

  return {
    title: useCase.metaTitle,
    description: useCase.metaDescription,
    alternates: { canonical: `https://www.codedeparrainage.com/meilleure-banque/${cas}` },
    openGraph: {
      title: useCase.metaTitle,
      description: useCase.metaDescription,
      url: `https://www.codedeparrainage.com/meilleure-banque/${cas}`,
      type: 'article',
    },
  }
}

export default async function BanqueCasPage({ params }: Props) {
  const { cas } = await params
  const useCase = BANQUE_CAS[cas as BanqueCasKey]
  if (!useCase) notFound()

  const orderedBanques = useCase.ranking
    .map((id) => BANQUE_LIST.find((b) => b.id === id))
    .filter(Boolean) as typeof BANQUE_LIST

  return (
    <BanqueComparatif
      banques={orderedBanques}
      h1={useCase.h1}
      intro={useCase.intro}
      currentCas={cas as BanqueCasKey}
      canonicalPath={`/meilleure-banque/${cas}`}
    />
  )
}
