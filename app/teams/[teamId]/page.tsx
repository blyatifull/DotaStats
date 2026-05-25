import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Trophy, TrendingUp, TrendingDown, Users } from 'lucide-react'
import { getTeam } from '@/lib/api/opendota'
import { getHeroes } from '@/lib/api/stratz'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PlayerCard } from '@/components/teams/player-card'
import { formatPercent, formatRelativeTime, formatDuration } from '@/lib/constants'
import { cn } from '@/lib/utils'

interface TeamPageProps {
  params: Promise<{ teamId: string }>
}

export async function generateMetadata({ params }: TeamPageProps): Promise<Metadata> {
  const { teamId } = await params
  const team = await getTeam(parseInt(teamId))
  
  if (!team) {
    return { title: 'Team Not Found' }
  }

  return {
    title: team.name,
    description: `${team.name} (${team.tag}) - Professional Dota 2 team roster, statistics, and match history.`,
  }
}

export default async function TeamDetailPage({ params }: TeamPageProps) {
  const { teamId } = await params
  const teamIdNum = parseInt(teamId)

  const [team, heroes] = await Promise.all([
    getTeam(teamIdNum),
    getHeroes().catch(() => []),
  ])

  if (!team) {
    notFound()
  }

  const heroesMap = new Map(heroes.map((h) => [h.id, h]))
  const totalGames = team.wins + team.losses
  const winRate = totalGames > 0 ? (team.wins / totalGames) * 100 : 0

  return (
    <div className="min-h-screen">
      {/* Team Header */}
      <section className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
          <Button asChild variant="ghost" size="sm" className="mb-4">
            <Link href="/teams">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Teams
            </Link>
          </Button>

          <div className="flex flex-col gap-6 md:flex-row md:items-center">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-xl border border-border bg-secondary">
              {team.logoUrl ? (
                <img
                  src={team.logoUrl}
                  alt={team.name}
                  className="h-20 w-20 object-contain"
                />
              ) : (
                <Trophy className="h-12 w-12 text-muted-foreground" />
              )}
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                {team.tag && (
                  <Badge variant="outline">{team.tag}</Badge>
                )}
                {team.region && (
                  <Badge variant="secondary">{team.region}</Badge>
                )}
              </div>
              <h1 className="mt-2 text-4xl font-bold tracking-tight">
                {team.name}
              </h1>
              <p className="mt-2 text-muted-foreground">
                Rating: {Math.round(team.rating)}
              </p>
            </div>

            <div className="flex gap-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-radiant">{team.wins}</p>
                <p className="text-sm text-muted-foreground">Wins</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-dire">{team.losses}</p>
                <p className="text-sm text-muted-foreground">Losses</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1">
                  {winRate >= 50 ? (
                    <TrendingUp className="h-5 w-5 text-radiant" />
                  ) : (
                    <TrendingDown className="h-5 w-5 text-dire" />
                  )}
                  <p
                    className={cn(
                      'text-3xl font-bold',
                      winRate >= 50 ? 'text-radiant' : 'text-dire'
                    )}
                  >
                    {formatPercent(winRate, 0)}
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
          {/* Roster */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Current Roster
                </CardTitle>
              </CardHeader>
              <CardContent>
                {team.roster.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    {team.roster.map((player) => (
                      <PlayerCard
                        key={player.accountId}
                        player={player}
                        heroesMap={heroesMap}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="py-8 text-center text-muted-foreground">
                    No roster information available
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
                {team.recentMatches.length > 0 ? (
                  <div className="space-y-3">
                    {team.recentMatches.slice(0, 10).map((match) => {
                      const isRadiant = match.radiantTeam?.id === team.id
                      const won = isRadiant === match.didRadiantWin
                      const opponent = isRadiant ? match.direTeam : match.radiantTeam

                      return (
                        <Link
                          key={match.id}
                          href={`/tournaments/match/${match.id}`}
                          className="flex items-center justify-between gap-3 rounded-lg border border-border bg-secondary/50 p-3 transition-all hover:border-primary/50 hover:bg-secondary"
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className={cn(
                                'h-2 w-2 rounded-full',
                                won ? 'bg-radiant' : 'bg-dire'
                              )}
                            />
                            <div>
                              <p className="text-sm font-medium">
                                vs {opponent?.name || 'Unknown'}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {formatRelativeTime(match.startDateTime)}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant={won ? 'default' : 'secondary'} className={cn(won && 'bg-radiant')}>
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
