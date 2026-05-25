import type { Metadata } from 'next'
import { getTeams } from '@/lib/api/opendota'
import { TeamList } from '@/components/teams/team-list'

export const metadata: Metadata = {
  title: 'Teams',
  description: 'Browse professional Dota 2 teams with rosters, statistics, and match history.',
}

export default async function TeamsPage() {
  const teams = await getTeams().catch(() => [])

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Teams</h1>
        <p className="mt-2 text-muted-foreground">
          Browse {teams.length} professional Dota 2 teams with rosters and statistics.
        </p>
      </div>

      <TeamList teams={teams} />
    </div>
  )
}
