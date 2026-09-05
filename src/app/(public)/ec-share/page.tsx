import { getSiteImages, isReplaced } from '@/lib/site-images'
import { getServerLanguage } from '@/lib/server-language'
import { EcSharePageClient } from './EcSharePageClient'

export default async function EcSharePage() {
  const lang = await getServerLanguage()
  const images = await getSiteImages(lang)

  return (
    <EcSharePageClient
      images={images}
      iconIsPlaceholder={!isReplaced(images, 'ecShareAppIcon')}
    />
  )
}
