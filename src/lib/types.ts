export type PersonId = 'p1' | 'p2'
export type Owner = PersonId | 'both' | 'sell'

export interface Person {
  id: PersonId
  name: string
  emoji: string
  color: string
}

export interface Game {
  id: string
  /** YYYY-MM-DD local (Seattle) date */
  date: string
  /** HH:MM local Seattle time, or null if unknown */
  time: string | null
  /** opponent abbreviation, e.g. VAN */
  opponent: string
  promo: string | null
  /** 1 preseason, 2 regular season, 3 playoffs */
  gameType: 1 | 2 | 3
  source: 'bundled' | 'nhl' | 'manual'
}

export interface Assignment {
  owner: Owner
  note?: string
}

export interface GameOverride {
  /** extra points the two of you agree this game is worth (can be negative) */
  bonus?: number
  promo?: string
  /** hide a game from the board (e.g. you sold the pair) */
  hidden?: boolean
}

export interface Trade {
  id: string
  at: string
  from: PersonId
  to: PersonId
  gave: string
  got: string | null
}

export interface DraftState {
  status: 'idle' | 'flipping' | 'live' | 'done'
  first: PersonId | null
  picks: string[]
}

export interface AppState {
  version: 1
  people: [Person, Person]
  games: Game[]
  scheduleSource: 'bundled' | 'nhl'
  scheduleFetchedAt: string | null
  assignments: Record<string, Assignment>
  overrides: Record<string, GameOverride>
  draft: DraftState
  trades: Trade[]
  room: string | null
  updatedAt: string
}
