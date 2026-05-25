import Link from 'next/link'
import Image from 'next/image'
import { Swords, Users, Trophy, TrendingUp, Activity } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { getHeroes, getHeroStats } from '@/lib/api/stratz'
import { getProMatches, getTeams } from '@/lib/api/opendota'
import { HERO_ICON_URL, formatPercent, formatRelativeTime, formatDuration } from '@/lib/constants'

export default async function HomePage() {
  const [heroes, heroStats, proMatches, teams] = await Promise.all([
    getHeroes().catch(() => []),
    getHeroStats().catch(() => []),
    getProMatches().catch(() => []),
    getTeams().catch(() => []),
  ])

  const heroMap = new Map(heroes.map((h) => [h.id, h]))

  // Get top meta heroes by pick rate
  const topHeroes = [...heroStats]
    .sort((a, b) => b.pickRate - a.pickRate)
    .slice(0, 8)
    .map((stat) => ({
      hero: heroMap.get(stat.heroId),
      stats: stat,
    }))
    .filter((h) => h.hero)

  // Get top teams
  const topTeams = teams.slice(0, 6)

  // Recent matches
  const recentMatches = proMatches.slice(0, 5)

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-primary/5 to-background">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 lg:px-8 lg:py-24">
          <div className="text-center">
            <Badge variant="outline" className="mb-4">
              Powered by Stratz & OpenDota
            </Badge>
            <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Dota 2 Statistics
              <br />
              <span className="text-primary">& Analytics</span>
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground text-pretty">
              Comprehensive hero statistics, team rosters, tournament brackets,
              and detailed match analysis with gold/XP graphs and win predictions.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Button asChild size="lg">
                <Link href="/heroes">
                  <Swords className="mr-2 h-5 w-5" />
                  Browse Heroes
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/tournaments">
                  <Trophy className="mr-2 h-5 w-5" />
                  View Tournaments
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="border-b border-border bg-card/50">
        <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">{heroes.length}+</p>
              <p className="text-sm text-muted-foreground">Heroes</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">{teams.length}+</p>
              <p className="text-sm text-muted-foreground">Pro Teams</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">
                {proMatches.length}+
              </p>
              <p className="text-sm text-muted-foreground">Recent Matches</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">Live</p>
              <p className="text-sm text-muted-foreground">Data Updates</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Meta Heroes */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Meta Heroes
                </CardTitle>
                <Button asChild variant="ghost" size="sm">
                  <Link href="/heroes">View All</Link>
                </Button>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {topHeroes.map(({ hero, stats }) => (
                    <Link
                      key={hero!.id}
                      href={`/heroes/${hero!.id}`}
                      className="group flex items-center gap-3 rounded-lg border border-border bg-secondary/50 p-3 transition-all hover:border-primary/50 hover:bg-secondary"
                    >
                      <div className="relative h-12 w-12 overflow-hidden rounded-lg border border-border">
                        <Image
                          src={HERO_ICON_URL(hero!.shortName)}
                          alt={hero!.displayName}
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {hero!.displayName}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span
                            className={
                              stats.winRate >= 52
                                ? 'text-radiant'
                                : stats.winRate <= 48
                                  ? 'text-dire'
                                  : ''
                            }
                          >
                            {formatPercent(stats.winRate, 1)}
                          </span>
                          <span className="text-border">|</span>
                          <span>{formatPercent(stats.pickRate, 1)}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Pro Matches */}
            <Card className="mt-6">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  Recent Pro Matches
                </CardTitle>
                <Button asChild variant="ghost" size="sm">
                  <Link href="/tournaments">View All</Link>
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentMatches.map((match) => (
                    <Link
                      key={match.id}
                      href={`/tournaments/match/${match.id}`}
                      className="flex items-center justify-between gap-4 rounded-lg border border-border bg-secondary/50 p-3 transition-all hover:border-primary/50 hover:bg-secondary"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`h-2 w-2 rounded-full ${
                            match.didRadiantWin ? 'bg-radiant' : 'bg-dire'
                          }`}
                        />
                        <div>
                          <p className="text-sm font-medium">
                            <span
                              className={
                                match.didRadiantWin ? 'text-radiant' : ''
                              }
                            >
                              {match.radiantTeam?.name || 'Radiant'}
                            </span>
                            <span className="mx-2 text-muted-foreground">
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
                          <p className="text-xs text-muted-foreground">
                            {match.league?.name || 'Professional Match'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-mono text-muted-foreground">
                          {formatDuration(match.durationSeconds)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatRelativeTime(match.startDateTime)}
                        </p>
                      </div>
                    </Link>
                  ))}

                  {recentMatches.length === 0 && (
                    <p className="py-8 text-center text-muted-foreground">
                      No recent matches available
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Top Teams */}
          <div>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Top Teams
                </CardTitle>
                <Button asChild variant="ghost" size="sm">
                  <Link href="/teams">View All</Link>
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topTeams.map((team, idx) => (
                    <Link
                      key={team.id}
                      href={`/teams/${team.id}`}
                      className="flex items-center gap-3 rounded-lg border border-border bg-secondary/50 p-3 transition-all hover:border-primary/50 hover:bg-secondary"
                    >
                      <span className="flex h-6 w-6 items-center justify-center rounded bg-primary/10 text-xs font-medium text-primary">
                        {idx + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {team.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Rating: {Math.round(team.rating)}
                        </p>
                      </div>
                      <div className="text-right text-xs text-muted-foreground">
                        <p>
                          {team.wins}W - {team.losses}L
                        </p>
                      </div>
                    </Link>
                  ))}

                  {topTeams.length === 0 && (
                    <p className="py-8 text-center text-muted-foreground">
                      No teams available
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Features Card */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Features</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <Swords className="mt-0.5 h-4 w-4 text-primary" />
                    <span>Hero statistics, builds, and matchups</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Users className="mt-0.5 h-4 w-4 text-primary" />
                    <span>Pro team rosters and player profiles</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Trophy className="mt-0.5 h-4 w-4 text-primary" />
                    <span>Tournament brackets and match history</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <TrendingUp className="mt-0.5 h-4 w-4 text-primary" />
                    <span>Gold/XP graphs and win predictions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Activity className="mt-0.5 h-4 w-4 text-primary" />
                    <span>Interactive heat maps and ward locations</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}
