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
  /** which revision of the built-in ticket plan this board was seeded from */
  planVersion: number
  /** 'nhl' once start times have been verified against the NHL schedule API */
  scheduleSource: 'bundled' | 'nhl'
  scheduleFetchedAt: string | null
  assignments: Record<string, Assignment>
  overrides: Record<string, GameOverride>
  /** keyed by `${date}|${opponent}` so it survives schedule refreshes */
  resale: Record<string, ResaleQuote>
  trades: Trade[]
  updatedAt: string
}

/** One team's line in the NHL standings, straight from the public API. */
export interface TeamRecord {
  abbrev: string
  wins: number
  losses: number
  otLosses: number
  points: number
  gamesPlayed: number
  division: string
  divisionRank: number
  conferenceRank: number
  wildcardRank: number
  /** e.g. "W3", "L1", "OT2" */
  streak: string
  /** last ten games, W-L-OT */
  l10: string
  goalsFor: number
  goalsAgainst: number
}

export interface Standings {
  teams: Record<string, TeamRecord>
  fetchedAt: string
}

/** Hand-written scouting report for one game; keyed by `${date}|${opponent}` in src/data/blurbs.ts. */
export interface GameBlurb {
  headline: string
  /** 2–4 sentences: why this game matters right now */
  story: string
  /** rivalry / history with the Kraken, if any */
  rivalry?: string
  /** players to watch, with a short note each */
  stars: Array<{ name: string; team: 'SEA' | 'OPP'; note: string }>
  /** YYYY-MM-DD the blurb was last written or checked */
  updated: string
}
