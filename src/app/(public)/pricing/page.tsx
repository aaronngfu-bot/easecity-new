import type { Metadata } from 'next'
import { PricingHero } from '@/components/pricing/PricingHero'
import { PricingCards } from '@/components/pricing/PricingCards'
import { PricingFAQ } from '@/components/pricing/PricingFAQ'

export const metadata: Metadata = {
  title: 'EC-Share Pricing',
  description:
    'EC-Share pricing: 14-day trial, Pro at $19/month, Business at $49/month, and Enterprise from $2,499/year.',
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
