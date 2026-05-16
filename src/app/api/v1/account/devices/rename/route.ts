import { withErrorHandler } from '@/lib/api-handler'
import { apiError, apiSuccess } from '@/lib/api-response'
import { prisma } from '@/lib/db'
import { EC_SHARE_PRODUCT, type LicenseJwtPayload, requireEcShareLicense } from '@/lib/license-jwt'
import { renameDeviceSchema } from '@/lib/validations/ec-share'

export const dynamic = 'force-dynamic'

export const POST = withErrorHandler(async (req) => {
  let payload: LicenseJwtPayload

  try {
    payload = await requireEcShareLicense(req)
  } catch {
    return apiError('UNAUTHORIZED', 'Invalid or missing license token.', 401)
  }

  const body = await req.json()
  const data = renameDeviceSchema.parse(body)

  const result = await prisma.device.updateMany({
    where: {
      product: EC_SHARE_PRODUCT,
      fingerprint: data.fingerprint,
      userId: payload.sub,
    },
    data: {
      nickname: data.nickname,
    },
  })

  if (result.count === 0) {
    return apiError('DEVICE_NOT_FOUND', 'Device not found.', 404)
  }

  return apiSuccess({
    fingerprint: data.fingerprint,
    nickname: data.nickname,
  })
})
