import type { Metadata } from 'next'
import { getHeroes, getHeroStats } from '@/lib/api/stratz'
import { HeroGrid } from '@/components/heroes/hero-grid'

export const metadata: Metadata = {
  title: 'Heroes',
  description: 'Browse all Dota 2 heroes with win rates, pick rates, and detailed statistics.',
}

export default async function HeroesPage() {
  const [heroes, stats] = await Promise.all([
    getHeroes().catch(() => []),
    getHeroStats().catch(() => []),
  ])

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Heroes</h1>
        <p className="mt-2 text-muted-foreground">
          Browse all {heroes.length} Dota 2 heroes with win rates, pick rates, and builds.
        </p>
      </div>

      <HeroGrid heroes={heroes} stats={stats} />
    </div>
  )
}
