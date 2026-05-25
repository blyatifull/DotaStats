'use client'

import { useState, useMemo } from 'react'
import { TeamCard } from './team-card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search } from 'lucide-react'
import type { Team } from '@/lib/types/team'

interface TeamListProps {
  teams: Team[]
}

type SortBy = 'rating' | 'wins' | 'name'

export function TeamList({ teams }: TeamListProps) {
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<SortBy>('rating')

  const filteredTeams = useMemo(() => {
    let result = teams.filter((team) =>
      team.name.toLowerCase().includes(search.toLowerCase()) ||
      team.tag?.toLowerCase().includes(search.toLowerCase())
    )

    result = result.sort((a, b) => {
      switch (sortBy) {
        case 'wins':
          return b.wins - a.wins
        case 'name':
          return a.name.localeCompare(b.name)
        default:
          return b.rating - a.rating
      }
    })

    return result
  }, [teams, search, sortBy])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search teams..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
            className="h-9 rounded-md border border-input bg-secondary px-3 text-sm"
          >
            <option value="rating">Rating</option>
            <option value="wins">Wins</option>
            <option value="name">Name</option>
          </select>
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        Showing {filteredTeams.length} of {teams.length} teams
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        {filteredTeams.map((team, idx) => (
          <TeamCard
            key={team.id}
            team={team}
            rank={sortBy === 'rating' ? idx + 1 : undefined}
          />
        ))}
      </div>

      {filteredTeams.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-lg text-muted-foreground">No teams found</p>
          <p className="text-sm text-muted-foreground">
            Try adjusting your search
          </p>
        </div>
      )}
    </div>
  )
}
