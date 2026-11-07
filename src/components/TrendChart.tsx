'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface TrendChartProps {
  data: Array<{
    date: string
    count: number
  }>
  title?: string
  height?: number
}

export function TrendChart({ data, title = 'Usage Trend (30 days)', height = 300 }: TrendChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-surface p-6 rounded-lg border border-border">
        <p className="text-small text-text-light">No trend data available</p>
      </div>
    )
  }

  return (
    <div className="bg-surface p-6 rounded-lg border border-border">
      {title && <h3 className="text-section-title text-navy mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12 }}
            tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: '8px',
              boxShadow: '0 4px 6px var(--shadow-alpha)',
            }}
            formatter={(value) => [value, 'Queries']}
            labelFormatter={(label) => new Date(label).toLocaleDateString()}
          />
          <Line
            type="monotone"
            dataKey="count"
            stroke="#0066FF"
            strokeWidth={2}
            dot={{ fill: '#0066FF', r: 3 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
