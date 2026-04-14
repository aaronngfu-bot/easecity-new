export const revalidate = 0

import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import DashboardClient from './DashboardClient'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect('/login')

  const [subscription, recentOrders] = await Promise.all([
    prisma.subscription.findUnique({ where: { userId: session.user.id } }),
    prisma.order.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 3,
    }),
  ])

  return (
    <DashboardClient
      userName={session.user.name ?? null}
      subscription={
        subscription
          ? {
              status: subscription.status,
              stripePriceId: subscription.stripePriceId,
              cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
              trialEnd: subscription.trialEnd?.toISOString() ?? null,
              currentPeriodEnd: subscription.currentPeriodEnd?.toISOString() ?? null,
            }
          : null
      }
      recentOrders={recentOrders.map((o) => ({
        id: o.id,
        amount: o.amount,
        currency: o.currency,
        status: o.status,
        createdAt: o.createdAt.toISOString(),
      }))}
    />
  )
}
