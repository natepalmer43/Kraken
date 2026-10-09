import { teamInfo } from '../data/teams'
import type { AppState, Game } from './types'

export interface ValueBreakdown {
  total: number
  parts: Array<{ label: string; pts: number }>
  /** 1-3 "tentacles" rating for quick display */
  tier: 1 | 2 | 3
}

const HOLIDAYS = new Set(['12-24', '12-25', '12-26', '12-31', '01-01', '11-26', '02-14'])

export function dayOfWeek(date: string): number {
  const [y, m, d] = date.split('-').map(Number)
  return new Date(y, m - 1, d).getDay()
}

export function gameValue(game: Game, state: Pick<AppState, 'overrides' | 'games'>): ValueBreakdown {
  const parts: Array<{ label: string; pts: number }> = [{ label: 'Base', pts: 10 }]
  const team = teamInfo(game.opponent)
  if (team.draw === 'rival') parts.push({ label: 'Rivalry game', pts: 6 })
  else if (team.draw === 'marquee') parts.push({ label: 'Marquee opponent', pts: 4 })

  const dow = dayOfWeek(game.date)
  if (dow === 6) parts.push({ label: 'Saturday', pts: 4 })
  else if (dow === 5) parts.push({ label: 'Friday', pts: 3 })
  else if (dow === 0) parts.push({ label: 'Sunday', pts: 1 })

  if (game.time && game.time < '15:00') parts.push({ label: 'Matinee', pts: 1 })

  const regular = state.games.filter((g) => g.gameType === 2).map((g) => g.date).sort()
  if (regular[0] === game.date && game.gameType === 2) parts.push({ label: 'Home opener', pts: 8 })
  if (regular[regular.length - 1] === game.date && game.gameType === 2) parts.push({ label: 'Home finale', pts: 3 })

  if (HOLIDAYS.has(game.date.slice(5))) parts.push({ label: 'Holiday', pts: 2 })

  const promo = state.overrides[game.id]?.promo ?? game.promo
  if (promo && !/opener/i.test(promo)) parts.push({ label: promo, pts: 2 })

  const bonus = state.overrides[game.id]?.bonus ?? 0
  if (bonus) parts.push({ label: bonus > 0 ? 'Agreed bonus' : 'Agreed discount', pts: bonus })

  if (game.gameType === 1) {
    parts.length = 0
    parts.push({ label: 'Preseason', pts: 3 })
  }

  const total = parts.reduce((s, p) => s + p.pts, 0)
  const tier: 1 | 2 | 3 = total >= 20 ? 3 : total >= 14 ? 2 : 1
  return { total, parts, tier }
}

export function visibleGames(state: AppState): Game[] {
  return state.games
    .filter((g) => !state.overrides[g.id]?.hidden)
    .slice()
    .sort((a, b) => (a.date + (a.time ?? '')).localeCompare(b.date + (b.time ?? '')))
}

/** Games still worth drafting: visible and not yet played. */
export function draftableGames(state: AppState): Game[] {
  const today = new Date()
  const key = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  return visibleGames(state).filter((g) => g.date >= key)
}

export interface Tally {
  games: number
  points: number
  weekends: number
  rivals: number
  premium: number
}

export function tally(state: AppState, who: 'p1' | 'p2'): Tally {
  const t: Tally = { games: 0, points: 0, weekends: 0, rivals: 0, premium: 0 }
  for (const g of visibleGames(state)) {
    const a = state.assignments[g.id]
    if (!a) continue
    const share = a.owner === who ? 1 : a.owner === 'both' ? 0.5 : 0
    if (!share) continue
    const v = gameValue(g, state)
    t.games += share
    t.points += v.total * share
    const dow = dayOfWeek(g.date)
    if (dow === 5 || dow === 6) t.weekends += share
    if (teamInfo(g.opponent).draw === 'rival') t.rivals += share
    if (v.tier === 3) t.premium += share
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
