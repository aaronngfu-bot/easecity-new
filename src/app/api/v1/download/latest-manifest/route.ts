import { withErrorHandler } from '@/lib/api-handler'
import { apiSuccess } from '@/lib/api-response'

export const dynamic = 'force-dynamic'

const DEFAULT_MANIFEST_URL =
  'https://dl.easecity.hk/ec-share/windows/stable/latest.json'

export const GET = withErrorHandler(async () => {
  const manifestUrl =
    process.env.EC_SHARE_DOWNLOAD_MANIFEST_URL ||
    process.env.NEXT_PUBLIC_EC_SHARE_DOWNLOAD_MANIFEST_URL ||
    DEFAULT_MANIFEST_URL

  const channel = process.env.EC_SHARE_DOWNLOAD_CHANNEL || 'stable'

  return apiSuccess({
    manifest_url: manifestUrl,
    platform: 'windows',
    channel,
    schema:
      'Opaque JSON hosted at manifest_url; desktop updater owns version/sha256/installer_url fields.',
  })
})
