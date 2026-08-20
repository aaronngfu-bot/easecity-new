import { z } from 'zod'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { withErrorHandler, AuthError, ForbiddenError } from '@/lib/api-handler'
import { apiSuccess } from '@/lib/api-response'
import { isAdmin } from '@/lib/permissions'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

const settingsSchema = z.object({
  ecshare_logo_url: z.string().max(500).nullable().optional(),
})

/** Read site settings (admin). */
export const GET = withErrorHandler(async () => {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new AuthError()
  if (!isAdmin(session.user.role)) throw new ForbiddenError()

  const rows = await prisma.siteSetting.findMany()
  const settings: Record<string, string | null> = {}
  for (const r of rows) settings[r.key] = r.value
  return apiSuccess(settings)
})

/** Upsert site settings (admin). */
export const PATCH = withErrorHandler(async (req) => {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new AuthError()
  if (!isAdmin(session.user.role)) throw new ForbiddenError()

  const body = settingsSchema.parse(await req.json())

  for (const [key, value] of Object.entries(body)) {
    await prisma.siteSetting.upsert({
      where: { key },
      update: { value: value ?? null },
      create: { key, value: value ?? null },
    })
  }

  const rows = await prisma.siteSetting.findMany()
  const settings: Record<string, string | null> = {}
  for (const r of rows) settings[r.key] = r.value
  return apiSuccess(settings)
})