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
  Legend,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { MatchPlayer } from '@/lib/types/match'
import type { Hero } from '@/lib/types/hero'

interface PlayerGoldChartProps {
  players: MatchPlayer[]
  heroes: Map<number, Hero>
  durationMinutes: number
}

const RADIANT_COLORS = [
  '#4ade80', // green-400
  '#22c55e', // green-500
  '#16a34a', // green-600
  '#15803d', // green-700
  '#166534', // green-800
]

const DIRE_COLORS = [
  '#f87171', // red-400
  '#ef4444', // red-500
  '#dc2626', // red-600
  '#b91c1c', // red-700
  '#991b1b', // red-800
]

export function PlayerGoldChart({ players, heroes, durationMinutes }: PlayerGoldChartProps) {
  const { data, playerInfo } = useMemo(() => {
    const radiantPlayers = players.filter((p) => p.isRadiant)
    const direPlayers = players.filter((p) => !p.isRadiant)

    // Find the longest timeline
    const maxLength = Math.max(
      ...players.map((p) => p.goldTimeline?.length || 0),
      1
    )

    // Build data points
    const chartData = Array.from({ length: maxLength }, (_, i) => {
      const point: Record<string, number> = { minute: i }
      
      players.forEach((player) => {
        const hero = heroes.get(player.heroId)
        const key = `player_${player.playerSlot}`
        point[key] = player.goldTimeline?.[i] || 0
      })

      return point
    })

    // Build player info for legend and lines
    const info = players.map((player, idx) => {
      const hero = heroes.get(player.heroId)
      const isRadiant = player.isRadiant
      const teamIdx = isRadiant
        ? radiantPlayers.indexOf(player)
        : direPlayers.indexOf(player)
      
      return {
        key: `player_${player.playerSlot}`,
        name: hero?.displayName || `Player ${idx + 1}`,
        color: isRadiant ? RADIANT_COLORS[teamIdx] : DIRE_COLORS[teamIdx],
        isRadiant,
      }
    })

    return { data: chartData, playerInfo: info }
  }, [players, heroes])

  if (data.length <= 1 || players.every((p) => !p.goldTimeline?.length)) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Player Gold Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="py-8 text-center text-muted-foreground">
            No player gold data available for this match
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Player Gold Over Time</CardTitle>
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
                  if (value >= 1000) {
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
                  maxHeight: '300px',
                  overflow: 'auto',
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
                formatter={(value: number, name: string) => {
                  const player = playerInfo.find((p) => p.key === name)
                  return [value.toLocaleString(), player?.name || name]
                }}
                labelFormatter={(label) => `${label} min`}
              />
              <Legend
                wrapperStyle={{ fontSize: '12px' }}
                formatter={(value) => {
                  const player = playerInfo.find((p) => p.key === value)
                  return player?.name || value
                }}
              />
              {playerInfo.map((player) => (
                <Line
                  key={player.key}
                  type="monotone"
                  dataKey={player.key}
                  name={player.key}
                  stroke={player.color}
                  strokeWidth={1.5}
                  dot={false}
                  activeDot={{ r: 3 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
