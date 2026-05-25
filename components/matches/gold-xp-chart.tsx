'use client'

import { useMemo } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface GoldXpChartProps {
  goldAdvantage: number[]
  xpAdvantage: number[]
  durationMinutes: number
}

export function GoldXpChart({ goldAdvantage, xpAdvantage, durationMinutes }: GoldXpChartProps) {
  const data = useMemo(() => {
    const maxLength = Math.max(goldAdvantage.length, xpAdvantage.length)
    return Array.from({ length: maxLength }, (_, i) => ({
      minute: i,
      gold: goldAdvantage[i] || 0,
      xp: xpAdvantage[i] || 0,
    }))
  }, [goldAdvantage, xpAdvantage])

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Gold & XP Advantage</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="py-8 text-center text-muted-foreground">
            No graph data available for this match
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Gold & XP Advantage</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="minute"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickFormatter={(value) => `${value}m`}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickFormatter={(value) => {
                  if (Math.abs(value) >= 1000) {
                    return `${(value / 1000).toFixed(0)}k`
                  }
                  return value.toString()
                }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
                formatter={(value: number, name: string) => [
                  value > 0 ? `+${value.toLocaleString()}` : value.toLocaleString(),
                  name === 'gold' ? 'Gold' : 'XP',
                ]}
                labelFormatter={(label) => `${label} min`}
              />
              <Legend />
              <ReferenceLine y={0} stroke="hsl(var(--border))" strokeWidth={2} />
              <Line
                type="monotone"
                dataKey="gold"
                name="Gold"
                stroke="hsl(var(--gold))"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="xp"
                name="XP"
                stroke="hsl(var(--chart-2))"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 flex items-center justify-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="text-radiant">Radiant</span>
            <span>{'(Positive)'}</span>
          </div>
          <span>|</span>
          <div className="flex items-center gap-2">
            <span className="text-dire">Dire</span>
            <span>{'(Negative)'}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
