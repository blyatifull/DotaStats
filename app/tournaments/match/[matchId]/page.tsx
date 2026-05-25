import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { ArrowLeft, Clock, Trophy, Swords, Map, Brain } from 'lucide-react'
import { getMatchFromOpenDota } from '@/lib/api/opendota'
import { getHeroes, getItems } from '@/lib/api/stratz'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { GoldXpChart } from '@/components/matches/gold-xp-chart'
import { PlayerGoldChart } from '@/components/matches/player-gold-chart'
import { PlayerStatsTable } from '@/components/matches/player-stats-table'
import { MinimapHeatmap } from '@/components/matches/minimap-heatmap'
import { WinPrediction } from '@/components/matches/win-prediction'
import {
  HERO_ICON_URL,
  formatDuration,
  formatRelativeTime,
} from '@/lib/constants'
import { cn } from '@/lib/utils'

interface MatchPageProps {
  params: Promise<{ matchId: string }>
}

export async function generateMetadata({ params }: MatchPageProps): Promise<Metadata> {
  const { matchId } = await params
  const match = await getMatchFromOpenDota(parseInt(matchId))

  if (!match) {
    return { title: 'Match Not Found' }
  }

  return {
    title: `${match.radiantTeam?.name || 'Radiant'} vs ${match.direTeam?.name || 'Dire'}`,
    description: `Match ${matchId} - ${match.didRadiantWin ? match.radiantTeam?.name || 'Radiant' : match.direTeam?.name || 'Dire'} wins in ${formatDuration(match.durationSeconds)}.`,
  }
}

export default async function MatchDetailPage({ params }: MatchPageProps) {
  const { matchId } = await params
  const matchIdNum = parseInt(matchId)

  const [match, heroes, items] = await Promise.all([
    getMatchFromOpenDota(matchIdNum),
    getHeroes().catch(() => []),
    getItems().catch(() => []),
  ])

  if (!match) {
    notFound()
  }

  const heroesMap = new Map(heroes.map((h) => [h.id, h]))
  const itemsMap = new Map(items.map((i) => [i.id, i]))

  const radiantPlayers = match.players.filter((p) => p.isRadiant)
  const direPlayers = match.players.filter((p) => !p.isRadiant)

  const radiantKills = radiantPlayers.reduce((sum, p) => sum + p.kills, 0)
  const direKills = direPlayers.reduce((sum, p) => sum + p.kills, 0)

  const durationMinutes = Math.floor(match.durationSeconds / 60)

  // Prepare data for Win Prediction
  const radiantHeroesForPrediction = radiantPlayers.map((p) => {
    const hero = heroesMap.get(p.heroId)
    return {
      id: p.heroId,
      name: hero?.shortName || `hero_${p.heroId}`,
      localizedName: hero?.displayName || `Hero ${p.heroId}`,
      winRate: hero?.stats?.winRate,
    }
  })

  const direHeroesForPrediction = direPlayers.map((p) => {
    const hero = heroesMap.get(p.heroId)
    return {
      id: p.heroId,
      name: hero?.shortName || `hero_${p.heroId}`,
      localizedName: hero?.displayName || `Hero ${p.heroId}`,
      winRate: hero?.stats?.winRate,
    }
  })

  // Generate mock ward data based on match (in production, this would come from API)
  const mockWards = generateMockWards(radiantPlayers, direPlayers, durationMinutes)
  const mockPositions = generateMockPositions(radiantPlayers, direPlayers, durationMinutes, heroesMap)

  return (
    <div className="min-h-screen">
      {/* Match Header */}
      <section className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-6 lg:px-8">
          <Button asChild variant="ghost" size="sm" className="mb-4">
            <Link href="/tournaments">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Tournaments
            </Link>
          </Button>

          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            {/* Teams & Score */}
            <div className="flex items-center gap-6">
              {/* Radiant */}
              <div className="text-center">
                <div
                  className={cn(
                    'mb-2 rounded-lg border-2 p-4',
                    match.didRadiantWin
                      ? 'border-radiant bg-radiant/10'
                      : 'border-border bg-secondary'
                  )}
                >
                  <div className="flex gap-1">
                    {radiantPlayers.slice(0, 5).map((player) => {
                      const hero = heroesMap.get(player.heroId)
                      return hero ? (
                        <div
                          key={player.playerSlot}
                          className="relative h-10 w-10 overflow-hidden rounded border border-border"
                        >
                          <Image
                            src={HERO_ICON_URL(hero.shortName)}
                            alt={hero.displayName}
                            fill
                            className="object-cover"
                            sizes="40px"
                          />
                        </div>
                      ) : null
                    })}
                  </div>
                </div>
                <p
                  className={cn(
                    'text-sm font-medium',
                    match.didRadiantWin && 'text-radiant'
                  )}
                >
                  {match.radiantTeam?.name || 'Radiant'}
                </p>
                {match.didRadiantWin && (
                  <Badge className="mt-1 bg-radiant text-radiant-foreground">
                    Winner
                  </Badge>
                )}
              </div>

              {/* Score */}
              <div className="text-center">
                <p className="text-5xl font-bold tabular-nums">
                  <span className={cn(match.didRadiantWin && 'text-radiant')}>
                    {radiantKills}
                  </span>
                  <span className="mx-3 text-muted-foreground">-</span>
                  <span className={cn(!match.didRadiantWin && 'text-dire')}>
                    {direKills}
                  </span>
                </p>
                <div className="mt-2 flex items-center justify-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{formatDuration(match.durationSeconds)}</span>
                </div>
              </div>

              {/* Dire */}
              <div className="text-center">
                <div
                  className={cn(
                    'mb-2 rounded-lg border-2 p-4',
                    !match.didRadiantWin
                      ? 'border-dire bg-dire/10'
                      : 'border-border bg-secondary'
                  )}
                >
                  <div className="flex gap-1">
                    {direPlayers.slice(0, 5).map((player) => {
                      const hero = heroesMap.get(player.heroId)
                      return hero ? (
                        <div
                          key={player.playerSlot}
                          className="relative h-10 w-10 overflow-hidden rounded border border-border"
                        >
                          <Image
                            src={HERO_ICON_URL(hero.shortName)}
                            alt={hero.displayName}
                            fill
                            className="object-cover"
                            sizes="40px"
                          />
                        </div>
                      ) : null
                    })}
                  </div>
                </div>
                <p
                  className={cn(
                    'text-sm font-medium',
                    !match.didRadiantWin && 'text-dire'
                  )}
                >
                  {match.direTeam?.name || 'Dire'}
                </p>
                {!match.didRadiantWin && (
                  <Badge className="mt-1 bg-dire text-dire-foreground">
                    Winner
                  </Badge>
                )}
              </div>
            </div>

            {/* Match Info */}
            <div className="text-sm text-muted-foreground">
              <p>Match ID: {match.id}</p>
              <p>{formatRelativeTime(match.startDateTime)}</p>
              {match.league && (
                <Link
                  href={`/tournaments/${match.league.id}`}
                  className="text-primary hover:underline"
                >
                  {match.league.name}
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Pick/Ban Phase */}
      {match.pickBans.length > 0 && (
        <section className="border-b border-border bg-secondary/30">
          <div className="mx-auto max-w-7xl px-4 py-4 lg:px-8">
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Radiant:</span>
                {match.pickBans
                  .filter((pb) => pb.team === 'radiant' && pb.isPick)
                  .map((pb) => {
                    const hero = heroesMap.get(pb.heroId)
                    return hero ? (
                      <div
                        key={pb.order}
                        className="relative h-7 w-7 overflow-hidden rounded border border-radiant"
                      >
                        <Image
                          src={HERO_ICON_URL(hero.shortName)}
                          alt={hero.displayName}
                          fill
                          className="object-cover"
                          sizes="28px"
                        />
                      </div>
                    ) : null
                  })}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Dire:</span>
                {match.pickBans
                  .filter((pb) => pb.team === 'dire' && pb.isPick)
                  .map((pb) => {
                    const hero = heroesMap.get(pb.heroId)
                    return hero ? (
                      <div
                        key={pb.order}
                        className="relative h-7 w-7 overflow-hidden rounded border border-dire"
                      >
                        <Image
                          src={HERO_ICON_URL(hero.shortName)}
                          alt={hero.displayName}
                          fill
                          className="object-cover"
                          sizes="28px"
                        />
                      </div>
                    ) : null
                  })}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Main Content */}
      <section className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="graphs">Graphs</TabsTrigger>
            <TabsTrigger value="players">Players</TabsTrigger>
            <TabsTrigger value="vision">
              <Map className="mr-1.5 h-4 w-4" />
              Vision
            </TabsTrigger>
            <TabsTrigger value="analysis">
              <Brain className="mr-1.5 h-4 w-4" />
              Analysis
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <GoldXpChart
                goldAdvantage={match.radiantGoldAdvantage}
                xpAdvantage={match.radiantXpAdvantage}
                durationMinutes={durationMinutes}
              />
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Match Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-lg border border-border bg-secondary/50 p-4 text-center">
                      <p className="text-2xl font-bold text-radiant">
                        {radiantPlayers.reduce((sum, p) => sum + p.networth, 0).toLocaleString()}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Radiant Net Worth
                      </p>
                    </div>
                    <div className="rounded-lg border border-border bg-secondary/50 p-4 text-center">
                      <p className="text-2xl font-bold text-dire">
                        {direPlayers.reduce((sum, p) => sum + p.networth, 0).toLocaleString()}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Dire Net Worth
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-center text-sm">
                    <div>
                      <p className="font-medium">
                        {radiantPlayers.reduce((sum, p) => sum + p.lastHits, 0)}
                      </p>
                      <p className="text-muted-foreground">Radiant LH</p>
                    </div>
                    <div>
                      <p className="font-medium">
                        {radiantPlayers.reduce((sum, p) => sum + p.heroDamage, 0).toLocaleString()}
                      </p>
                      <p className="text-muted-foreground">Radiant DMG</p>
                    </div>
                    <div>
                      <p className="font-medium">
                        {radiantPlayers.reduce((sum, p) => sum + p.towerDamage, 0).toLocaleString()}
                      </p>
                      <p className="text-muted-foreground">Radiant TD</p>
                    </div>
                    <div>
                      <p className="font-medium">
                        {direPlayers.reduce((sum, p) => sum + p.lastHits, 0)}
                      </p>
                      <p className="text-muted-foreground">Dire LH</p>
                    </div>
                    <div>
                      <p className="font-medium">
                        {direPlayers.reduce((sum, p) => sum + p.heroDamage, 0).toLocaleString()}
                      </p>
                      <p className="text-muted-foreground">Dire DMG</p>
                    </div>
                    <div>
                      <p className="font-medium">
                        {direPlayers.reduce((sum, p) => sum + p.towerDamage, 0).toLocaleString()}
                      </p>
                      <p className="text-muted-foreground">Dire TD</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <PlayerStatsTable
              players={match.players}
              heroes={heroesMap}
              items={itemsMap}
              didRadiantWin={match.didRadiantWin}
            />
          </TabsContent>

          <TabsContent value="graphs" className="space-y-6">
            <GoldXpChart
              goldAdvantage={match.radiantGoldAdvantage}
              xpAdvantage={match.radiantXpAdvantage}
              durationMinutes={durationMinutes}
            />
            <PlayerGoldChart
              players={match.players}
              heroes={heroesMap}
              durationMinutes={durationMinutes}
            />
          </TabsContent>

          <TabsContent value="players">
            <PlayerStatsTable
              players={match.players}
              heroes={heroesMap}
              items={itemsMap}
              didRadiantWin={match.didRadiantWin}
            />
          </TabsContent>

          <TabsContent value="vision" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Map className="h-5 w-5" />
                    Team Positions & Wards
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <MinimapHeatmap
                    wards={mockWards}
                    radiantPositions={mockPositions.radiant}
                    direPositions={mockPositions.dire}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Vision Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <p className="text-sm font-medium text-radiant">Radiant</p>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Observer Wards</span>
                          <span className="font-medium">
                            {radiantPlayers.reduce((sum, p) => sum + (p.observerWards || 0), 0)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Sentry Wards</span>
                          <span className="font-medium">
                            {radiantPlayers.reduce((sum, p) => sum + (p.sentryWards || 0), 0)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Wards Destroyed</span>
                          <span className="font-medium">
                            {radiantPlayers.reduce((sum, p) => sum + (p.wardsDestroyed || 0), 0)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Smokes Used</span>
                          <span className="font-medium">
                            {radiantPlayers.reduce((sum, p) => sum + (p.smokesUsed || 0), 0)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <p className="text-sm font-medium text-dire">Dire</p>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Observer Wards</span>
                          <span className="font-medium">
                            {direPlayers.reduce((sum, p) => sum + (p.observerWards || 0), 0)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Sentry Wards</span>
                          <span className="font-medium">
                            {direPlayers.reduce((sum, p) => sum + (p.sentryWards || 0), 0)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Wards Destroyed</span>
                          <span className="font-medium">
                            {direPlayers.reduce((sum, p) => sum + (p.wardsDestroyed || 0), 0)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Smokes Used</span>
                          <span className="font-medium">
                            {direPlayers.reduce((sum, p) => sum + (p.smokesUsed || 0), 0)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg border border-border bg-secondary/30 p-4">
                    <p className="text-sm text-muted-foreground">
                      The minimap shows approximate team positions throughout the match. 
                      Switch between heat map, ward, and position views to analyze 
                      team movements and vision control.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analysis" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <WinPrediction
                radiantHeroes={radiantHeroesForPrediction}
                direHeroes={direHeroesForPrediction}
              />

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Draft Analysis</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <p className="text-sm font-medium">Team Composition</p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="space-y-2">
                        <p className="text-radiant">Radiant</p>
                        <div className="space-y-1 text-muted-foreground">
                          {radiantPlayers.map((p) => {
                            const hero = heroesMap.get(p.heroId)
                            return (
                              <div key={p.playerSlot} className="flex items-center gap-2">
                                {hero && (
                                  <div className="relative h-5 w-5 overflow-hidden rounded">
                                    <Image
                                      src={HERO_ICON_URL(hero.shortName)}
                                      alt={hero.displayName}
                                      fill
                                      className="object-cover"
                                      sizes="20px"
                                    />
                                  </div>
                                )}
                                <span>{hero?.displayName || 'Unknown'}</span>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-dire">Dire</p>
                        <div className="space-y-1 text-muted-foreground">
                          {direPlayers.map((p) => {
                            const hero = heroesMap.get(p.heroId)
                            return (
                              <div key={p.playerSlot} className="flex items-center gap-2">
                                {hero && (
                                  <div className="relative h-5 w-5 overflow-hidden rounded">
                                    <Image
                                      src={HERO_ICON_URL(hero.shortName)}
                                      alt={hero.displayName}
                                      fill
                                      className="object-cover"
                                      sizes="20px"
                                    />
                                  </div>
                                )}
                                <span>{hero?.displayName || 'Unknown'}</span>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg border border-border bg-secondary/30 p-4">
                    <p className="text-sm font-medium mb-2">Match Outcome</p>
                    <p className="text-sm text-muted-foreground">
                      {match.didRadiantWin ? (
                        <>
                          <span className="text-radiant font-medium">
                            {match.radiantTeam?.name || 'Radiant'}
                          </span>{' '}
                          won the match in{' '}
                          <span className="font-medium">{formatDuration(match.durationSeconds)}</span>{' '}
                          with a final score of{' '}
                          <span className="text-radiant">{radiantKills}</span>-
                          <span className="text-dire">{direKills}</span>.
                        </>
                      ) : (
                        <>
                          <span className="text-dire font-medium">
                            {match.direTeam?.name || 'Dire'}
                          </span>{' '}
                          won the match in{' '}
                          <span className="font-medium">{formatDuration(match.durationSeconds)}</span>{' '}
                          with a final score of{' '}
                          <span className="text-dire">{direKills}</span>-
                          <span className="text-radiant">{radiantKills}</span>.
                        </>
                      )}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Performance Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-lg border border-border bg-secondary/30 p-4">
                    <p className="text-sm text-muted-foreground mb-1">Highest Damage</p>
                    {(() => {
                      const topDamage = [...match.players].sort((a, b) => b.heroDamage - a.heroDamage)[0]
                      const hero = heroesMap.get(topDamage.heroId)
                      return (
                        <div className="flex items-center gap-2">
                          {hero && (
                            <div className="relative h-8 w-8 overflow-hidden rounded">
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
                            <p className="font-medium">{hero?.displayName}</p>
                            <p className="text-xs text-muted-foreground">
                              {topDamage.heroDamage.toLocaleString()} damage
                            </p>
                          </div>
                        </div>
                      )
                    })()}
                  </div>
                  <div className="rounded-lg border border-border bg-secondary/30 p-4">
                    <p className="text-sm text-muted-foreground mb-1">Most Kills</p>
                    {(() => {
                      const topKills = [...match.players].sort((a, b) => b.kills - a.kills)[0]
                      const hero = heroesMap.get(topKills.heroId)
                      return (
                        <div className="flex items-center gap-2">
                          {hero && (
                            <div className="relative h-8 w-8 overflow-hidden rounded">
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
                            <p className="font-medium">{hero?.displayName}</p>
                            <p className="text-xs text-muted-foreground">
                              {topKills.kills} kills
                            </p>
                          </div>
                        </div>
                      )
                    })()}
                  </div>
                  <div className="rounded-lg border border-border bg-secondary/30 p-4">
                    <p className="text-sm text-muted-foreground mb-1">Highest GPM</p>
                    {(() => {
                      const topGPM = [...match.players].sort((a, b) => b.goldPerMin - a.goldPerMin)[0]
                      const hero = heroesMap.get(topGPM.heroId)
                      return (
                        <div className="flex items-center gap-2">
                          {hero && (
                            <div className="relative h-8 w-8 overflow-hidden rounded">
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
                            <p className="font-medium">{hero?.displayName}</p>
                            <p className="text-xs text-muted-foreground">
                              {topGPM.goldPerMin} GPM
                            </p>
                          </div>
                        </div>
                      )
                    })()}
                  </div>
                  <div className="rounded-lg border border-border bg-secondary/30 p-4">
                    <p className="text-sm text-muted-foreground mb-1">Best KDA</p>
                    {(() => {
                      const topKDA = [...match.players].sort((a, b) => {
                        const kdaA = (a.kills + a.assists) / Math.max(1, a.deaths)
                        const kdaB = (b.kills + b.assists) / Math.max(1, b.deaths)
                        return kdaB - kdaA
                      })[0]
                      const hero = heroesMap.get(topKDA.heroId)
                      const kda = ((topKDA.kills + topKDA.assists) / Math.max(1, topKDA.deaths)).toFixed(1)
                      return (
                        <div className="flex items-center gap-2">
                          {hero && (
                            <div className="relative h-8 w-8 overflow-hidden rounded">
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
                            <p className="font-medium">{hero?.displayName}</p>
                            <p className="text-xs text-muted-foreground">
                              {kda} KDA ({topKDA.kills}/{topKDA.deaths}/{topKDA.assists})
                            </p>
                          </div>
                        </div>
                      )
                    })()}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </section>
    </div>
  )
}

// Helper functions to generate mock data for demonstration
// In production, this would come from the actual API
function generateMockWards(
  radiantPlayers: typeof [] extends (infer T)[] ? T[] : never[],
  direPlayers: typeof [] extends (infer T)[] ? T[] : never[],
  durationMinutes: number
) {
  const wards: Array<{
    x: number
    y: number
    time: number
    type: 'observer' | 'sentry'
    team: 'radiant' | 'dire'
    playerName?: string
  }> = []

  // Common ward spots
  const radiantWardSpots = [
    { x: -4000, y: -3000 },
    { x: -2000, y: -1000 },
    { x: 1000, y: 2000 },
    { x: -1000, y: 3000 },
    { x: 3000, y: 1000 },
  ]

  const direWardSpots = [
    { x: 4000, y: 3000 },
    { x: 2000, y: 1000 },
    { x: -1000, y: -2000 },
    { x: 1000, y: -3000 },
    { x: -3000, y: -1000 },
  ]

  // Generate wards based on match duration
  const numWards = Math.min(15, Math.floor(durationMinutes / 3))

  for (let i = 0; i < numWards; i++) {
    const radiantSpot = radiantWardSpots[i % radiantWardSpots.length]
    const direSpot = direWardSpots[i % direWardSpots.length]

    wards.push({
      x: radiantSpot.x + (Math.random() - 0.5) * 500,
      y: radiantSpot.y + (Math.random() - 0.5) * 500,
      time: Math.floor((i / numWards) * durationMinutes * 60),
      type: i % 3 === 0 ? 'sentry' : 'observer',
      team: 'radiant',
    })

    wards.push({
      x: direSpot.x + (Math.random() - 0.5) * 500,
      y: direSpot.y + (Math.random() - 0.5) * 500,
      time: Math.floor((i / numWards) * durationMinutes * 60),
      type: i % 3 === 0 ? 'sentry' : 'observer',
      team: 'dire',
    })
  }

  return wards
}

function generateMockPositions(
  radiantPlayers: typeof [] extends (infer T)[] ? T[] : never[],
  direPlayers: typeof [] extends (infer T)[] ? T[] : never[],
  durationMinutes: number,
  heroesMap: Map<number, { displayName: string }>
) {
  const radiant: Array<{
    x: number
    y: number
    time: number
    team: 'radiant' | 'dire'
    playerName?: string
  }> = []

  const dire: Array<{
    x: number
    y: number
    time: number
    team: 'radiant' | 'dire'
    playerName?: string
  }> = []

  // Generate positions showing common movement patterns
  const numPoints = Math.min(200, durationMinutes * 5)

  for (let i = 0; i < numPoints; i++) {
    const timePercent = i / numPoints

    // Radiant positions (bottom left to top right movement over time)
    radiant.push({
      x: -6000 + timePercent * 8000 + (Math.random() - 0.5) * 4000,
      y: -6000 + timePercent * 8000 + (Math.random() - 0.5) * 4000,
      time: Math.floor(timePercent * durationMinutes * 60),
      team: 'radiant',
    })

    // Dire positions (top right to bottom left movement over time)
    dire.push({
      x: 6000 - timePercent * 8000 + (Math.random() - 0.5) * 4000,
      y: 6000 - timePercent * 8000 + (Math.random() - 0.5) * 4000,
      time: Math.floor(timePercent * durationMinutes * 60),
      team: 'dire',
    })
  }

  return { radiant, dire }
}
