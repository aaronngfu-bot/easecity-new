import { z } from 'zod'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { withErrorHandler, AuthError, ForbiddenError } from '@/lib/api-handler'
import { apiSuccess, apiError } from '@/lib/api-response'
import { isAdmin } from '@/lib/permissions'
import { uploadImage, UPLOAD_PREFIXES } from '@/lib/blob-upload'

export const dynamic = 'force-dynamic'

const uploadSchema = z.object({
  filename: z.string().min(1).max(200),
  contentType: z.string().min(1).max(100),
  // base64 body, no data: prefix
  data: z.string().min(1),
  prefix: z.enum(UPLOAD_PREFIXES).default('site'),
})

/**
 * Admin image upload to Vercel Blob. Returns the public URL to store against
 * whatever record the caller is editing. `/api/admin/blog/upload` is the same
 * thing pinned to the blog folder, kept so the blog editor keeps working.
 */
export const POST = withErrorHandler(async (req) => {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new AuthError()
  if (!isAdmin(session.user.role)) throw new ForbiddenError()

  const { filename, contentType, data, prefix } = uploadSchema.parse(await req.json())
  const result = await uploadImage({ prefix, filename, contentType, data })

  if (!result.ok) return apiError(result.code, result.message, result.status)
  return apiSuccess({ url: result.url }, 201)
})
