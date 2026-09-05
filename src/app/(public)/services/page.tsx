import type { Metadata } from 'next'
import { getSiteImages } from '@/lib/site-images'
import { getServerLanguage } from '@/lib/server-language'
import { ServicesPageClient } from '@/components/services/ServicesPageClient'

export const metadata: Metadata = {
  title: 'Services',
  description:
    'EaseCity provides system development, web platforms, and design services for teams who need reliable, beautiful tools.',
}

export default async function ServicesPage() {
  const lang = await getServerLanguage()
  const images = await getSiteImages(lang)
  return <ServicesPageClient images={images} />
}
