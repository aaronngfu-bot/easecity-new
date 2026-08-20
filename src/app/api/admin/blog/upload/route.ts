import { z } from 'zod'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { withErrorHandler, AuthError, ForbiddenError } from '@/lib/api-handler'
import { apiSuccess, apiError } from '@/lib/api-response'
import { isAdmin } from '@/lib/permissions'

export const dynamic = 'force-dynamic'

const MAX_SIZE = 2 * 1024 * 1024 // 2MB base64 → ~2.8MB data URL, within zod(5M)/function body limits
const ALLOWED = ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/avif']

const uploadSchema = z.object({
  filename: z.string().min(1).max(200),
  contentType: z.string().min(1).max(100),
  // base64 body (no data: prefix) — avoids multipart parsing complexity
  data: z.string().min(1),
})

/**
 * Admin blog image upload — returns a self-contained data URL to store on the
 * VlogPost.image column. Images live in the DB, so no external Blob token is
 * needed.
 */
export const POST = withErrorHandler(async (req) => {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new AuthError()
  if (!isAdmin(session.user.role)) throw new ForbiddenError()

  const body = await req.json()
  const { filename, contentType, data } = uploadSchema.parse(body)

  if (!ALLOWED.includes(contentType)) {
    return apiError('INVALID_TYPE', 'Unsupported image type', 400)
  }

  const buf = Buffer.from(data, 'base64')
  if (buf.length === 0) return apiError('EMPTY', 'Empty file', 400)
  if (buf.length > MAX_SIZE) return apiError('TOO_LARGE', 'Image exceeds 5MB limit', 400)

  // Store the image as a self-contained data URL in the DB (VlogPost.image).
  // No external object storage / token needed — works with the existing Neon DB.
  const dataUrl = `data:${contentType};base64,${data}`

  return apiSuccess({ url: dataUrl }, 201)
})