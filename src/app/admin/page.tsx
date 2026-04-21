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
        <h1 className="font-display text-2xl font-bold text-text-primary">Dashboard</h1>
        <p className="text-text-secondary text-sm mt-1">System overview</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Users" value={totalUsers} sub={`+${recentUsers} this week`} />
        <StatCard label="Total Orders" value={totalOrders} />
        <StatCard label="Revenue" value={`$${totalRevenue.toFixed(2)}`} sub="Last 30 days" />
        <StatCard label="Contact Forms" value={totalContacts} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueChart data={dailyRevenue} />
        <OrdersChart data={dailyRevenue} />
      </div>
    </div>
  )
}

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="p-5 rounded-xl border border-border bg-bg-surface">
      <p className="text-xs text-text-muted font-medium uppercase tracking-wider">{label}</p>
      <p className="font-display text-2xl font-bold text-text-primary mt-2">{value}</p>
      {sub && <p className="text-xs text-signal mt-1">{sub}</p>}
    </div>
  )
}

function ChartSkeleton() {
  return (
    <div className="p-5 rounded-xl border border-border bg-bg-surface">
      <div className="h-4 w-32 bg-bg-elevated rounded animate-pulse mb-4" />
      <div className="h-64 bg-bg-elevated rounded animate-pulse" />
    </div>
  )
}
