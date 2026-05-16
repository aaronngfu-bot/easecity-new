import { createPrivateKey, createPublicKey } from 'node:crypto'

import { withErrorHandler } from '@/lib/api-handler'
import { apiError, apiSuccess } from '@/lib/api-response'

export const dynamic = 'force-dynamic'

export const GET = withErrorHandler(async () => {
  const raw = process.env.LICENSE_JWT_PRIVATE_KEY_PEM

  if (!raw) {
    return apiError('SERVICE_UNAVAILABLE', 'License signing keys are not configured.', 503)
  }

  const pem = raw.replace(/\\n/g, '\n')
  const kid = process.env.LICENSE_JWT_KEY_ID || '2026a'

  try {
    const privateKey = createPrivateKey(pem)
    const publicKey = createPublicKey(privateKey)
    const jwk = publicKey.export({ format: 'jwk' }) as Record<string, string>

    const key = {
      ...jwk,
      kid,
      use: 'sig',
      alg: 'EdDSA',
    }

    return apiSuccess({ keys: [key] })
  } catch {
    return apiError('SERVICE_UNAVAILABLE', 'License public key could not be derived.', 503)
  }
})
