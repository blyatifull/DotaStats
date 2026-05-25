import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Trophy } from 'lucide-react'
import { getLeagueMatches } from '@/lib/api/opendota'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatRelativeTime, formatDuration } from '@/lib/constants'
import { cn } from '@/lib/utils'

interface LeaguePageProps {
  params: Promise<{ leagueId: string }>
}

export async function generateMetadata({ params }: LeaguePageProps): Promise<Metadata> {
  const { leagueId } = await params
  return {
    title: `League ${leagueId}`,
    description: `View matches and brackets for League ${leagueId}.`,
  }
}

export default async function LeagueDetailPage({ params }: LeaguePageProps) {
  const { leagueId } = await params
  const leagueIdNum = parseInt(leagueId)

  const matches = await getLeagueMatches(leagueIdNum).catch(() => [])

  if (matches.length === 0) {
    notFound()
  }

  const leagueName = matches[0]?.league?.name || `League ${leagueId}`

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
          <Button asChild variant="ghost" size="sm" className="mb-4">
            <Link href="/tournaments">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Tournaments
            </Link>
          </Button>

          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl border border-border bg-secondary">
              <Trophy className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{leagueName}</h1>
              <p className="text-muted-foreground">{matches.length} matches</p>
            </div>
          </div>
        </div>
      </section>

      {/* Matches */}
      <section className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle>Match History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {matches.map((match) => (
                <Link
                  key={match.id}
                  href={`/tournaments/match/${match.id}`}
                  className="flex items-center justify-between gap-4 rounded-lg border border-border bg-secondary/50 p-4 transition-all hover:border-primary/50 hover:bg-secondary"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={cn(
                        'h-3 w-3 rounded-full',
                        match.didRadiantWin ? 'bg-radiant' : 'bg-dire'
                      )}
                    />
                    <div>
                      <p className="font-medium">
                        <span
                          className={match.didRadiantWin ? 'text-radiant' : ''}
                        >
                          {match.radiantTeam?.name || 'Radiant'}
                        </span>
                        <span className="mx-2 text-muted-foreground">vs</span>
                        <span
                          className={!match.didRadiantWin ? 'text-dire' : ''}
                        >
                          {match.direTeam?.name || 'Dire'}
                        </span>
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatRelativeTime(match.startDateTime)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-muted-foreground">
                      {formatDuration(match.durationSeconds)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
