import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatRelativeTime, formatPercent } from '@/lib/constants'
import type { Team } from '@/lib/types/team'
import { Trophy, TrendingUp, TrendingDown } from 'lucide-react'

interface TeamCardProps {
  team: Team
  rank?: number
}

export function TeamCard({ team, rank }: TeamCardProps) {
  const winRate = team.wins + team.losses > 0 
    ? (team.wins / (team.wins + team.losses)) * 100 
    : 0

  return (
    <Link href={`/teams/${team.id}`}>
      <Card className="overflow-hidden transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            {rank !== undefined && (
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-primary/10 text-sm font-bold text-primary">
                {rank}
              </span>
            )}
            
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-border bg-secondary">
              {team.logoUrl ? (
                <img
                  src={team.logoUrl}
                  alt={team.name}
                  className="h-10 w-10 object-contain"
                />
              ) : (
                <Trophy className="h-6 w-6 text-muted-foreground" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="truncate font-semibold">{team.name}</h3>
                {team.tag && (
                  <Badge variant="outline" className="text-xs">
                    {team.tag}
                  </Badge>
                )}
              </div>
              <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
                <span>Rating: {Math.round(team.rating)}</span>
                <span className="text-border">|</span>
                <span>
                  {team.wins}W - {team.losses}L
                </span>
              </div>
            </div>

            <div className="text-right">
              <div className="flex items-center gap-1">
                {winRate >= 50 ? (
                  <TrendingUp className="h-4 w-4 text-radiant" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-dire" />
                )}
                <span
                  className={cn(
                    'font-mono text-sm',
                    winRate >= 50 ? 'text-radiant' : 'text-dire'
                  )}
                >
                  {formatPercent(winRate, 1)}
                </span>
              </div>
              {team.lastMatchTime > 0 && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatRelativeTime(team.lastMatchTime)}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
