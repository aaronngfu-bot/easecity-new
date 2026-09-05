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
import type { Language } from '@/i18n/translations'

export const dynamic = 'force-dynamic'

const patchSchema = z.object({
  id: z.string().min(1).max(80),
  /**
   * Which language column this override belongs to. Omitted = 'en', which is
   * also how the pre-per-language rows were stored, so old rows keep reading
   * as the EN column.
   */
  lang: z.enum(['en', 'zh']).default('en'),
  /**
   * An uploaded URL, or null to drop the override. The slot then falls back —
   * first to the other language's override, then to its shipped asset, or to
   * nothing at all for the slots that ship without one.
   */
  url: z.string().max(1000).nullable(),
})

function langKey(id: string, lang: Language): string {
  const base = siteImageKey(id)
  return lang === 'zh' ? `${base}:zh` : base
}

async function currentState() {
  const rows = await prisma.siteSetting.findMany({
    where: { key: { startsWith: 'image:' } },
  })

  const overrides: { en: Record<string, string>; zh: Record<string, string> } = {
    en: {},
    zh: {},
  }
  for (const row of rows) {
    if (!row.value) continue
    const rest = row.key.slice('image:'.length)
    if (rest.endsWith(':zh')) {
      const id = rest.slice(0, -3)
      if (isSiteImageId(id)) overrides.zh[id] = row.value
    } else if (rest.endsWith(':en')) {
      const id = rest.slice(0, -3)
      if (isSiteImageId(id)) overrides.en[id] = row.value
    } else if (isSiteImageId(rest)) {
      // Legacy un-suffixed rows read as the EN column.
      overrides.en[rest] = row.value
    }
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

/** Point one slot's language column at an uploaded image, or clear it. */
export const PATCH = withErrorHandler(async (req) => {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new AuthError()
  if (!isAdmin(session.user.role)) throw new ForbiddenError()

  const { id, lang, url } = patchSchema.parse(await req.json())

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

  const key = langKey(id, lang)
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
