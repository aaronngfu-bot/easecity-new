import type { Metadata } from 'next'
import Link from 'next/link'
import { PageHero } from '@/components/ui/PageHero'
import { ServicesPageClient } from '@/components/services/ServicesPageClient'

export const metadata: Metadata = {
  title: 'Services',
  description:
    'EaseCity provides system development, web platforms, and design services for teams who need reliable, beautiful tools.',
}

export default function ServicesPage() {
  return (
    <>
      <ServicesPageClient />
    </>
  )
}
