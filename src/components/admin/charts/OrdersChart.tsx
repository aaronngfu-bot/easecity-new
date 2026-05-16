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
    <div className="rounded-lg border border-border bg-bg-surface p-5">
      <p className="label-mono mb-2 text-signal">ORDERS.BAR</p>
      <h3 className="mb-4 font-display text-sm font-semibold text-text-primary">
        Orders (30 days)
      </h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={formattedData}>
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
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#101418',
                border: '1px solid #243034',
                borderRadius: '8px',
                fontSize: '12px',
              }}
              labelStyle={{ color: '#c6d1d0' }}
              itemStyle={{ color: '#35f5e0' }}
              formatter={(value) => [String(value), 'Orders']}
            />
            <Bar dataKey="orders" fill="#35f5e0" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
