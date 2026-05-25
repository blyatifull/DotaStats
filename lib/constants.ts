// CDN URLs for Dota 2 assets
export const HERO_ICON_URL = (shortName: string) =>
  `https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/${shortName}.png`

export const HERO_PORTRAIT_URL = (shortName: string) =>
  `https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/crops/${shortName}.png`

export const ITEM_ICON_URL = (shortName: string) =>
  `https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/${shortName}.png`

export const ABILITY_ICON_URL = (name: string) =>
  `https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/${name}.png`

// Attribute display names and colors
export const ATTRIBUTE_CONFIG = {
  str: { name: 'Strength', color: 'text-str', bgClass: 'attr-str' },
  agi: { name: 'Agility', color: 'text-agi', bgClass: 'attr-agi' },
  int: { name: 'Intelligence', color: 'text-int', bgClass: 'attr-int' },
  all: { name: 'Universal', color: 'text-all', bgClass: 'attr-all' },
} as const

// Role definitions
export const ROLES = [
  'Carry',
  'Support',
  'Nuker',
  'Disabler',
  'Durable',
  'Escape',
  'Pusher',
  'Initiator',
] as const

// Format duration from seconds to mm:ss
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// Format large numbers (e.g., 1234 -> 1.2k)
export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k'
  }
  return num.toString()
}

// Format percentage
export function formatPercent(value: number, decimals: number = 1): string {
  return value.toFixed(decimals) + '%'
}

// Calculate KDA
export function calculateKDA(kills: number, deaths: number, assists: number): number {
  if (deaths === 0) return kills + assists
  return (kills + assists) / deaths
}

// Format timestamp to relative time
export function formatRelativeTime(timestamp: number): string {
  const now = Date.now() / 1000
  const diff = now - timestamp

  if (diff < 60) return 'Just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`
  
  const date = new Date(timestamp * 1000)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

// Map game coordinates to minimap canvas coordinates
export function gameToMinimapCoords(
  gameX: number,
  gameY: number,
  canvasWidth: number,
  canvasHeight: number
): { x: number; y: number } {
  const MAP_MIN = -8288
  const MAP_MAX = 8288
  const MAP_SIZE = MAP_MAX - MAP_MIN

  return {
    x: ((gameX - MAP_MIN) / MAP_SIZE) * canvasWidth,
    y: ((MAP_MAX - gameY) / MAP_SIZE) * canvasHeight, // Y is inverted
  }
}
