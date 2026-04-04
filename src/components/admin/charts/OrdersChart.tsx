'use client'

import { useMemo } from 'react'
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
    <div className="p-5 rounded-xl border border-border bg-bg-surface">
      <h3 className="font-display text-sm font-semibold text-text-primary mb-4">
        Orders (30 days)
      </h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={formattedData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis
              dataKey="label"
              tick={{ fill: '#52525b', fontSize: 11 }}
              axisLine={{ stroke: '#27272a' }}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fill: '#52525b', fontSize: 11 }}
              axisLine={{ stroke: '#27272a' }}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#111116',
                border: '1px solid #27272a',
                borderRadius: '8px',
                fontSize: '12px',
              }}
              labelStyle={{ color: '#a1a1aa' }}
              itemStyle={{ color: '#a855f7' }}
              formatter={(value) => [String(value), 'Orders']}
            />
            <Bar dataKey="orders" fill="#a855f7" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
