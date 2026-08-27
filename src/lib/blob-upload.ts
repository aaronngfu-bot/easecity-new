import { put } from '@vercel/blob'

/**
 * Shared image upload to Vercel Blob. Both the blog editor and the media
 * library post here, so the size ceiling, the accepted types and the filename
 * sanitising are decided in one place.
 *
 * The payload is base64 in a JSON body rather than multipart: the images are
 * small, and it keeps the route handlers free of form parsing.
 */

const MAX_SIZE = 5 * 1024 * 1024
const ALLOWED = ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/avif']

/** Folders inside the blob store. Anything else is rejected, so a caller cannot
 *  choose a path. */
export const UPLOAD_PREFIXES = ['blog', 'site'] as const
export type UploadPrefix = (typeof UPLOAD_PREFIXES)[number]

export type UploadResult =
  | { ok: true; url: string }
  | { ok: false; code: string; message: string; status: number }

export function isBlobConfigured(): boolean {
  return !!process.env.BLOB_READ_WRITE_TOKEN
}

/** The SDK's default auth order tries `VERCEL_OIDC_TOKEN` before this token,
 *  and picks it whenever the env var is merely present — expired or not, and
 *  regardless of whether the Blob store's project connection actually allows
 *  OIDC for the current environment. Locally that variable is a stale copy
 *  left behind by `vercel env pull`, and this store isn't connected for
 *  Development, so every upload took the OIDC path and failed with
 *  `BlobOidcEnvironmentNotAllowedError` before ever trying the read-write
 *  token below it. Passing the token explicitly skips that resolution order
 *  entirely (see `resolveBlobAuth` in `@vercel/blob`, which checks
 *  `options.token` first), so this can't regress the next time someone syncs
 *  env vars from Vercel. */
function readWriteToken(): string | undefined {
  return process.env.BLOB_READ_WRITE_TOKEN
}

export async function uploadImage(input: {
  prefix: UploadPrefix
  filename: string
  contentType: string
  data: string
}): Promise<UploadResult> {
  if (!isBlobConfigured()) {
    return {
      ok: false,
      code: 'BLOB_NOT_CONFIGURED',
      message: 'Vercel Blob storage is not configured (missing BLOB_READ_WRITE_TOKEN)',
      status: 503,
    }
  }

  if (!ALLOWED.includes(input.contentType)) {
    return { ok: false, code: 'INVALID_TYPE', message: 'Unsupported image type', status: 400 }
  }

  const buf = Buffer.from(input.data, 'base64')
  if (buf.length === 0) {
    return { ok: false, code: 'EMPTY', message: 'Empty file', status: 400 }
  }
  if (buf.length > MAX_SIZE) {
    return { ok: false, code: 'TOO_LARGE', message: 'Image exceeds the 5MB limit', status: 400 }
  }

  const safeName = input.filename.replace(/[^a-zA-Z0-9._-]/g, '-').toLowerCase()
  const blob = await put(`${input.prefix}/${Date.now()}-${safeName}`, buf, {
    access: 'public',
    contentType: input.contentType,
    addRandomSuffix: false,
    token: readWriteToken(),
  })

  return { ok: true, url: blob.url }
}
