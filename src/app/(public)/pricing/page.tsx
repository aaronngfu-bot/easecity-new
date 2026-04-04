import type { Metadata } from 'next'
import { PricingHero } from '@/components/pricing/PricingHero'
import { PricingCards } from '@/components/pricing/PricingCards'
import { PricingFAQ } from '@/components/pricing/PricingFAQ'

export const metadata: Metadata = {
  title: 'Pricing',
  description:
    'Transparent pricing for easecity stream control infrastructure. From startups to enterprise — choose the plan that scales with your needs.',
}

export default function PricingPage() {
  return (
    <>
      <PricingHero />
      <PricingCards />
      <PricingFAQ />
    </>
  )
}
