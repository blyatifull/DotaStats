import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { ArrowLeft, User, Trophy, TrendingUp, TrendingDown } from 'lucide-react'
import { getPlayer } from '@/lib/api/opendota'
import { getHeroes } from '@/lib/api/stratz'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { HERO_ICON_URL, formatPercent, formatRelativeTime, formatDuration } from '@/lib/constants'
import { cn } from '@/lib/utils'

interface PlayerPageProps {
  params: Promise<{ playerId: string }>
}

export async function generateMetadata({ params }: PlayerPageProps): Promise<Metadata> {
  const { playerId } = await params
  const player = await getPlayer(parseInt(playerId))
  
  if (!player) {
    return { title: 'Player Not Found' }
  }

  return {
    title: player.name,
    description: `${player.name} - Professional Dota 2 player statistics, best heroes, and match history.`,
  }
}

export default async function PlayerDetailPage({ params }: PlayerPageProps) {
  const { playerId } = await params
  const playerIdNum = parseInt(playerId)

  const [player, heroes] = await Promise.all([
    getPlayer(playerIdNum),
    getHeroes().catch(() => []),
  ])

  if (!player) {
    notFound()
  }

  const heroesMap = new Map(heroes.map((h) => [h.id, h]))

  return (
    <div className="min-h-screen">
      {/* Player Header */}
      <section className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
          <Button asChild variant="ghost" size="sm" className="mb-4">
            <Link href="/teams">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Teams
            </Link>
          </Button>

          <div className="flex flex-col gap-6 md:flex-row md:items-center">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full border border-border bg-secondary">
              {player.avatarFull ? (
                <img
                  src={player.avatarFull}
                  alt={player.name}
                  className="h-20 w-20 rounded-full object-cover"
                />
              ) : (
                <User className="h-12 w-12 text-muted-foreground" />
              )}
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                {player.countryCode && (
                  <Badge variant="outline">{player.countryCode}</Badge>
                )}
                {player.rank && (
                  <Badge variant="secondary">Rank {player.rank}</Badge>
                )}
              </div>
              <h1 className="mt-2 text-4xl font-bold tracking-tight">
                {player.name}
              </h1>
              {player.personaName !== player.name && (
                <p className="mt-1 text-muted-foreground">{player.personaName}</p>
              )}
            </div>

            <div className="flex gap-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-radiant">{player.wins}</p>
                <p className="text-sm text-muted-foreground">Wins</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-dire">{player.losses}</p>
                <p className="text-sm text-muted-foreground">Losses</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1">
                  {player.winRate >= 50 ? (
                    <TrendingUp className="h-5 w-5 text-radiant" />
                  ) : (
                    <TrendingDown className="h-5 w-5 text-dire" />
                  )}
                  <p
                    className={cn(
                      'text-3xl font-bold',
                      player.winRate >= 50 ? 'text-radiant' : 'text-dire'
                    )}
                  >
                    {formatPercent(player.winRate, 0)}
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">Win Rate</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Best Heroes */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-primary" />
                  Best Heroes
                </CardTitle>
              </CardHeader>
              <CardContent>
                {player.bestHeroes.length > 0 ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {player.bestHeroes.map((heroStat) => {
                      const hero = heroesMap.get(heroStat.heroId)
                      if (!hero) return null

                      return (
                        <Link
                          key={heroStat.heroId}
                          href={`/heroes/${hero.id}`}
                          className="flex items-center gap-3 rounded-lg border border-border bg-secondary/50 p-3 transition-all hover:border-primary/50 hover:bg-secondary"
                        >
                          <div className="relative h-12 w-12 overflow-hidden rounded-lg border border-border">
                            <Image
                              src={HERO_ICON_URL(hero.shortName)}
                              alt={hero.displayName}
                              fill
                              className="object-cover"
                              sizes="48px"
                            />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{hero.displayName}</p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span>{heroStat.games} games</span>
                              <span className="text-border">|</span>
                              <span
                                className={
                                  heroStat.winRate >= 50
                                    ? 'text-radiant'
                                    : 'text-dire'
                                }
                              >
                                {formatPercent(heroStat.winRate, 0)}
                              </span>
                            </div>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                ) : (
                  <p className="py-8 text-center text-muted-foreground">
                    No hero statistics available
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Matches */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Recent Matches</CardTitle>
              </CardHeader>
              <CardContent>
                {player.recentMatches.length > 0 ? (
                  <div className="space-y-3">
                    {player.recentMatches.slice(0, 10).map((match) => {
                      const playerData = match.players[0]
                      const hero = heroesMap.get(playerData?.heroId || 0)
                      const won = playerData?.isRadiant === match.didRadiantWin

                      return (
                        <Link
                          key={match.id}
                          href={`/tournaments/match/${match.id}`}
                          className="flex items-center justify-between gap-3 rounded-lg border border-border bg-secondary/50 p-3 transition-all hover:border-primary/50 hover:bg-secondary"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={cn(
                                'h-2 w-2 rounded-full',
                                won ? 'bg-radiant' : 'bg-dire'
                              )}
                            />
                            {hero && (
                              <div className="relative h-8 w-8 overflow-hidden rounded border border-border">
                                <Image
                                  src={HERO_ICON_URL(hero.shortName)}
                                  alt={hero.displayName}
                                  fill
                                  className="object-cover"
                                  sizes="32px"
                                />
                              </div>
                            )}
                            <div>
                              <p className="text-sm font-medium">
                                {playerData?.kills}/{playerData?.deaths}/{playerData?.assists}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {formatRelativeTime(match.startDateTime)}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge
                              variant={won ? 'default' : 'secondary'}
                              className={cn(won && 'bg-radiant')}
                            >
                              {won ? 'W' : 'L'}
                            </Badge>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {formatDuration(match.durationSeconds)}
                            </p>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                ) : (
                  <p className="py-8 text-center text-muted-foreground">
                    No recent matches
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}
