import { getAllSiteImages, isReplaced } from '@/lib/site-images'
import { EcSharePageClient } from './EcSharePageClient'

export default async function EcSharePage() {
  // All three languages in one payload: EcSharePageClient is a client
  // component, so it swaps the image set LIVE when the visitor flips the
  // language toggle instead of waiting for a reload.
  const images = await getAllSiteImages()

  return (
    <EcSharePageClient
      images={images}
      iconIsPlaceholder={!isReplaced(images.en, 'ecShareAppIcon')}
    />
  )
}
