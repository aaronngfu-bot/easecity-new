import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { withErrorHandler, AuthError, ForbiddenError } from '@/lib/api-handler'
import { apiSuccess } from '@/lib/api-response'
import { prisma } from '@/lib/db'
import { isAdmin } from '@/lib/permissions'

export const dynamic = 'force-dynamic'

export const GET = withErrorHandler(async () => {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new AuthError()
  if (!isAdmin(session.user.role)) throw new ForbiddenError()

  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  const [
    totalUsers,
    totalOrders,
    totalContacts,
    recentUsers,
    recentOrders,
    paidOrders,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.order.count(),
    prisma.contactSubmission.count(),
    prisma.user.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    prisma.order.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    prisma.order.findMany({
      where: { status: 'paid', createdAt: { gte: thirtyDaysAgo } },
      select: { amount: true, createdAt: true },
    }),
  ])

  const totalRevenue = paidOrders.reduce((sum, o) => sum + o.amount, 0)

  const dailyRevenue = Array.from({ length: 30 }, (_, i) => {
    const date = new Date(now.getTime() - (29 - i) * 24 * 60 * 60 * 1000)
    const dateStr = date.toISOString().split('T')[0]
    const dayOrders = paidOrders.filter(
      (o) => o.createdAt.toISOString().split('T')[0] === dateStr
    )
    return {
      date: dateStr,
      revenue: dayOrders.reduce((s, o) => s + o.amount, 0) / 100,
      orders: dayOrders.length,
    }
  })

  return apiSuccess({
    summary: {
      totalUsers,
      totalOrders,
      totalContacts,
      totalRevenue: totalRevenue / 100,
      recentUsers,
      recentOrders,
    },
    dailyRevenue,
  })
})
