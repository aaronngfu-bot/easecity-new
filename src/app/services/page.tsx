import type { Metadata } from 'next'
import { StreamControlArch } from '@/components/services/StreamControlArch'
import { UseCases } from '@/components/services/UseCases'
import { TechProcess } from '@/components/services/TechProcess'
import { FutureServices } from '@/components/services/FutureServices'
import { ServicesHero } from '@/components/services/ServicesHero'

export const metadata: Metadata = {
  title: 'Services',
  description:
    "Explore easecity's stream control architecture — enabling one hub to manage multiple remote endpoints with real-time precision and scalable infrastructure.",
}

export default function ServicesPage() {
  return (
    <>
      <ServicesHero />
      <StreamControlArch />
      <UseCases />
      <TechProcess />
      <FutureServices />
    </>
  )
}
