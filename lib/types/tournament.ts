import type { Team, Match } from './match'

export interface Tournament {
  id: number
  name: string
  tier: TournamentTier
  prizePool: number | null
  startDate: number | null
  endDate: number | null
  imageUrl: string | null
  status: TournamentStatus
  teams: TournamentTeam[]
  matches: TournamentMatch[]
}

export type TournamentTier = 
  | 'premium'
  | 'professional'
  | 'amateur'
  | 'unknown'

export type TournamentStatus = 
  | 'upcoming'
  | 'ongoing'
  | 'completed'

export interface TournamentTeam extends Team {
  standing: number | null
  placement: string | null
  gamesPlayed: number
  wins: number
  losses: number
}

export interface TournamentMatch extends Match {
  round: string | null
  series: number
  seriesType: SeriesType
  radiantScore: number
  direScore: number
}

export type SeriesType = 'bo1' | 'bo2' | 'bo3' | 'bo5' | 'bo7'

export interface BracketRound {
  name: string
  matches: BracketMatch[]
}

export interface BracketMatch {
  id: number
  team1: Team | null
  team2: Team | null
  score1: number
  score2: number
  winner: number | null
  isComplete: boolean
}
