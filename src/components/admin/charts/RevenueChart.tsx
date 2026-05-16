'use client'

import { useMemo } from 'react'
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
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00e5cc" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#00e5cc" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#172024" />
            <XAxis
              dataKey="label"
              tick={{ fill: '#839190', fontSize: 11 }}
              axisLine={{ stroke: '#243034' }}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fill: '#839190', fontSize: 11 }}
              axisLine={{ stroke: '#243034' }}
              tickLine={false}
              tickFormatter={(v) => `$${v}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#101418',
                border: '1px solid #243034',
                borderRadius: '8px',
                fontSize: '12px',
              }}
              labelStyle={{ color: '#c6d1d0' }}
              itemStyle={{ color: '#00e5cc' }}
              formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Revenue']}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#00e5cc"
              strokeWidth={2}
              fill="url(#revenueGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
