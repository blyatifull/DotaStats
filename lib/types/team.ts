import type { Player, Match } from './match'

export interface Team {
  id: number
  name: string
  tag: string
  logoUrl: string | null
  rating: number
  wins: number
  losses: number
  lastMatchTime: number
  region: string | null
}

export interface TeamWithRoster extends Team {
  roster: TeamPlayer[]
  recentMatches: Match[]
}

export interface TeamPlayer extends Player {
  role: PlayerRole
  isCurrentMember: boolean
  joinDate: number | null
  leaveDate: number | null
  gamesPlayed: number
  wins: number
}

export type PlayerRole = 
  | 'carry'
  | 'mid'
  | 'offlane'
  | 'soft_support'
  | 'hard_support'
  | 'unknown'

export interface PlayerProfile extends Player {
  rank: number | null
  wins: number
  losses: number
  winRate: number
  bestHeroes: PlayerHeroStats[]
  recentMatches: Match[]
}

export interface PlayerHeroStats {
  heroId: number
  games: number
  wins: number
  winRate: number
  kda: number
}
