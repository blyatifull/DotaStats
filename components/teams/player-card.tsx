import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { HERO_ICON_URL, formatPercent } from '@/lib/constants'
import type { TeamPlayer } from '@/lib/types/team'
import type { Hero } from '@/lib/types/hero'
import { User } from 'lucide-react'

interface PlayerCardProps {
  player: TeamPlayer
  bestHeroes?: number[]
  heroesMap?: Map<number, Hero>
}

export function PlayerCard({ player, bestHeroes = [], heroesMap }: PlayerCardProps) {
  const winRate = player.gamesPlayed > 0 
    ? (player.wins / player.gamesPlayed) * 100 
    : 0

  const roleLabels: Record<string, string> = {
    carry: 'Pos 1',
    mid: 'Pos 2',
    offlane: 'Pos 3',
    soft_support: 'Pos 4',
    hard_support: 'Pos 5',
    unknown: 'Unknown',
  }

  return (
    <Link href={`/teams/player/${player.accountId}`}>
      <Card className="overflow-hidden transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-border bg-secondary">
              {player.avatar ? (
                <img
                  src={player.avatar}
                  alt={player.name}
                  className="h-12 w-12 rounded-full object-cover"
                />
              ) : (
                <User className="h-6 w-6 text-muted-foreground" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="truncate font-semibold">{player.name}</h3>
                <Badge variant="secondary" className="text-xs">
                  {roleLabels[player.role]}
                </Badge>
              </div>
              <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
                <span>{player.gamesPlayed} games</span>
                <span className="text-border">|</span>
                <span className={winRate >= 50 ? 'text-radiant' : 'text-dire'}>
                  {formatPercent(winRate, 1)} WR
                </span>
              </div>
            </div>

            {bestHeroes.length > 0 && heroesMap && (
              <div className="flex gap-1">
                {bestHeroes.slice(0, 3).map((heroId) => {
                  const hero = heroesMap.get(heroId)
                  if (!hero) return null
                  return (
                    <div
                      key={heroId}
                      className="relative h-8 w-8 overflow-hidden rounded border border-border"
                    >
                      <Image
                        src={HERO_ICON_URL(hero.shortName)}
                        alt={hero.displayName}
                        fill
                        className="object-cover"
                        sizes="32px"
                      />
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
