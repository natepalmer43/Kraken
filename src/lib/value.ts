import { teamInfo } from '../data/teams'
import type { AppState, Game, PersonId } from './types'

export function dayOfWeek(date: string): number {
  const [y, m, d] = date.split('-').map(Number)
  return new Date(y, m - 1, d).getDay()
}

/** Friday, Saturday and Sunday count as weekend games. */
export function isWeekend(game: Game): boolean {
  const dow = dayOfWeek(game.date)
  return dow === 0 || dow === 5 || dow === 6
}

export function dayLabel(game: Game): 'Weekend' | 'Weeknight' {
  return isWeekend(game) ? 'Weekend' : 'Weeknight'
}

export function resaleKey(game: Game): string {
  return `${game.date}|${game.opponent}`
}

export interface ResaleView {
  /** best per-ticket estimate: your manual number, else the live average */
  value: number | null
  source: 'manual' | 'live' | null
  quote: AppState['resale'][string] | null
}

export function resaleFor(game: Game, state: Pick<AppState, 'overrides' | 'resale'>): ResaleView {
  const manual = state.overrides[game.id]?.resale
  const quote = state.resale[resaleKey(game)] ?? null
  if (typeof manual === 'number' && manual > 0) return { value: manual, source: 'manual', quote }
  if (quote?.average) return { value: Math.round(quote.average), source: 'live', quote }
  return { value: null, source: null, quote }
}

export function visibleGames(state: AppState): Game[] {
  return state.games
    .filter((g) => !state.overrides[g.id]?.hidden)
    .slice()
    .sort((a, b) => (a.date + (a.time ?? '')).localeCompare(b.date + (b.time ?? '')))
}

export function todayKey(): string {
  const t = new Date()
  return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`
}

export function upcomingGames(state: AppState): Game[] {
  const today = todayKey()
  return visibleGames(state).filter((g) => g.date >= today)
}

export interface Tally {
  games: number
  weekends: number
  weeknights: number
  rivals: number
  /** estimated resale value (per ticket × 2) of the games this person holds */
  resale: number
}

export function tally(state: AppState, who: PersonId): Tally {
  const t: Tally = { games: 0, weekends: 0, weeknights: 0, rivals: 0, resale: 0 }
  for (const g of visibleGames(state)) {
    const a = state.assignments[g.id]
    if (!a) continue
    const share = a.owner === who ? 1 : a.owner === 'both' ? 0.5 : 0
    if (!share) continue
    t.games += share
    if (isWeekend(g)) t.weekends += share
    else t.weeknights += share
    if (teamInfo(g.opponent).draw === 'rival') t.rivals += share
    const r = resaleFor(g, state).value
    if (r) t.resale += r * 2 * share
  }
  return t
}

export function fmtDate(date: string, opts: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: 'numeric' }): string {
  const [y, m, d] = date.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-US', opts)
}

export function fmtTime(time: string | null): string {
  if (!time) return 'TBD'
  const [h, m] = time.split(':').map(Number)
  const suffix = h >= 12 ? 'PM' : 'AM'
  const hh = ((h + 11) % 12) + 1
  return `${hh}:${String(m).padStart(2, '0')} ${suffix}`
}

export function fmtMoney(n: number | null | undefined): string {
  if (n === null || n === undefined) return '—'
  return `$${Math.round(n).toLocaleString('en-US')}`
}

export function gameStart(game: Game): Date {
  const [y, m, d] = game.date.split('-').map(Number)
  const [h, mi] = (game.time ?? '19:00').split(':').map(Number)
  return new Date(y, m - 1, d, h, mi)
}

export function monthKey(date: string): string {
  return date.slice(0, 7)
}

export function monthLabel(key: string): string {
  const [y, m] = key.split('-').map(Number)
  return new Date(y, m - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

/** Outbound resale search links for a game. */
export function resaleLinks(game: Game, state: Pick<AppState, 'resale'>): Array<{ label: string; href: string }> {
  const t = teamInfo(game.opponent)
  const q = encodeURIComponent(`Seattle Kraken vs ${t.city} ${t.name} ${fmtDate(game.date, { month: 'long', day: 'numeric', year: 'numeric' })}`)
  const live = state.resale[resaleKey(game)]?.url
  return [
    { label: 'SeatGeek', href: live ?? `https://seatgeek.com/search?search=${q}` },
    { label: 'StubHub', href: `https://www.stubhub.com/find/s/?q=${q}` },
    { label: 'Ticketmaster', href: `https://www.ticketmaster.com/search?q=${q}` },
  ]
}
