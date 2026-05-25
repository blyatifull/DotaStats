export interface Match {
  id: number
  didRadiantWin: boolean
  durationSeconds: number
  startDateTime: number
  endDateTime: number
  gameMode: number
  lobbyType: number
  radiantTeam: MatchTeam | null
  direTeam: MatchTeam | null
  players: MatchPlayer[]
  radiantGoldAdvantage: number[]
  radiantXpAdvantage: number[]
  pickBans: PickBan[]
  league: League | null
}

export interface MatchTeam {
  id: number
  name: string
  tag: string
  logoUrl: string | null
}

export interface MatchPlayer {
  steamAccountId: number
  heroId: number
  isRadiant: boolean
  playerSlot: number
  kills: number
  deaths: number
  assists: number
  networth: number
  goldPerMinute: number
  experiencePerMinute: number
  heroDamage: number
  heroHealing: number
  towerDamage: number
  lastHits: number
  denies: number
  level: number
  items: PlayerItems
  backpack: number[]
  neutralItem: number | null
  abilityBuild: number[]
  goldTimeline: number[]
  xpTimeline: number[]
  wards: WardPlacement[]
  observerWards: number
  sentryWards: number
  smokeUsed: number
  gemsPurchased: number
  lanePositions: LanePosition[]
  player: Player | null
}

export interface PlayerItems {
  item0: number | null
  item1: number | null
  item2: number | null
  item3: number | null
  item4: number | null
  item5: number | null
}

export interface WardPlacement {
  time: number
  x: number
  y: number
  type: 'observer' | 'sentry'
  isRadiant: boolean
}

export interface LanePosition {
  time: number
  x: number
  y: number
}

export interface PickBan {
  isPick: boolean
  heroId: number
  team: 'radiant' | 'dire'
  order: number
  isBan: boolean
}

export interface Player {
  accountId: number
  name: string
  personaName: string
  avatar: string
  avatarFull: string
  countryCode: string | null
  team: Team | null
}

export interface Team {
  id: number
  name: string
  tag: string
  logoUrl: string | null
  rating: number
  wins: number
  losses: number
  lastMatchTime: number
}

export interface League {
  id: number
  name: string
  tier: 'premium' | 'professional' | 'amateur' | 'unknown'
  prizePool: number | null
  startDate: number | null
  endDate: number | null
  imageUrl: string | null
}
