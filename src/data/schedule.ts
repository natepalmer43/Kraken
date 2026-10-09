import type { Game } from '../lib/types'

/**
 * Bundled fallback for the 2026-27 Kraken home schedule (Climate Pledge Arena).
 * Compiled from public schedule listings when the app was built; a few dates
 * may be off. The app refreshes from the NHL API on load when it can reach it.
 * Times are local Seattle time, "TBD" when unknown.
 */
const raw: Array<[string, string, string?, string?]> = [
  // date, opponent abbrev, local time, promo/note
  ['2026-10-04', 'CGY', '17:00', 'Home Opener'],
  ['2026-10-06', 'VGK', '19:00'],
  ['2026-10-20', 'DET', '18:40'],
  ['2026-10-22', 'UTA', '18:40'],
  ['2026-10-24', 'MIN', '19:00'],
  ['2026-10-28', 'TOR', '18:40'],
  ['2026-11-04', 'CGY', '18:40'],
  ['2026-11-07', 'NYR', '14:00'],
  ['2026-11-19', 'VAN', '18:40'],
  ['2026-11-23', 'ANA', '18:40'],
  ['2026-11-25', 'CHI', '18:40'],
  ['2026-11-28', 'EDM', '19:00'],
  ['2026-12-01', 'DAL', '18:40'],
  ['2026-12-03', 'DAL', '18:40'],
  ['2026-12-06', 'BUF', '17:00'],
  ['2026-12-10', 'WSH', '18:40'],
  ['2026-12-12', 'NSH', '19:00'],
  ['2026-12-22', 'SJS', '18:40'],
  ['2027-01-02', 'NYI', '19:00'],
  ['2027-01-03', 'VAN', '17:00'],
  ['2027-01-05', 'TBL', '18:40'],
  ['2027-01-16', 'SJS', '19:00'],
  ['2027-01-18', 'CBJ', '18:40'],
  ['2027-01-31', 'NJD', '17:00', 'Bobblehead Night'],
  ['2027-02-03', 'MTL', '18:40'],
  ['2027-02-13', 'STL', '19:00'],
  ['2027-02-15', 'PIT', '18:40'],
  ['2027-02-17', 'OTT', '18:40'],
  ['2027-02-22', 'BOS', '18:40'],
  ['2027-02-27', 'WPG', '19:00'],
  ['2027-03-15', 'STL', '18:40'],
  ['2027-03-19', 'COL', '19:00'],
  ['2027-03-21', 'LAK', '17:00'],
  ['2027-03-23', 'VGK', '18:40'],
  ['2027-03-25', 'ANA', '18:40'],
  ['2027-03-30', 'UTA', '18:40'],
  ['2027-04-03', 'WPG', '19:00'],
]

export const BUNDLED_SCHEDULE: Game[] = raw.map(([date, opp, time, promo]) => ({
  id: `b-${date}-${opp}`,
  date,
  time: time ?? null,
  opponent: opp,
  promo: promo ?? null,
  gameType: 2,
  source: 'bundled',
}))

export const SEASON = '20262027'
export const SEASON_LABEL = '2026-27'
