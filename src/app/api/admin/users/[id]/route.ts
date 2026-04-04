import { z } from 'zod'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { withErrorHandler, AuthError, ForbiddenError } from '@/lib/api-handler'
import { apiSuccess } from '@/lib/api-response'
import { prisma } from '@/lib/db'
import { isAdmin } from '@/lib/permissions'
import { logAction } from '@/lib/audit'

const updateUserSchema = z.object({
  role: z.enum(['MEMBER', 'ADMIN', 'SUPER_ADMIN']).optional(),
  status: z.enum(['ACTIVE', 'SUSPENDED']).optional(),
})

export const PATCH = withErrorHandler(async (req, context) => {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new AuthError()
  if (!isAdmin(session.user.role)) throw new ForbiddenError()

  const { id } = await context.params
  const body = await req.json()
  const data = updateUserSchema.parse(body)

  const before = await prisma.user.findUnique({ where: { id } })

  const user = await prisma.user.update({
    where: { id },
    data,
    select: { id: true, name: true, email: true, role: true, status: true },
  })

  await logAction({
    userId: session.user.id,
    action: 'user.update',
    targetType: 'User',
    targetId: id,
    changes: {
      before: { role: before?.role, status: before?.status },
      after: { role: user.role, status: user.status },
    },
    request: req,
  })

  return apiSuccess(user)
})
