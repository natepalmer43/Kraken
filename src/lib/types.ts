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
  /** what you actually sold the pair for, if you sold it */
  soldFor?: number
}

export interface GameOverride {
  /** resale value per ticket you looked up yourself (overrides the live number) */
  resale?: number
  promo?: string
  /** hide a game from the board */
  hidden?: boolean
}

/** Live resale market snapshot for one game (per-ticket USD). */
export interface ResaleQuote {
  average: number | null
  median: number | null
  lowest: number | null
  highest: number | null
  listings: number
  url: string | null
  fetchedAt: string
}

export interface Trade {
  id: string
  at: string
  from: PersonId
  to: PersonId
  gave: string
  got: string | null
}

export interface AppState {
  version: 1
  people: [Person, Person]
  games: Game[]
  scheduleSource: 'bundled' | 'nhl'
  scheduleFetchedAt: string | null
  assignments: Record<string, Assignment>
  overrides: Record<string, GameOverride>
  /** keyed by `${date}|${opponent}` so it survives schedule refreshes */
  resale: Record<string, ResaleQuote>
  trades: Trade[]
  room: string | null
  updatedAt: string
}
