import { SEASON } from '../data/schedule'
import type { Game } from './types'

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
