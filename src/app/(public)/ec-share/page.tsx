import { getSiteImages, isReplaced } from '@/lib/site-images'
import { EcSharePageClient } from './EcSharePageClient'

export default async function EcSharePage() {
  const images = await getSiteImages()

  return (
    <EcSharePageClient
      images={images}
      iconIsPlaceholder={!isReplaced(images, 'ecShareAppIcon')}
    />
  )
}
