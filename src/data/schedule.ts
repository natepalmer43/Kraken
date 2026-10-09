import type { Game } from '../lib/types'

/**
 * The 19-game 2026-27 ticket plan, exactly as it appears in the Ticketmaster
 * account (Climate Pledge Arena). Times are local Seattle time.
 * Bump PLAN_VERSION whenever this list changes so saved boards pick it up.
 */
export const PLAN_VERSION = 2

const raw: Array<[string, string, string, string?]> = [
  // date, opponent abbrev, local time, promo/note
  ['2026-10-20', 'DET', '18:40'],
  ['2026-10-28', 'TOR', '19:00'],
  ['2026-11-07', 'NYR', '14:00'],
  ['2026-11-19', 'VAN', '18:40'],
  ['2026-11-28', 'EDM', '19:00'],
  ['2026-12-01', 'DAL', '18:40'],
  ['2026-12-06', 'BUF', '17:00'],
  ['2026-12-29', 'PHI', '18:40'],
  ['2027-01-02', 'NYI', '19:00'],
  ['2027-01-12', 'FLA', '18:40'],
  ['2027-01-16', 'SJS', '19:00'],
  ['2027-01-31', 'NJD', '13:00'],
  ['2027-02-13', 'STL', '19:00'],
  ['2027-02-27', 'WPG', '16:00'],
  ['2027-03-11', 'LAK', '18:30'],
  ['2027-03-19', 'COL', '19:00'],
  ['2027-03-23', 'VGK', '18:40'],
  ['2027-03-25', 'ANA', '18:40'],
  ['2027-03-30', 'UTA', '18:40'],
]

export const TICKET_PLAN: Game[] = raw.map(([date, opp, time, promo]) => ({
  id: `b-${date}-${opp}`,
  date,
  time,
  opponent: opp,
  promo: promo ?? null,
  gameType: 2,
  source: 'bundled',
}))

/** @deprecated use TICKET_PLAN */
export const BUNDLED_SCHEDULE = TICKET_PLAN

export const SEASON = '20262027'
export const SEASON_LABEL = '2026-27'
