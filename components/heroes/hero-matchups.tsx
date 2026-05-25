import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { HeroMatchup } from '@/lib/types/hero'
import type { Hero } from '@/lib/types/hero'
import { HERO_ICON_URL, formatPercent } from '@/lib/constants'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface HeroMatchupsProps {
  matchups: HeroMatchup[]
  heroes: Map<number, Hero>
  showBest?: boolean
}

export function HeroMatchups({ matchups, heroes, showBest = true }: HeroMatchupsProps) {
  // Sort by win rate - best matchups at top, worst at bottom
  const sortedMatchups = [...matchups]
    .filter((m) => m.gamesPlayed >= 100) // Only show matchups with enough games
    .sort((a, b) => (showBest ? b.winRate - a.winRate : a.winRate - b.winRate))
    .slice(0, 10)

  if (sortedMatchups.length === 0) {
    return (
      <p className="py-4 text-center text-sm text-muted-foreground">
        No matchup data available
      </p>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Hero</TableHead>
          <TableHead className="text-right">Win Rate</TableHead>
          <TableHead className="text-right">Games</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedMatchups.map((matchup) => {
          const hero = heroes.get(matchup.vsHeroId)
          if (!hero) return null

          return (
            <TableRow key={matchup.vsHeroId}>
              <TableCell>
                <Link
                  href={`/heroes/${hero.id}`}
                  className="flex items-center gap-3 hover:text-primary"
                >
                  <div className="relative h-8 w-8 overflow-hidden rounded border border-border">
                    <Image
                      src={HERO_ICON_URL(hero.shortName)}
                      alt={hero.displayName}
                      fill
                      className="object-cover"
                      sizes="32px"
                    />
                  </div>
                  <span className="text-sm font-medium">{hero.displayName}</span>
                </Link>
              </TableCell>
              <TableCell className="text-right">
                <span
                  className={cn(
                    'font-mono text-sm',
                    matchup.winRate >= 52
                      ? 'text-radiant'
                      : matchup.winRate <= 48
                        ? 'text-dire'
                        : 'text-muted-foreground'
                  )}
                >
                  {formatPercent(matchup.winRate, 1)}
                </span>
              </TableCell>
              <TableCell className="text-right text-sm text-muted-foreground">
                {matchup.gamesPlayed.toLocaleString()}
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
