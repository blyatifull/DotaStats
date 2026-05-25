'use client'

import { useState, useMemo } from 'react'
import { HeroCard } from './hero-card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Search, SlidersHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Hero, HeroStatistics } from '@/lib/types/hero'
import { ATTRIBUTE_CONFIG, ROLES } from '@/lib/constants'

interface HeroGridProps {
  heroes: Hero[]
  stats: HeroStatistics[]
}

type Attribute = 'all' | 'str' | 'agi' | 'int'
type SortBy = 'name' | 'winrate' | 'pickrate'

export function HeroGrid({ heroes, stats }: HeroGridProps) {
  const [search, setSearch] = useState('')
  const [selectedAttribute, setSelectedAttribute] = useState<Attribute | null>(null)
  const [selectedRole, setSelectedRole] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<SortBy>('name')
  const [showFilters, setShowFilters] = useState(false)

  const statsMap = useMemo(() => {
    return new Map(stats.map((s) => [s.heroId, s]))
  }, [stats])

  const filteredHeroes = useMemo(() => {
    let result = heroes.filter((hero) => {
      const matchesSearch =
        hero.displayName.toLowerCase().includes(search.toLowerCase()) ||
        hero.name.toLowerCase().includes(search.toLowerCase())

      const matchesAttribute =
        !selectedAttribute || hero.primaryAttribute === selectedAttribute

      const matchesRole = !selectedRole || hero.roles.includes(selectedRole)

      return matchesSearch && matchesAttribute && matchesRole
    })

    result = result.sort((a, b) => {
      switch (sortBy) {
        case 'winrate': {
          const statsA = statsMap.get(a.id)
          const statsB = statsMap.get(b.id)
          return (statsB?.winRate || 0) - (statsA?.winRate || 0)
        }
        case 'pickrate': {
          const statsA = statsMap.get(a.id)
          const statsB = statsMap.get(b.id)
          return (statsB?.pickRate || 0) - (statsA?.pickRate || 0)
        }
        default:
          return a.displayName.localeCompare(b.displayName)
      }
    })

    return result
  }, [heroes, search, selectedAttribute, selectedRole, sortBy, statsMap])

  const attributes: Attribute[] = ['str', 'agi', 'int', 'all']

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search heroes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className={cn(showFilters && 'bg-accent')}
          >
            <SlidersHorizontal className="mr-2 h-4 w-4" />
            Filters
          </Button>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
            className="h-9 rounded-md border border-input bg-secondary px-3 text-sm"
          >
            <option value="name">Name</option>
            <option value="winrate">Win Rate</option>
            <option value="pickrate">Pick Rate</option>
          </select>
        </div>
      </div>

      {showFilters && (
        <div className="space-y-4 rounded-lg border border-border bg-card p-4">
          <div>
            <h4 className="mb-2 text-sm font-medium text-muted-foreground">
              Attribute
            </h4>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedAttribute === null ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedAttribute(null)}
              >
                All
              </Button>
              {attributes.map((attr) => (
                <Button
                  key={attr}
                  variant={selectedAttribute === attr ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedAttribute(attr)}
                  className={cn(
                    selectedAttribute === attr &&
                      attr === 'str' &&
                      'bg-str hover:bg-str/90',
                    selectedAttribute === attr &&
                      attr === 'agi' &&
                      'bg-agi hover:bg-agi/90',
                    selectedAttribute === attr &&
                      attr === 'int' &&
                      'bg-int hover:bg-int/90',
                    selectedAttribute === attr &&
                      attr === 'all' &&
                      'bg-all hover:bg-all/90'
                  )}
                >
                  {ATTRIBUTE_CONFIG[attr].name}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <h4 className="mb-2 text-sm font-medium text-muted-foreground">
              Role
            </h4>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedRole === null ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedRole(null)}
              >
                All
              </Button>
              {ROLES.map((role) => (
                <Button
                  key={role}
                  variant={selectedRole === role ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedRole(role)}
                >
                  {role}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {filteredHeroes.length} of {heroes.length} heroes
        </p>
        {(selectedAttribute || selectedRole || search) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearch('')
              setSelectedAttribute(null)
              setSelectedRole(null)
            }}
          >
            Clear filters
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
        {filteredHeroes.map((hero) => (
          <HeroCard key={hero.id} hero={hero} stats={statsMap.get(hero.id)} />
        ))}
      </div>

      {filteredHeroes.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-lg text-muted-foreground">No heroes found</p>
          <p className="text-sm text-muted-foreground">
            Try adjusting your search or filters
          </p>
        </div>
      )}
    </div>
  )
}
