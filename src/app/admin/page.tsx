export const revalidate = 0

import { prisma } from '@/lib/db'
import dynamic from 'next/dynamic'

const RevenueChart = dynamic(
  () => import('@/components/admin/charts/RevenueChart').then((m) => m.RevenueChart),
  { ssr: false, loading: () => <ChartSkeleton /> }
)

const OrdersChart = dynamic(
  () => import('@/components/admin/charts/OrdersChart').then((m) => m.OrdersChart),
  { ssr: false, loading: () => <ChartSkeleton /> }
)

export default async function AdminDashboardPage() {
  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  const [totalUsers, totalOrders, totalContacts, paidOrders, recentUsers] =
    await Promise.all([
      prisma.user.count(),
      prisma.order.count(),
      prisma.contactSubmission.count(),
      prisma.order.findMany({
        where: { status: 'paid', createdAt: { gte: thirtyDaysAgo } },
        select: { amount: true, createdAt: true },
      }),
      prisma.user.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    ])

  const totalRevenue = paidOrders.reduce((sum, o) => sum + o.amount, 0) / 100

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

  return (
    <div className="space-y-6">
      <div>
        <p className="label-mono mb-2 text-signal">ADMIN.OVERVIEW</p>
        <h1 className="font-display text-3xl font-semibold tracking-[-0.05em] text-text-primary">Dashboard</h1>
        <p className="mt-1 text-sm text-text-secondary">System overview</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Users" value={totalUsers} sub={`+${recentUsers} this week`} />
        <StatCard label="Total Orders" value={totalOrders} />
        <StatCard label="Revenue" value={`$${totalRevenue.toFixed(2)}`} sub="Last 30 days" />
        <StatCard label="Contact Forms" value={totalContacts} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RevenueChart data={dailyRevenue} />
        <OrdersChart data={dailyRevenue} />
      </div>
    </div>
  )
}

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="rounded-lg border border-border bg-bg-surface p-5">
      <p className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-text-muted">{label}</p>
      <p className="mt-2 font-display text-3xl font-semibold tracking-[-0.04em] text-text-primary tabular-nums">{value}</p>
      {sub && <p className="mt-1 text-xs text-signal">{sub}</p>}
    </div>
  )
}

function ChartSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-bg-surface p-5">
      <div className="mb-4 h-4 w-32 animate-pulse rounded bg-bg-elevated" />
      <div className="h-64 animate-pulse rounded bg-bg-elevated" />
    </div>
  )
}
