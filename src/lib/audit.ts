import { prisma } from './db'

export async function logAction(params: {
  userId: string
  action: string
  targetType: string
  targetId: string
  changes?: Record<string, unknown>
  request?: Request
}) {
  const { userId, action, targetType, targetId, changes, request } = params

  await prisma.auditLog.create({
    data: {
      userId,
      action,
      targetType,
      targetId,
      changes: changes ? JSON.stringify(changes) : null,
      ipAddress: request?.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null,
      userAgent: request?.headers.get('user-agent') ?? null,
    },
  })
}
