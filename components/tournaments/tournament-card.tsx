import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Trophy } from 'lucide-react'
import type { League } from '@/lib/types/match'

interface TournamentCardProps {
  league: League
}

export function TournamentCard({ league }: TournamentCardProps) {
  const tierColors: Record<string, string> = {
    premium: 'bg-gold text-gold-foreground',
    professional: 'bg-primary text-primary-foreground',
    amateur: 'bg-secondary text-secondary-foreground',
    unknown: 'bg-muted text-muted-foreground',
  }

  return (
    <Link href={`/tournaments/${league.id}`}>
      <Card className="overflow-hidden transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-border bg-secondary">
              {league.imageUrl ? (
                <img
                  src={league.imageUrl}
                  alt={league.name}
                  className="h-10 w-10 object-contain"
                />
              ) : (
                <Trophy className="h-6 w-6 text-muted-foreground" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="truncate font-semibold">{league.name}</h3>
              </div>
              <div className="mt-1 flex items-center gap-2">
                <Badge className={tierColors[league.tier]}>
                  {league.tier.charAt(0).toUpperCase() + league.tier.slice(1)}
                </Badge>
                {league.prizePool && league.prizePool > 0 && (
                  <span className="text-sm text-gold">
                    ${league.prizePool.toLocaleString()}
                  </span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
