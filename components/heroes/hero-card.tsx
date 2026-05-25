import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { Hero, HeroStatistics } from '@/lib/types/hero'
import { HERO_ICON_URL, ATTRIBUTE_CONFIG, formatPercent } from '@/lib/constants'

interface HeroCardProps {
  hero: Hero
  stats?: HeroStatistics
  showStats?: boolean
}

export function HeroCard({ hero, stats, showStats = true }: HeroCardProps) {
  const attrConfig = ATTRIBUTE_CONFIG[hero.primaryAttribute]

  return (
    <Link
      href={`/heroes/${hero.id}`}
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5',
        attrConfig.bgClass
      )}
    >
      <div className="relative aspect-[16/9] overflow-hidden">
        <Image
          src={HERO_ICON_URL(hero.shortName)}
          alt={hero.displayName}
          fill
          className="object-cover transition-transform group-hover:scale-105"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 12.5vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
      </div>

      <div className="flex flex-1 flex-col gap-1 p-2">
        <h3 className="truncate text-sm font-medium leading-tight">
          {hero.displayName}
        </h3>

        {showStats && stats && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span
              className={cn(
                'font-mono',
                stats.winRate >= 52
                  ? 'text-radiant'
                  : stats.winRate <= 48
                    ? 'text-dire'
                    : ''
              )}
            >
              {formatPercent(stats.winRate, 1)}
            </span>
            <span className="text-border">|</span>
            <span>{formatPercent(stats.pickRate, 1)} pick</span>
          </div>
        )}
      </div>

      <div
        className={cn(
          'absolute right-1 top-1 h-2 w-2 rounded-full',
          hero.primaryAttribute === 'str' && 'bg-str',
          hero.primaryAttribute === 'agi' && 'bg-agi',
          hero.primaryAttribute === 'int' && 'bg-int',
          hero.primaryAttribute === 'all' && 'bg-all'
        )}
      />
    </Link>
  )
}
