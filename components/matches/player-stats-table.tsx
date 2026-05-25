import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { ItemIcon } from '@/components/items/item-icon'
import { HERO_ICON_URL, formatNumber, calculateKDA } from '@/lib/constants'
import type { MatchPlayer } from '@/lib/types/match'
import type { Hero } from '@/lib/types/hero'
import type { Item } from '@/lib/types/item'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Eye, Shield } from 'lucide-react'

interface PlayerStatsTableProps {
  players: MatchPlayer[]
  heroes: Map<number, Hero>
  items: Map<number, Item>
  didRadiantWin: boolean
}

export function PlayerStatsTable({
  players,
  heroes,
  items,
  didRadiantWin,
}: PlayerStatsTableProps) {
  const radiantPlayers = players.filter((p) => p.isRadiant)
  const direPlayers = players.filter((p) => !p.isRadiant)

  return (
    <div className="space-y-6">
      {/* Radiant Team */}
      <div>
        <div className="mb-2 flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-radiant" />
          <h3 className="font-semibold text-radiant">
            Radiant {didRadiantWin && '(Winner)'}
          </h3>
        </div>
        <TeamTable players={radiantPlayers} heroes={heroes} items={items} isRadiant />
      </div>

      {/* Dire Team */}
      <div>
        <div className="mb-2 flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-dire" />
          <h3 className="font-semibold text-dire">
            Dire {!didRadiantWin && '(Winner)'}
          </h3>
        </div>
        <TeamTable players={direPlayers} heroes={heroes} items={items} isRadiant={false} />
      </div>
    </div>
  )
}

interface TeamTableProps {
  players: MatchPlayer[]
  heroes: Map<number, Hero>
  items: Map<number, Item>
  isRadiant: boolean
}

function TeamTable({ players, heroes, items, isRadiant }: TeamTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow className={cn(isRadiant ? 'team-radiant' : 'team-dire')}>
            <TableHead className="w-48">Player</TableHead>
            <TableHead className="text-center">K/D/A</TableHead>
            <TableHead className="text-center">NW</TableHead>
            <TableHead className="text-center">GPM</TableHead>
            <TableHead className="text-center">XPM</TableHead>
            <TableHead className="text-center">DMG</TableHead>
            <TableHead className="text-center">Heal</TableHead>
            <TableHead className="text-center">LH/DN</TableHead>
            <TableHead>Items</TableHead>
            <TableHead className="text-center">Wards</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {players.map((player) => {
            const hero = heroes.get(player.heroId)
            const kda = calculateKDA(player.kills, player.deaths, player.assists)
            const playerItems = [
              player.items.item0,
              player.items.item1,
              player.items.item2,
              player.items.item3,
              player.items.item4,
              player.items.item5,
            ]

            return (
              <TableRow key={player.playerSlot}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {hero && (
                      <Link href={`/heroes/${hero.id}`}>
                        <div className="relative h-8 w-8 overflow-hidden rounded border border-border">
                          <Image
                            src={HERO_ICON_URL(hero.shortName)}
                            alt={hero.displayName}
                            fill
                            className="object-cover"
                            sizes="32px"
                          />
                        </div>
                      </Link>
                    )}
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {player.player?.name || 'Unknown'}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {hero?.displayName || 'Unknown Hero'}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <div className="font-mono text-sm">
                    <span className="text-radiant">{player.kills}</span>
                    <span className="text-muted-foreground">/</span>
                    <span className="text-dire">{player.deaths}</span>
                    <span className="text-muted-foreground">/</span>
                    <span>{player.assists}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {kda.toFixed(1)} KDA
                  </p>
                </TableCell>
                <TableCell className="text-center">
                  <span className="font-mono text-sm text-gold">
                    {formatNumber(player.networth)}
                  </span>
                </TableCell>
                <TableCell className="text-center font-mono text-sm">
                  {player.goldPerMinute}
                </TableCell>
                <TableCell className="text-center font-mono text-sm">
                  {player.experiencePerMinute}
                </TableCell>
                <TableCell className="text-center font-mono text-sm">
                  {formatNumber(player.heroDamage)}
                </TableCell>
                <TableCell className="text-center font-mono text-sm">
                  {formatNumber(player.heroHealing)}
                </TableCell>
                <TableCell className="text-center font-mono text-sm">
                  {player.lastHits}/{player.denies}
                </TableCell>
                <TableCell>
                  <div className="flex gap-0.5">
                    {playerItems.map((itemId, idx) => (
                      <ItemIcon
                        key={idx}
                        item={itemId ? items.get(itemId) || null : null}
                        size="sm"
                      />
                    ))}
                    {player.neutralItem && (
                      <div className="ml-1 rounded-full border border-gold/50">
                        <ItemIcon
                          item={items.get(player.neutralItem) || null}
                          size="sm"
                        />
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-2 text-xs">
                    <div className="flex items-center gap-1">
                      <Eye className="h-3 w-3 text-radiant" />
                      <span>{player.observerWards}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Shield className="h-3 w-3 text-chart-2" />
                      <span>{player.sentryWards}</span>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
