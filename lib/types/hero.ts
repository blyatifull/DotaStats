export interface Hero {
  id: number
  name: string
  shortName: string
  displayName: string
  primaryAttribute: 'str' | 'agi' | 'int' | 'all'
  attackType: 'Melee' | 'Ranged'
  roles: string[]
  stats: HeroStats
}

export interface HeroStats {
  baseStrength: number
  strengthGain: number
  baseAgility: number
  agilityGain: number
  baseIntelligence: number
  intelligenceGain: number
  baseHealth: number
  baseMana: number
  moveSpeed: number
  armor: number
  attackRange: number
  attackRate: number
  baseDamageMin: number
  baseDamageMax: number
}

export interface HeroStatistics {
  heroId: number
  winCount: number
  pickCount: number
  banCount: number
  winRate: number
  pickRate: number
  banRate: number
}

export interface HeroMatchup {
  heroId: number
  vsHeroId: number
  gamesPlayed: number
  wins: number
  winRate: number
}

export interface HeroBuild {
  heroId: number
  startingItems: number[]
  earlyGameItems: number[]
  coreItems: number[]
  lateGameItems: number[]
  abilityBuild: number[]
  talents: TalentChoice[]
}

export interface TalentChoice {
  level: number
  leftTalent: string
  rightTalent: string
  selectedSide: 'left' | 'right'
}

export interface Ability {
  id: number
  name: string
  displayName: string
  description: string
  cooldown: number[]
  manaCost: number[]
  isUltimate: boolean
  slot: number
}
