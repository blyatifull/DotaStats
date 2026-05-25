import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Sword, Heart, Zap, Shield } from 'lucide-react'
import { getHero, getHeroes, getHeroStats, getHeroBuild, getItems } from '@/lib/api/stratz'
import { getHeroMatchups } from '@/lib/api/opendota'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { HeroStatsCards } from '@/components/heroes/hero-stats-cards'
import { HeroMatchups } from '@/components/heroes/hero-matchups'
import { HeroBuilds } from '@/components/heroes/hero-builds'
import {
  HERO_PORTRAIT_URL,
  ATTRIBUTE_CONFIG,
  formatPercent,
} from '@/lib/constants'
import { cn } from '@/lib/utils'

interface HeroPageProps {
  params: Promise<{ heroId: string }>
}

export async function generateMetadata({
  params,
}: HeroPageProps): Promise<Metadata> {
  const { heroId } = await params
  const hero = await getHero(parseInt(heroId))
  
  if (!hero) {
    return { title: 'Hero Not Found' }
  }

  return {
    title: hero.displayName,
    description: `${hero.displayName} statistics, builds, and matchups. View win rate, pick rate, and recommended items.`,
  }
}

export default async function HeroDetailPage({ params }: HeroPageProps) {
  const { heroId } = await params
  const heroIdNum = parseInt(heroId)

  const [hero, allHeroes, allStats, matchups, build, items] = await Promise.all([
    getHero(heroIdNum),
    getHeroes().catch(() => []),
    getHeroStats().catch(() => []),
    getHeroMatchups(heroIdNum).catch(() => []),
    getHeroBuild(heroIdNum).catch(() => null),
    getItems().catch(() => []),
  ])

  if (!hero) {
    notFound()
  }

  const heroesMap = new Map(allHeroes.map((h) => [h.id, h]))
  const stats = allStats.find((s) => s.heroId === heroIdNum) || null
  const itemsMap = new Map(items.map((i) => [i.id, i]))
  const attrConfig = ATTRIBUTE_CONFIG[hero.primaryAttribute]

  return (
    <div className="min-h-screen">
      {/* Hero Header */}
      <section
        className={cn(
          'relative overflow-hidden border-b border-border',
          attrConfig.bgClass
        )}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
        <div className="relative mx-auto max-w-7xl px-4 py-8 lg:px-8">
          <Button asChild variant="ghost" size="sm" className="mb-4">
            <Link href="/heroes">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Heroes
            </Link>
          </Button>

          <div className="flex flex-col gap-6 md:flex-row md:items-end">
            <div className="relative h-48 w-48 shrink-0 overflow-hidden rounded-lg border border-border shadow-2xl md:h-56 md:w-56">
              <Image
                src={HERO_PORTRAIT_URL(hero.shortName)}
                alt={hero.displayName}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 192px, 224px"
                priority
              />
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  className={cn(
                    'text-xs',
                    hero.primaryAttribute === 'str' && 'bg-str',
                    hero.primaryAttribute === 'agi' && 'bg-agi',
                    hero.primaryAttribute === 'int' && 'bg-int',
                    hero.primaryAttribute === 'all' && 'bg-all'
                  )}
                >
                  {attrConfig.name}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {hero.attackType}
                </Badge>
                {hero.roles.slice(0, 3).map((role) => (
                  <Badge key={role} variant="secondary" className="text-xs">
                    {role}
                  </Badge>
                ))}
              </div>

              <h1 className="mt-2 text-4xl font-bold tracking-tight">
                {hero.displayName}
              </h1>

              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded bg-str/20">
                    <Heart className="h-4 w-4 text-str" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Strength</p>
                    <p className="text-sm font-medium">
                      {hero.stats.baseStrength} + {hero.stats.strengthGain}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded bg-agi/20">
                    <Sword className="h-4 w-4 text-agi" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Agility</p>
                    <p className="text-sm font-medium">
                      {hero.stats.baseAgility} + {hero.stats.agilityGain}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded bg-int/20">
                    <Zap className="h-4 w-4 text-int" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Intelligence</p>
                    <p className="text-sm font-medium">
                      {hero.stats.baseIntelligence} + {hero.stats.intelligenceGain}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded bg-primary/20">
                    <Shield className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Armor</p>
                    <p className="text-sm font-medium">
                      {hero.stats.armor.toFixed(1)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        <div className="space-y-8">
          {/* Stats Cards */}
          <HeroStatsCards stats={stats} />

          {/* Tabs Section */}
          <Tabs defaultValue="matchups" className="w-full">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="matchups">Matchups</TabsTrigger>
              <TabsTrigger value="builds">Builds</TabsTrigger>
              <TabsTrigger value="attributes">Attributes</TabsTrigger>
            </TabsList>

            <TabsContent value="matchups" className="mt-6">
              <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-radiant">
                      Best Against
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <HeroMatchups matchups={matchups} heroes={heroesMap} showBest />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-dire">
                      Worst Against
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <HeroMatchups
                      matchups={matchups}
                      heroes={heroesMap}
                      showBest={false}
                    />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="builds" className="mt-6">
              <HeroBuilds build={build} items={itemsMap} />
            </TabsContent>

            <TabsContent value="attributes" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Base Attributes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="flex items-center justify-between rounded-lg border border-border bg-secondary/50 p-4">
                      <span className="text-sm text-muted-foreground">Base Health</span>
                      <span className="font-mono font-medium">{hero.stats.baseHealth}</span>
                    </div>
                    <div className="flex items-center justify-between rounded-lg border border-border bg-secondary/50 p-4">
                      <span className="text-sm text-muted-foreground">Base Mana</span>
                      <span className="font-mono font-medium">{hero.stats.baseMana}</span>
                    </div>
                    <div className="flex items-center justify-between rounded-lg border border-border bg-secondary/50 p-4">
                      <span className="text-sm text-muted-foreground">Move Speed</span>
                      <span className="font-mono font-medium">{hero.stats.moveSpeed}</span>
                    </div>
                    <div className="flex items-center justify-between rounded-lg border border-border bg-secondary/50 p-4">
                      <span className="text-sm text-muted-foreground">Attack Range</span>
                      <span className="font-mono font-medium">{hero.stats.attackRange}</span>
                    </div>
                    <div className="flex items-center justify-between rounded-lg border border-border bg-secondary/50 p-4">
                      <span className="text-sm text-muted-foreground">Base Damage</span>
                      <span className="font-mono font-medium">
                        {hero.stats.baseDamageMin} - {hero.stats.baseDamageMax}
                      </span>
                    </div>
                    <div className="flex items-center justify-between rounded-lg border border-border bg-secondary/50 p-4">
                      <span className="text-sm text-muted-foreground">Attack Rate</span>
                      <span className="font-mono font-medium">{hero.stats.attackRate}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  )
}
