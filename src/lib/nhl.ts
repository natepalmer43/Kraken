import { SEASON } from '../data/schedule'
import type { Game, Standings, TeamRecord } from './types'

interface NhlGame {
  id: number
  gameDate: string
  gameType: number
  startTimeUTC: string
  venue?: { default: string }
  neutralSite?: boolean
  homeTeam: { abbrev: string }
  awayTeam: { abbrev: string }
}

/** Fetches the live Kraken home schedule straight from the NHL public API (CORS-enabled). */
export async function fetchKrakenHomeSchedule(signal?: AbortSignal): Promise<Game[]> {
  const res = await fetch(`https://api-web.nhle.com/v1/club-schedule-season/SEA/${SEASON}`, { signal })
  if (!res.ok) throw new Error(`NHL API ${res.status}`)
  const json = (await res.json()) as { games: NhlGame[] }
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Los_Angeles',
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
  const games: Game[] = []
  for (const g of json.games) {
    if (g.homeTeam.abbrev !== 'SEA') continue
    if (g.gameType !== 1 && g.gameType !== 2) continue
    if (g.neutralSite) continue
    const venue = g.venue?.default ?? ''
    if (venue && !/climate pledge/i.test(venue)) continue
    const parts = Object.fromEntries(fmt.formatToParts(new Date(g.startTimeUTC)).map((p) => [p.type, p.value]))
    const hour = parts.hour === '24' ? '00' : parts.hour
    games.push({
      id: `nhl-${g.id}`,
      date: `${parts.year}-${parts.month}-${parts.day}`,
      time: `${hour}:${parts.minute}`,
      opponent: g.awayTeam.abbrev,
      promo: null,
      gameType: g.gameType as 1 | 2,
      source: 'nhl',
    })
  }
  if (games.length < 10) throw new Error('NHL API returned too few home games')
  return games.sort((a, b) => a.date.localeCompare(b.date))
}

/**
 * Re-keys assignments/overrides from old game ids to new ones by matching date+opponent,
 * so a schedule refresh never loses who owns what.
 */
export function remapByGame<T>(oldGames: Game[], newGames: Game[], map: Record<string, T>): Record<string, T> {
  const keyOf = (g: Game) => `${g.date}|${g.opponent}`
  const newByKey = new Map(newGames.map((g) => [keyOf(g), g.id]))
  const oldById = new Map(oldGames.map((g) => [g.id, g]))
  const out: Record<string, T> = {}
  for (const [id, val] of Object.entries(map)) {
    const old = oldById.get(id)
    const target = old ? newByKey.get(keyOf(old)) : newGames.some((g) => g.id === id) ? id : undefined
    if (target) out[target] = val
  }
  return out
}

interface NhlStandingsRow {
  teamAbbrev: { default: string }
  wins: number
  losses: number
  otLosses: number
  points: number
  gamesPlayed: number
  divisionName: string
  divisionSequence: number
  conferenceSequence: number
  wildcardSequence: number
  streakCode?: string
  streakCount?: number
  l10Wins: number
  l10Losses: number
  l10OtLosses: number
  goalFor: number
  goalAgainst: number
}

/** Fetches today's league-wide standings so the app can show the Kraken's record and every opponent's. */
export async function fetchStandings(signal?: AbortSignal): Promise<Standings> {
  const res = await fetch('https://api-web.nhle.com/v1/standings/now', { signal })
  if (!res.ok) throw new Error(`NHL API ${res.status}`)
  const json = (await res.json()) as { standings: NhlStandingsRow[] }
  const teams: Record<string, TeamRecord> = {}
  for (const r of json.standings) {
    const abbrev = r.teamAbbrev?.default
    if (!abbrev) continue
    teams[abbrev] = {
      abbrev,
      wins: r.wins,
      losses: r.losses,
      otLosses: r.otLosses,
      points: r.points,
      gamesPlayed: r.gamesPlayed,
      division: r.divisionName,
      divisionRank: r.divisionSequence,
      conferenceRank: r.conferenceSequence,
      wildcardRank: r.wildcardSequence,
      streak: r.streakCode && r.streakCount ? `${r.streakCode}${r.streakCount}` : '',
      l10: `${r.l10Wins}-${r.l10Losses}-${r.l10OtLosses}`,
      goalsFor: r.goalFor,
      goalsAgainst: r.goalAgainst,
    }
  }
  if (!teams.SEA) throw new Error('NHL standings missing SEA')
  return { teams, fetchedAt: new Date().toISOString() }
}

export function fmtRecord(r: TeamRecord | undefined): string {
  return r ? `${r.wins}-${r.losses}-${r.otLosses}` : '—'
}

const ORD = ['th', 'st', 'nd', 'rd']
export function ordinal(n: number): string {
  const v = n % 100
  return `${n}${ORD[(v - 20) % 10] ?? ORD[v] ?? ORD[0]}`
}

/** "4th Pacific · 4 pts" or "WC1" style standing summary. */
export function fmtStanding(r: TeamRecord | undefined): string {
  if (!r) return ''
  return `${ordinal(r.divisionRank)} ${r.division} · ${r.points} pts`
}
