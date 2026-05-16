import { withErrorHandler } from '@/lib/api-handler'
import { apiError, apiSuccess } from '@/lib/api-response'
import { prisma } from '@/lib/db'
import {
  EC_SHARE_PRODUCT,
  type LicenseJwtPayload,
  requireEcShareLicense,
} from '@/lib/license-jwt'
import { deviceFingerprintParamSchema } from '@/lib/validations/ec-share'

export const dynamic = 'force-dynamic'

export const DELETE = withErrorHandler(async (req, context) => {
  let payload: LicenseJwtPayload

  try {
    payload = await requireEcShareLicense(req)
  } catch {
    return apiError('UNAUTHORIZED', 'Invalid or missing license token.', 401)
  }

  const params = await context.params
  const data = deviceFingerprintParamSchema.parse({
    fingerprint: params.fingerprint,
  })

  const device = await prisma.device.findFirst({
    where: {
      product: EC_SHARE_PRODUCT,
      fingerprint: data.fingerprint,
      userId: payload.sub,
    },
    select: {
      fingerprint: true,
    },
  })

  if (!device) {
    return apiError('DEVICE_NOT_FOUND', 'Device not found.', 404)
  }

  await prisma.device.delete({
    where: {
      product_fingerprint: {
        product: EC_SHARE_PRODUCT,
        fingerprint: data.fingerprint,
      },
    },
  })

  return apiSuccess({ deleted: true })
})
