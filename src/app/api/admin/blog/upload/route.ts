import { z } from 'zod'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { withErrorHandler, AuthError, ForbiddenError } from '@/lib/api-handler'
import { apiSuccess, apiError } from '@/lib/api-response'
import { isAdmin } from '@/lib/permissions'
import { put } from '@vercel/blob'

export const dynamic = 'force-dynamic'

const MAX_SIZE = 5 * 1024 * 1024 // 5MB base64
const ALLOWED = ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/avif']

const uploadSchema = z.object({
  filename: z.string().min(1).max(200),
  contentType: z.string().min(1).max(100),
  // base64 body (no data: prefix) — avoids multipart parsing complexity
  data: z.string().min(1),
})

/**
 * Admin blog image upload → Vercel Blob. Returns a public URL to store on the
 * VlogPost.image column. Requires BLOB_READ_WRITE_TOKEN in env.
 */
export const POST = withErrorHandler(async (req) => {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new AuthError()
  if (!isAdmin(session.user.role)) throw new ForbiddenError()

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return apiError('BLOB_NOT_CONFIGURED', 'Vercel Blob storage is not configured (missing BLOB_READ_WRITE_TOKEN)', 503)
  }

  const body = await req.json()
  const { filename, contentType, data } = uploadSchema.parse(body)

  if (!ALLOWED.includes(contentType)) {
    return apiError('INVALID_TYPE', 'Unsupported image type', 400)
  }

  const buf = Buffer.from(data, 'base64')
  if (buf.length === 0) return apiError('EMPTY', 'Empty file', 400)
  if (buf.length > MAX_SIZE) return apiError('TOO_LARGE', 'Image exceeds size limit', 400)

  const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, '-').toLowerCase()
  const blob = await put(`blog/${Date.now()}-${safeName}`, buf, {
    access: 'public',
    contentType,
    addRandomSuffix: false,
  })

  return apiSuccess({ url: blob.url }, 201)
})