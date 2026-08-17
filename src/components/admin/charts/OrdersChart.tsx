'use client'

import { useMemo } from 'react'
import { useTheme } from 'next-themes'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface DailyData {
  date: string
  revenue: number
  orders: number
}

export function OrdersChart({ data }: { data: DailyData[] }) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme !== 'light'

  const colors = useMemo(
    () => ({
      grid: isDark ? '#172024' : '#d8e2e0',
      axis: isDark ? '#243034' : '#b8c8c6',
      tick: isDark ? 'var(--text-muted)' : '#667472',
      tooltipBg: isDark ? 'var(--bg-surface)' : '#f0f4f7',
      tooltipBorder: isDark ? '#243034' : '#d8e2e0',
      tooltipLabel: isDark ? 'var(--text-secondary)' : 'var(--text-secondary)',
      bar: isDark ? 'var(--signal-light)' : 'var(--signal)',
    }),
    [isDark]
  )

  const formattedData = useMemo(
    () =>
      data.map((d) => ({
        ...d,
        label: new Date(d.date).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        }),
      })),
    [data]
  )

  return (
    <div className="rounded-lg border border-border bg-bg-surface p-5">
      <p className="label-mono mb-2 text-signal">ORDERS.BAR</p>
      <h3 className="mb-4 font-display text-sm font-semibold text-text-primary">
        Orders (30 days)
      </h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={formattedData}>
            <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
            <XAxis
              dataKey="label"
              tick={{ fill: colors.tick, fontSize: 11 }}
              axisLine={{ stroke: colors.axis }}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fill: colors.tick, fontSize: 11 }}
              axisLine={{ stroke: colors.axis }}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: colors.tooltipBg,
                border: `1px solid ${colors.tooltipBorder}`,
                borderRadius: '8px',
                fontSize: '12px',
              }}
              labelStyle={{ color: colors.tooltipLabel }}
              itemStyle={{ color: colors.bar }}
              formatter={(value) => [String(value), 'Orders']}
            />
            <Bar dataKey="orders" fill={colors.bar} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
