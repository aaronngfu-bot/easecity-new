import { z } from 'zod'
import { revalidateTag } from 'next/cache'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { withErrorHandler, AuthError, ForbiddenError } from '@/lib/api-handler'
import { apiSuccess, apiError } from '@/lib/api-response'
import { isAdmin } from '@/lib/permissions'
import { prisma } from '@/lib/db'
import {
  SITE_IMAGE_SLOTS,
  SITE_IMAGES_TAG,
  defaultSiteImages,
  isRenderableImageSrc,
  isSiteImageId,
  siteImageKey,
} from '@/lib/site-images'

export const dynamic = 'force-dynamic'

const patchSchema = z.object({
  id: z.string().min(1).max(80),
  /**
   * An uploaded URL, or null to drop the override. The slot then falls back to
   * its shipped asset, or to nothing at all for the slots that ship without one.
   */
  url: z.string().max(1000).nullable(),
})

async function currentState() {
  const rows = await prisma.siteSetting.findMany({
    where: { key: { startsWith: 'image:' } },
  })

  const overrides: Record<string, string> = {}
  for (const row of rows) {
    const id = row.key.slice('image:'.length)
    if (isSiteImageId(id) && row.value) overrides[id] = row.value
  }

  return {
    slots: SITE_IMAGE_SLOTS,
    defaults: defaultSiteImages(),
    overrides,
  }
}

/** The slot definitions, the shipped assets, and whatever has replaced them. */
export const GET = withErrorHandler(async () => {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new AuthError()
  if (!isAdmin(session.user.role)) throw new ForbiddenError()

  return apiSuccess(await currentState())
})

/** Point one slot at an uploaded image, or clear the override. */
export const PATCH = withErrorHandler(async (req) => {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new AuthError()
  if (!isAdmin(session.user.role)) throw new ForbiddenError()

  const { id, url } = patchSchema.parse(await req.json())

  if (!isSiteImageId(id)) {
    return apiError('UNKNOWN_SLOT', `No image slot named "${id}"`, 400)
  }
  if (url !== null && !isRenderableImageSrc(url)) {
    return apiError(
      'UNSUPPORTED_SOURCE',
      'Images must be uploaded here, or be a path inside this site. An external URL cannot be rendered.',
      400
    )
  }

  const key = siteImageKey(id)
  if (url === null) {
    await prisma.siteSetting.deleteMany({ where: { key } })
  } else {
    await prisma.siteSetting.upsert({
      where: { key },
      update: { value: url },
      create: { key, value: url },
    })
  }

  // The public pages read this through a tagged cache so they stay static.
  // Without this they would keep serving the previous photograph.
  revalidateTag(SITE_IMAGES_TAG)

  return apiSuccess(await currentState())
})
