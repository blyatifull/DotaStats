import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatPercent } from '@/lib/constants'
import type { HeroStatistics } from '@/lib/types/hero'
import { TrendingUp, TrendingDown, Minus, Target, Ban, Swords } from 'lucide-react'

interface HeroStatsCardsProps {
  stats: HeroStatistics | null
}

export function HeroStatsCards({ stats }: HeroStatsCardsProps) {
  if (!stats) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="h-16 animate-pulse rounded bg-secondary" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const statCards = [
    {
      title: 'Win Rate',
      value: formatPercent(stats.winRate, 1),
      icon: stats.winRate >= 52 ? TrendingUp : stats.winRate <= 48 ? TrendingDown : Minus,
      iconColor: stats.winRate >= 52 ? 'text-radiant' : stats.winRate <= 48 ? 'text-dire' : 'text-muted-foreground',
      valueColor: stats.winRate >= 52 ? 'text-radiant' : stats.winRate <= 48 ? 'text-dire' : '',
      subtext: `${stats.winCount.toLocaleString()} wins`,
    },
    {
      title: 'Pick Rate',
      value: formatPercent(stats.pickRate, 2),
      icon: Target,
      iconColor: 'text-primary',
      valueColor: '',
      subtext: `${stats.pickCount.toLocaleString()} picks`,
    },
    {
      title: 'Ban Rate',
      value: formatPercent(stats.banRate, 2),
      icon: Ban,
      iconColor: 'text-dire',
      valueColor: stats.banRate >= 20 ? 'text-dire' : '',
      subtext: `${stats.banCount.toLocaleString()} bans`,
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {statCards.map((card) => (
        <Card key={card.title}>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{card.title}</p>
                <p className={cn('text-3xl font-bold tabular-nums', card.valueColor)}>
                  {card.value}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">{card.subtext}</p>
              </div>
              <card.icon className={cn('h-5 w-5', card.iconColor)} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
