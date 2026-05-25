import type { Metadata } from 'next'
import { getLeagues, getProMatches } from '@/lib/api/opendota'
import { TournamentCard } from '@/components/tournaments/tournament-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Activity } from 'lucide-react'
import Link from 'next/link'
import { formatRelativeTime, formatDuration } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'Tournaments',
  description: 'Browse Dota 2 tournaments, leagues, and professional matches.',
}

export default async function TournamentsPage() {
  const [leagues, proMatches] = await Promise.all([
    getLeagues().catch(() => []),
    getProMatches().catch(() => []),
  ])

  const recentMatches = proMatches.slice(0, 10)

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Tournaments</h1>
        <p className="mt-2 text-muted-foreground">
          Browse Dota 2 leagues, tournaments, and professional matches.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Leagues */}
        <div className="lg:col-span-2">
          <h2 className="mb-4 text-xl font-semibold">Leagues</h2>
          {leagues.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {leagues.map((league) => (
                <TournamentCard key={league.id} league={league} />
              ))}
            </div>
          ) : (
            <p className="py-12 text-center text-muted-foreground">
              No leagues available
            </p>
          )}
        </div>

        {/* Recent Pro Matches */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Recent Pro Matches
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentMatches.length > 0 ? (
                <div className="space-y-3">
                  {recentMatches.map((match) => (
                    <Link
                      key={match.id}
                      href={`/tournaments/match/${match.id}`}
                      className="flex items-center justify-between gap-3 rounded-lg border border-border bg-secondary/50 p-3 transition-all hover:border-primary/50 hover:bg-secondary"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <div
                            className={`h-2 w-2 shrink-0 rounded-full ${
                              match.didRadiantWin ? 'bg-radiant' : 'bg-dire'
                            }`}
                          />
                          <p className="truncate text-sm font-medium">
                            <span
                              className={
                                match.didRadiantWin ? 'text-radiant' : ''
                              }
                            >
                              {match.radiantTeam?.name || 'Radiant'}
                            </span>
                            <span className="mx-1 text-muted-foreground">
                              vs
                            </span>
                            <span
                              className={
                                !match.didRadiantWin ? 'text-dire' : ''
                              }
                            >
                              {match.direTeam?.name || 'Dire'}
                            </span>
                          </p>
                        </div>
                        <p className="mt-1 truncate text-xs text-muted-foreground">
                          {match.league?.name || 'Pro Match'}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-xs font-mono text-muted-foreground">
                          {formatDuration(match.durationSeconds)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatRelativeTime(match.startDateTime)}
                        </p>
                      </div>
                    </Link>
                  ))}
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
    </div>
  )
}
