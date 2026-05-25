import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ItemIcon } from '@/components/items/item-icon'
import type { HeroBuild } from '@/lib/types/hero'
import type { Item } from '@/lib/types/item'

interface HeroBuildsProps {
  build: HeroBuild | null
  items: Map<number, Item>
}

export function HeroBuilds({ build, items }: HeroBuildsProps) {
  if (!build) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recommended Build</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No build data available for this hero.
          </p>
        </CardContent>
      </Card>
    )
  }

  const sections = [
    { title: 'Starting Items', items: build.startingItems, timing: 'Start' },
    { title: 'Early Game', items: build.earlyGameItems, timing: '0-10 min' },
    { title: 'Core Items', items: build.coreItems, timing: '10-25 min' },
    { title: 'Late Game', items: build.lateGameItems, timing: '25+ min' },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Recommended Build</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {sections.map((section) => (
          <div key={section.title}>
            <div className="mb-2 flex items-center justify-between">
              <h4 className="text-sm font-medium">{section.title}</h4>
              <Badge variant="outline" className="text-xs">
                {section.timing}
              </Badge>
            </div>
            <div className="flex flex-wrap gap-2">
              {section.items.length > 0 ? (
                section.items.map((itemId, idx) => {
                  const item = items.get(itemId)
                  return (
                    <ItemIcon
                      key={`${itemId}-${idx}`}
                      item={item || null}
                      size="lg"
                    />
                  )
                })
              ) : (
                <p className="text-sm text-muted-foreground">No items</p>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
