import type { Metadata } from 'next'
import { getAllSiteImages } from '@/lib/site-images'
import { ServicesPageClient } from '@/components/services/ServicesPageClient'

export const metadata: Metadata = {
  title: 'Services',
  description:
    'EaseCity provides system development, web platforms, and design services for teams who need reliable, beautiful tools.',
}

export default async function ServicesPage() {
  // All three languages in one payload — ServicesPageClient swaps the set LIVE
  // on the language toggle instead of waiting for a reload.
  const images = await getAllSiteImages()
  return <ServicesPageClient images={images} />
}
