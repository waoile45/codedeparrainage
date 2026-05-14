import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import VpnComparatif from '../VpnComparatif'
import { VPN_LIST, USE_CASES, USE_CASE_KEYS, UseCaseKey } from '@/data/comparatifs/vpn'

type Props = { params: Promise<{ cas: string }> }

export async function generateStaticParams() {
  return USE_CASE_KEYS.map((cas) => ({ cas }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { cas } = await params
  const useCase = USE_CASES[cas as UseCaseKey]
  if (!useCase) return { title: 'Comparatif VPN introuvable' }

  return {
    title: useCase.metaTitle,
    description: useCase.metaDescription,
    alternates: { canonical: `https://www.codedeparrainage.com/meilleur-vpn/${cas}` },
    openGraph: {
      title: useCase.metaTitle,
      description: useCase.metaDescription,
      url: `https://www.codedeparrainage.com/meilleur-vpn/${cas}`,
      type: 'article',
    },
  }
}

export default async function VpnUseCasePage({ params }: Props) {
  const { cas } = await params
  const useCase = USE_CASES[cas as UseCaseKey]
  if (!useCase) notFound()

  const orderedVpns = useCase.ranking
    .map((id) => VPN_LIST.find((v) => v.id === id))
    .filter(Boolean) as typeof VPN_LIST

  return (
    <VpnComparatif
      vpns={orderedVpns}
      h1={useCase.h1}
      intro={useCase.intro}
      currentCas={cas as UseCaseKey}
      canonicalPath={`/meilleur-vpn/${cas}`}
    />
  )
}
