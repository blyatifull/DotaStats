import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { HERO_ICON_URL, formatDuration, formatRelativeTime } from '@/lib/constants'
import type { Match } from '@/lib/types/match'
import type { Hero } from '@/lib/types/hero'

interface MatchCardProps {
  match: Match
  heroes: Map<number, Hero>
  className?: string
}

export function MatchCard({ match, heroes, className }: MatchCardProps) {
  const radiantPlayers = match.players.filter((p) => p.isRadiant)
  const direPlayers = match.players.filter((p) => !p.isRadiant)

  return (
    <Link href={`/tournaments/match/${match.id}`}>
      <Card
        className={cn(
          'overflow-hidden transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5',
          className
        )}
      >
        <CardHeader className="p-4 pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {match.league && (
                <Badge variant="outline" className="text-xs">
                  {match.league.name}
                </Badge>
              )}
            </div>
            <span className="text-sm text-muted-foreground">
              {formatRelativeTime(match.startDateTime)}
            </span>
          </div>
        </CardHeader>

        <CardContent className="p-4 pt-2">
          <div className="flex items-center justify-between gap-4">
            {/* Radiant Team */}
            <div className="flex-1">
              <div className="mb-2 flex items-center gap-2">
                <div
                  className={cn(
                    'h-2 w-2 rounded-full',
                    match.didRadiantWin ? 'bg-radiant' : 'bg-muted'
                  )}
                />
                <span
                  className={cn(
                    'text-sm font-medium',
                    match.didRadiantWin && 'text-radiant'
                  )}
                >
                  {match.radiantTeam?.name || 'Radiant'}
                </span>
                {match.didRadiantWin && (
                  <Badge className="bg-radiant text-radiant-foreground text-xs">
                    W
                  </Badge>
                )}
              </div>
              <div className="flex gap-1">
                {radiantPlayers.slice(0, 5).map((player, idx) => {
                  const hero = heroes.get(player.heroId)
                  return (
                    <div
                      key={idx}
                      className="relative h-8 w-8 overflow-hidden rounded border border-border"
                    >
                      {hero ? (
                        <Image
                          src={HERO_ICON_URL(hero.shortName)}
                          alt={hero.displayName}
                          fill
                          className="object-cover"
                          sizes="32px"
                        />
                      ) : (
                        <div className="h-full w-full bg-secondary" />
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Score / Duration */}
            <div className="text-center">
              <p className="text-2xl font-bold tabular-nums">
                <span className={cn(match.didRadiantWin && 'text-radiant')}>
                  {radiantPlayers.reduce((sum, p) => sum + p.kills, 0)}
                </span>
                <span className="mx-2 text-muted-foreground">-</span>
                <span className={cn(!match.didRadiantWin && 'text-dire')}>
                  {direPlayers.reduce((sum, p) => sum + p.kills, 0)}
                </span>
              </p>
              <p className="text-sm text-muted-foreground">
                {formatDuration(match.durationSeconds)}
              </p>
            </div>

            {/* Dire Team */}
            <div className="flex-1">
              <div className="mb-2 flex items-center justify-end gap-2">
                {!match.didRadiantWin && (
                  <Badge className="bg-dire text-dire-foreground text-xs">
                    W
                  </Badge>
                )}
                <span
                  className={cn(
                    'text-sm font-medium',
                    !match.didRadiantWin && 'text-dire'
                  )}
                >
                  {match.direTeam?.name || 'Dire'}
                </span>
                <div
                  className={cn(
                    'h-2 w-2 rounded-full',
                    !match.didRadiantWin ? 'bg-dire' : 'bg-muted'
                  )}
                />
              </div>
              <div className="flex justify-end gap-1">
                {direPlayers.slice(0, 5).map((player, idx) => {
                  const hero = heroes.get(player.heroId)
                  return (
                    <div
                      key={idx}
                      className="relative h-8 w-8 overflow-hidden rounded border border-border"
                    >
                      {hero ? (
                        <Image
                          src={HERO_ICON_URL(hero.shortName)}
                          alt={hero.displayName}
                          fill
                          className="object-cover"
                          sizes="32px"
                        />
                      ) : (
                        <div className="h-full w-full bg-secondary" />
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
