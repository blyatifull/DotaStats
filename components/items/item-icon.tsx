import Image from 'next/image'
import { cn } from '@/lib/utils'
import { ITEM_ICON_URL } from '@/lib/constants'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card'
import type { Item } from '@/lib/types/item'

interface ItemIconProps {
  item: Item | null
  size?: 'sm' | 'md' | 'lg'
  showTooltip?: boolean
  className?: string
}

const sizeMap = {
  sm: 'h-6 w-6',
  md: 'h-8 w-8',
  lg: 'h-10 w-10',
}

export function ItemIcon({
  item,
  size = 'md',
  showTooltip = true,
  className,
}: ItemIconProps) {
  if (!item) {
    return (
      <div
        className={cn(
          'rounded bg-secondary/50 border border-border',
          sizeMap[size],
          className
        )}
      />
    )
  }

  const content = (
    <div
      className={cn(
        'relative overflow-hidden rounded border border-border bg-secondary',
        sizeMap[size],
        className
      )}
    >
      <Image
        src={ITEM_ICON_URL(item.shortName)}
        alt={item.displayName}
        fill
        className="object-contain"
        sizes="40px"
      />
    </div>
  )

  if (!showTooltip) {
    return content
  }

  return (
    <HoverCard openDelay={200} closeDelay={100}>
      <HoverCardTrigger asChild>{content}</HoverCardTrigger>
      <HoverCardContent
        side="top"
        align="center"
        className="w-72 border-border bg-popover p-0"
      >
        <ItemTooltipContent item={item} />
      </HoverCardContent>
    </HoverCard>
  )
}

function ItemTooltipContent({ item }: { item: Item }) {
  return (
    <div className="space-y-3 p-4">
      <div className="flex items-start gap-3">
        <div className="relative h-12 w-12 overflow-hidden rounded border border-border bg-secondary">
          <Image
            src={ITEM_ICON_URL(item.shortName)}
            alt={item.displayName}
            fill
            className="object-contain"
            sizes="48px"
          />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold leading-tight">{item.displayName}</h4>
          {item.cost > 0 && (
            <p className="text-sm font-medium text-gold">{item.cost} gold</p>
          )}
          {item.isNeutral && item.neutralTier !== null && (
            <p className="text-sm text-muted-foreground">
              Tier {item.neutralTier} Neutral
            </p>
          )}
        </div>
      </div>

      {item.description && (
        <p
          className="text-sm leading-relaxed text-muted-foreground"
          dangerouslySetInnerHTML={{
            __html: formatItemDescription(item.description),
          }}
        />
      )}

      {item.attributes.length > 0 && (
        <div className="space-y-1 border-t border-border pt-3">
          {item.attributes.map((attr, idx) => (
            <p key={idx} className="text-sm">
              <span className="text-foreground">{attr.header}</span>{' '}
              <span className="text-gold">{attr.value}</span>
            </p>
          ))}
        </div>
      )}

      {item.lore && (
        <p className="border-t border-border pt-3 text-xs italic text-muted-foreground">
          {item.lore}
        </p>
      )}
    </div>
  )
}

function formatItemDescription(description: string): string {
  // Convert Dota 2 markup to HTML
  return description
    .replace(/\n/g, '<br/>')
    .replace(/<h1>/g, '<strong class="text-foreground">')
    .replace(/<\/h1>/g, '</strong>')
}
