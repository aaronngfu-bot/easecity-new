'use client'

import { useMemo } from 'react'
import { useTheme } from 'next-themes'
import {
  AreaChart,
  Area,
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

export function RevenueChart({ data }: { data: DailyData[] }) {
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
      line: isDark ? 'var(--signal)' : 'var(--signal)',
      gradientId: isDark ? 'revenueGradientDark' : 'revenueGradientLight',
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
      <p className="label-mono mb-2 text-signal">REVENUE.LINE</p>
      <h3 className="mb-4 font-display text-sm font-semibold text-text-primary">
        Revenue (30 days)
      </h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={formattedData}>
            <defs>
              <linearGradient id={colors.gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colors.line} stopOpacity={0.3} />
                <stop offset="95%" stopColor={colors.line} stopOpacity={0} />
              </linearGradient>
            </defs>
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
              tickFormatter={(v) => `$${v}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: colors.tooltipBg,
                border: `1px solid ${colors.tooltipBorder}`,
                borderRadius: '8px',
                fontSize: '12px',
              }}
              labelStyle={{ color: colors.tooltipLabel }}
              itemStyle={{ color: colors.line }}
              formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Revenue']}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke={colors.line}
              strokeWidth={2}
              fill={`url(#${colors.gradientId})`}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
